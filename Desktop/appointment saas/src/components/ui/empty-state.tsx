import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="h-10 w-10 rounded-2xl bg-[var(--panel-muted)]" />
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="max-w-xl text-sm leading-6 text-[var(--muted-foreground)]">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

