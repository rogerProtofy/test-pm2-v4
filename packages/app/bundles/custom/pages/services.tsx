/* @my/ui is wrapper for tamagui. Any component in tamagui can be imported through @my/ui
use result = await API.get(url) or result = await API.post(url, data) to send requests
API.get/API.post will return a PendingResult, with properties like isLoaded, isError and a .data property with the result
if you call paginated apis, you will need to wait for result.isLoaded and look into result.data.items, since result.data is an object with the pagination.
Paginated apis return an object like: {"itemsPerPage": 25, "items": [...], "total": 20, "page": 0, "pages": 1}
*/

import {Protofy} from 'protolib/base'
import {Objects} from 'app/bundles/objects'
import { Theme, YStack, Text, Spacer, XStack, Paragraph, Switch, Button} from "@my/ui"
import { BlockTitle, Tinted, withSession, Page, useEdit, DataView, DataTable2, API, PaginatedDataSSR, SectionBox, SSR, ContainerLarge} from "protolib"
import { DefaultLayout, } from "../../../layout/DefaultLayout"
import { NextPageContext } from 'next'
import { ServiceButtons } from '../components/ServiceButtons'
import { ServiceStatus } from '../components/ServiceStatus'
import { useState, useEffect } from 'react';
import { useSubscription } from 'mqtt-react-hooks';
import {ServiceModel} from '../objects/service'
import { AdminPage } from 'protolib'
import { Save } from '@tamagui/lucide-icons'
const Icons =  {}
const isProtected = Protofy("protected", false)
const {name, prefix} = Objects.service.getApiOptions()
const sourceUrl = prefix + name

