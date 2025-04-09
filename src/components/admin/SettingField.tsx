
import React, { useState } from 'react';
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { SiteSetting } from '@/hooks/useSettings';

interface SettingFieldProps {
  label: string;
  name: string;
  value: string | number | boolean;
  onChange: (setting: SiteSetting) => void;
  group?: string;
  type?: 'text' | 'textarea' | 'number' | 'boolean' | 'color';
  description?: string;
}

const SettingField: React.FC<SettingFieldProps> = ({
  label,
  name,
  value,
  onChange,
  group = 'general',
  type = 'text',
  description
}) => {
  const [currentValue, setCurrentValue] = useState<string | number | boolean>(value);
  
  const handleChange = (newValue: string | number | boolean) => {
    setCurrentValue(newValue);
    onChange({
      key: name,
      value: newValue,
      group,
      type
    });
  };
  
  const renderField = () => {
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            id={name}
            value={String(currentValue)}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full"
          />
        );
      
      case 'number':
        return (
          <Input
            id={name}
            type="number"
            value={String(currentValue)}
            onChange={(e) => handleChange(Number(e.target.value))}
            className="w-full"
          />
        );
      
      case 'boolean':
        return (
          <Switch
            id={name}
            checked={Boolean(currentValue)}
            onCheckedChange={(checked) => handleChange(checked)}
          />
        );
      
      case 'color':
        return (
          <div className="flex items-center gap-2">
            <Input
              id={name}
              type="color"
              value={String(currentValue)}
              onChange={(e) => handleChange(e.target.value)}
              className="w-20 h-10 p-1"
            />
            <Input
              type="text"
              value={String(currentValue)}
              onChange={(e) => handleChange(e.target.value)}
              className="flex-1"
            />
          </div>
        );
      
      default:
        return (
          <Input
            id={name}
            type="text"
            value={String(currentValue)}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full"
          />
        );
    }
  };
  
  return (
    <FormItem className="mb-4">
      <FormLabel htmlFor={name}>{label}</FormLabel>
      {renderField()}
      {description && <FormDescription>{description}</FormDescription>}
    </FormItem>
  );
};

export default SettingField;
