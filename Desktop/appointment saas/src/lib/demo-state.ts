import { cookies } from "next/headers";

import { buildSeedSnapshot } from "@/lib/demo-data";
import { DemoAppData, DemoMutationState } from "@/lib/types";

const DEMO_COOKIE = "atelier-reserve-demo-state";

export function createEmptyDemoState(): DemoMutationState {
  return {
    createdCustomers: [],
    createdAppointments: [],
    appointmentOverrides: {},
    staffStatus: {},
    serviceStatus: {},
    settings: null,
  };
}

export async function readDemoState() {
  const cookieStore = await cookies();
  const rawValue = cookieStore.get(DEMO_COOKIE)?.value;

  if (!rawValue) {
    return createEmptyDemoState();
  }

  try {
    const parsed = JSON.parse(rawValue) as DemoMutationState;

    return {
      ...createEmptyDemoState(),
      ...parsed,
      createdCustomers: parsed.createdCustomers ?? [],
      createdAppointments: parsed.createdAppointments ?? [],
      appointmentOverrides: parsed.appointmentOverrides ?? {},
      staffStatus: parsed.staffStatus ?? {},
      serviceStatus: parsed.serviceStatus ?? {},
      settings: parsed.settings ?? null,
    };
  } catch {
    return createEmptyDemoState();
  }
}

export async function writeDemoState(state: DemoMutationState) {
  const cookieStore = await cookies();

  cookieStore.set(DEMO_COOKIE, JSON.stringify(state), {
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export function mergeDemoData(baseData: DemoAppData, state: DemoMutationState): DemoAppData {
  const customers = [...baseData.customers];

  for (const createdCustomer of state.createdCustomers) {
    const existingIndex = customers.findIndex((customer) => customer.id === createdCustomer.id);

    if (existingIndex >= 0) {
      customers[existingIndex] = createdCustomer;
    } else {
      customers.push(createdCustomer);
    }
  }

  const appointments = baseData.appointments.map((appointment) => ({
    ...appointment,
    ...state.appointmentOverrides[appointment.id],
  }));

  for (const createdAppointment of state.createdAppointments) {
    const existingIndex = appointments.findIndex(
      (appointment) => appointment.id === createdAppointment.id,
    );

    if (existingIndex >= 0) {
      appointments[existingIndex] = createdAppointment;
    } else {
      appointments.push(createdAppointment);
    }
  }

  return {
    ...baseData,
    settings: {
      ...baseData.settings,
      ...(state.settings ?? {}),
    },
    staff: baseData.staff.map((member) => ({
      ...member,
      active: state.staffStatus[member.id] ?? member.active,
    })),
    services: baseData.services.map((service) => ({
      ...service,
      active: state.serviceStatus[service.id] ?? service.active,
    })),
    customers: customers.sort((left, right) => left.createdAt.localeCompare(right.createdAt)),
    appointments: appointments.sort((left, right) => left.startsAt.localeCompare(right.startsAt)),
  };
}

export async function getMergedDemoData() {
  return mergeDemoData(buildSeedSnapshot(), await readDemoState());
}
