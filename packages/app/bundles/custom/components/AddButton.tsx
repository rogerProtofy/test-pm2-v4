import { useState } from 'react';
import { Button, YStack } from 'tamagui';
import { Plus } from '@tamagui/lucide-icons';
import { ServiceAdd } from '../components/ServiceAdd';
import { AlertDialog } from 'protolib'

export const AddButton = () => {
  const [open, setOpen] = useState(false);
  const  onPress =  () => {
    setOpen(!open)   
  }
  return (
    <>
      {open ? 
        <AlertDialog
          acceptCaption="Add"
          setOpen={setOpen}
          open={open}
          onAccept={(setOpen) => {
            setOpen(false)
          }}
          title={'Add new program'}
          description={""}
        >
          <YStack f={1} jc="center" ai="center">
          <ServiceAdd />
          </YStack>
        </AlertDialog> : null
      }

      <Button $sm={{ mr: '$0' }} mr="$2" onPress={() => onPress()} chromeless={true}>
        <Plus />
      </Button>
    </>
  );
};
