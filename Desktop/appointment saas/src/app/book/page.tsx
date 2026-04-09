import Link from "next/link";

import { BookingFlow } from "@/components/booking/booking-flow";
import { buttonVariants } from "@/components/ui/button";
import { createBookingAction } from "@/lib/actions";
import { getAppData } from "@/lib/data";

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const data = await getAppData();
  const hasError = params.error === "missing";

  return (
    <main className="min-h-screen px-4 py-6 lg:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap gap-3">
          <Link href="/" className={buttonVariants({ variant: "ghost" })}>
            Back to overview
          </Link>
          <Link href="/demo" className={buttonVariants({ variant: "outline" })}>
            View admin demo
          </Link>
        </div>

        <section className="panel px-6 py-8 md:px-10">
          <p className="section-kicker">Public booking flow</p>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="font-serif text-[3rem] leading-[0.94] md:text-[4rem]">
                Book a premium service appointment without friction.
              </h1>
              <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)] md:text-[15px]">
                This client-facing flow is connected to the same demo data as the admin workspace,
                including service duration logic, staff availability, blocked times, and business
                booking rules.
              </p>
            </div>
            <div className="rounded-[24px] border bg-[rgba(255,255,255,0.55)] px-5 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                Demo business
              </p>
              <p className="mt-2 text-sm font-medium">{data.business.name}</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {data.business.city}, {data.business.region}
              </p>
            </div>
          </div>
        </section>

        {hasError ? (
          <div className="rounded-[26px] border border-[rgba(168,97,74,0.2)] bg-[rgba(168,97,74,0.1)] px-5 py-4 text-sm text-[var(--danger-foreground)]">
            Please complete the required booking details before confirming the appointment.
          </div>
        ) : null}

        <BookingFlow data={data} submitAction={createBookingAction} />
      </div>
    </main>
  );
}

