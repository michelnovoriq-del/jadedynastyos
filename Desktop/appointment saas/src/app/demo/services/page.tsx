import { toggleServiceStatusAction } from "@/lib/actions";
import { PageHeader } from "@/components/demo/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppData, getServiceRecords } from "@/lib/data";
import { formatCurrency, resolveDemoRole } from "@/lib/utils";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const role = resolveDemoRole(params.role);
  const data = await getAppData();
  const services = getServiceRecords(data).sort((left, right) =>
    left.active === right.active ? left.name.localeCompare(right.name) : left.active ? -1 : 1,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Services"
        title={role === "staff" ? "Service catalog" : "Service management"}
        description="Define what can be booked, how long each visit takes, what it costs, and which staff members can deliver it."
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {services.map((service) => (
          <Card key={service.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                    {service.category}
                  </p>
                  <h2 className="mt-2 text-xl font-medium">{service.name}</h2>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    service.active
                      ? "bg-[rgba(109,123,90,0.12)] text-[var(--foreground)]"
                      : "bg-[rgba(165,138,114,0.12)] text-[var(--muted-foreground)]"
                  }`}
                >
                  {service.active ? "Active" : "Inactive"}
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">{service.description}</p>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-[22px] bg-[var(--panel-muted)] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                    Duration
                  </p>
                  <p className="mt-2 text-sm font-medium">{service.durationMin} min</p>
                </div>
                <div className="rounded-[22px] bg-[var(--panel-muted)] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                    Price
                  </p>
                  <p className="mt-2 text-sm font-medium">
                    {formatCurrency(service.price, data.business.currency)}
                  </p>
                </div>
                <div className="rounded-[22px] bg-[var(--panel-muted)] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                    Appointments
                  </p>
                  <p className="mt-2 text-sm font-medium">{service.appointments.length}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {service.staffMembers.map((member) => (
                  <span key={member.id} className="rounded-full bg-[rgba(255,255,255,0.6)] px-3 py-1 text-xs">
                    {member.name}
                  </span>
                ))}
              </div>

              {role === "staff" ? null : (
                <form action={toggleServiceStatusAction} className="mt-5">
                  <input type="hidden" name="serviceId" value={service.id} />
                  <input type="hidden" name="nextValue" value={String(!service.active)} />
                  <input type="hidden" name="redirectTo" value="/demo/services" />
                  <button
                    type="submit"
                    className={buttonVariants({
                      variant: service.active ? "outline" : "primary",
                      className: "w-full",
                    })}
                  >
                    {service.active ? "Deactivate service" : "Activate service"}
                  </button>
                </form>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

