import * as React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TimePickerProps {
  value?: string; // HH:mm format
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// Generate time options in 30-minute intervals
function generateTimeOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, '0');
      const minute = m.toString().padStart(2, '0');
      const value = `${hour}:${minute}`;
      const period = h >= 12 ? 'PM' : 'AM';
      const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const label = `${displayHour}:${minute} ${period}`;
      options.push({ value, label });
    }
  }
  return options;
}

const TIME_OPTIONS = generateTimeOptions();

export function TimePicker({
  value,
  onChange,
  placeholder = 'Select time',
  className,
  disabled,
}: TimePickerProps) {
  const displayLabel = React.useMemo(() => {
    if (!value) return '';
    const option = TIME_OPTIONS.find(o => o.value === value);
    return option?.label || value;
  }, [value]);

  return (
    <Select value={value || ''} onValueChange={v => onChange?.(v)} disabled={disabled}>
      <SelectTrigger className={cn('w-full', className)}>
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <SelectValue placeholder={placeholder}>{displayLabel || placeholder}</SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent className="max-h-[200px]">
        {TIME_OPTIONS.map(option => (
          <SelectItem key={option.value} value={option.value} className="text-sm">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
