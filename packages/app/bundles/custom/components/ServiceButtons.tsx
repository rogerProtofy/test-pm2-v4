import  { useState } from 'react';
import { XStack } from 'tamagui'
import { StartStopButton } from './StartStopButton';
import { TerminalButton } from './TerminalButton';
import { SaveButton } from './SaveButton';
import { RestartButton } from './RestartButton';
import { API } from 'protolib'

export const ServiceButtons = ({ minero, onPress }) => {
  const [estadoMinero, setEstadoMinero] = useState(minero.status);
  const [enabledMinero, setEnabledMinero] = useState(minero.enabled);
  
  const buttonContainer = async (action) => { 
    if (action && minero.id && ['start', 'stop', 'restart','save','terminal'].indexOf(action) >= 0) {
      switch(action) {
        case 'start':
          minero.status = 'online'
          setEstadoMinero('online')  
          break;
        case 'stop':
          console.log("STOP")
          minero.status = 'stopped'
          setEstadoMinero('stopped')
          break;                
        case 'restart':
          minero.status = 'online'
          setEstadoMinero('online')
          break;
        case 'save':                   
          setEnabledMinero((prevEnabled) => !prevEnabled);
          { minero.enabled ? (
              minero.enabled = false
          ) : minero.enabled = true}   
          console.log(minero.enabled ? "saved" : "unsaved");                
          break;
        case 'terminal':
          onPress()
          console.log("TERMINAL")
          break;
        default:
          break;
      }
      try { 
        let serviceMiner=await API.post('/api/v1/services/' + minero.id, minero);  // change of the service state
        console.log("service miner: ", serviceMiner)
        console.log("minero", minero, "enabled", minero.enabled)
        action != 'save' && action != 'terminal' ? API.get('/api/v1/pm2Services/' + action + '/' + minero.id) : null // PM2 START OR STOP      
      } catch( error ) {
        console.error('Error al hacer la solicitud al servidor:', error);
      }        
    }     
  }

  return (
      <XStack>
        <StartStopButton minero={minero} buttonPressed={buttonContainer} />
        <TerminalButton minero={minero} buttonPressed={buttonContainer} />
        <SaveButton minero={minero} buttonPressed={buttonContainer} />
        <RestartButton minero={minero} buttonPressed={buttonContainer} />
      </XStack>
    );
  }