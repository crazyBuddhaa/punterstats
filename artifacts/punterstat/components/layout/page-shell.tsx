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
        "border-b border-border/50 bg-white px-4 py-12 sm:px-6 sm:py-16",
        className
      )}
    >
      <div className="container mx-auto max-w-4xl">
        {badge && (
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#3D2DFF]/20 bg-[#3D2DFF]/10 px-3 py-1 text-sm font-medium text-[#3D2DFF]">
            {badge}
          </div>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-lg text-[#1e293b]/60 leading-relaxed">
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
