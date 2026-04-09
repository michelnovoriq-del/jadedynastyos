"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";

import { buttonVariants, Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getBookableDays, getBookingSlots } from "@/lib/booking";
import { DemoAppData } from "@/lib/types";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";

const steps = [
  "Select service",
  "Choose staff",
  "Pick a slot",
  "Customer details",
  "Review",
];

function SubmitBookingButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {pending ? "Confirming booking..." : "Confirm booking"}
    </Button>
  );
}

export function BookingFlow({
  data,
  submitAction,
}: {
  data: DemoAppData;
  submitAction: (formData: FormData) => void | Promise<void>;
}) {
  const activeServices = data.services.filter((service) => service.active);
  const bookableDays = getBookableDays(data, 8);
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState(activeServices[0]?.id ?? "");
  const [preferredStaffId, setPreferredStaffId] = useState("");
  const [selectedDate, setSelectedDate] = useState(bookableDays[0]?.dateKey ?? "");
  const [selectedSlotStart, setSelectedSlotStart] = useState("");
  const [customerDetails, setCustomerDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
  });

  const selectedService = activeServices.find((service) => service.id === serviceId) ?? null;
  const availableStaff = data.staff.filter(
    (member) =>
      member.active &&
      data.staffServices.some(
        (assignment) => assignment.staffId === member.id && assignment.serviceId === serviceId,
      ),
  );
  const slots = selectedService
    ? getBookingSlots(data, selectedDate, selectedService.id, preferredStaffId || undefined)
    : [];
  const selectedSlot = slots.find((slot) => slot.startsAt === selectedSlotStart) ?? null;
  const assignedStaff =
    data.staff.find((member) => member.id === (selectedSlot?.staffId ?? preferredStaffId)) ?? null;

  useEffect(() => {
    if (!selectedSlotStart) {
      return;
    }

    if (!slots.some((slot) => slot.startsAt === selectedSlotStart)) {
      setSelectedSlotStart("");
    }
  }, [selectedSlotStart, slots]);

  const customerDetailsComplete =
    customerDetails.firstName &&
    customerDetails.lastName &&
    customerDetails.email &&
    customerDetails.phone;

  const canContinue =
    (step === 0 && Boolean(serviceId)) ||
    (step === 1 && Boolean(serviceId)) ||
    (step === 2 && Boolean(selectedSlot)) ||
    (step === 3 && Boolean(customerDetailsComplete));

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_380px]">
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-[rgba(201,186,167,0.55)] pb-5">
          <div className="flex flex-wrap gap-2">
            {steps.map((item, index) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  if (index <= step) {
                    setStep(index);
                  }
                }}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs transition",
                  index === step
                    ? "bg-[var(--accent)] text-[var(--panel-strong)]"
                    : index < step
                      ? "bg-[rgba(109,123,90,0.12)] text-[var(--foreground)]"
                      : "bg-[var(--panel-muted)] text-[var(--muted-foreground)]",
                )}
              >
                {index + 1}. {item}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {step === 0 ? (
            <div className="space-y-6">
              <div>
                <p className="section-kicker">Step 1</p>
                <h2 className="mt-2 font-serif text-[2rem]">Choose a service</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)]">
                  Select the appointment type that matches the visit. Duration and pricing update
                  automatically in the summary panel.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {activeServices.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => {
                      setServiceId(service.id);
                      setPreferredStaffId("");
                      setSelectedSlotStart("");
                    }}
                    className={cn(
                      "rounded-[28px] border p-5 text-left transition",
                      service.id === serviceId
                        ? "border-[var(--accent)] bg-[rgba(109,123,90,0.08)]"
                        : "bg-[rgba(255,255,255,0.55)] hover:bg-[var(--panel-muted)]",
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                          {service.category}
                        </p>
                        <h3 className="mt-2 text-lg font-medium">{service.name}</h3>
                      </div>
                      <span className="rounded-full bg-[var(--panel)] px-3 py-1 text-xs">
                        {service.durationMin} min
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                      {service.description}
                    </p>
                    <p className="mt-5 text-sm font-medium text-[var(--foreground)]">
                      {formatCurrency(service.price, data.business.currency)}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-6">
              <div>
                <p className="section-kicker">Step 2</p>
                <h2 className="mt-2 font-serif text-[2rem]">Choose staff</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)]">
                  Staff selection is optional. Leave it open and the system will surface the best
                  available options for the chosen service.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setPreferredStaffId("");
                    setSelectedSlotStart("");
                  }}
                  className={cn(
                    "rounded-[28px] border p-5 text-left transition",
                    !preferredStaffId
                      ? "border-[var(--accent)] bg-[rgba(109,123,90,0.08)]"
                      : "bg-[rgba(255,255,255,0.55)] hover:bg-[var(--panel-muted)]",
                  )}
                >
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                    Flexible assignment
                  </p>
                  <h3 className="mt-2 text-lg font-medium">Best available staff</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                    Good for faster booking. Availability will show across all qualified active team
                    members.
                  </p>
                </button>
                {availableStaff.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => {
                      setPreferredStaffId(member.id);
                      setSelectedSlotStart("");
                    }}
                    className={cn(
                      "rounded-[28px] border p-5 text-left transition",
                      preferredStaffId === member.id
                        ? "border-[var(--accent)] bg-[rgba(109,123,90,0.08)]"
                        : "bg-[rgba(255,255,255,0.55)] hover:bg-[var(--panel-muted)]",
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                          {member.role}
                        </p>
                        <h3 className="mt-2 text-lg font-medium">{member.name}</h3>
                      </div>
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: member.color }}
                      />
                    </div>
                    <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
                      {member.title}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                      {member.bio}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-6">
              <div>
                <p className="section-kicker">Step 3</p>
                <h2 className="mt-2 font-serif text-[2rem]">Pick a date and time</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)]">
                  Slots respect service duration, buffer times, staff working hours, and blocked
                  periods from the admin schedule.
                </p>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2">
                {bookableDays.map((day) => (
                  <button
                    key={day.dateKey}
                    type="button"
                    onClick={() => {
                      setSelectedDate(day.dateKey);
                      setSelectedSlotStart("");
                    }}
                    className={cn(
                      "min-w-[88px] rounded-[24px] border px-4 py-3 text-center transition",
                      selectedDate === day.dateKey
                        ? "border-[var(--accent)] bg-[rgba(109,123,90,0.1)]"
                        : "bg-[rgba(255,255,255,0.55)] hover:bg-[var(--panel-muted)]",
                    )}
                  >
                    <p className="text-sm font-medium">{day.title}</p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">{day.subtitle}</p>
                  </button>
                ))}
              </div>

              {slots.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {slots.map((slot) => {
                    const slotStaff = data.staff.find((member) => member.id === slot.staffId);

                    return (
                      <button
                        key={slot.startsAt}
                        type="button"
                        onClick={() => setSelectedSlotStart(slot.startsAt)}
                        className={cn(
                          "rounded-[24px] border p-4 text-left transition",
                          selectedSlotStart === slot.startsAt
                            ? "border-[var(--accent)] bg-[rgba(109,123,90,0.08)]"
                            : "bg-[rgba(255,255,255,0.55)] hover:bg-[var(--panel-muted)]",
                        )}
                      >
                        <p className="text-base font-medium">{formatDateTime(slot.startsAt, "h:mm a")}</p>
                        <p className="mt-2 text-sm text-[var(--foreground)]">
                          {slotStaff?.name ?? "Assigned specialist"}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                          {slotStaff?.title ?? "Qualified team member"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[28px] border border-dashed bg-[rgba(255,255,255,0.5)] p-6">
                  <p className="text-lg font-medium">No open times for this combination</p>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted-foreground)]">
                    Try another day or switch back to best available staff to unlock more options.
                  </p>
                </div>
              )}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-6">
              <div>
                <p className="section-kicker">Step 4</p>
                <h2 className="mt-2 font-serif text-[2rem]">Enter customer details</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)]">
                  Collect the details the business actually needs to prepare, confirm, and follow up
                  on the appointment.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First name</label>
                  <Input
                    value={customerDetails.firstName}
                    onChange={(event) =>
                      setCustomerDetails((current) => ({
                        ...current,
                        firstName: event.target.value,
                      }))
                    }
                    placeholder="Ava"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last name</label>
                  <Input
                    value={customerDetails.lastName}
                    onChange={(event) =>
                      setCustomerDetails((current) => ({
                        ...current,
                        lastName: event.target.value,
                      }))
                    }
                    placeholder="Cole"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={customerDetails.email}
                    onChange={(event) =>
                      setCustomerDetails((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    placeholder="ava@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={customerDetails.phone}
                    onChange={(event) =>
                      setCustomerDetails((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    placeholder="+1 (202) 555-0188"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Notes for the team</label>
                  <Textarea
                    value={customerDetails.notes}
                    onChange={(event) =>
                      setCustomerDetails((current) => ({
                        ...current,
                        notes: event.target.value,
                      }))
                    }
                    placeholder="Share access instructions, preferences, or context for the appointment."
                  />
                </div>
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <form action={submitAction} className="space-y-6">
              <div>
                <p className="section-kicker">Step 5</p>
                <h2 className="mt-2 font-serif text-[2rem]">Review and confirm</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)]">
                  This creates a real demo appointment using the shared booking data layer and sends
                  you to a confirmation summary page.
                </p>
              </div>

              <div className="rounded-[28px] border bg-[rgba(255,255,255,0.55)] p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                      Customer
                    </p>
                    <p className="mt-2 text-lg font-medium">
                      {customerDetails.firstName} {customerDetails.lastName}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      {customerDetails.email}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {customerDetails.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                      Appointment
                    </p>
                    <p className="mt-2 text-lg font-medium">{selectedService?.name}</p>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      {selectedSlot ? formatDateTime(selectedSlot.startsAt) : "Select a slot"}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {assignedStaff?.name ?? "Assigned at confirmation"}
                    </p>
                  </div>
                </div>
              </div>

              <input type="hidden" name="serviceId" value={selectedService?.id ?? ""} />
              <input type="hidden" name="staffId" value={selectedSlot?.staffId ?? ""} />
              <input type="hidden" name="startsAt" value={selectedSlot?.startsAt ?? ""} />
              <input type="hidden" name="firstName" value={customerDetails.firstName} />
              <input type="hidden" name="lastName" value={customerDetails.lastName} />
              <input type="hidden" name="email" value={customerDetails.email} />
              <input type="hidden" name="phone" value={customerDetails.phone} />
              <input type="hidden" name="notes" value={customerDetails.notes} />

              <div className="flex flex-wrap gap-3">
                <SubmitBookingButton />
                <button
                  type="button"
                  className={buttonVariants({ variant: "ghost" })}
                  onClick={() => setStep(3)}
                >
                  Edit details
                </button>
              </div>
            </form>
          ) : null}

          {step < 4 ? (
            <div className="mt-8 flex flex-wrap gap-3 border-t border-[rgba(201,186,167,0.55)] pt-6">
              {step > 0 ? (
                <button
                  type="button"
                  className={buttonVariants({ variant: "ghost" })}
                  onClick={() => setStep((current) => Math.max(0, current - 1))}
                >
                  Back
                </button>
              ) : null}
              <button
                type="button"
                className={buttonVariants({ className: "sm:ml-auto" })}
                onClick={() => setStep((current) => Math.min(4, current + 1))}
                disabled={!canContinue}
              >
                Continue
              </button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <p className="section-kicker">Booking summary</p>
            <CardTitle>Live appointment recap</CardTitle>
            <CardDescription>
              As selections change, this summary updates with service, duration, price, and staff.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[24px] bg-[var(--panel-muted)] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                Service
              </p>
              <p className="mt-2 text-lg font-medium">{selectedService?.name ?? "Not selected"}</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {selectedService
                  ? `${selectedService.durationMin} min · ${formatCurrency(
                      selectedService.price,
                      data.business.currency,
                    )}`
                  : "Choose a service to begin."}
              </p>
            </div>

            <div className="rounded-[24px] border bg-[rgba(255,255,255,0.5)] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                Staff
              </p>
              <p className="mt-2 text-base font-medium">
                {assignedStaff?.name ??
                  (preferredStaffId ? "Choose a slot to confirm staff" : "Best available")}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {assignedStaff?.title ??
                  "Staff assignment is finalized when you select an open appointment time."}
              </p>
            </div>

            <div className="rounded-[24px] border bg-[rgba(255,255,255,0.5)] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                Time
              </p>
              <p className="mt-2 text-base font-medium">
                {selectedSlot ? formatDateTime(selectedSlot.startsAt) : "No time selected"}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Lead time, buffers, and staff schedules are already applied.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[rgba(255,255,255,0.62)]">
          <CardHeader>
            <p className="section-kicker">Need admin access?</p>
            <CardTitle>Switch to the demo workspace</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-[var(--muted-foreground)]">
              Review the owner dashboard, calendar, appointments table, customers, staff schedules,
              and settings without leaving this demo environment.
            </p>
            <Link
              href="/demo"
              className={buttonVariants({ variant: "outline", className: "mt-4 w-full" })}
            >
              View admin demo
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

