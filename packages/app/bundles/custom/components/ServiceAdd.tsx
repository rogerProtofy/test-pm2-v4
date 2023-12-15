import { Fieldset, Input, Label, YStack } from "@my/ui";
import { BaseServiceSchema } from "../objects/service";
import { ServiceAddItem } from './ServiceAddItem'

export const ServiceAdd = () => {
    const fields = Object.keys(BaseServiceSchema.shape).map(p => {
        return { name: p };
    });
  return (
    <YStack width={"100%"} f={1}>
      {fields.map(f => (
        <Fieldset my={"$2"} gap="$4" horizontal key={f.name}>
          <Label width={"120px"}>{f.name}</Label>
          {f.name === 'enabled' || f.name === 'status' ? (
            <ServiceAddItem fieldName={f.name} />
          ) : (
            <Input f={1} />
          )}
        </Fieldset>
      ))}
    </YStack>
  );
};


