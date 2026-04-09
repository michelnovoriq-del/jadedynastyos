export function LoadingShell({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-8 lg:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="space-y-3">
          <div className="h-3 w-28 rounded-full bg-[rgba(109,123,90,0.18)]" />
          <div className="h-10 w-72 rounded-full bg-[rgba(165,138,114,0.18)]" />
          <div className="h-4 w-[32rem] max-w-full rounded-full bg-[rgba(145,137,126,0.16)]" />
        </div>
        <div className="grid gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-[28px] border bg-[rgba(255,255,255,0.5)]"
            />
          ))}
        </div>
        <div className="panel p-10">
          <p className="font-serif text-2xl">{title}</p>
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

