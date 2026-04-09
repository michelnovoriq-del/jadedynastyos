import Link from "next/link";
import { isAfter, isSameDay, parseISO } from "date-fns";

import { PageHeader } from "@/components/demo/page-header";
import { StatCard } from "@/components/demo/stat-card";
import { StatusBadge } from "@/components/demo/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppointmentRecords, getAppData, getStaffRecords } from "@/lib/data";
import { resolveDemoRole, timeUntil } from "@/lib/utils";

const DEMO_STAFF_ID = "staff_maya_idris";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const role = resolveDemoRole(params.role);
  const data = await getAppData();
  const allRecords = getAppointmentRecords(data);
  const currentStaff = data.staff.find((member) => member.id === DEMO_STAFF_ID) ?? data.staff[0];
  const records =
    role === "staff"
      ? allRecords.filter((appointment) => appointment.staffId === currentStaff.id)
      : allRecords;
  const now = new Date();
  const todayBookings = records.filter((appointment) =>
    isSameDay(parseISO(appointment.startsAt), now),
  );
  const upcomingBookings = records.filter(
    (appointment) =>
      isAfter(parseISO(appointment.startsAt), now) &&
      (appointment.status === "confirmed" || appointment.status === "pending"),
  );
  const completedBookings = records.filter((appointment) => appointment.status === "completed");
  const cancelledBookings = records.filter((appointment) => appointment.status === "cancelled");
  const recentActivity = records
    .slice()
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 6);
  const utilization = getStaffRecords(data)
    .filter((member) => (role === "staff" ? member.id === currentStaff.id : member.active))
    .map((member) => {
      const weeklyMinutes = member.appointments
        .filter((appointment) => appointment.status !== "cancelled")
        .reduce(
          (total, appointment) =>
            total +
            (parseISO(appointment.endsAt).getTime() - parseISO(appointment.startsAt).getTime()) /
              60000,
          0,
        );

      return {
        staff: member,
        bookedHours: Math.round((weeklyMinutes / 60) * 10) / 10,
        utilization: Math.min(96, Math.round((weeklyMinutes / (36 * 60)) * 100)),
      };
    })
    .sort((left, right) => right.utilization - left.utilization)
    .slice(0, role === "staff" ? 1 : 5);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={role === "staff" ? "Staff workspace" : "Owner workspace"}
        title={role === "staff" ? `${currentStaff.name}'s dashboard` : "Business operations dashboard"}
        description={
          role === "staff"
            ? "This scoped view keeps the focus on assigned appointments, personal utilization, and the daily schedule."
            : "Monitor bookings, upcoming appointments, customer movement, and staff utilization from a single, polished scheduling workspace."
        }
        actions={
          <>
            <Link href="/book" className={buttonVariants({ variant: "outline" })}>
              New public booking
            </Link>
            <Link
              href={role === "staff" ? "/demo/calendar?role=staff" : "/demo/calendar"}
              className={buttonVariants()}
            >
              Open calendar
            </Link>
          </>
        }
      />

      {role === "staff" ? (
        <div className="rounded-[28px] border border-[rgba(109,123,90,0.16)] bg-[rgba(109,123,90,0.08)] px-5 py-4 text-sm leading-6 text-[var(--foreground)]">
          Staff mode narrows the demo to a single team member view. Owner mode exposes the full
          business controls, cross-team metrics, and settings management screens.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label={role === "staff" ? "Assigned bookings" : "Total bookings"}
          value={String(records.length)}
          detail={
            role === "staff"
              ? "Appointments assigned to the scoped staff demo user."
              : "Seeded operational appointments spanning all core statuses."
          }
        />
        <StatCard
          label="Today"
          value={String(todayBookings.length)}
          detail="Today's live booking volume in the current workspace scope."
        />
        <StatCard
          label="Upcoming"
          value={String(upcomingBookings.length)}
          detail="Confirmed or pending appointments scheduled ahead."
        />
        <StatCard
          label="Completed"
          value={String(completedBookings.length)}
          detail="Completed visits visible in reporting and customer history."
        />
        <StatCard
          label="Cancelled"
          value={String(cancelledBookings.length)}
          detail="Cancelled appointments that impact capacity and follow-up."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Card>
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-kicker">Upcoming appointments</p>
              <CardTitle>What is next on the schedule</CardTitle>
            </div>
            <Link
              href={role === "staff" ? "/demo/appointments?role=staff" : "/demo/appointments"}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              View appointments
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingBookings.slice(0, 8).map((appointment) => (
              <Link
                key={appointment.id}
                href={
                  role === "staff"
                    ? `/demo/appointments/${appointment.id}?role=staff`
                    : `/demo/appointments/${appointment.id}`
                }
                className="block rounded-[24px] border bg-[rgba(255,255,255,0.52)] p-4 transition hover:bg-[var(--panel-muted)]"
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
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={appointment.status} />
                    <div className="text-right text-sm text-[var(--muted-foreground)]">
                      <p>{timeUntil(appointment.startsAt)}</p>
                      <p>{appointment.reference}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <p className="section-kicker">Utilization</p>
              <CardTitle>{role === "staff" ? "Personal capacity" : "Staff utilization"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {utilization.map((item) => (
                <div key={item.staff.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{item.staff.name}</p>
                      <p className="text-[var(--muted-foreground)]">{item.bookedHours} booked hours</p>
                    </div>
                    <p className="font-medium">{item.utilization}%</p>
                  </div>
                  <div className="h-2 rounded-full bg-[rgba(109,123,90,0.08)]">
                    <div
                      className="h-2 rounded-full bg-[var(--accent)]"
                      style={{ width: `${item.utilization}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="section-kicker">Recent customer activity</p>
              <CardTitle>Operational touchpoints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-[22px] border bg-[rgba(255,255,255,0.5)] p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">
                        {appointment.customer.firstName} {appointment.customer.lastName}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                        {appointment.service.name}
                      </p>
                    </div>
                    <StatusBadge status={appointment.status} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

