"use server";

import {
  AppointmentSource as PrismaAppointmentSource,
  AppointmentStatus as PrismaAppointmentStatus,
} from "@prisma/client";
import { addMinutes } from "date-fns";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAppData, getAppointmentRecords } from "@/lib/data";
import { getMergedDemoData, readDemoState, writeDemoState } from "@/lib/demo-state";
import { prisma } from "@/lib/prisma";
import { AppointmentStatus, Customer } from "@/lib/types";

async function runWithFallback(
  databaseAction: () => Promise<void>,
  demoAction: () => Promise<void>,
) {
  if (!process.env.DATABASE_URL) {
    await demoAction();
    return;
  }

  try {
    await databaseAction();
  } catch {
    await demoAction();
  }
}

function parseBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function revalidateDemoViews() {
  [
    "/",
    "/book",
    "/demo",
    "/demo/calendar",
    "/demo/appointments",
    "/demo/customers",
    "/demo/staff",
    "/demo/services",
    "/demo/settings",
  ].forEach((path) => revalidatePath(path));
}

function toPrismaStatus(status: AppointmentStatus): PrismaAppointmentStatus {
  switch (status) {
    case "pending":
      return PrismaAppointmentStatus.PENDING;
    case "confirmed":
      return PrismaAppointmentStatus.CONFIRMED;
    case "completed":
      return PrismaAppointmentStatus.COMPLETED;
    case "cancelled":
      return PrismaAppointmentStatus.CANCELLED;
    case "no_show":
      return PrismaAppointmentStatus.NO_SHOW;
  }
}

export async function createBookingAction(formData: FormData) {
  const appData = await getAppData();
  const serviceId = String(formData.get("serviceId") ?? "");
  const staffId = String(formData.get("staffId") ?? "");
  const startsAt = String(formData.get("startsAt") ?? "");
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  const service = appData.services.find((item) => item.id === serviceId);
  const staff = appData.staff.find((item) => item.id === staffId) ?? null;

  if (!service || !startsAt || !firstName || !lastName || !email || !phone) {
    redirect("/book?error=missing");
  }

  const bookingStart = new Date(startsAt);
  const bookingEnd = addMinutes(bookingStart, service.durationMin);
  const appointmentStatus: AppointmentStatus = appData.settings.autoConfirmBookings
    ? "confirmed"
    : "pending";
  const reference = `AR-${Date.now().toString().slice(-6)}`;
  const successParams = new URLSearchParams({
    ref: reference,
    service: service.name,
    staff: staff?.name ?? "Assigned at confirmation",
    date: bookingStart.toISOString(),
    customer: `${firstName} ${lastName}`,
  });

  await runWithFallback(
    async () => {
      const customer = await prisma.customer.upsert({
        where: {
          businessId_email: {
            businessId: appData.business.id,
            email,
          },
        },
        update: {
          firstName,
          lastName,
          phone,
          notes: notes || null,
        },
        create: {
          id: `customer_${Date.now()}`,
          businessId: appData.business.id,
          firstName,
          lastName,
          email,
          phone,
          notes: notes || null,
          tags: ["New client", "Web booking"],
          preferredStaffId: staff?.id ?? null,
        },
      });

      await prisma.appointment.create({
        data: {
          id: `appointment_${Date.now()}`,
          businessId: appData.business.id,
          reference,
          customerId: customer.id,
          staffId: staff?.id ?? null,
          serviceId: service.id,
          startsAt: bookingStart,
          endsAt: bookingEnd,
          status: toPrismaStatus(appointmentStatus),
          source: PrismaAppointmentSource.WEB,
          notes: notes || null,
        },
      });
    },
    async () => {
      const state = await readDemoState();
      const currentData = await getMergedDemoData();
      let customer = currentData.customers.find((item) => item.email.toLowerCase() === email) ?? null;

      if (!customer) {
        customer = {
          id: `customer_demo_${Date.now()}`,
          businessId: currentData.business.id,
          firstName,
          lastName,
          email,
          phone,
          notes: notes || null,
          tags: ["New client", "Web booking"],
          preferredStaffId: staff?.id ?? null,
          createdAt: new Date().toISOString(),
        } satisfies Customer;
        state.createdCustomers.push(customer);
      }

      state.createdAppointments.push({
        id: `appointment_demo_${Date.now()}`,
        businessId: currentData.business.id,
        reference,
        customerId: customer.id,
        staffId: staff?.id ?? null,
        serviceId: service.id,
        startsAt: bookingStart.toISOString(),
        endsAt: bookingEnd.toISOString(),
        status: appointmentStatus,
        source: "web",
        notes: notes || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await writeDemoState(state);
    },
  );

  revalidateDemoViews();
  redirect(`/book/success?${successParams.toString()}`);
}

export async function updateAppointmentStatusAction(formData: FormData) {
  const appointmentId = String(formData.get("appointmentId") ?? "");
  const status = String(formData.get("status") ?? "") as AppointmentStatus;
  const redirectTo = String(formData.get("redirectTo") ?? "/demo/appointments");

  await runWithFallback(
    async () => {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: toPrismaStatus(status) },
      });
    },
    async () => {
      const state = await readDemoState();
      state.appointmentOverrides[appointmentId] = {
        ...(state.appointmentOverrides[appointmentId] ?? {}),
        status,
      };
      await writeDemoState(state);
    },
  );

  revalidateDemoViews();
  redirect(redirectTo);
}

