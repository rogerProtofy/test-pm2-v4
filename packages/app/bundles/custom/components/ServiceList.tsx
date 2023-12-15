import { useEffect, useState } from 'react';
import { API } from 'protolib'
import { ServiceView } from './ServiceView';
import { useSubscription } from 'mqtt-react-hooks';

export function ListMiners({ elements, onPress }) {
  const [minersData, setMinersData] = useState([]);
  const [pageLoaded, setPageLoaded] = useState(false);

  const fetchInitialData = async () => {
    try {
      const updatedMinersData = await Promise.all(
        elements.data.items?.map(async (minero) => {
          const response = await API.get(`/api/v1/pm2Services/describe/${minero.id}`);
          const data = response.data;
          const cpu = data.cpu          
          const memory = data.memory
          let updatedMinero;
          if (minero.status==='online' && !minero.enabled && minero.id) {
            updatedMinero = {
              id: minero.id,
              status: 'stopped',
              cpu: 0,
              memory: '0.0', 
              enabled: minero.enabled,
            };
            API.get('/api/v1/pm2Services/stop/' + minero.id)  
            setPageLoaded(true)
          } else {
            updatedMinero = {
              id: minero.id,
              status: minero.status,
              cpu: !isNaN(cpu) ? cpu : 'N/A',
              memory: !isNaN(memory) ? memory : 'N/A', 
              enabled: minero.enabled,
            };
            setPageLoaded(false)
          }
          
          return updatedMinero;
        })
      );
      setMinersData(updatedMinersData);
    } catch (error) {
      console.error('Error al obtener datos de los mineros:', error);
    }
  };

  const serviceMqttData = (realTimeData) => {
    if (!pageLoaded) {
      const realTime = JSON.parse(realTimeData)
      try {
        const updatedMinersData = minersData.map((minero) => {
          if (minero.id === realTime.id) {
            return {
              ...minero,
              cpu: realTime?.cpu,
              memory: realTime?.memory + ' MB',
              status: realTime?.status
            };
          }
          return minero;
        });
        setMinersData(updatedMinersData);      
      } catch (error) {
        console.error('Error al hacer la solicitud al servidor:', error);
      }
    }
  }

  useEffect(() => {
    fetchInitialData();
  }, [elements]);

  const realTimeDataTopic = 'real_time_data_topic';
  const { message: realTimeDataMessage } = useSubscription(realTimeDataTopic);

  useEffect(() => {
    if (realTimeDataMessage) {
      try {
        serviceMqttData(realTimeDataMessage.message);  
      } catch (error) {
        console.error('Error al parsear el mensaje MQTT:', error);
      }
    }
  }, [realTimeDataMessage, pageLoaded]);

  return (
    <>
      {minersData?.map((minero) => (
        <ServiceView minero={minero} onPress={onPress}/>
      ))}
    </>
  );
}