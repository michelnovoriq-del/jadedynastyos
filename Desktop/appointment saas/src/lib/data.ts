import {
  AppointmentSource as PrismaAppointmentSource,
  AppointmentStatus as PrismaAppointmentStatus,
} from "@prisma/client";
import {
  differenceInMinutes,
  isAfter,
  isSameDay,
  parseISO,
  startOfWeek,
} from "date-fns";

import { getMergedDemoData } from "@/lib/demo-state";
import { prisma } from "@/lib/prisma";
import {
  AppointmentRecord,
  CustomerRecord,
  DemoAppData,
  ServiceRecord,
  StaffRecord,
} from "@/lib/types";

function mapPrismaStatus(status: PrismaAppointmentStatus) {
  return status.toLowerCase() as AppointmentRecord["status"];
}

function mapPrismaSource(source: PrismaAppointmentSource) {
  return source.toLowerCase() as AppointmentRecord["source"];
}

export async function getAppData(): Promise<DemoAppData> {
  if (!process.env.DATABASE_URL) {
    return getMergedDemoData();
  }

  try {
    const business = await prisma.business.findFirst({
      include: {
        settings: true,
        hours: true,
        blockedTimes: true,
        closures: true,
      },
    });

    if (!business || !business.settings) {
      return getMergedDemoData();
    }

    const [staff, services, customers, appointments] = await Promise.all([
      prisma.staff.findMany({
        where: { businessId: business.id },
        include: {
          availabilities: true,
        },
        orderBy: { name: "asc" },
      }),
      prisma.service.findMany({
        where: { businessId: business.id },
        orderBy: [{ active: "desc" }, { category: "asc" }, { name: "asc" }],
      }),
      prisma.customer.findMany({
        where: { businessId: business.id },
        orderBy: { createdAt: "asc" },
      }),
      prisma.appointment.findMany({
        where: { businessId: business.id },
        orderBy: { startsAt: "asc" },
      }),
    ]);

    const staffServices = await prisma.staffService.findMany({
      where: {
        staffId: {
          in: staff.map((member) => member.id),
        },
      },
      orderBy: [{ staffId: "asc" }, { serviceId: "asc" }],
    });

    return {
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        tagline: business.tagline ?? "",
        description: business.description ?? "",
        email: business.email,
        phone: business.phone,
        website: business.website ?? "",
        addressLine1: business.addressLine1,
        addressLine2: business.addressLine2,
        city: business.city,
        region: business.region,
        postalCode: business.postalCode,
        timezone: business.timezone,
        currency: business.currency,
        industries: business.industries,
      },
      settings: {
        id: business.settings.id,
        businessId: business.settings.businessId,
        bookingLeadHours: business.settings.bookingLeadHours,
        cancellationWindowHours: business.settings.cancellationWindowHours,
        bufferMinutes: business.settings.bufferMinutes,
        allowStaffSelection: business.settings.allowStaffSelection,
        autoConfirmBookings: business.settings.autoConfirmBookings,
        sendEmailNotifications: business.settings.sendEmailNotifications,
        sendSmsNotifications: business.settings.sendSmsNotifications,
        reminderHoursBefore: business.settings.reminderHoursBefore,
        dailyAgendaDigest: business.settings.dailyAgendaDigest,
        collectCustomerNotes: business.settings.collectCustomerNotes,
        depositRequired: business.settings.depositRequired,
        depositAmount:
          business.settings.depositAmount === null
            ? null
            : Number(business.settings.depositAmount),
        notes: business.settings.notes,
      },
      businessHours: business.hours.map((hour) => ({
        id: hour.id,
        dayOfWeek: hour.dayOfWeek,
        label: hour.label,
        opensAt: hour.opensAt,
        closesAt: hour.closesAt,
        isOpen: hour.isOpen,
      })),
      staff: staff.map((member) => ({
        id: member.id,
        businessId: member.businessId,
        name: member.name,
        title: member.title,
        role: member.role,
        email: member.email,
        phone: member.phone,
        bio: member.bio ?? "",
        color: member.color ?? "#A69789",
        active: member.active,
        utilizationTarget: member.utilizationTarget,
      })),
      staffAvailabilities: staff.flatMap((member) =>
        member.availabilities.map((availability) => ({
          id: availability.id,
          staffId: availability.staffId,
          dayOfWeek: availability.dayOfWeek,
          label: availability.label,
          startsAt: availability.startsAt,
          endsAt: availability.endsAt,
          isWorking: availability.isWorking,
        })),
      ),
      services: services.map((service) => ({
        id: service.id,
        businessId: service.businessId,
        name: service.name,
        category: service.category,
        description: service.description ?? "",
        durationMin: service.durationMin,
        price: Number(service.price),
        active: service.active,
      })),
      staffServices: staffServices.map((assignment) => ({
        id: assignment.id,
        staffId: assignment.staffId,
        serviceId: assignment.serviceId,
      })),
      customers: customers.map((customer) => ({
        id: customer.id,
        businessId: customer.businessId,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        notes: customer.notes,
        tags: customer.tags,
        preferredStaffId: customer.preferredStaffId,
        createdAt: customer.createdAt.toISOString(),
      })),
      appointments: appointments.map((appointment) => ({
        id: appointment.id,
        businessId: appointment.businessId,
        reference: appointment.reference,
        customerId: appointment.customerId,
        staffId: appointment.staffId,
        serviceId: appointment.serviceId,
        startsAt: appointment.startsAt.toISOString(),
        endsAt: appointment.endsAt.toISOString(),
        status: mapPrismaStatus(appointment.status),
        source: mapPrismaSource(appointment.source),
        notes: appointment.notes,
        createdAt: appointment.createdAt.toISOString(),
        updatedAt: appointment.updatedAt.toISOString(),
      })),
      blockedTimes: business.blockedTimes.map((blockedTime) => ({
        id: blockedTime.id,
        businessId: blockedTime.businessId,
        staffId: blockedTime.staffId,
        title: blockedTime.title,
        reason: blockedTime.reason,
        startsAt: blockedTime.startsAt.toISOString(),
        endsAt: blockedTime.endsAt.toISOString(),
      })),
      closures: business.closures.map((closure) => ({
        id: closure.id,
        businessId: closure.businessId,
        title: closure.title,
        date: closure.date.toISOString(),
        notes: closure.notes,
      })),
    };
  } catch {
    return getMergedDemoData();
  }
}

