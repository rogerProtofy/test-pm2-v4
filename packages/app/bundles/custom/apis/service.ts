import {Objects} from "app/bundles/objects";
import {AutoAPI} from 'protolib/api'
import {Protofy} from 'protolib/base'

Protofy("type", "AutoAPI")
Protofy("object", "service")
const {name, prefix} = Objects.service.getApiOptions()

const API = AutoAPI({
    modelName: name,
    modelType: Objects.service,
    initialDataDir: __dirname,
    prefix: prefix
})

export default API