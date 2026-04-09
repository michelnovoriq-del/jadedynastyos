import Link from "next/link";
import { addDays, format, isSameDay, parseISO, startOfWeek } from "date-fns";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/demo/page-header";
import { StatusBadge } from "@/components/demo/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { filterAppointments, getAppointmentRecords, getAppData } from "@/lib/data";
import { formatDateTime, resolveDemoRole } from "@/lib/utils";

const DEMO_STAFF_ID = "staff_maya_idris";

function buildCalendarHref(filters: Record<string, string | undefined>) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== "all") {
      params.set(key, value);
    }
  });

  const query = params.toString();
  return query ? `/demo/calendar?${query}` : "/demo/calendar";
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const role = resolveDemoRole(params.role);
  const data = await getAppData();
  const currentStaffId = role === "staff" ? DEMO_STAFF_ID : undefined;
  const currentDate =
    typeof params.date === "string" ? params.date : format(new Date(), "yyyy-MM-dd");
  const view = typeof params.view === "string" ? params.view : "week";
  const status = typeof params.status === "string" ? params.status : "all";
  const serviceId = typeof params.serviceId === "string" ? params.serviceId : "all";
  const staffId =
    role === "staff"
      ? currentStaffId
      : typeof params.staffId === "string"
        ? params.staffId
        : "all";

  const scopedRecords =
    role === "staff"
      ? getAppointmentRecords(data).filter((appointment) => appointment.staffId === currentStaffId)
      : getAppointmentRecords(data);

  const filteredRecords = filterAppointments(scopedRecords, {
    status,
    serviceId,
    staffId,
  });

  const selectedDay = parseISO(`${currentDate}T00:00:00`);
  const weekStart = startOfWeek(selectedDay, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const weeklyAppointments = filteredRecords.filter((appointment) => {
    const appointmentDate = parseISO(appointment.startsAt);
    return appointmentDate >= weekStart && appointmentDate < addDays(weekStart, 7);
  });
  const dailyAppointments = filteredRecords.filter((appointment) =>
    isSameDay(parseISO(appointment.startsAt), selectedDay),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Calendar"
        title={view === "day" ? "Daily schedule" : "Weekly schedule"}
        description="Filter the operational calendar by staff, service, and status while keeping the schedule readable on both desktop and mobile."
        actions={
          <>
            <Link
              href={buildCalendarHref({
                role: role === "staff" ? "staff" : undefined,
                view: "day",
                date: currentDate,
                serviceId,
                status,
                staffId: role === "staff" ? "staff_maya_idris" : staffId,
              })}
              className={buttonVariants({
                variant: view === "day" ? "primary" : "outline",
              })}
            >
              Day view
            </Link>
            <Link
              href={buildCalendarHref({
                role: role === "staff" ? "staff" : undefined,
                view: "week",
                date: currentDate,
                serviceId,
                status,
                staffId: role === "staff" ? "staff_maya_idris" : staffId,
              })}
              className={buttonVariants({
                variant: view === "week" ? "primary" : "outline",
              })}
            >
              Week view
            </Link>
          </>
        }
      />

      <Card>
        <CardHeader>
          <p className="section-kicker">Filters</p>
          <CardTitle>Refine the schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-4 xl:grid-cols-5">
            {role === "staff" ? <input type="hidden" name="role" value="staff" /> : null}
            <input type="hidden" name="view" value={view} />
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input type="date" name="date" defaultValue={currentDate} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select name="status" defaultValue={status}>
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No-show</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Service</label>
              <Select name="serviceId" defaultValue={serviceId}>
                <option value="all">All services</option>
                {data.services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </Select>
            </div>
            {role === "staff" ? null : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Staff</label>
                <Select name="staffId" defaultValue={staffId}>
                  <option value="all">All staff</option>
                  {data.staff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}
            <div className="space-y-2 self-end">
              <button type="submit" className={buttonVariants({ className: "w-full" })}>
                Apply filters
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {view === "week" ? (
        <Card>
          <CardHeader>
            <p className="section-kicker">Weekly view</p>
            <CardTitle>Appointments by day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="hidden gap-4 xl:grid xl:grid-cols-7">
              {weekDays.map((day) => {
                const dayAppointments = weeklyAppointments
                  .filter((appointment) => isSameDay(parseISO(appointment.startsAt), day))
                  .sort((left, right) => left.startsAt.localeCompare(right.startsAt));

                return (
                  <div key={day.toISOString()} className="space-y-3">
                    <div className="rounded-[22px] bg-[var(--panel-muted)] px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                        {format(day, "EEE")}
                      </p>
                      <p className="mt-1 text-sm font-medium">{format(day, "MMM d")}</p>
                    </div>
                    {dayAppointments.length > 0 ? (
                      dayAppointments.map((appointment) => (
                        <Link
                          key={appointment.id}
                          href={
                            role === "staff"
                              ? `/demo/appointments/${appointment.id}?role=staff`
                              : `/demo/appointments/${appointment.id}`
                          }
                          className="block rounded-[22px] border bg-[rgba(255,255,255,0.55)] p-3 transition hover:bg-[var(--panel-muted)]"
                        >
                          <p className="text-sm font-medium">
                            {formatDateTime(appointment.startsAt, "h:mm a")}
                          </p>
                          <p className="mt-1 text-sm text-[var(--foreground)]">
                            {appointment.customer.firstName} {appointment.customer.lastName}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                            {appointment.service.name}
                          </p>
                        </Link>
                      ))
                    ) : (
                      <div className="rounded-[22px] border border-dashed p-4 text-sm text-[var(--muted-foreground)]">
                        No appointments.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="space-y-4 xl:hidden">
              {weekDays.map((day) => {
                const dayAppointments = weeklyAppointments.filter((appointment) =>
                  isSameDay(parseISO(appointment.startsAt), day),
                );

                return (
                  <div key={day.toISOString()} className="rounded-[24px] border p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{format(day, "EEEE")}</p>
                      <p className="text-sm text-[var(--muted-foreground)]">{format(day, "MMM d")}</p>
                    </div>
                    <div className="mt-3 space-y-3">
                      {dayAppointments.length > 0 ? (
                        dayAppointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            className="rounded-[20px] bg-[var(--panel-muted)] p-3"
                          >
                            <p className="text-sm font-medium">
                              {formatDateTime(appointment.startsAt, "h:mm a")}
                            </p>
                            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                              {appointment.customer.firstName} {appointment.customer.lastName}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-[var(--muted-foreground)]">No appointments.</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <p className="section-kicker">Day list</p>
            <CardTitle>Appointments for {format(selectedDay, "EEEE, MMMM d")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dailyAppointments.length > 0 ? (
              dailyAppointments.map((appointment) => (
                <Link
                  key={appointment.id}
                  href={
                    role === "staff"
                      ? `/demo/appointments/${appointment.id}?role=staff`
                      : `/demo/appointments/${appointment.id}`
                  }
                  className="block rounded-[24px] border bg-[rgba(255,255,255,0.55)] p-4 transition hover:bg-[var(--panel-muted)]"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {appointment.customer.firstName} {appointment.customer.lastName}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                        {appointment.service.name} with {appointment.staff?.name ?? "Unassigned"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={appointment.status} />
                      <p className="text-sm font-medium">
                        {formatDateTime(appointment.startsAt, "h:mm a")}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <EmptyState
                title="No appointments for this day"
                description="Try a different date or widen the staff and status filters to reveal more of the schedule."
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

