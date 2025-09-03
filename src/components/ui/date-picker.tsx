
'use client';

import * as React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface CustomDatePickerProps {
  date: Date;
  setDate: (date: Date) => void;
}

export function CustomDatePicker({ date, setDate }: CustomDatePickerProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const selectedYear = date.getFullYear();
  const selectedMonth = date.getMonth() + 1;
  const selectedDay = date.getDate();

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleYearChange = (year: string) => {
    const newDate = new Date(date);
    newDate.setFullYear(parseInt(year, 10));
    // Check if the current day is valid for the new month/year
    const newDaysInMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
    if (newDate.getDate() > newDaysInMonth) {
        newDate.setDate(newDaysInMonth);
    }
    setDate(newDate);
  };

  const handleMonthChange = (month: string) => {
    const newDate = new Date(date);
    newDate.setMonth(parseInt(month, 10) - 1);
     // Check if the current day is valid for the new month/year
    const newDaysInMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
    if (newDate.getDate() > newDaysInMonth) {
        newDate.setDate(newDaysInMonth);
    }
    setDate(newDate);
  };

  const handleDayChange = (day: string) => {
    const newDate = new Date(date);
    newDate.setDate(parseInt(day, 10));
    setDate(newDate);
  };

  return (
    <div className="flex gap-2">
      <Select onValueChange={handleYearChange} value={selectedYear.toString()}>
        <SelectTrigger><SelectValue placeholder="年" /></SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}年
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={handleMonthChange} value={selectedMonth.toString()}>
        <SelectTrigger><SelectValue placeholder="月" /></SelectTrigger>
        <SelectContent>
          {months.map((month) => (
            <SelectItem key={month} value={month.toString()}>
              {month}月
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={handleDayChange} value={selectedDay.toString()}>
        <SelectTrigger><SelectValue placeholder="日" /></SelectTrigger>
        <SelectContent>
          {days.map((day) => (
            <SelectItem key={day} value={day.toString()}>
              {day}日
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
