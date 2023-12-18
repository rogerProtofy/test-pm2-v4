import {Objects} from "app/bundles/objects";
import {AutoAPI} from 'protolib/api'
import {Protofy} from 'protolib/base'
import fs from 'fs'; 
import pm2 from 'pm2';

Protofy("type", "AutoAPI")
Protofy("object", "pm2")
const {name, prefix} = Objects.pm2.getApiOptions()

const API = AutoAPI({
    modelName: name,
    modelType: Objects.pm2,
    initialDataDir: __dirname,
    prefix: prefix
})

export default API

async function GetMiners() {
    try {
        const response = await fetch('http://localhost:8080/api/v1/services');
        if (!response.ok) {
            throw new Error('No se pudo obtener la lista de mineros.');
        }
        const data = await response.json();
        const minerIds = data.items?.map((miner) => miner.id);
        return minerIds;
    } catch (error) {
        throw new Error('Error al obtener la lista de mineros: ' + error.message);       
    }
}

export function IntervalMqtt(app, context) {
    const minersIds = GetMiners()
    const { mqtt } = context
    
    setInterval(() => {
        try {
            minersIds.then((id) => {
                id.forEach((id) => {
                    pm2.describe(id, (err, apps) => {
                        if (err) {
                            console.error('Error al obtener procesos:', err);
                        } else {
                            let status, cpu, memory;
                            
                            if (apps) {
                                // Verifica si la memoria es NaN
                                if (isNaN(apps[0]?.monit?.memory)) {
                                    status = 'stopped';
                                    cpu = 0;
                                    memory = '0.0';
                                } else {
                                    status = apps[0]?.pm2_env?.status;
                                    cpu = apps[0]?.monit?.cpu;
                                    memory = (apps[0]?.monit?.memory / (1024 * 1024)).toFixed(1);
                                }
                                
                                const realTimeData = {
                                    id: id,
                                    status: status,
                                    cpu: cpu,
                                    memory: memory
                                };
                    
                                const realTimeDataString = JSON.stringify(realTimeData);
                                // mqttClient.on(realTimeDataString, (topic, message) => {
                                mqtt.publish('real_time_data_topic', realTimeDataString);
                                console.log("realTimeDataString", realTimeDataString)
                                // })
                            } else {
                                const realTimeData = ([{ name: id, pm2_env: { status: 'stopped' } }]);
                                const realTimeDataString = JSON.stringify(realTimeData);
                                mqtt.publish('real_time_data_topic', realTimeDataString);
                            }
                        }
                    });
                });
                
            });
                    
        } catch (error) {
            console.error('Error al obtener procesos:', error);
        }
    }, 3000)
}

export function GetProcesses(app, context) {
    app.get("/api/v1/pm2Services/describe/:id", (req, res) => {
        const { id } = req.params;
        const { mqtt } = context
        setTimeout(() => {
            try {
                pm2.describe(id, (err, apps) => {
                    if (err) {
                        console.error('Error al obtener procesos:', err);
                        res.status(500).send("<h1>500 Internal server error</h1>");
                    } else {
                        let status, cpu, memory;
                
                        if (apps[0]) {
                            // Verifica si la memoria es NaN
                            if (isNaN(apps[0]?.monit?.memory)) {
                                status = 'stopped';
                                cpu = 0;
                                memory = '0.0';
                            } else {
                                // Asigna los valores actuales si la memoria no es NaN
                                status = apps[0]?.pm2_env?.status;
                                cpu = apps[0]?.monit?.cpu;
                                memory = (apps[0]?.monit?.memory / (1024 * 1024)).toFixed(1);
                            }
                
                            const realTimeData = {
                                id: id,
                                status: status,
                                cpu: cpu,
                                memory: memory
                            };
                
                            const realTimeDataString = JSON.stringify(realTimeData);
                            mqtt.publish('real_time_data_topic', realTimeDataString);
                            res.json(apps[0]);
                        } else {
                            res.json([{ name: id, pm2_env: { status: 'stopped' } }]);
                        }
                    }
                });
                
            } catch (error) {
                console.error('Error al obtener procesos:', error);
                res.status(500).send("<h1>500 Internal server error</h1>");
            }
        },600)
        
    });
}

function isFileEmpty(filePath) {
    return new Promise((resolve, reject) => {
        fs.stat(filePath, (err, stats) => {
            if (err) {
                // Si hay un error al obtener información del archivo, rechazar la promesa
                reject(err);
                return;
            }

            // Verificar si el tamaño del archivo es cero
            resolve(stats.size === 0);
        });
    });
}

