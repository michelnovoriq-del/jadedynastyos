import { addDays, addMinutes, getDay, startOfDay } from "date-fns";

import {
  combineDateAndTime,
  getBusinessHour,
  getStaffAvailability,
  minutesToTime,
  timeToMinutes,
  toDateKey,
} from "@/lib/booking";
import {
  Appointment,
  AppointmentSource,
  AppointmentStatus,
  BlockedTime,
  Business,
  BusinessHour,
  BusinessSettings,
  Closure,
  Customer,
  DemoAppData,
  Service,
  Staff,
  StaffAvailability,
  StaffService,
} from "@/lib/types";

const BUSINESS_ID = "biz_atelier_reserve";

function isoDate(value: Date) {
  return value.toISOString();
}

function intervalsOverlap(
  leftStart: number,
  leftEnd: number,
  rightStart: number,
  rightEnd: number,
) {
  return leftStart < rightEnd && rightStart < leftEnd;
}

const dayLabels = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function buildSeedSnapshot(baseDate = new Date()): DemoAppData {
  const anchor = startOfDay(baseDate);

  const business: Business = {
    id: BUSINESS_ID,
    name: "Atelier Reserve",
    slug: "atelier-reserve",
    tagline: "Appointment operations for premium service businesses.",
    description:
      "Atelier Reserve is a polished scheduling system for service-led teams that need reliable bookings, staff coordination, and client visibility without enterprise overhead.",
    email: "hello@atelierreserve.demo",
    phone: "+1 (202) 555-0188",
    website: "www.atelierreserve.demo",
    addressLine1: "58 Mercer House",
    addressLine2: "Suite 204",
    city: "Washington",
    region: "DC",
    postalCode: "20005",
    timezone: "America/New_York",
    currency: "USD",
    industries: ["Salon", "Wellness studio", "Aesthetic clinic", "Consulting"],
  };

  const settings: BusinessSettings = {
    id: "settings_atelier_reserve",
    businessId: BUSINESS_ID,
    bookingLeadHours: 4,
    cancellationWindowHours: 24,
    bufferMinutes: 15,
    allowStaffSelection: true,
    autoConfirmBookings: false,
    sendEmailNotifications: true,
    sendSmsNotifications: false,
    reminderHoursBefore: 24,
    dailyAgendaDigest: true,
    collectCustomerNotes: true,
    depositRequired: false,
    depositAmount: null,
    notes:
      "Premium booking experience with manual review for first-time color and bridal appointments.",
  };

  const businessHours: BusinessHour[] = [
    { id: "hour_sun", dayOfWeek: 0, label: "Sunday", opensAt: null, closesAt: null, isOpen: false },
    { id: "hour_mon", dayOfWeek: 1, label: "Monday", opensAt: "09:00", closesAt: "18:00", isOpen: true },
    { id: "hour_tue", dayOfWeek: 2, label: "Tuesday", opensAt: "09:00", closesAt: "18:00", isOpen: true },
    { id: "hour_wed", dayOfWeek: 3, label: "Wednesday", opensAt: "09:00", closesAt: "18:00", isOpen: true },
    { id: "hour_thu", dayOfWeek: 4, label: "Thursday", opensAt: "09:00", closesAt: "18:00", isOpen: true },
    { id: "hour_fri", dayOfWeek: 5, label: "Friday", opensAt: "09:00", closesAt: "18:00", isOpen: true },
    { id: "hour_sat", dayOfWeek: 6, label: "Saturday", opensAt: "10:00", closesAt: "15:00", isOpen: true },
  ];

  const staff: Staff[] = [
    {
      id: "staff_elena_marlowe",
      businessId: BUSINESS_ID,
      name: "Elena Marlowe",
      title: "Studio Director",
      role: "Owner",
      email: "elena@atelierreserve.demo",
      phone: "+1 (202) 555-0111",
      bio: "Oversees premium bookings, bridal consultations, and complex appointment planning.",
      color: "#7B8A6A",
      active: true,
      utilizationTarget: 82,
    },
    {
      id: "staff_maya_idris",
      businessId: BUSINESS_ID,
      name: "Maya Idris",
      title: "Senior Stylist",
      role: "Stylist",
      email: "maya@atelierreserve.demo",
      phone: "+1 (202) 555-0112",
      bio: "Leads cut, color, and scalp care appointments for repeat clients and referrals.",
      color: "#9B8164",
      active: true,
      utilizationTarget: 86,
    },
    {
      id: "staff_noa_bennett",
      businessId: BUSINESS_ID,
      name: "Noa Bennett",
      title: "Skin Therapist",
      role: "Therapist",
      email: "noa@atelierreserve.demo",
      phone: "+1 (202) 555-0113",
      bio: "Handles facials, express treatments, and clinical follow-up visits.",
      color: "#8A9377",
      active: true,
      utilizationTarget: 78,
    },
    {
      id: "staff_jules_hart",
      businessId: BUSINESS_ID,
      name: "Jules Hart",
      title: "Recovery Therapist",
      role: "Therapist",
      email: "jules@atelierreserve.demo",
      phone: "+1 (202) 555-0114",
      bio: "Manages recovery sessions, scalp rituals, and longer restorative bookings.",
      color: "#A0866C",
      active: true,
      utilizationTarget: 74,
    },
    {
      id: "staff_priya_lang",
      businessId: BUSINESS_ID,
      name: "Priya Lang",
      title: "Brow & Bridal Specialist",
      role: "Specialist",
      email: "priya@atelierreserve.demo",
      phone: "+1 (202) 555-0115",
      bio: "Supports brow design, event prep, and guest styling appointments.",
      color: "#7E7264",
      active: true,
      utilizationTarget: 70,
    },
    {
      id: "staff_lucian_reed",
      businessId: BUSINESS_ID,
      name: "Lucian Reed",
      title: "Guest Consultant",
      role: "Consultant",
      email: "lucian@atelierreserve.demo",
      phone: "+1 (202) 555-0116",
      bio: "Inactive demo profile used to show staffing controls and availability management.",
      color: "#A69789",
      active: false,
      utilizationTarget: 50,
    },
  ];

  const services: Service[] = [
    {
      id: "service_signature_consultation",
      businessId: BUSINESS_ID,
      name: "Signature Consultation",
      category: "Consultation",
      description: "Intake visit for new clients, treatment planning, and service fit.",
      durationMin: 30,
      price: 45,
      active: true,
    },
    {
      id: "service_precision_cut_finish",
      businessId: BUSINESS_ID,
      name: "Precision Cut & Finish",
      category: "Hair",
      description: "Detailed cut, blow dry, and style refinement for existing clients.",
      durationMin: 60,
      price: 95,
      active: true,
    },
    {
      id: "service_color_refresh",
      businessId: BUSINESS_ID,
      name: "Lived-In Color Refresh",
      category: "Hair",
      description: "Multi-step color maintenance with finish styling and consultation.",
      durationMin: 105,
      price: 165,
      active: true,
    },
    {
      id: "service_scalp_ritual",
      businessId: BUSINESS_ID,
      name: "Scalp Renewal Ritual",
      category: "Wellness",
      description: "Focused scalp treatment with pressure therapy and recovery massage.",
      durationMin: 45,
      price: 70,
      active: true,
    },
    {
      id: "service_signature_facial",
      businessId: BUSINESS_ID,
      name: "Studio Signature Facial",
      category: "Skin",
      description: "Deep treatment facial with consultation, exfoliation, and hydration.",
      durationMin: 75,
      price: 140,
      active: true,
    },
    {
      id: "service_recovery_massage",
      businessId: BUSINESS_ID,
      name: "Recovery Massage Session",
      category: "Wellness",
      description: "Targeted recovery session for clients needing restorative bodywork.",
      durationMin: 60,
      price: 120,
      active: true,
    },
    {
      id: "service_brow_design",
      businessId: BUSINESS_ID,
      name: "Brow Design & Tint",
      category: "Beauty",
      description: "Shape, tint, and refinement for regular maintenance bookings.",
      durationMin: 45,
      price: 65,
      active: true,
    },
    {
      id: "service_bridal_preview",
      businessId: BUSINESS_ID,
      name: "Bridal Preview Session",
      category: "Bridal",
      description: "Long-form trial for bridal styling, timing, and event look planning.",
      durationMin: 90,
      price: 180,
      active: true,
    },
    {
      id: "service_express_glow",
      businessId: BUSINESS_ID,
      name: "Express Glow Treatment",
      category: "Skin",
      description: "Fast glow-up treatment designed for midweek maintenance bookings.",
      durationMin: 30,
      price: 55,
      active: true,
    },
    {
      id: "service_follow_up_review",
      businessId: BUSINESS_ID,
      name: "Follow-Up Treatment Review",
      category: "Consultation",
      description: "Short progress review, aftercare adjustment, and future planning.",
      durationMin: 20,
      price: 35,
      active: true,
    },
    {
      id: "service_seasonal_reset",
      businessId: BUSINESS_ID,
      name: "Seasonal Reset Package",
      category: "Package",
      description: "Inactive bundled package shown for demo service management states.",
      durationMin: 90,
      price: 150,
      active: false,
    },
  ];

  const staffServiceMatrix: Record<string, string[]> = {
    staff_elena_marlowe: [
      "service_signature_consultation",
      "service_precision_cut_finish",
      "service_color_refresh",
      "service_bridal_preview",
      "service_follow_up_review",
      "service_seasonal_reset",
    ],
    staff_maya_idris: [
      "service_signature_consultation",
      "service_precision_cut_finish",
      "service_color_refresh",
      "service_scalp_ritual",
      "service_follow_up_review",
    ],
    staff_noa_bennett: [
      "service_signature_facial",
      "service_express_glow",
      "service_follow_up_review",
    ],
    staff_jules_hart: [
      "service_scalp_ritual",
      "service_recovery_massage",
      "service_follow_up_review",
      "service_seasonal_reset",
    ],
    staff_priya_lang: [
      "service_signature_consultation",
      "service_brow_design",
      "service_bridal_preview",
      "service_express_glow",
    ],
    staff_lucian_reed: ["service_signature_consultation", "service_seasonal_reset"],
  };

  const staffServices: StaffService[] = Object.entries(staffServiceMatrix).flatMap(
    ([staffId, serviceIds], index) =>
      serviceIds.map((serviceId, serviceIndex) => ({
        id: `staff_service_${index + 1}_${serviceIndex + 1}`,
        staffId,
        serviceId,
      })),
  );

  const staffAvailabilityMatrix: Record<string, Array<[string | null, string | null, boolean]>> = {
    staff_elena_marlowe: [
      [null, null, false],
      [null, null, false],
      ["09:00", "17:30", true],
      ["10:00", "18:00", true],
      ["09:00", "17:30", true],
      ["09:00", "17:00", true],
      ["10:00", "15:00", true],
    ],
    staff_maya_idris: [
      [null, null, false],
      ["09:00", "18:00", true],
      ["09:00", "18:00", true],
      ["09:00", "18:00", true],
      ["09:00", "18:00", true],
      ["09:00", "17:30", true],
      ["10:00", "15:00", true],
    ],
    staff_noa_bennett: [
      [null, null, false],
      [null, null, false],
      ["10:00", "18:00", true],
      ["10:00", "18:00", true],
      ["10:00", "18:00", true],
      ["10:00", "18:00", true],
      ["10:00", "15:00", true],
    ],
    staff_jules_hart: [
      [null, null, false],
      ["09:30", "17:30", true],
      ["09:30", "17:30", true],
      ["09:30", "17:30", true],
      ["09:30", "17:30", true],
      ["09:30", "16:00", true],
      [null, null, false],
    ],
    staff_priya_lang: [
      [null, null, false],
      [null, null, false],
      ["11:00", "17:00", true],
      ["10:00", "18:00", true],
      ["10:00", "18:00", true],
      ["10:00", "18:00", true],
      ["10:00", "15:00", true],
    ],
    staff_lucian_reed: [
      [null, null, false],
      [null, null, false],
      [null, null, false],
      [null, null, false],
      ["11:00", "17:00", true],
      ["11:00", "16:00", true],
      ["10:00", "14:00", true],
    ],
  };

  const staffAvailabilities: StaffAvailability[] = staff.flatMap((member) =>
    staffAvailabilityMatrix[member.id].map(([startsAt, endsAt, isWorking], dayOfWeek) => ({
      id: `availability_${member.id}_${dayOfWeek}`,
      staffId: member.id,
      dayOfWeek,
      label: dayLabels[dayOfWeek],
      startsAt,
      endsAt,
      isWorking,
    })),
  );

  const rawCustomers = [
    ["Ava", "Cole"],
    ["Jordan", "Reyes"],
    ["Camille", "Dawson"],
    ["Ethan", "Vale"],
    ["Sienna", "Parker"],
    ["Miles", "Greene"],
    ["Layla", "Ross"],
    ["Naomi", "Pierce"],
    ["Daniel", "Frost"],
    ["Isla", "Bennett"],
    ["Zoe", "Monroe"],
    ["Nora", "Hughes"],
    ["Leah", "Morris"],
    ["Julian", "Cross"],
    ["Mila", "Hayes"],
    ["Chloe", "Ellis"],
    ["Grace", "Adair"],
    ["Owen", "Fletcher"],
    ["Hazel", "Brooks"],
    ["Lila", "Watts"],
    ["Madison", "Reeve"],
    ["Ruby", "Sinclair"],
    ["Theo", "Bishop"],
    ["Aria", "Donovan"],
  ];

  const tagSets = [
    ["VIP", "Color"],
    ["Referral"],
    ["Skincare"],
    ["Consulting"],
    ["Bridal"],
    ["Wellness"],
    ["Returning"],
    ["New client"],
  ];

  const noteSamples = [
    "Prefers weekday afternoons and quiet treatment rooms.",
    "Usually books follow-up care immediately after each visit.",
    "Requested reminder email only, no SMS notifications.",
    "Interested in a longer package once schedule opens next month.",
    "Needs coordinated timing for event preparation.",
    "Often books paired services when availability allows.",
  ];

  const preferredStaffRotation = [
    "staff_maya_idris",
    "staff_elena_marlowe",
    "staff_noa_bennett",
    "staff_priya_lang",
    "staff_jules_hart",
    null,
  ];

  const customers: Customer[] = rawCustomers.map(([firstName, lastName], index) => ({
    id: `customer_${index + 1}`,
    businessId: BUSINESS_ID,
    firstName,
    lastName,
    email: `${firstName}.${lastName}`.toLowerCase() + "@clientmail.demo",
    phone: `+1 (202) 555-${String(1200 + index).padStart(4, "0")}`,
    notes: noteSamples[index % noteSamples.length],
    tags: tagSets[index % tagSets.length],
    preferredStaffId: preferredStaffRotation[index % preferredStaffRotation.length],
    createdAt: isoDate(addDays(anchor, -110 + index * 4)),
  }));

  const closures: Closure[] = [
    {
      id: "closure_private_event",
      businessId: BUSINESS_ID,
      title: "Private studio event",
      date: isoDate(addDays(anchor, 19)),
      notes: "Bookings closed for a brand event and team reset.",
    },
    {
      id: "closure_training_day",
      businessId: BUSINESS_ID,
      title: "Seasonal training day",
      date: isoDate(addDays(anchor, 33)),
      notes: "Team training and service calibration.",
    },
  ];

  const blockedTimes: BlockedTime[] = [
    {
      id: "blocked_team_photography",
      businessId: BUSINESS_ID,
      staffId: null,
      title: "Editorial photography block",
      reason: "Studio-wide content shoot",
      startsAt: isoDate(combineDateAndTime(toDateKey(addDays(anchor, 8)), "12:00")),
      endsAt: isoDate(combineDateAndTime(toDateKey(addDays(anchor, 8)), "14:30")),
    },
    {
      id: "blocked_maya_training",
      businessId: BUSINESS_ID,
      staffId: "staff_maya_idris",
      title: "Color lab training",
      reason: "Product training block",
      startsAt: isoDate(combineDateAndTime(toDateKey(addDays(anchor, 4)), "13:00")),
      endsAt: isoDate(combineDateAndTime(toDateKey(addDays(anchor, 4)), "15:00")),
    },
    {
      id: "blocked_noa_supply",
      businessId: BUSINESS_ID,
      staffId: "staff_noa_bennett",
      title: "Treatment room restock",
      reason: "Inventory and room reset",
      startsAt: isoDate(combineDateAndTime(toDateKey(addDays(anchor, 2)), "11:30")),
      endsAt: isoDate(combineDateAndTime(toDateKey(addDays(anchor, 2)), "12:30")),
    },
    {
      id: "blocked_priya_event_trial",
      businessId: BUSINESS_ID,
      staffId: "staff_priya_lang",
      title: "On-site bridal call",
      reason: "External event preparation",
      startsAt: isoDate(combineDateAndTime(toDateKey(addDays(anchor, 6)), "10:00")),
      endsAt: isoDate(combineDateAndTime(toDateKey(addDays(anchor, 6)), "13:00")),
    },
  ];

  const activeServices = services.filter((service) => service.active);
  const scheduledIntervals = new Map<string, Array<{ start: number; end: number }>>();

  const statusForOffset = (offset: number, index: number): AppointmentStatus => {
    if (offset < -1) {
      const cycle: AppointmentStatus[] = [
        "completed",
        "completed",
        "completed",
        "cancelled",
        "completed",
        "no_show",
      ];
      return cycle[index % cycle.length];
    }

    if (offset === -1) {
      const cycle: AppointmentStatus[] = ["completed", "completed", "cancelled"];
      return cycle[index % cycle.length];
    }

    if (offset === 0) {
      const cycle: AppointmentStatus[] = ["confirmed", "confirmed", "pending"];
      return cycle[index % cycle.length];
    }

    const cycle: AppointmentStatus[] = [
      "confirmed",
      "confirmed",
      "pending",
      "confirmed",
      "cancelled",
    ];
    return cycle[index % cycle.length];
  };

  const sourceCycle: AppointmentSource[] = ["web", "phone", "referral", "manual", "walk_in"];
  const appointments: Appointment[] = [];
  let appointmentIndex = 0;

  for (let offset = -12; offset <= 15; offset += 1) {
    const day = addDays(anchor, offset);
    const dayKey = toDateKey(day);
    const dayOfWeek = getDay(day);
    const businessHour = getBusinessHour(
      {
        business,
        settings,
        businessHours,
        staff,
        staffAvailabilities,
        services,
        staffServices,
        customers,
        appointments: [],
        blockedTimes,
        closures,
      },
      dayOfWeek,
    );

    if (!businessHour?.isOpen || !businessHour.opensAt || !businessHour.closesAt) {
      continue;
    }

    if (closures.some((closure) => toDateKey(closure.date) === dayKey)) {
      continue;
    }

    const dailyCount = dayOfWeek === 6 ? 2 : offset % 3 === 0 ? 3 : 2;

    for (let slotIndex = 0; slotIndex < dailyCount; slotIndex += 1) {
      let service = activeServices[(appointmentIndex + slotIndex) % activeServices.length];
      let staffId: string | null = null;

      for (let attempt = 0; attempt < activeServices.length; attempt += 1) {
        const candidateService = activeServices[(appointmentIndex + attempt) % activeServices.length];
        const candidateStaffIds = staffServices
          .filter((assignment) => assignment.serviceId === candidateService.id)
          .map((assignment) => assignment.staffId)
          .filter((candidateStaffId) => {
            const member = staff.find((item) => item.id === candidateStaffId);
            const availability = getStaffAvailability(
              {
                business,
                settings,
                businessHours,
                staff,
                staffAvailabilities,
                services,
                staffServices,
                customers,
                appointments: [],
                blockedTimes,
                closures,
              },
              candidateStaffId,
              dayOfWeek,
            );

            return Boolean(member?.active && availability?.isWorking);
          });

        if (candidateStaffIds.length > 0) {
          service = candidateService;
          staffId = candidateStaffIds[(appointmentIndex + attempt) % candidateStaffIds.length];
          break;
        }
      }

      if (!staffId) {
        continue;
      }

      const availability = getStaffAvailability(
        {
          business,
          settings,
          businessHours,
          staff,
          staffAvailabilities,
          services,
          staffServices,
          customers,
          appointments: [],
          blockedTimes,
          closures,
        },
        staffId,
        dayOfWeek,
      );

      if (!availability?.startsAt || !availability.endsAt) {
        continue;
      }

      const businessOpen = timeToMinutes(businessHour.opensAt);
      const businessClose = timeToMinutes(businessHour.closesAt);
      const staffOpen = timeToMinutes(availability.startsAt);
      const staffClose = timeToMinutes(availability.endsAt);
      const windowOpen = Math.max(businessOpen, staffOpen);
      const windowClose = Math.min(businessClose, staffClose);
      const offsetOptions = dayOfWeek === 6 ? [0, 120, 225] : [0, 90, 180, 300, 390];
      const scheduleKey = `${staffId}-${dayKey}`;
      const scheduled = scheduledIntervals.get(scheduleKey) ?? [];
      let startMinute: number | null = null;

      for (let attempt = 0; attempt < offsetOptions.length; attempt += 1) {
        const proposedStart = windowOpen + offsetOptions[(slotIndex + attempt) % offsetOptions.length];
        const proposedEnd = proposedStart + service.durationMin;

        if (proposedEnd > windowClose) {
          continue;
        }

        const blocked = blockedTimes.some((blockedTime) => {
          if (blockedTime.staffId && blockedTime.staffId !== staffId) {
            return false;
          }

          if (toDateKey(blockedTime.startsAt) !== dayKey) {
            return false;
          }

          const blockedStart = new Date(blockedTime.startsAt);
          const blockedEnd = new Date(blockedTime.endsAt);
          const blockedStartMinute = blockedStart.getHours() * 60 + blockedStart.getMinutes();
          const blockedEndMinute = blockedEnd.getHours() * 60 + blockedEnd.getMinutes();

          return intervalsOverlap(proposedStart, proposedEnd, blockedStartMinute, blockedEndMinute);
        });

        if (blocked) {
          continue;
        }

        const conflict = scheduled.some((interval) =>
          intervalsOverlap(
            proposedStart - settings.bufferMinutes,
            proposedEnd + settings.bufferMinutes,
            interval.start,
            interval.end,
          ),
        );

        if (!conflict) {
          startMinute = proposedStart;
          break;
        }
      }

      if (startMinute === null) {
        continue;
      }

      const startsAt = combineDateAndTime(dayKey, minutesToTime(startMinute));
      const endsAt = addMinutes(startsAt, service.durationMin);
      const customer = customers[(appointmentIndex * 2 + slotIndex) % customers.length];
      const status = statusForOffset(offset, appointmentIndex + slotIndex);
      const notes =
        status === "cancelled"
          ? "Client cancelled within the review window and requested a rebook option."
          : status === "no_show"
            ? "No-show flagged by front desk after fifteen-minute grace period."
            : `${service.name} with ${staff.find((member) => member.id === staffId)?.name}.`;

      appointments.push({
        id: `appointment_${String(appointmentIndex + 1).padStart(3, "0")}`,
        businessId: BUSINESS_ID,
        reference: `AR-${String(appointmentIndex + 1042)}`,
        customerId: customer.id,
        staffId,
        serviceId: service.id,
        startsAt: isoDate(startsAt),
        endsAt: isoDate(endsAt),
        status,
        source: sourceCycle[(appointmentIndex + slotIndex) % sourceCycle.length],
        notes,
        createdAt: isoDate(addDays(startsAt, -8)),
        updatedAt: isoDate(addDays(startsAt, status === "cancelled" ? -1 : -2)),
      });

      scheduled.push({ start: startMinute, end: startMinute + service.durationMin });
      scheduledIntervals.set(scheduleKey, scheduled);
      appointmentIndex += 1;
    }
  }

  return {
    business,
    settings,
    businessHours,
    staff,
    staffAvailabilities,
    services,
    staffServices,
    customers,
    appointments: appointments.sort((left, right) => left.startsAt.localeCompare(right.startsAt)),
    blockedTimes,
    closures,
  };
}
