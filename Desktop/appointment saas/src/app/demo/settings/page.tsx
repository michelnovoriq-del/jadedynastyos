import { updateBusinessSettingsAction } from "@/lib/actions";
import { PageHeader } from "@/components/demo/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getAppData } from "@/lib/data";
import { resolveDemoRole } from "@/lib/utils";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const role = resolveDemoRole(params.role);
  const data = await getAppData();
  const toggleFields = [
    {
      name: "allowStaffSelection",
      label: "Allow customers to choose staff",
      checked: data.settings.allowStaffSelection,
    },
    {
      name: "autoConfirmBookings",
      label: "Auto-confirm new bookings",
      checked: data.settings.autoConfirmBookings,
    },
    {
      name: "sendEmailNotifications",
      label: "Send email notifications",
      checked: data.settings.sendEmailNotifications,
    },
    {
      name: "sendSmsNotifications",
      label: "Send SMS notifications",
      checked: data.settings.sendSmsNotifications,
    },
    {
      name: "dailyAgendaDigest",
      label: "Send daily agenda digest",
      checked: data.settings.dailyAgendaDigest,
    },
    {
      name: "collectCustomerNotes",
      label: "Collect customer notes at booking",
      checked: data.settings.collectCustomerNotes,
    },
    {
      name: "depositRequired",
      label: "Require a booking deposit",
      checked: data.settings.depositRequired,
    },
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title={role === "staff" ? "Business settings snapshot" : "Business settings"}
        description="Booking rules, notification preferences, and operational policies that shape how appointments are created and managed."
      />

      {role === "staff" ? (
        <div className="rounded-[28px] border border-[rgba(165,138,114,0.18)] bg-[rgba(165,138,114,0.08)] px-5 py-4 text-sm leading-6 text-[var(--foreground)]">
          Owner mode unlocks editing for booking rules and notification preferences. Staff mode
          shows the current operational policy in read-only form.
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <p className="section-kicker">Business profile</p>
              <CardTitle>Studio information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[24px] bg-[var(--panel-muted)] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                  Business
                </p>
                <p className="mt-2 text-lg font-medium">{data.business.name}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{data.business.tagline}</p>
              </div>
              <div className="rounded-[24px] border bg-[rgba(255,255,255,0.55)] p-4">
                <p className="text-sm text-[var(--foreground)]">{data.business.email}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{data.business.phone}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {data.business.addressLine1}, {data.business.city}, {data.business.region}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{data.business.website}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="section-kicker">Current policy</p>
              <CardTitle>Booking rules snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[var(--muted-foreground)]">
              <div className="rounded-[22px] bg-[var(--panel-muted)] p-4">
                Lead time: {data.settings.bookingLeadHours} hours
              </div>
              <div className="rounded-[22px] bg-[var(--panel-muted)] p-4">
                Cancellation window: {data.settings.cancellationWindowHours} hours
              </div>
              <div className="rounded-[22px] bg-[var(--panel-muted)] p-4">
                Buffer between appointments: {data.settings.bufferMinutes} minutes
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <p className="section-kicker">Controls</p>
            <CardTitle>Booking and notification preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateBusinessSettingsAction} className="space-y-6">
              <input type="hidden" name="redirectTo" value="/demo/settings" />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Booking lead time (hours)</label>
                  <Input
                    type="number"
                    name="bookingLeadHours"
                    defaultValue={String(data.settings.bookingLeadHours)}
                    disabled={role === "staff"}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cancellation window (hours)</label>
                  <Input
                    type="number"
                    name="cancellationWindowHours"
                    defaultValue={String(data.settings.cancellationWindowHours)}
                    disabled={role === "staff"}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Buffer between bookings (minutes)</label>
                  <Input
                    type="number"
                    name="bufferMinutes"
                    defaultValue={String(data.settings.bufferMinutes)}
                    disabled={role === "staff"}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reminder timing (hours)</label>
                  <Input
                    type="number"
                    name="reminderHoursBefore"
                    defaultValue={String(data.settings.reminderHoursBefore)}
                    disabled={role === "staff"}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Internal notes</label>
                  <Textarea
                    name="notes"
                    defaultValue={data.settings.notes ?? ""}
                    disabled={role === "staff"}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {toggleFields.map((toggle) => (
                  <label
                    key={toggle.name}
                    className="flex items-center gap-3 rounded-[22px] border bg-[rgba(255,255,255,0.55)] px-4 py-3 text-sm"
                  >
                    <Checkbox
                      name={toggle.name}
                      defaultChecked={toggle.checked}
                      disabled={role === "staff"}
                    />
                    <span>{toggle.label}</span>
                  </label>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Deposit amount</label>
                <Input
                  type="number"
                  name="depositAmount"
                  defaultValue={data.settings.depositAmount ? String(data.settings.depositAmount) : ""}
                  disabled={role === "staff"}
                />
              </div>

              {role === "staff" ? null : (
                <Button type="submit">Save settings</Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