export function ListContainersPage({ initialElements, pageSession }) {
    const [elements, setElements] = useState(initialElements)
    const [consoleDataMessage, setConsoleDataMessage] = useState([]);
    const [visible, setVisible] = useState<boolean>(false)
    const [minersData, setMinersData] = useState([]);
    const [pageLoaded, setPageLoaded] = useState(false);

    const  onPress =  () => {
        setVisible(!visible)  
        if(!visible) {
            setConsoleDataMessage([])
        }     
    }
    const fetchInitialData = async () => {
        try {
            const updatedMinersData = await Promise.all(
            elements.data.items?.map(async (minero) => {
                const response = await API.get(`/api/v1/pm2Services/describe/${minero.id}`);
                const data = response.data;
                const cpu = data.cpu          
                const memory = data.memory
                let updatedMinero;
                if (minero.status==='online' && !minero.enabled && minero.id) {
                    updatedMinero = {
                        id: minero.id,
                        status: 'stopped',
                        cpu: 0,
                        memory: '0.0', 
                        enabled: minero.enabled,
                    };
                    API.get('/api/v1/pm2Services/stop/' + minero.id)  
                    setPageLoaded(true)
                } else {
                    updatedMinero = {
                        id: minero.id,
                        status: minero.status,
                        cpu: !isNaN(cpu) ? cpu : 'N/A',
                        memory: !isNaN(memory) ? memory : 'N/A', 
                        enabled: minero.enabled,
                    };
                    setPageLoaded(false)
                }
                
                return updatedMinero;
            })
            );
            setMinersData(updatedMinersData);
        } catch (error) {
            console.error('Error al obtener datos de los mineros:', error);
        }
    };
    const serviceMqttData = (realTimeData) => {
        if (!pageLoaded) {
            const realTime = JSON.parse(realTimeData)
            try {
                const updatedMinersData = minersData.map((minero) => {
                    if (minero.id === realTime.id) {
                        return {
                            ...minero,
                            cpu: realTime?.cpu,
                            memory: realTime?.memory + ' MB',
                            status: realTime?.status
                        };
                    }
                    return minero;
                });
                setMinersData(updatedMinersData);      
            } catch (error) {
                console.error('Error al hacer la solicitud al servidor:', error);
            }
        }
    }
    const realTimeDataTopic = 'real_time_data_topic';
    const { message: realTimeDataMessage } = useSubscription(realTimeDataTopic);
    const consoleDataTopic = 'console_data';
    const { message } = useSubscription(consoleDataTopic);
    useEffect(() => {
        if (message && !consoleDataMessage.includes(message.message)) {
            console.log("contenido archivo: ", message.message)
            setConsoleDataMessage(prevMessages => [...prevMessages, message.message]);
        }
    }, [message]);
    const pageState = {
        itemsPerPage: '',
        page: '',
        search: '',
        orderBy: '',
        orderDirection: '',
        view: '',
        item: '',
        editFile: ''
    }
    // console.log("inital Elements:", initialElements)
    return (<AdminPage title="Services" pageSession={pageSession}>
        <DataView
            integratedChat
            sourceUrl={sourceUrl}
            initialItems={initialElements}
            itemData={initialElements}
            numColumnsForm={1}
            name="service"
            onAdd={data=> {return data}}
            columns={DataTable2.columns(
                DataTable2.column("id", "id", true),
                DataTable2.column("status", "status", true, (row) => {
                    useEffect(() => {
                        fetchInitialData();
                    }, [elements])
                    useEffect(() => {
                        if (realTimeDataMessage) {
                            try {
                                row = serviceMqttData(realTimeDataMessage.message);  
                            } catch (error) {
                                console.error('Error al parsear el mensaje MQTT:', error);
                            }
                        }
                    }, [realTimeDataMessage, pageLoaded]);
                    return <ServiceStatus status={row.status} />;
                }),
                DataTable2.column("monit", "monit", false, (row) => {        
                    useEffect(() => {
                        /* const time = setInterval(() => { */
                            fetchInitialData();
                        // }, 3000)
                        // return () => clearInterval(time); 
                    }, [elements]);
                
                    useEffect(() => {
                        if (realTimeDataMessage) {
                            try {
                                serviceMqttData(realTimeDataMessage.message);  
                            } catch (error) {
                                console.error('Error al parsear el mensaje MQTT:', error);
                            }
                        }
                    }, [realTimeDataMessage, pageLoaded]);
                
                    return (
                        minersData?.map((minero) => (
                            <XStack key={minero.id}>
                            {minero.id === row.id && (
                                <>
                                    <XStack width={80} display='flex' alignItems='center'>
                                        <Paragraph>CPU: {minero.cpu} </Paragraph>
                                    </XStack>
                                    <XStack width={100} display='flex' alignItems='center'>
                                        <Paragraph>RAM: {minero.memory}</Paragraph>
                                    </XStack>
                                </>
                            )}
                            </XStack>
                        ))
                    );
                        
                }),
                DataTable2.column("buttons", "enabled", true, (row) => {
                    // const [minero, setMinero] = useState(row);
                    
                    useEffect(() => {
                        const fetchData = async () => {
                            if (pageLoaded) {
                                try {
                                    row = await fetchInitialData();
                                    // setMinero(initialData);
                                } catch (error) {
                                    console.error('Error al obtener datos iniciales:', error);
                                }
                            }
                        };
                    
                        fetchData();
                    }, [pageLoaded]);
                    
                    useEffect(() => {
                        if (realTimeDataMessage) {
                            try {
                                row = serviceMqttData(realTimeDataMessage.message);  
                                // setMinero(initialData);
                            } catch (error) {
                                console.error('Error al parsear el mensaje MQTT:', error);
                            }
                        }
                    }, [realTimeDataMessage]);
                    if (pageLoaded) {
                        row.enabled ? row.status : row.status = 'stopped'
                    }
                    return <ServiceButtons minero={row} onPress={onPress} />;
                }),
            )}
            extraMenuActions={[
                {
                    text: "Save all services",
                    icon: Save,
                    action: async () => { for (const minero of initialElements.data.items) {
                        if (minero.id) {
                            try {
                            let enabled = await API.get('/api/v1/services/' + minero.id);   
                            // console.log("miner: ", minero.id, "enabled: ", enabled.data.enabled)      
                            minero.enabled = true
                            await API.post('/api/v1/services/' + minero.id, minero);                   
                            } catch (error) {
                            console.error('Error al hacer la solicitud al servidor:', error);
                            }   
                        }
                        } },
                    isVisible: (data) => true
                }
            ]}
            model={ServiceModel}
            pageState={pageState}
            dataTableGridProps={{ itemMinWidth: 300, spacing: 20 }}
        />
        {visible ? 
            <SectionBox mt="$5" width={'1100px'} color="yellow" bubble={true} gradient={true} borderColor={'yellow'} borderStyle="solid">
                {consoleDataMessage.map((message, index) => (
                    <Paragraph key={index}>{message}</Paragraph>
                ))}                  
            </SectionBox> : null
        }
    </AdminPage>);
}

export default {
    route: Protofy("route", "/services"),
    component: ({pageState, initialItems, pageSession, extraData}:any) => {
        return (
            <ListContainersPage initialElements={initialItems} pageSession={pageSession}/>
        )
    }, 
    getServerSideProps: PaginatedDataSSR(sourceUrl, isProtected?Protofy("permissions", []):undefined)
}