export async function GetConsole(app, context) {
    // app.get("/api/v1/pm2Services/console/:id", (req, res) => {
    //     const { id } = req.params;
    //     try {
    //         pm2.describe(id, (err, apps) => {
    //             if (err) {
    //                 console.error('Error al obtener procesos:', err);
    //                 res.status(500).send("<h1>500 Internal server error</h1>");
    //             } else {
    //                 if (apps) {
    //                     const route = apps[0].pm2_env.pm_out_log_path
    //                     const path = route.replace(/\\/g, '/');
    //                     // mqttClient.publish('real_time_data_topic', realTimeDataString, { qos: 0, retain: false });
    //                     res.json(path);
    //                 } else {
    //                     res.json([{ name: id, pm2_env: { status: 'stopped' } }]);
    //                 }
    //             }
    //         });
            
    //     } catch (error) {
    //         console.error('Error al obtener procesos:', error);
    //         res.status(500).send("<h1>500 Internal server error</h1>");
    //     }
        
    // });
    const minersIds = GetMiners()
    const { mqtt } = context
    setInterval(() => {
        try {
            minersIds.then((id) => {
                id.forEach((id) => {
                    pm2.describe(id, (err, apps) => {
                        if (err) {
                            console.error('Error al obtener procesos:', err);
                        } else {                  
                            if (apps[0]) {
                                const route = apps[0].pm2_env.pm_out_log_path
                                const path = route.replace(/\\/g, '/');
                                fs.readFile(path, 'utf-8', (err, data) => {
                                    if (err) {
                                        console.error('Error al leer el archivo:', err);
                                        return;
                                    }
                                    const lineas = data.split('\n');
                                    const ultimaLinea = lineas[lineas.length - 2];
                                    isFileEmpty(route)
                                        .then((isEmpty) => {
                                            if (!isEmpty && apps[0].pm2_env.status === 'online') {
                                                console.log("data: ", data.toString())
                                                mqtt.publish('console_data', ultimaLinea.toString());
                                            }                                                                         
                                        })
                                        .catch((error) => {
                                            console.error('Error al verificar si el archivo está vacío:', error);
                                        });
                                });
                            } 
                        }
                    });
                });
                
            })
                    
        } catch (error) {
            console.error('Error al obtener procesos:', error);
        }
    }, 3000)
}

export async function StartProcess(app) {
    app.get('/api/v1/pm2Services/start/:id', async (req, res) => {
        const {id} = req.params
        try {
            const proc = GetStartOptions(id);
            pm2.start(proc, (err, apps) => {
                if (err) {
                    res.status(500).send("<h1>500 Internal server error</h1>");
                } else {
                    res.json(apps);
                }
            });
        } catch (error) {
            res.status(500).send("<h1>502 Internal server error</h1>");
        }
    });
}

export async function RestartProcess(app) {
    app.get('/api/v1/pm2Services/restart/:id', async (req, res) => {
        const {id} = req.params
        const scriptFileName = `${id}.js`;
        try {
            pm2.restart(scriptFileName, (err, apps) => {
                if (err) {
                    res.status(500).send("<h1>500 Internal server error</h1>");
                } else {
                    res.json(apps);
                }
            });
            //res.send(result);
        } catch (error) {
            res.status(500).send(error.message);
        }
    });
}

export async function StopProcess(app) {
    app.get('/api/v1/pm2Services/stop/:id', async (req, res) => {
        const {id} = req.params
        const scriptFileName = `${id}.js`;
        try {
            pm2.stop(scriptFileName, (err, apps) => {
                if (err) {
                    res.status(500).send("<h1>500 Internal server error</h1>");
                } else {
                    console.log(`Process ${id} stopped`)
                    res.json(apps);
                }
            });
        } catch (error) {
            res.status(500).send(error.message);
        }
    });
}

export function GetStartOptions(name) {
    const script = `setInterval(() => { console.log('Ejecutando el contenido del contenedor ${name}');  }, 1000);`;
    const scriptFileName = `${name}.js`;

    try {
        // Escribe el script en un archivo con el nombre del contenedor
        fs.writeFileSync(scriptFileName, script, 'utf8');
        console.log(`Archivo del script del contenedor ${name} creado correctamente.`);
    } catch (err) {
        console.error('Error al escribir el archivo del script:', err);
    }

    return {
        script: scriptFileName,
        name: name,
        log_date_format: 'YYYY-MM-DD HH:mm Z',
        output: `./${name}.stdout.log`,
        error: `./${name}.stderr.log`,
        exec_mode: 'cluster'
    };
}