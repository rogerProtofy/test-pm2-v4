import {Protofy} from 'protolib/base'
import serviceApi from "./service";
import pm2Api, { IntervalMqtt, GetProcesses, GetConsole, StartProcess, RestartProcess, StopProcess } from "./pm2";

const autoApis = Protofy("apis", {
    service: serviceApi,
    pm2: pm2Api
})

export default (app, context) => {
    Object.keys(autoApis).forEach((k) => {
        autoApis[k](app, context)
    })
    IntervalMqtt(app, context),
    GetProcesses(app, context),
    GetConsole(app, context),
    StartProcess(app),
    RestartProcess(app),
    StopProcess(app)
}