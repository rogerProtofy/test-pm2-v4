import { Terminal } from '@tamagui/lucide-icons'
import { Button } from 'tamagui'

export const TerminalButton = ({ minero, buttonPressed }) => {

  return minero.status === 'online' ? (
    <Button onPress={() => buttonPressed('terminal')} borderColor={'yellow'} borderStyle="solid" ml={2} mr={2}>
      <Terminal />
    </Button>
  ) : null;
};