export function getAppointmentRecords(data: DemoAppData): AppointmentRecord[] {
  return data.appointments
    .map((appointment) => {
      const customer = data.customers.find((item) => item.id === appointment.customerId);
      const service = data.services.find((item) => item.id === appointment.serviceId);

      if (!customer || !service) {
        return null;
      }

      return {
        ...appointment,
        customer,
        service,
        staff: data.staff.find((item) => item.id === appointment.staffId) ?? null,
      };
    })
    .filter((record): record is AppointmentRecord => Boolean(record));
}

export function getCustomerRecords(data: DemoAppData): CustomerRecord[] {
  const appointmentRecords = getAppointmentRecords(data);

  return data.customers
    .map((customer) => {
      const appointments = appointmentRecords
        .filter((appointment) => appointment.customerId === customer.id)
        .sort((left, right) => right.startsAt.localeCompare(left.startsAt));

      const latestAppointment =
        appointments.find((appointment) => parseISO(appointment.startsAt) <= new Date()) ?? null;
      const upcomingAppointment =
        appointments.find((appointment) => parseISO(appointment.startsAt) > new Date()) ?? null;

      return {
        ...customer,
        appointments,
        totalVisits: appointments.filter((appointment) => appointment.status === "completed").length,
        latestAppointment,
        upcomingAppointment,
      };
    })
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function getStaffRecords(data: DemoAppData): StaffRecord[] {
  const appointmentRecords = getAppointmentRecords(data);

  return data.staff.map((member) => ({
    ...member,
    services: data.staffServices
      .filter((assignment) => assignment.staffId === member.id)
      .map((assignment) => data.services.find((service) => service.id === assignment.serviceId))
      .filter((service): service is NonNullable<typeof service> => Boolean(service)),
    availabilities: data.staffAvailabilities.filter(
      (availability) => availability.staffId === member.id,
    ),
    appointments: appointmentRecords.filter((appointment) => appointment.staffId === member.id),
  }));
}

export function getServiceRecords(data: DemoAppData): ServiceRecord[] {
  const appointmentRecords = getAppointmentRecords(data);

  return data.services.map((service) => ({
    ...service,
    staffMembers: data.staffServices
      .filter((assignment) => assignment.serviceId === service.id)
      .map((assignment) => data.staff.find((member) => member.id === assignment.staffId))
      .filter((member): member is NonNullable<typeof member> => Boolean(member)),
    appointments: appointmentRecords.filter((appointment) => appointment.serviceId === service.id),
  }));
}

export function filterAppointments(
  records: AppointmentRecord[],
  filters: {
    query?: string;
    status?: string;
    serviceId?: string;
    staffId?: string;
    date?: string;
  },
) {
  const query = filters.query?.trim().toLowerCase();

  return records.filter((record) => {
    if (filters.status && filters.status !== "all" && record.status !== filters.status) {
      return false;
    }

    if (filters.serviceId && filters.serviceId !== "all" && record.serviceId !== filters.serviceId) {
      return false;
    }

    if (filters.staffId && filters.staffId !== "all" && record.staffId !== filters.staffId) {
      return false;
    }

    if (filters.date && filters.date !== "all" && !record.startsAt.startsWith(filters.date)) {
      return false;
    }

    if (query) {
      const haystack = [
        record.reference,
        record.customer.firstName,
        record.customer.lastName,
        record.customer.email,
        record.service.name,
        record.staff?.name ?? "",
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(query)) {
        return false;
      }
    }

    return true;
  });
}

export function getDashboardMetrics(data: DemoAppData) {
  const appointmentRecords = getAppointmentRecords(data);
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });

  const todayBookings = appointmentRecords.filter((record) =>
    isSameDay(parseISO(record.startsAt), now),
  );
  const upcomingAppointments = appointmentRecords.filter(
    (record) =>
      isAfter(parseISO(record.startsAt), now) &&
      (record.status === "confirmed" || record.status === "pending"),
  );
  const completedAppointments = appointmentRecords.filter(
    (record) => record.status === "completed",
  );
  const cancelledAppointments = appointmentRecords.filter(
    (record) => record.status === "cancelled",
  );

  const staffUtilization = getStaffRecords(data)
    .filter((member) => member.active)
    .map((member) => {
      const weeklyMinutes = member.appointments
        .filter((appointment) => {
          const appointmentDate = parseISO(appointment.startsAt);
          return appointmentDate >= weekStart && appointment.status !== "cancelled";
        })
        .reduce(
          (total, appointment) =>
            total +
            differenceInMinutes(parseISO(appointment.endsAt), parseISO(appointment.startsAt)),
          0,
        );

      const utilization = Math.min(96, Math.round((weeklyMinutes / (34 * 60)) * 100));

      return {
        staff: member,
        bookedHours: Math.round((weeklyMinutes / 60) * 10) / 10,
        utilization,
      };
    })
    .sort((left, right) => right.utilization - left.utilization);

  const recentCustomerActivity = appointmentRecords
    .slice()
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 6)
    .map((record) => ({
      id: record.id,
      title: `${record.customer.firstName} ${record.customer.lastName}`,
      detail: `${record.service.name} · ${record.staff?.name ?? "Unassigned"}`,
      updatedAt: record.updatedAt,
      status: record.status,
    }));

  return {
    totalBookings: appointmentRecords.length,
    todayBookings: todayBookings.length,
    upcomingBookings: upcomingAppointments.length,
    completedBookings: completedAppointments.length,
    cancelledBookings: cancelledAppointments.length,
    noShowBookings: appointmentRecords.filter((record) => record.status === "no_show").length,
    staffUtilization,
    recentCustomerActivity,
  };
}

export function getUpcomingAppointments(records: AppointmentRecord[], limit = 8) {
  return records
    .filter(
      (record) =>
        isAfter(parseISO(record.startsAt), new Date()) &&
        (record.status === "confirmed" || record.status === "pending"),
    )
    .slice()
    .sort((left, right) => left.startsAt.localeCompare(right.startsAt))
    .slice(0, limit);
}

