import {
  AppointmentSource as PrismaAppointmentSource,
  AppointmentStatus as PrismaAppointmentStatus,
  Prisma,
} from "@prisma/client";

import { prisma } from "../src/lib/prisma";
import { buildSeedSnapshot } from "../src/lib/demo-data";

const statusMap: Record<string, PrismaAppointmentStatus> = {
  pending: PrismaAppointmentStatus.PENDING,
  confirmed: PrismaAppointmentStatus.CONFIRMED,
  completed: PrismaAppointmentStatus.COMPLETED,
  cancelled: PrismaAppointmentStatus.CANCELLED,
  no_show: PrismaAppointmentStatus.NO_SHOW,
};

const sourceMap: Record<string, PrismaAppointmentSource> = {
  web: PrismaAppointmentSource.WEB,
  phone: PrismaAppointmentSource.PHONE,
  walk_in: PrismaAppointmentSource.WALK_IN,
  referral: PrismaAppointmentSource.REFERRAL,
  manual: PrismaAppointmentSource.MANUAL,
};

async function main() {
  const snapshot = buildSeedSnapshot();

  await prisma.$transaction([
    prisma.appointment.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.staffAvailability.deleteMany(),
    prisma.blockedTime.deleteMany(),
    prisma.closure.deleteMany(),
    prisma.staffService.deleteMany(),
    prisma.service.deleteMany(),
    prisma.staff.deleteMany(),
    prisma.businessHour.deleteMany(),
    prisma.businessSettings.deleteMany(),
    prisma.business.deleteMany(),
  ]);

  await prisma.business.create({
    data: {
      ...snapshot.business,
    },
  });

  await prisma.businessSettings.create({
    data: {
      ...snapshot.settings,
      depositAmount:
        snapshot.settings.depositAmount === null
          ? null
          : new Prisma.Decimal(snapshot.settings.depositAmount),
    },
  });

  await prisma.businessHour.createMany({
    data: snapshot.businessHours.map((businessHour) => ({
      ...businessHour,
      businessId: snapshot.business.id,
    })),
  });

  await prisma.closure.createMany({
    data: snapshot.closures.map((closure) => ({
      ...closure,
      businessId: snapshot.business.id,
      date: new Date(closure.date),
    })),
  });

  await prisma.blockedTime.createMany({
    data: snapshot.blockedTimes.map((blockedTime) => ({
      ...blockedTime,
      businessId: snapshot.business.id,
      startsAt: new Date(blockedTime.startsAt),
      endsAt: new Date(blockedTime.endsAt),
    })),
  });

  await prisma.staff.createMany({
    data: snapshot.staff.map((member) => ({
      ...member,
      businessId: snapshot.business.id,
    })),
  });

  await prisma.staffAvailability.createMany({
    data: snapshot.staffAvailabilities,
  });

  await prisma.service.createMany({
    data: snapshot.services.map((service) => ({
      ...service,
      businessId: snapshot.business.id,
      price: new Prisma.Decimal(service.price),
    })),
  });

  await prisma.customer.createMany({
    data: snapshot.customers.map((customer) => ({
      ...customer,
      businessId: snapshot.business.id,
      createdAt: new Date(customer.createdAt),
    })),
  });

  await prisma.staffService.createMany({
    data: snapshot.staffServices,
  });

  await prisma.appointment.createMany({
    data: snapshot.appointments.map((appointment) => ({
      ...appointment,
      startsAt: new Date(appointment.startsAt),
      endsAt: new Date(appointment.endsAt),
      status: statusMap[appointment.status],
      source: sourceMap[appointment.source],
      createdAt: new Date(appointment.createdAt),
      updatedAt: new Date(appointment.updatedAt),
    })),
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
