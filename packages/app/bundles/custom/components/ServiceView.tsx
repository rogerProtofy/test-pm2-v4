import { XStack, } from 'tamagui'
import { Paragraph } from "@my/ui"
import { ServiceButtons } from './ServiceButtons'
import { ServiceStatus } from './ServiceStatus'

export function ServiceView({ minero, onPress }) {
  // console.log("data1: ", data)
  return (
    <XStack key={minero.id} jc="space-between" borderColor={"white"} borderStyle='solid' borderRadius={10} p={10} margin={5}>
      <XStack>
        <XStack width={150} display='flex' alignItems='center'><Paragraph>{minero.id}</Paragraph></XStack>
        <XStack width={150} display='flex' alignItems='center'><Paragraph><ServiceStatus status={minero.status} /></Paragraph></XStack>
        <XStack width={100} display='flex' alignItems='center'><Paragraph>CPU: {minero.cpu} </Paragraph></XStack>
        <XStack width={100} display='flex' alignItems='center'><Paragraph>RAM: {minero.memory}</Paragraph></XStack>
      </XStack>
      <XStack>
        <ServiceButtons minero={minero} onPress={onPress}/>
      </XStack>
    </XStack>
  );
}