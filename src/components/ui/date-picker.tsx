import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type DatePickerProps = {
  value?: string;
  onChange?: (date: string) => void;
  disabled?: boolean;
  placeholder?: string;
  disableFutureDates?: boolean;
}

export function DatePicker({ 
  value, 
  onChange, 
  disabled, 
  placeholder = "Pick a date",
  disableFutureDates = false 
}: DatePickerProps) {
  const selectedDate = value ? new Date(value) : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (date && onChange) {
      // Format as YYYY-MM-DD for form compatibility
      const formatted = format(date, "yyyy-MM-dd");
      onChange(formatted);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          data-empty={!selectedDate}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar 
          mode="single" 
          selected={selectedDate} 
          onSelect={handleSelect}
          disabled={disableFutureDates ? { after: new Date() } : undefined}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}