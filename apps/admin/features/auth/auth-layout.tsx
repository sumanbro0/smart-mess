import { cn } from "@/lib/utils";

export function AuthLayout({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "min-h-screen w-full bg-background",
        "before:absolute before:inset-0 before:bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] before:bg-[size:16px_16px] before:opacity-20",
        "after:absolute after:inset-0 after:bg-gradient-to-b after:from-background/0 after:via-background/50 after:to-background",
        "relative",
        className
      )}
      {...props}
    >
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-[400px] rounded-lg border bg-card p-8 shadow-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
