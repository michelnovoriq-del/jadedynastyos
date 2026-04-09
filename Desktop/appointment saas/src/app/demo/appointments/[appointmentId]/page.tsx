import Link from "next/link";
import { format, parseISO } from "date-fns";

import {
  reassignAppointmentStaffAction,
  rescheduleAppointmentAction,
  updateAppointmentStatusAction,
} from "@/lib/actions";
import { PageHeader } from "@/components/demo/page-header";
import { StatusBadge } from "@/components/demo/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getAppointmentRecords, getAppData } from "@/lib/data";
import { formatDateTime, resolveDemoRole } from "@/lib/utils";

export default async function AppointmentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ appointmentId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ appointmentId }, query] = await Promise.all([params, searchParams]);
  const role = resolveDemoRole(query.role);
  const data = await getAppData();
  const records = getAppointmentRecords(data);
  const record = records.find((appointment) => appointment.id === appointmentId);

  if (!record) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Appointment not found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--muted-foreground)]">
            The requested appointment could not be loaded from the current demo dataset.
          </p>
        </CardContent>
      </Card>
    );
  }

  const redirectTo = role === "staff" ? `/demo/appointments/${record.id}?role=staff` : `/demo/appointments/${record.id}`;
  const relatedAppointments = records
    .filter((appointment) => appointment.customerId === record.customerId && appointment.id !== record.id)
    .slice(0, 4);
  const assignableStaff = data.staff.filter((member) =>
    data.staffServices.some(
      (assignment) => assignment.staffId === member.id && assignment.serviceId === record.serviceId,
    ),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Appointment detail"
        title={record.service.name}
        description={`Reference ${record.reference} · Created ${formatDateTime(record.createdAt, "MMM d, yyyy")}`}
        actions={
          <>
            <Link
              href={role === "staff" ? "/demo/appointments?role=staff" : "/demo/appointments"}
              className={buttonVariants({ variant: "outline" })}
            >
              Back to appointments
            </Link>
            <StatusBadge status={record.status} />
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <p className="section-kicker">Overview</p>
              <CardTitle>Appointment summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] bg-[var(--panel-muted)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                  Customer
                </p>
                <p className="mt-2 text-lg font-medium">
                  {record.customer.firstName} {record.customer.lastName}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{record.customer.email}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{record.customer.phone}</p>
              </div>
              <div className="rounded-[24px] bg-[var(--panel-muted)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                  Scheduled
                </p>
                <p className="mt-2 text-lg font-medium">{formatDateTime(record.startsAt)}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Ends {formatDateTime(record.endsAt, "h:mm a")}
                </p>
              </div>
              <div className="rounded-[24px] border bg-[rgba(255,255,255,0.55)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                  Staff
                </p>
                <p className="mt-2 text-lg font-medium">{record.staff?.name ?? "Unassigned"}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {record.staff?.title ?? "Needs assignment"}
                </p>
              </div>
              <div className="rounded-[24px] border bg-[rgba(255,255,255,0.55)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                  Notes
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  {record.notes ?? "No additional notes added to this appointment."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="section-kicker">Customer history</p>
              <CardTitle>Recent related visits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {relatedAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-[22px] border bg-[rgba(255,255,255,0.52)] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">{appointment.service.name}</p>
                      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                        {formatDateTime(appointment.startsAt)}
                      </p>
                    </div>
                    <StatusBadge status={appointment.status} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <p className="section-kicker">Actions</p>
              <CardTitle>
                {role === "staff" ? "Status updates" : "Status, reassignment, and rescheduling"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <form action={updateAppointmentStatusAction} className="space-y-3">
                <input type="hidden" name="appointmentId" value={record.id} />
                <input type="hidden" name="redirectTo" value={redirectTo} />
                <label className="text-sm font-medium">Update status</label>
                <Select name="status" defaultValue={record.status}>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No-show</option>
                </Select>
                <button type="submit" className={buttonVariants({ className: "w-full" })}>
                  Save status
                </button>
              </form>

              {role === "staff" ? null : (
                <>
                  <form action={reassignAppointmentStaffAction} className="space-y-3">
                    <input type="hidden" name="appointmentId" value={record.id} />
                    <input type="hidden" name="redirectTo" value={redirectTo} />
                    <label className="text-sm font-medium">Assign or reassign staff</label>
                    <Select name="staffId" defaultValue={record.staffId ?? "unassigned"}>
                      <option value="unassigned">Unassigned</option>
                      {assignableStaff.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </Select>
                    <button
                      type="submit"
                      className={buttonVariants({ variant: "outline", className: "w-full" })}
                    >
                      Save assignment
                    </button>
                  </form>

                  <form action={rescheduleAppointmentAction} className="space-y-3">
                    <input type="hidden" name="appointmentId" value={record.id} />
                    <input type="hidden" name="redirectTo" value={redirectTo} />
                    <label className="text-sm font-medium">Reschedule</label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        type="date"
                        name="date"
                        defaultValue={format(parseISO(record.startsAt), "yyyy-MM-dd")}
                      />
                      <Input
                        type="time"
                        name="time"
                        defaultValue={format(parseISO(record.startsAt), "HH:mm")}
                      />
                    </div>
                    <button
                      type="submit"
                      className={buttonVariants({ variant: "outline", className: "w-full" })}
                    >
                      Save new time
                    </button>
                  </form>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="section-kicker">Customer profile</p>
              <CardTitle>Linked record</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                Open the customer profile to review visit history, notes, contact information, and
                recent activity tied to this booking.
              </p>
              <Link
                href={
                  role === "staff"
                    ? `/demo/customers/${record.customer.id}?role=staff`
                    : `/demo/customers/${record.customer.id}`
                }
                className={buttonVariants({ variant: "outline", className: "mt-4 w-full" })}
              >
                Open customer record
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
