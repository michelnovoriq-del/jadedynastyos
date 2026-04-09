import {
  addDays,
  addMinutes,
  format,
  getDay,
  isSameDay,
  parseISO,
  startOfDay,
} from "date-fns";

import { BookingSlot, DemoAppData, StaffAvailability } from "@/lib/types";

export interface BookableDay {
  dateKey: string;
  title: string;
  subtitle: string;
}

export function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(value: number) {
  const hours = Math.floor(value / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (value % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function toDateKey(value: Date | string) {
  return format(typeof value === "string" ? parseISO(value) : value, "yyyy-MM-dd");
}

export function combineDateAndTime(dateKey: string, time: string) {
  const date = parseISO(`${dateKey}T00:00:00`);
  const [hours, minutes] = time.split(":").map(Number);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function getBusinessHour(data: DemoAppData, dayOfWeek: number) {
  return data.businessHours.find((hour) => hour.dayOfWeek === dayOfWeek) ?? null;
}

export function getStaffAvailability(
  data: DemoAppData,
  staffId: string,
  dayOfWeek: number,
): StaffAvailability | null {
  return (
    data.staffAvailabilities.find(
      (availability) =>
        availability.staffId === staffId && availability.dayOfWeek === dayOfWeek,
    ) ?? null
  );
}

export function isClosureDay(data: DemoAppData, dateKey: string) {
  return data.closures.some((closure) => toDateKey(closure.date) === dateKey);
}

function intervalsOverlap(
  leftStart: number,
  leftEnd: number,
  rightStart: number,
  rightEnd: number,
) {
  return leftStart < rightEnd && rightStart < leftEnd;
}

export function getBookableDays(data: DemoAppData, count = 8): BookableDay[] {
  const days: BookableDay[] = [];
  let cursor = startOfDay(new Date());

  while (days.length < count) {
    const dateKey = toDateKey(cursor);
    const hour = getBusinessHour(data, getDay(cursor));

    if (hour?.isOpen && !isClosureDay(data, dateKey)) {
      days.push({
        dateKey,
        title: format(cursor, "EEE"),
        subtitle: format(cursor, "MMM d"),
      });
    }

    cursor = addDays(cursor, 1);
  }

  return days;
}

export function getBookingSlots(
  data: DemoAppData,
  selectedDate: string,
  serviceId: string,
  preferredStaffId?: string | null,
): BookingSlot[] {
  const service = data.services.find((item) => item.id === serviceId && item.active);

  if (!service || !selectedDate) {
    return [];
  }

  const day = parseISO(`${selectedDate}T00:00:00`);
  const dayOfWeek = getDay(day);
  const businessHour = getBusinessHour(data, dayOfWeek);

  if (!businessHour?.isOpen || !businessHour.opensAt || !businessHour.closesAt) {
    return [];
  }

  if (isClosureDay(data, selectedDate)) {
    return [];
  }

  const supportedStaffIds = data.staffServices
    .filter((assignment) => assignment.serviceId === serviceId)
    .map((assignment) => assignment.staffId);

  const candidateStaff = data.staff.filter(
    (member) =>
      member.active &&
      supportedStaffIds.includes(member.id) &&
      (!preferredStaffId || member.id === preferredStaffId),
  );

  const businessOpen = timeToMinutes(businessHour.opensAt);
  const businessClose = timeToMinutes(businessHour.closesAt);
  const buffer = data.settings.bufferMinutes;
  const leadBoundary = new Date();
  leadBoundary.setHours(leadBoundary.getHours() + data.settings.bookingLeadHours);

  const slots: BookingSlot[] = [];

  for (const member of candidateStaff) {
    const availability = getStaffAvailability(data, member.id, dayOfWeek);

    if (!availability?.isWorking || !availability.startsAt || !availability.endsAt) {
      continue;
    }

    const staffOpen = timeToMinutes(availability.startsAt);
    const staffClose = timeToMinutes(availability.endsAt);
    const startWindow = Math.max(businessOpen, staffOpen);
    const endWindow = Math.min(businessClose, staffClose);

    for (
      let startMinute = startWindow;
      startMinute + service.durationMin <= endWindow;
      startMinute += 30
    ) {
      const endMinute = startMinute + service.durationMin;
      const slotStart = combineDateAndTime(selectedDate, minutesToTime(startMinute));
      const slotEnd = addMinutes(slotStart, service.durationMin);

      if (isSameDay(slotStart, new Date()) && slotStart < leadBoundary) {
        continue;
      }

      const blocked = data.blockedTimes.some((blockedTime) => {
        if (blockedTime.staffId && blockedTime.staffId !== member.id) {
          return false;
        }

        const blockedStart = parseISO(blockedTime.startsAt);
        const blockedEnd = parseISO(blockedTime.endsAt);

        return intervalsOverlap(
          slotStart.getTime(),
          slotEnd.getTime(),
          blockedStart.getTime(),
          blockedEnd.getTime(),
        );
      });

      if (blocked) {
        continue;
      }

      const conflictingAppointment = data.appointments.some((appointment) => {
        if (appointment.staffId !== member.id || appointment.status === "cancelled") {
          return false;
        }

        const appointmentStart = parseISO(appointment.startsAt);

        if (!isSameDay(appointmentStart, slotStart)) {
          return false;
        }

        const appointmentStartMinute = appointmentStart.getHours() * 60 + appointmentStart.getMinutes();
        const appointmentEnd = parseISO(appointment.endsAt);
        const appointmentEndMinute = appointmentEnd.getHours() * 60 + appointmentEnd.getMinutes();

        return intervalsOverlap(
          startMinute - buffer,
          endMinute + buffer,
          appointmentStartMinute,
          appointmentEndMinute,
        );
      });

      if (conflictingAppointment) {
        continue;
      }

      slots.push({
        staffId: member.id,
        startsAt: slotStart.toISOString(),
        endsAt: slotEnd.toISOString(),
      });
    }
  }

  return slots
    .sort((left, right) => left.startsAt.localeCompare(right.startsAt))
    .slice(0, 14);
}

