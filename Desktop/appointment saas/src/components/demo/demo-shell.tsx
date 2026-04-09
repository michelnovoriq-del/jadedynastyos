"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { cn, resolveDemoRole } from "@/lib/utils";

const adminNavigation = [
  { href: "/demo", label: "Dashboard" },
  { href: "/demo/calendar", label: "Calendar" },
  { href: "/demo/appointments", label: "Appointments" },
  { href: "/demo/customers", label: "Customers" },
  { href: "/demo/staff", label: "Staff" },
  { href: "/demo/services", label: "Services" },
  { href: "/demo/availability", label: "Availability" },
  { href: "/demo/settings", label: "Settings" },
];

const staffNavigation = [
  { href: "/demo", label: "Dashboard" },
  { href: "/demo/calendar", label: "Calendar" },
  { href: "/demo/appointments", label: "Appointments" },
  { href: "/demo/customers", label: "Customers" },
  { href: "/demo/staff", label: "Team" },
  { href: "/demo/services", label: "Services" },
];

export function DemoShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = resolveDemoRole(searchParams.get("role"));
  const navigation = role === "staff" ? staffNavigation : adminNavigation;
  const buildHref = (href: string) => (role === "staff" ? `${href}?role=staff` : href);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-4 lg:px-6">
        <aside className="hidden w-[280px] shrink-0 lg:block">
          <div className="panel sticky top-4 flex min-h-[calc(100vh-2rem)] flex-col p-5">
            <Link href="/" className="rounded-[24px] border border-[var(--border)] bg-[var(--panel-muted)] p-5">
              <p className="section-kicker">Portfolio Proof</p>
              <h2 className="mt-3 font-serif text-3xl leading-none">Atelier Reserve</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                Appointment booking, staffing, availability, and customer operations in one calm admin workspace.
              </p>
            </Link>

            <div className="mt-6 rounded-[24px] border border-[rgba(109,123,90,0.16)] bg-[rgba(109,123,90,0.08)] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                Demo role
              </p>
              <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
                {role === "staff" ? "Staff workspace" : "Owner workspace"}
              </p>
            </div>

            <nav className="mt-6 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={buildHref(item.href)}
                    className={cn(
                      "flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition",
                      isActive
                        ? "bg-[var(--accent)] text-[var(--panel-strong)]"
                        : "text-[var(--foreground)] hover:bg-[rgba(109,123,90,0.08)]",
                    )}
                  >
                    <span>{item.label}</span>
                    <span
                      className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        isActive ? "bg-[var(--panel-strong)]" : "bg-[rgba(109,123,90,0.16)]",
                      )}
                    />
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto space-y-3 pt-6">
              <Link href="/book" className={buttonVariants({ className: "w-full" })}>
                Book appointment
              </Link>
              <Link
                href="/"
                className={buttonVariants({ variant: "outline", className: "w-full" })}
              >
                Back to overview
              </Link>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="panel sticky top-4 z-10 flex flex-col gap-4 px-5 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
            <div>
              <p className="section-kicker">Admin Demo</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                No auth gate in this portfolio build. Switch between owner and staff views to showcase role-based behavior.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                Demo role
              </label>
              <select
                value={role}
                onChange={(event) => {
                  const nextParams = new URLSearchParams(searchParams.toString());
                  if (event.target.value === "staff") {
                    nextParams.set("role", "staff");
                  } else {
                    nextParams.delete("role");
                  }

                  const query = nextParams.toString();
                  router.replace(query ? `${pathname}?${query}` : pathname);
                }}
                className="h-11 rounded-full border border-[var(--border)] bg-[rgba(255,255,255,0.7)] px-4 text-sm"
              >
                <option value="admin">Owner / Admin</option>
                <option value="staff">Staff member</option>
              </select>
              <Link
                href="/book"
                className={buttonVariants({ variant: "secondary", className: "whitespace-nowrap" })}
              >
                Public booking flow
              </Link>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navigation.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={buildHref(item.href)}
                  className={cn(
                    "whitespace-nowrap rounded-full px-4 py-2 text-sm",
                    isActive
                      ? "bg-[var(--accent)] text-[var(--panel-strong)]"
                      : "bg-[rgba(255,255,255,0.7)] text-[var(--foreground)]",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="space-y-6 pb-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
