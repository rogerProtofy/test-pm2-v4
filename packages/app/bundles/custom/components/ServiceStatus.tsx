import { XStack } from 'tamagui'
import { Paragraph } from "@my/ui"


export const ServiceStatus = ({status}) => {
    const backgroundColor = status === 'stopped' ? 'red' : 'green';
    
    return (
        <XStack jc="space-between" backgroundColor={backgroundColor} borderRadius={10} p={10} >
            <Paragraph margin={"-6px"}>{status}</Paragraph>
        </XStack>
    );
}