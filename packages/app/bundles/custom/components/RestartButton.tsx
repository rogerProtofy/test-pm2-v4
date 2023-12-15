import { Button, XStack } from 'tamagui'
import { RefreshCcw } from '@tamagui/lucide-icons'

export const RestartButton = ({ minero, buttonPressed }) => {
  return (
    <Button onPress={() => buttonPressed('restart')} borderColor={'blue'} borderStyle="solid" ml={2} mr={2}>
      <RefreshCcw />
    </Button>
  );
};
