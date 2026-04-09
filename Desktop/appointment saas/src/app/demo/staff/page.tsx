import { parseISO } from "date-fns";

import { toggleStaffStatusAction } from "@/lib/actions";
import { PageHeader } from "@/components/demo/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppData, getStaffRecords } from "@/lib/data";
import { formatDateTime, resolveDemoRole } from "@/lib/utils";

const DEMO_STAFF_ID = "staff_maya_idris";

export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const role = resolveDemoRole(params.role);
  const data = await getAppData();
  const records = getStaffRecords(data).sort((left, right) =>
    left.id === DEMO_STAFF_ID ? -1 : right.id === DEMO_STAFF_ID ? 1 : left.name.localeCompare(right.name),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Staff"
        title={role === "staff" ? "Team and availability" : "Staff management"}
        description="Review roles, service coverage, upcoming assignments, availability, and active versus inactive team states."
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {records.map((member) => {
          const nextAppointment = member.appointments
            .filter((appointment) => parseISO(appointment.startsAt) > new Date())
            .sort((left, right) => left.startsAt.localeCompare(right.startsAt))[0];
          const availabilitySummary = member.availabilities
            .filter((availability) => availability.isWorking && availability.startsAt && availability.endsAt)
            .map((availability) => `${availability.label.slice(0, 3)} ${availability.startsAt}-${availability.endsAt}`)
            .join(" · ");

          return (
            <Card key={member.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                      {member.role}
                    </p>
                    <h2 className="mt-2 text-xl font-medium">{member.name}</h2>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">{member.title}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      member.active
                        ? "bg-[rgba(109,123,90,0.12)] text-[var(--foreground)]"
                        : "bg-[rgba(165,138,114,0.12)] text-[var(--muted-foreground)]"
                    }`}
                  >
                    {member.active ? "Active" : "Inactive"}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">{member.bio}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {member.services.map((service) => (
                    <span key={service.id} className="rounded-full bg-[var(--panel-muted)] px-3 py-1 text-xs">
                      {service.name}
                    </span>
                  ))}
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[22px] bg-[var(--panel-muted)] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                      Availability
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                      {availabilitySummary || "No working hours configured."}
                    </p>
                  </div>
                  <div className="rounded-[22px] bg-[var(--panel-muted)] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                      Next appointment
                    </p>
                    <p className="mt-2 text-sm">
                      {nextAppointment ? formatDateTime(nextAppointment.startsAt) : "Nothing upcoming"}
                    </p>
                  </div>
                </div>

                {role === "staff" ? null : (
                  <form action={toggleStaffStatusAction} className="mt-5">
                    <input type="hidden" name="staffId" value={member.id} />
                    <input type="hidden" name="nextValue" value={String(!member.active)} />
                    <input type="hidden" name="redirectTo" value="/demo/staff" />
                    <button
                      type="submit"
                      className={buttonVariants({
                        variant: member.active ? "outline" : "primary",
                        className: "w-full",
                      })}
                    >
                      {member.active ? "Mark inactive" : "Reactivate staff member"}
                    </button>
                  </form>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

