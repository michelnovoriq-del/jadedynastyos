import Link from "next/link";

import { PageHeader } from "@/components/demo/page-header";
import { StatusBadge } from "@/components/demo/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppData, getCustomerRecords } from "@/lib/data";
import { formatDateTime, resolveDemoRole } from "@/lib/utils";

export default async function CustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ customerId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ customerId }, query] = await Promise.all([params, searchParams]);
  const role = resolveDemoRole(query.role);
  const data = await getAppData();
  const customer = getCustomerRecords(data).find((item) => item.id === customerId);

  if (!customer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer not found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--muted-foreground)]">
            This profile is not available in the active demo dataset.
          </p>
        </CardContent>
      </Card>
    );
  }

  const preferredStaff =
    data.staff.find((member) => member.id === customer.preferredStaffId) ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Customer profile"
        title={`${customer.firstName} ${customer.lastName}`}
        description="Customer records connect contact details, notes, appointment history, and upcoming visits from the booking workflow."
        actions={
          <Link
            href={role === "staff" ? "/demo/customers?role=staff" : "/demo/customers"}
            className={buttonVariants({ variant: "outline" })}
          >
            Back to customers
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <p className="section-kicker">Profile</p>
              <CardTitle>Customer details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[24px] bg-[var(--panel-muted)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                  Contact
                </p>
                <p className="mt-2 text-sm">{customer.email}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{customer.phone}</p>
              </div>
              <div className="rounded-[24px] border bg-[rgba(255,255,255,0.55)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                  Notes
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  {customer.notes ?? "No notes recorded for this customer."}
                </p>
              </div>
              <div className="rounded-[24px] border bg-[rgba(255,255,255,0.55)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                  Preferred staff
                </p>
                <p className="mt-2 text-sm">{preferredStaff?.name ?? "No preference saved"}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {customer.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[rgba(109,123,90,0.08)] px-3 py-1 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="section-kicker">Account summary</p>
              <CardTitle>Visit metrics</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[22px] bg-[var(--panel-muted)] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                  Completed visits
                </p>
                <p className="mt-2 font-serif text-4xl">{customer.totalVisits}</p>
              </div>
              <div className="rounded-[22px] bg-[var(--panel-muted)] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                  Upcoming booking
                </p>
                <p className="mt-2 text-sm">
                  {customer.upcomingAppointment
                    ? formatDateTime(customer.upcomingAppointment.startsAt, "MMM d, h:mm a")
                    : "None scheduled"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <p className="section-kicker">History</p>
            <CardTitle>Appointment timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {customer.appointments.map((appointment) => (
              <Link
                key={appointment.id}
                href={
                  role === "staff"
                    ? `/demo/appointments/${appointment.id}?role=staff`
                    : `/demo/appointments/${appointment.id}`
                }
                className="block rounded-[24px] border bg-[rgba(255,255,255,0.5)] p-4 transition hover:bg-[var(--panel-muted)]"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium">{appointment.service.name}</p>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      {appointment.staff?.name ?? "Unassigned"} · {formatDateTime(appointment.startsAt)}
                    </p>
                  </div>
                  <StatusBadge status={appointment.status} />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

