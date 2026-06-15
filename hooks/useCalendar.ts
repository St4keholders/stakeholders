"use client";

import { useState, useMemo } from "react";
import { MESES, DIAS, DOW, formatDate, validPhone, validEmail } from "@/lib/dates";

const MAX_MONTHS_AHEAD = 2;

export function useCalendar() {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const monthOffset = (y: number, m: number) => {
    return (y - today.getFullYear()) * 12 + (m - today.getMonth());
  };

  const nextMonth = () => {
    if (monthOffset(viewYear, viewMonth) >= MAX_MONTHS_AHEAD) return;
    let m = viewMonth + 1;
    let y = viewYear;
    if (m > 11) {
      m = 0;
      y++;
    }
    setViewMonth(m);
    setViewYear(y);
  };

  const prevMonth = () => {
    if (monthOffset(viewYear, viewMonth) <= 0) return;
    let m = viewMonth - 1;
    let y = viewYear;
    if (m < 0) {
      m = 11;
      y--;
    }
    setViewMonth(m);
    setViewYear(y);
  };

  const monthName = `${MESES[viewMonth][0].toUpperCase()}${MESES[viewMonth].slice(1)} ${viewYear}`;

  const firstDay = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const offset = (firstDay.getDay() + 6) % 7; // Lunes = primera columna

  const emptyDays = Array.from({ length: offset });
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(viewYear, viewMonth, i + 1);
    const isPast = date <= today;
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const disabled = isPast || isWeekend;
    const isSelected = selectedDate && 
      selectedDate.getFullYear() === viewYear && 
      selectedDate.getMonth() === viewMonth && 
      selectedDate.getDate() === date.getDate();

    return { date, disabled, isSelected, dayNum: i + 1 };
  });

  const hasContact = validPhone(phone) && validEmail(email);
  const isReady = selectedDate && selectedSlot && hasContact;

  let pickMessage = "Elige un día y una hora";
  if (selectedDate && !selectedSlot) {
    pickMessage = `<b>${formatDate(selectedDate)}</b> · falta la hora`;
  } else if (!selectedDate && selectedSlot) {
    pickMessage = `<b>${selectedSlot}</b> · falta el día`;
  } else if (!hasContact && selectedDate && selectedSlot) {
    pickMessage = `<b>${formatDate(selectedDate)} · ${selectedSlot}</b> · faltan tus datos de contacto`;
  } else if (isReady && selectedDate && selectedSlot) {
    pickMessage = `<b>${formatDate(selectedDate)} · ${selectedSlot}</b> · todo listo ✓`;
  }

  return {
    DOW,
    viewYear,
    viewMonth,
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    phone,
    setPhone,
    email,
    setEmail,
    monthName,
    emptyDays,
    days,
    prevMonth,
    nextMonth,
    prevDisabled: monthOffset(viewYear, viewMonth) <= 0,
    nextDisabled: monthOffset(viewYear, viewMonth) >= MAX_MONTHS_AHEAD,
    isReady,
    pickMessage,
  };
}
