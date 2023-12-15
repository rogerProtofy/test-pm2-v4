import {Protofy} from 'protolib/base'
import { ServiceModel } from "./service";
import { Pm2Model } from "./pm2";

export default Protofy("objects", {
    service: ServiceModel,
    pm2: Pm2Model
})