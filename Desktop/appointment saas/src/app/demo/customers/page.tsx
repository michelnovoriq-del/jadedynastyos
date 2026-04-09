import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/demo/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAppointmentRecords, getAppData, getCustomerRecords } from "@/lib/data";
import { formatDateTime, resolveDemoRole } from "@/lib/utils";

const DEMO_STAFF_ID = "staff_maya_idris";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const role = resolveDemoRole(params.role);
  const query = typeof params.q === "string" ? params.q.toLowerCase() : "";
  const data = await getAppData();
  const scopedAppointments =
    role === "staff"
      ? getAppointmentRecords(data).filter((appointment) => appointment.staffId === DEMO_STAFF_ID)
      : getAppointmentRecords(data);
  const customerIds = new Set(scopedAppointments.map((appointment) => appointment.customerId));
  const customers = getCustomerRecords(data)
    .filter((customer) => (role === "staff" ? customerIds.has(customer.id) : true))
    .filter((customer) => {
      if (!query) {
        return true;
      }

      return (
        `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query)
      );
    });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Customers"
        title={role === "staff" ? "Assigned customer records" : "Customer management"}
        description="Review client details, visit history, appointment notes, and recent activity tied directly to the booking workflow."
        actions={
          <Link href="/book" className={buttonVariants({ variant: "outline" })}>
            Create booking
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <p className="section-kicker">Search</p>
          <CardTitle>Find a customer record</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4 md:flex-row">
            {role === "staff" ? <input type="hidden" name="role" value="staff" /> : null}
            <Input
              name="q"
              defaultValue={query}
              placeholder="Search by name, email, or phone"
              className="flex-1"
            />
            <button type="submit" className={buttonVariants({ className: "md:w-auto" })}>
              Search
            </button>
          </form>
        </CardContent>
      </Card>

      {customers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {customers.map((customer) => (
            <Card key={customer.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-medium">
                      {customer.firstName} {customer.lastName}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">{customer.email}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">{customer.phone}</p>
                  </div>
                  <span className="rounded-full bg-[var(--panel-muted)] px-3 py-1 text-xs">
                    {customer.totalVisits} visits
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {customer.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[rgba(109,123,90,0.08)] px-3 py-1 text-xs text-[var(--foreground)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-5 space-y-3 rounded-[22px] bg-[var(--panel-muted)] p-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                      Upcoming
                    </p>
                    <p className="mt-1 text-sm">
                      {customer.upcomingAppointment
                        ? formatDateTime(customer.upcomingAppointment.startsAt)
                        : "No future booking"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                      Recent activity
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      {customer.latestAppointment
                        ? `${customer.latestAppointment.service.name} on ${formatDateTime(
                            customer.latestAppointment.startsAt,
                            "MMM d, yyyy",
                          )}`
                        : "New customer record"}
                    </p>
                  </div>
                </div>

                <Link
                  href={
                    role === "staff"
                      ? `/demo/customers/${customer.id}?role=staff`
                      : `/demo/customers/${customer.id}`
                  }
                  className={buttonVariants({ variant: "outline", className: "mt-5 w-full" })}
                >
                  Open profile
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No customers match that search"
          description="Try a broader query to reveal the seeded customer records linked to appointment history."
        />
      )}
    </div>
  );
}

