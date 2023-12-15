import { useState } from 'react';
import { Button, XStack } from 'tamagui'
import { Save } from '@tamagui/lucide-icons'
import { API } from 'protolib'

// USE INSTRUCTIONS: 1st start the service, then click on save all to save all the services

export function SaveAllServices({ elements }) {
  const buttonPressed = async () => {
    for (const minero of elements.data.items) {
      if (minero.id) {
        try {
          let enabled = await API.get('/api/v1/services/' + minero.id);   
          // console.log("miner: ", minero.id, "enabled: ", enabled.data.enabled)      
          minero.enabled = true
          await API.post('/api/v1/services/' + minero.id, minero);                   
        } catch (error) {
          console.error('Error al hacer la solicitud al servidor:', error);
        }   
      }
    }
    console.log("Todo guardado");
  };
  
  return (
    <>
      {/* <XStack f={1} mb={"$5"} ml={"$5"} $sm={{ ml: "$0" }} jc="flex-end" ai="center">         */}
        <Button hoverStyle={{ o: 1 }} o={0.7} circular onPress={buttonPressed} chromeless={true}>
          <Save />
        </Button>
      {/* </XStack> */}
    </>
  );
}