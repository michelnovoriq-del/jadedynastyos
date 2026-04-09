import Link from "next/link";

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

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const role = resolveDemoRole(params.role);
  const data = await getAppData();
  const query = typeof params.q === "string" ? params.q : "";
  const status = typeof params.status === "string" ? params.status : "all";
  const serviceId = typeof params.serviceId === "string" ? params.serviceId : "all";
  const staffId =
    role === "staff"
      ? DEMO_STAFF_ID
      : typeof params.staffId === "string"
        ? params.staffId
        : "all";

  const records = filterAppointments(getAppointmentRecords(data), {
    query,
    status,
    serviceId,
    staffId,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Appointments"
        title={role === "staff" ? "Assigned appointments" : "Appointment management"}
        description="Search, filter, and open detailed appointment records to update status, reschedule work, or reassign staff."
        actions={
          <Link href="/book" className={buttonVariants()}>
            Create booking
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <p className="section-kicker">Filters</p>
          <CardTitle>Find the right booking fast</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {role === "staff" ? <input type="hidden" name="role" value="staff" /> : null}
            <div className="space-y-2 xl:col-span-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                name="q"
                defaultValue={query}
                placeholder="Customer, service, reference, or staff"
              />
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
                Apply
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {records.length > 0 ? (
        <>
          <Card className="hidden overflow-hidden xl:block">
            <CardHeader className="border-b border-[rgba(201,186,167,0.55)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="section-kicker">Table view</p>
                  <CardTitle>{records.length} appointments</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <table className="w-full text-left text-sm">
                <thead className="bg-[rgba(243,235,222,0.75)] text-[var(--muted-foreground)]">
                  <tr>
                    <th className="px-6 py-4 font-medium">Appointment</th>
                    <th className="px-6 py-4 font-medium">Customer</th>
                    <th className="px-6 py-4 font-medium">Staff</th>
                    <th className="px-6 py-4 font-medium">Scheduled</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Open</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className="border-t border-[rgba(201,186,167,0.45)] bg-[rgba(255,255,255,0.45)]"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium">{appointment.service.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                          {appointment.reference}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium">
                          {appointment.customer.firstName} {appointment.customer.lastName}
                        </p>
                        <p className="mt-1 text-[var(--muted-foreground)]">{appointment.customer.email}</p>
                      </td>
                      <td className="px-6 py-4">{appointment.staff?.name ?? "Unassigned"}</td>
                      <td className="px-6 py-4">{formatDateTime(appointment.startsAt)}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={appointment.status} />
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={
                            role === "staff"
                              ? `/demo/appointments/${appointment.id}?role=staff`
                              : `/demo/appointments/${appointment.id}`
                          }
                          className={buttonVariants({ variant: "ghost", size: "sm" })}
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <div className="space-y-4 xl:hidden">
            {records.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{appointment.service.name}</p>
                      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                        {appointment.customer.firstName} {appointment.customer.lastName}
                      </p>
                    </div>
                    <StatusBadge status={appointment.status} />
                  </div>
                  <p className="mt-4 text-sm text-[var(--muted-foreground)]">
                    {formatDateTime(appointment.startsAt)}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    {appointment.staff?.name ?? "Unassigned"}
                  </p>
                  <Link
                    href={
                      role === "staff"
                        ? `/demo/appointments/${appointment.id}?role=staff`
                        : `/demo/appointments/${appointment.id}`
                    }
                    className={buttonVariants({ variant: "outline", className: "mt-4 w-full" })}
                  >
                    Open appointment
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          title="No appointments match those filters"
          description="Clear the search or widen the filters to reveal the seeded operational booking data."
        />
      )}
    </div>
  );
}

