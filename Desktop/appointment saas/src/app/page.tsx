import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppData, getAppointmentRecords, getDashboardMetrics, getUpcomingAppointments } from "@/lib/data";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default async function HomePage() {
  const data = await getAppData();
  const metrics = getDashboardMetrics(data);
  const upcomingAppointments = getUpcomingAppointments(getAppointmentRecords(data), 4);
  const activeServices = data.services.filter((service) => service.active).slice(0, 4);

  return (
    <main className="min-h-screen px-4 py-6 lg:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="panel overflow-hidden px-6 py-8 md:px-10 md:py-10">
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1.2fr)_420px] xl:items-start">
            <div className="space-y-7">
              <div className="space-y-4">
                <p className="section-kicker">Appointment Booking & Scheduling System</p>
                <h1 className="max-w-4xl font-serif text-[3.3rem] leading-[0.92] text-[var(--foreground)] md:text-[4.8rem]">
                  Quiet luxury scheduling software for real service businesses.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-[var(--muted-foreground)] md:text-lg">
                  A portfolio-grade proof product for salons, clinics, consultants, coaches,
                  wellness studios, and service teams that need booking, customer records, staff
                  scheduling, and operational visibility in one polished system.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/book" className={buttonVariants({ size: "lg" })}>
                  Book appointment
                </Link>
                <Link
                  href="/demo"
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  View admin demo
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[28px] border bg-[rgba(255,255,255,0.58)] p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                    Total bookings
                  </p>
                  <p className="mt-3 font-serif text-4xl">{metrics.totalBookings}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                    Realistic seeded appointments across active, completed, cancelled, and no-show
                    states.
                  </p>
                </div>
                <div className="rounded-[28px] border bg-[rgba(255,255,255,0.58)] p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                    Service catalog
                  </p>
                  <p className="mt-3 font-serif text-4xl">{data.services.length}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                    Bookable services with duration, pricing, categories, and staff assignment logic.
                  </p>
                </div>
                <div className="rounded-[28px] border bg-[rgba(255,255,255,0.58)] p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                    Team coverage
                  </p>
                  <p className="mt-3 font-serif text-4xl">{data.staff.filter((member) => member.active).length}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                    Active specialists with schedule controls, utilization insight, and availability rules.
                  </p>
                </div>
              </div>
            </div>

            <Card className="bg-[rgba(255,255,255,0.62)]">
              <CardHeader>
                <p className="section-kicker">Live preview</p>
                <CardTitle>Operational snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[24px] bg-[var(--panel-muted)] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                    Today
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-2xl font-medium">{metrics.todayBookings}</p>
                      <p className="text-sm text-[var(--muted-foreground)]">bookings scheduled</p>
                    </div>
                    <div>
                      <p className="text-2xl font-medium">{metrics.upcomingBookings}</p>
                      <p className="text-sm text-[var(--muted-foreground)]">upcoming appointments</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="rounded-[22px] border bg-[rgba(255,255,255,0.5)] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">
                            {appointment.customer.firstName} {appointment.customer.lastName}
                          </p>
                          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                            {appointment.service.name} with {appointment.staff?.name ?? "Assigned staff"}
                          </p>
                        </div>
                        <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs">
                          {formatDateTime(appointment.startsAt, "EEE h:mm a")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <Card>
            <CardHeader>
              <p className="section-kicker">Built for SME operations</p>
              <CardTitle>Everything points to believable day-to-day workflows</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] bg-[var(--panel-muted)] p-4">
                <p className="text-sm font-medium">Bookings and scheduling</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  Multi-step public booking flow, appointment table, daily and weekly calendar views,
                  and reschedule/cancel controls.
                </p>
              </div>
              <div className="rounded-[24px] bg-[var(--panel-muted)] p-4">
                <p className="text-sm font-medium">Customer operations</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  Customer profiles, visit history, notes, contact information, and recent activity
                  linked directly to bookings.
                </p>
              </div>
              <div className="rounded-[24px] bg-[var(--panel-muted)] p-4">
                <p className="text-sm font-medium">Admin control</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  Staff assignment, service catalog, availability rules, booking policies, and
                  role-based owner versus staff views.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="section-kicker">Service examples</p>
              <CardTitle>Believable premium catalog</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeServices.map((service) => (
                <div
                  key={service.id}
                  className="rounded-[24px] border bg-[rgba(255,255,255,0.52)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{service.name}</p>
                      <p className="mt-1 text-sm text-[var(--muted-foreground)]">{service.category}</p>
                    </div>
                    <p className="text-sm font-medium">
                      {formatCurrency(service.price, data.business.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

