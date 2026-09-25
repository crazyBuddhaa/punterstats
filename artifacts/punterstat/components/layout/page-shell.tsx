import { cn } from "@/lib/utils";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

export function PageShell({ children, className }: PageShellProps) {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  children,
  className,
}: PageHeaderProps) {
  return (
    <section
      className={cn(
        "relative isolate mb-10 overflow-hidden border-b border-white/[0.06] bg-brand-ink px-4 py-14 sm:mb-14 sm:px-6 sm:py-20",
        className
      )}
    >
      <div className="bg-grid-ink mask-fade-radial pointer-events-none absolute inset-0 -z-10" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[360px] w-[720px] -translate-x-1/2 rounded-full bg-brand-blue/25 blur-[100px]" />
      <div className="container mx-auto max-w-4xl">
        {badge && (
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-violet/30 bg-brand-blue/10 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-brand-violet">
            {badge}
          </div>
        )}
        <h1 className="text-3xl font-bold tracking-[-0.03em] text-white sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-300/80">
            {description}
          </p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeMap = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-5xl",
  xl: "max-w-6xl",
  full: "max-w-none",
};

export function Container({
  children,
  className,
  size = "xl",
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6",
        sizeMap[size],
        className
      )}
    >
      {children}
    </div>
  );
}
