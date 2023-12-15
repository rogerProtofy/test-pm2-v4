import { Button, XStack } from 'tamagui'
import { PlayCircle,PauseCircle } from '@tamagui/lucide-icons'

export const StartStopButton = ({ minero, buttonPressed }) => {
  const backgroundColor = minero.status === 'stopped' ? 'green' : 'red';
  const iconStatus = minero.status === 'stopped' ? 'start' : 'stop';

  return (
    <Button borderColor={backgroundColor} onPress={() =>  buttonPressed(iconStatus)} borderStyle="solid" mr={2}>
      {minero.status === 'stopped' ? <PlayCircle /> : <PauseCircle />}
    </Button>
  );
};
