import { z } from "protolib/base";
import { Protofy, AutoModel, Schema, BaseSchema } from 'protolib/base'
import moment from "moment";

Protofy("features", {
    "AutoAPI": true
})

export const BasePm2Schema = Schema.object(Protofy("schema", {
	id: z.string(),
	status: z.string(),
	enabled: z.boolean()
}))

export const Pm2Schema = Schema.object({
    ...BaseSchema.shape,
    ...BasePm2Schema.shape
});

export type Pm2Type = z.infer<typeof Pm2Schema>;
export const Pm2Model = AutoModel.createDerived<Pm2Type>("Pm2Model", Pm2Schema, 'pm2s', '/api/v1/');