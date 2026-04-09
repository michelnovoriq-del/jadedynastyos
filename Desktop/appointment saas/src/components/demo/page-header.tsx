import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl space-y-3">
        {eyebrow ? <p className="section-kicker">{eyebrow}</p> : null}
        <div className="space-y-2">
          <h1 className="font-serif text-[2.3rem] leading-none text-[var(--foreground)] md:text-[2.8rem]">
            {title}
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-[var(--muted-foreground)] md:text-[15px]">
            {description}
          </p>
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}
