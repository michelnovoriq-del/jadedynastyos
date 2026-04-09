import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card className="border-[rgba(201,186,167,0.65)]">
      <CardHeader className="space-y-4 pb-3">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
          {label}
        </p>
        <p className="font-serif text-[2rem] leading-none text-[var(--foreground)]">{value}</p>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">{detail}</p>
      </CardContent>
    </Card>
  );
}

