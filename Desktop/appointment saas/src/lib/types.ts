export type DemoRole = "admin" | "staff";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type AppointmentSource =
  | "web"
  | "phone"
  | "walk_in"
  | "referral"
  | "manual";

export interface Business {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  region: string | null;
  postalCode: string | null;
  timezone: string;
  currency: string;
  industries: string[];
}

export interface BusinessHour {
  id: string;
  dayOfWeek: number;
  label: string;
  opensAt: string | null;
  closesAt: string | null;
  isOpen: boolean;
}

export interface BusinessSettings {
  id: string;
  businessId: string;
  bookingLeadHours: number;
  cancellationWindowHours: number;
  bufferMinutes: number;
  allowStaffSelection: boolean;
  autoConfirmBookings: boolean;
  sendEmailNotifications: boolean;
  sendSmsNotifications: boolean;
  reminderHoursBefore: number;
  dailyAgendaDigest: boolean;
  collectCustomerNotes: boolean;
  depositRequired: boolean;
  depositAmount: number | null;
  notes: string | null;
}

export interface Staff {
  id: string;
  businessId: string;
  name: string;
  title: string;
  role: string;
  email: string;
  phone: string;
  bio: string;
  color: string;
  active: boolean;
  utilizationTarget: number;
}

export interface StaffAvailability {
  id: string;
  staffId: string;
  dayOfWeek: number;
  label: string;
  startsAt: string | null;
  endsAt: string | null;
  isWorking: boolean;
}

export interface Service {
  id: string;
  businessId: string;
  name: string;
  category: string;
  description: string;
  durationMin: number;
  price: number;
  active: boolean;
}

export interface StaffService {
  id: string;
  staffId: string;
  serviceId: string;
}

export interface Customer {
  id: string;
  businessId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string | null;
  tags: string[];
  preferredStaffId: string | null;
  createdAt: string;
}

export interface Appointment {
  id: string;
  businessId: string;
  reference: string;
  customerId: string;
  staffId: string | null;
  serviceId: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  source: AppointmentSource;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlockedTime {
  id: string;
  businessId: string;
  staffId: string | null;
  title: string;
  reason: string | null;
  startsAt: string;
  endsAt: string;
}

export interface Closure {
  id: string;
  businessId: string;
  title: string;
  date: string;
  notes: string | null;
}

export interface DemoAppData {
  business: Business;
  settings: BusinessSettings;
  businessHours: BusinessHour[];
  staff: Staff[];
  staffAvailabilities: StaffAvailability[];
  services: Service[];
  staffServices: StaffService[];
  customers: Customer[];
  appointments: Appointment[];
  blockedTimes: BlockedTime[];
  closures: Closure[];
}

export interface AppointmentRecord extends Appointment {
  customer: Customer;
  service: Service;
  staff: Staff | null;
}

export interface CustomerRecord extends Customer {
  appointments: AppointmentRecord[];
  totalVisits: number;
  upcomingAppointment: AppointmentRecord | null;
  latestAppointment: AppointmentRecord | null;
}

export interface StaffRecord extends Staff {
  services: Service[];
  availabilities: StaffAvailability[];
  appointments: AppointmentRecord[];
}

export interface ServiceRecord extends Service {
  staffMembers: Staff[];
  appointments: AppointmentRecord[];
}

export interface DemoMutationState {
  createdCustomers: Customer[];
  createdAppointments: Appointment[];
  appointmentOverrides: Record<
    string,
    Partial<Pick<Appointment, "status" | "staffId" | "startsAt" | "endsAt" | "notes">>
  >;
  staffStatus: Record<string, boolean>;
  serviceStatus: Record<string, boolean>;
  settings: Partial<BusinessSettings> | null;
}

export interface BookingSlot {
  staffId: string;
  startsAt: string;
  endsAt: string;
}