export async function reassignAppointmentStaffAction(formData: FormData) {
  const appointmentId = String(formData.get("appointmentId") ?? "");
  const staffIdValue = String(formData.get("staffId") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/demo/appointments");
  const staffId = staffIdValue === "unassigned" ? null : staffIdValue;

  await runWithFallback(
    async () => {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { staffId },
      });
    },
    async () => {
      const state = await readDemoState();
      state.appointmentOverrides[appointmentId] = {
        ...(state.appointmentOverrides[appointmentId] ?? {}),
        staffId,
      };
      await writeDemoState(state);
    },
  );

  revalidateDemoViews();
  redirect(redirectTo);
}

export async function rescheduleAppointmentAction(formData: FormData) {
  const appointmentId = String(formData.get("appointmentId") ?? "");
  const date = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/demo/appointments");
  const data = await getAppData();
  const record = getAppointmentRecords(data).find((appointment) => appointment.id === appointmentId);

  if (!record || !date || !time) {
    redirect(redirectTo);
  }

  const startsAt = new Date(`${date}T${time}:00`);
  const endsAt = addMinutes(startsAt, record.service.durationMin);

  await runWithFallback(
    async () => {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          startsAt,
          endsAt,
        },
      });
    },
    async () => {
      const state = await readDemoState();
      state.appointmentOverrides[appointmentId] = {
        ...(state.appointmentOverrides[appointmentId] ?? {}),
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
      };
      await writeDemoState(state);
    },
  );

  revalidateDemoViews();
  redirect(redirectTo);
}

export async function toggleStaffStatusAction(formData: FormData) {
  const staffId = String(formData.get("staffId") ?? "");
  const nextValue = String(formData.get("nextValue") ?? "") === "true";
  const redirectTo = String(formData.get("redirectTo") ?? "/demo/staff");

  await runWithFallback(
    async () => {
      await prisma.staff.update({
        where: { id: staffId },
        data: { active: nextValue },
      });
    },
    async () => {
      const state = await readDemoState();
      state.staffStatus[staffId] = nextValue;
      await writeDemoState(state);
    },
  );

  revalidateDemoViews();
  redirect(redirectTo);
}

export async function toggleServiceStatusAction(formData: FormData) {
  const serviceId = String(formData.get("serviceId") ?? "");
  const nextValue = String(formData.get("nextValue") ?? "") === "true";
  const redirectTo = String(formData.get("redirectTo") ?? "/demo/services");

  await runWithFallback(
    async () => {
      await prisma.service.update({
        where: { id: serviceId },
        data: { active: nextValue },
      });
    },
    async () => {
      const state = await readDemoState();
      state.serviceStatus[serviceId] = nextValue;
      await writeDemoState(state);
    },
  );

  revalidateDemoViews();
  redirect(redirectTo);
}

export async function updateBusinessSettingsAction(formData: FormData) {
  const appData = await getAppData();
  const redirectTo = String(formData.get("redirectTo") ?? "/demo/settings");
  const nextSettings = {
    bookingLeadHours: Number(formData.get("bookingLeadHours") ?? appData.settings.bookingLeadHours),
    cancellationWindowHours: Number(
      formData.get("cancellationWindowHours") ?? appData.settings.cancellationWindowHours,
    ),
    bufferMinutes: Number(formData.get("bufferMinutes") ?? appData.settings.bufferMinutes),
    reminderHoursBefore: Number(
      formData.get("reminderHoursBefore") ?? appData.settings.reminderHoursBefore,
    ),
    allowStaffSelection: parseBoolean(formData.get("allowStaffSelection")),
    autoConfirmBookings: parseBoolean(formData.get("autoConfirmBookings")),
    sendEmailNotifications: parseBoolean(formData.get("sendEmailNotifications")),
    sendSmsNotifications: parseBoolean(formData.get("sendSmsNotifications")),
    dailyAgendaDigest: parseBoolean(formData.get("dailyAgendaDigest")),
    collectCustomerNotes: parseBoolean(formData.get("collectCustomerNotes")),
    depositRequired: parseBoolean(formData.get("depositRequired")),
    depositAmount: Number(formData.get("depositAmount") ?? 0) || null,
    notes: String(formData.get("notes") ?? ""),
  };

  await runWithFallback(
    async () => {
      await prisma.businessSettings.update({
        where: { businessId: appData.business.id },
        data: nextSettings,
      });
    },
    async () => {
      const state = await readDemoState();
      state.settings = nextSettings;
      await writeDemoState(state);
    },
  );

  revalidateDemoViews();
  redirect(redirectTo);
}
