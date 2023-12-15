import { Check, ChevronDown } from '@tamagui/lucide-icons';
import { Select } from 'tamagui';
import { useState, useMemo } from "react";

export function ServiceAddItem({ fieldName }) {
    const [val, setVal] = useState('');
  
    const items = useMemo(() => {
        if (fieldName === 'enabled') {
            setVal('false')
            return [
                { name: 'true' },
                { name: 'false' }
            ];
        } else if (fieldName === 'status') {
            setVal('stopped')
            return [
                { name: 'online' },
                { name: 'stopped' }
            ];
        }
        return [];
    }, [fieldName]);
  
    return (
      <Select
        value={val}
        onValueChange={setVal}
        disablePreventBodyScroll
      >
        <Select.Trigger width={220} iconAfter={ChevronDown}>
          <Select.Value placeholder="Select" />
        </Select.Trigger>
  
        <Select.Content zIndex={200000}>
          <Select.Viewport>
            <Select.Group>
              {items.map((item, i) => (
                <Select.Item index={i} key={item.name} value={item.name.toLowerCase()}>
                  <Select.ItemText>{item.name}</Select.ItemText>
                  <Select.ItemIndicator marginLeft="auto">
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Viewport>
        </Select.Content>
      </Select>
    );
  }