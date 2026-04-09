import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const reference = typeof params.ref === "string" ? params.ref : "";
  const service = typeof params.service === "string" ? params.service : "Booked service";
  const staff = typeof params.staff === "string" ? params.staff : "Assigned specialist";
  const date = typeof params.date === "string" ? params.date : "";
  const customer = typeof params.customer === "string" ? params.customer : "Customer";

  return (
    <main className="min-h-screen px-4 py-6 lg:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <Card className="px-2 py-2">
          <CardHeader className="pb-2">
            <p className="section-kicker">Booking confirmed</p>
            <CardTitle className="text-[2.6rem]">Appointment summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-[28px] bg-[var(--panel-muted)] p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                Reference
              </p>
              <p className="mt-3 font-serif text-4xl">{reference || "AR-DEMO"}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border bg-[rgba(255,255,255,0.55)] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                  Customer
                </p>
                <p className="mt-2 text-lg font-medium">{customer}</p>
              </div>
              <div className="rounded-[24px] border bg-[rgba(255,255,255,0.55)] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                  Appointment time
                </p>
                <p className="mt-2 text-lg font-medium">
                  {date ? formatDateTime(date) : "To be confirmed"}
                </p>
              </div>
              <div className="rounded-[24px] border bg-[rgba(255,255,255,0.55)] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                  Service
                </p>
                <p className="mt-2 text-lg font-medium">{service}</p>
              </div>
              <div className="rounded-[24px] border bg-[rgba(255,255,255,0.55)] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                  Team member
                </p>
                <p className="mt-2 text-lg font-medium">{staff}</p>
              </div>
            </div>

            <p className="text-sm leading-7 text-[var(--muted-foreground)]">
              In the full product build, this record also appears in the admin calendar, appointment
              table, and customer profile history. In portfolio mode, the demo keeps working even
              without a live database connection.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/demo" className={buttonVariants()}>
                View admin demo
              </Link>
              <Link href="/book" className={buttonVariants({ variant: "outline" })}>
                Book another appointment
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

