import { format, parseISO } from "date-fns";

import { PageHeader } from "@/components/demo/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppData, getStaffRecords } from "@/lib/data";
import { formatDateTime, resolveDemoRole } from "@/lib/utils";

const DEMO_STAFF_ID = "staff_maya_idris";

export default async function AvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const role = resolveDemoRole(params.role);
  const data = await getAppData();
  const staffRecords = getStaffRecords(data).filter((member) =>
    role === "staff" ? member.id === DEMO_STAFF_ID : true,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Availability"
        title="Business hours and scheduling controls"
        description="Review studio opening hours, staff working patterns, blocked times, and unavailable dates that shape the booking engine."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <p className="section-kicker">Business hours</p>
              <CardTitle>Opening schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.businessHours.map((hour) => (
                <div
                  key={hour.id}
                  className="flex items-center justify-between rounded-[22px] bg-[var(--panel-muted)] px-4 py-3 text-sm"
                >
                  <span>{hour.label}</span>
                  <span className="text-[var(--muted-foreground)]">
                    {hour.isOpen ? `${hour.opensAt} - ${hour.closesAt}` : "Closed"}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="section-kicker">Unavailable dates</p>
              <CardTitle>Closures and blocked periods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.closures.map((closure) => (
                <div key={closure.id} className="rounded-[22px] border bg-[rgba(255,255,255,0.55)] p-4">
                  <p className="text-sm font-medium">{closure.title}</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    {format(parseISO(closure.date), "EEEE, MMM d")}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{closure.notes}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <p className="section-kicker">Staff schedules</p>
              <CardTitle>{role === "staff" ? "Personal hours" : "Working hours by team member"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {staffRecords.map((member) => (
                <div key={member.id} className="rounded-[24px] border bg-[rgba(255,255,255,0.55)] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
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
                  <div className="mt-4 grid gap-2 md:grid-cols-2">
                    {member.availabilities.map((availability) => (
                      <div
                        key={availability.id}
                        className="rounded-[18px] bg-[var(--panel-muted)] px-3 py-2 text-sm"
                      >
                        <span>{availability.label}</span>
                        <span className="ml-2 text-[var(--muted-foreground)]">
                          {availability.isWorking
                            ? `${availability.startsAt} - ${availability.endsAt}`
                            : "Off"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="section-kicker">Blocked times</p>
              <CardTitle>Operational overrides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.blockedTimes
                .filter((blockedTime) => (role === "staff" ? blockedTime.staffId === DEMO_STAFF_ID || blockedTime.staffId === null : true))
                .map((blockedTime) => (
                  <div
                    key={blockedTime.id}
                    className="rounded-[22px] border bg-[rgba(255,255,255,0.5)] p-4"
                  >
                    <p className="text-sm font-medium">{blockedTime.title}</p>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      {blockedTime.reason ?? "Scheduling override"}
                    </p>
                    <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                      {formatDateTime(blockedTime.startsAt)} to {formatDateTime(blockedTime.endsAt, "h:mm a")}
                    </p>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

