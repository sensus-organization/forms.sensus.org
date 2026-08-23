"use client";

import { cn } from "@/lib/cn";
import { Button } from "@/modules/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/modules/ui/components/popover";
import { useTranslate } from "@tolgee/react";
import { format } from "date-fns";
import { CalendarCheckIcon, CalendarIcon } from "lucide-react";
import { useRef, useState } from "react";
import Calendar from "react-calendar";
import "./styles.css";

interface DatePickerProps {
  date: Date | null;
  updateSurveyDate: (date: Date) => void;
}

export const getStartOfDay = (date: Date): Date => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
};

export const combineDateWithTime = (date: Date, time: Date | null): Date =>
  new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    time?.getHours() ?? 0,
    time?.getMinutes() ?? 0
  );

export const setLocalTime = (date: Date, time: string): Date => {
  const [hours, minutes] = time.split(":").map(Number);
  const updatedDate = new Date(date);
  updatedDate.setHours(hours, minutes, 0, 0);
  return updatedDate;
};

export const DatePicker = ({ date, updateSurveyDate }: DatePickerProps) => {
  const { t } = useTranslate();
  const [isOpen, setIsOpen] = useState(false);
  const value = date ? new Date(date) : undefined;
  const formattedDate = value ? format(value, "do MMM, yyyy") : undefined;
  const today = getStartOfDay(new Date());

  const btnRef = useRef<HTMLButtonElement>(null);

  const onDateChange = (date: Date) => {
    if (date) {
      updateSurveyDate(date);
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {formattedDate ? (
          <Button
            variant={"ghost"}
            className={cn(
              "w-[280px] justify-start border border-slate-300 bg-white text-left font-normal transition-all ease-in hover:bg-slate-300",
              !formattedDate && "text-muted-foreground bg-slate-800"
            )}
            ref={btnRef}>
            <CalendarCheckIcon className="mr-2 h-4 w-4" />
            {formattedDate}
          </Button>
        ) : (
          <Button
            variant={"ghost"}
            className={cn(
              "w-[280px] justify-start border border-slate-300 bg-white text-left font-normal hover:bg-slate-300",
              !formattedDate && "text-muted-foreground"
            )}
            onClick={() => setIsOpen(true)}
            ref={btnRef}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>{t("common.pick_a_date")}</span>
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="min-w-96 rounded-lg px-4 py-3">
        <Calendar
          value={value}
          onChange={(date) => onDateChange(date as Date)}
          minDate={today}
          className="!border-0"
          tileClassName={({ date }: { date: Date }) => {
            const baseClass =
              "hover:fb-bg-input-bg-selected fb-rounded-custom fb-h-9 fb-p-0 fb-mt-1 fb-font-normal fb-text-heading aria-selected:fb-opacity-100 focus:fb-ring-2 focus:fb-bg-slate-200";
            // today's date class
            if (
              date.getDate() === new Date().getDate() &&
              date.getMonth() === new Date().getMonth() &&
              date.getFullYear() === new Date().getFullYear()
            ) {
              return `${baseClass} !fb-bg-brand !fb-border-border-highlight !fb-text-heading focus:fb-ring-2 focus:fb-bg-slate-200`;
            }
            // active date class
            if (
              date.getDate() === value?.getDate() &&
              date.getMonth() === value?.getMonth() &&
              date.getFullYear() === value?.getFullYear()
            ) {
              return `${baseClass} !fb-bg-brand !fb-border-border-highlight !fb-text-heading`;
            }

            return baseClass;
          }}
          showNeighboringMonth={false}
        />
      </PopoverContent>
    </Popover>
  );
};
