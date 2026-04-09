import {
  format,
  formatDistanceToNowStrict,
  isToday,
  isTomorrow,
  parseISO,
} from "date-fns";

import { AppointmentStatus, DemoRole } from "@/lib/types";

type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ClassValue[]
  | Record<string, boolean>;

export function cn(...inputs: ClassValue[]) {
  const classes: string[] = [];

  const pushValue = (value: ClassValue) => {
    if (!value) {
      return;
    }

    if (typeof value === "string" || typeof value === "number") {
      classes.push(String(value));
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(pushValue);
      return;
    }

    if (typeof value === "object") {
      Object.entries(value).forEach(([key, enabled]) => {
        if (enabled) {
          classes.push(key);
        }
      });
    }
  };

  inputs.forEach(pushValue);

  return classes.join(" ");
}

export function resolveDemoRole(value?: string | string[] | null): DemoRole {
  if (Array.isArray(value)) {
    return resolveDemoRole(value[0]);
  }

  return value === "staff" ? "staff" : "admin";
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPhoneNumber(phone: string) {
  return phone;
}

export function formatDateLabel(value: string | Date, formatString = "EEE, MMM d") {
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, formatString);
}

export function formatDateTime(value: string | Date, formatString = "MMM d, yyyy 'at' h:mm a") {
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, formatString);
}

export function formatTime(value: string | Date, formatString = "h:mm a") {
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, formatString);
}

export function describeRelativeDate(value: string | Date) {
  const date = typeof value === "string" ? parseISO(value) : value;

  if (isToday(date)) {
    return "Today";
  }

  if (isTomorrow(date)) {
    return "Tomorrow";
  }

  return format(date, "EEE, MMM d");
}

export function timeUntil(value: string | Date) {
  const date = typeof value === "string" ? parseISO(value) : value;
  return formatDistanceToNowStrict(date, { addSuffix: true });
}

export function getStatusLabel(status: AppointmentStatus) {
  switch (status) {
    case "pending":
      return "Pending";
    case "confirmed":
      return "Confirmed";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    case "no_show":
      return "No-show";
    default:
      return status;
  }
}

export function getStatusTone(status: AppointmentStatus) {
  switch (status) {
    case "confirmed":
      return "bg-[rgba(105,124,84,0.14)] text-[var(--success-foreground)] border-[rgba(105,124,84,0.2)]";
    case "completed":
      return "bg-[rgba(130,132,112,0.14)] text-[var(--foreground)] border-[rgba(130,132,112,0.22)]";
    case "cancelled":
      return "bg-[rgba(168,97,74,0.14)] text-[var(--danger-foreground)] border-[rgba(168,97,74,0.2)]";
    case "no_show":
      return "bg-[rgba(174,136,79,0.16)] text-[var(--warning-foreground)] border-[rgba(174,136,79,0.22)]";
    case "pending":
    default:
      return "bg-[rgba(145,137,126,0.16)] text-[var(--muted-foreground)] border-[rgba(145,137,126,0.2)]";
  }
}

export function titleCase(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
