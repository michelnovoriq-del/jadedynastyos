import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "destructive";
type ButtonSize = "default" | "sm" | "lg";

export function buttonVariants({
  variant = "primary",
  size = "default",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  const base =
    "inline-flex items-center justify-center rounded-full font-medium transition duration-200 focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-60";
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-[var(--accent)] text-[var(--panel-strong)] shadow-soft hover:bg-[var(--accent-strong)]",
    secondary:
      "bg-[var(--panel-muted)] text-[var(--foreground)] hover:bg-[#ede3d3]",
    ghost: "bg-transparent text-[var(--foreground)] hover:bg-[rgba(109,123,90,0.08)]",
    outline:
      "border border-[var(--border-strong)] bg-[rgba(255,255,255,0.55)] text-[var(--foreground)] hover:bg-[var(--panel)]",
    destructive:
      "bg-[#9c624d] text-[var(--panel-strong)] hover:bg-[#844f3d]",
  };
  const sizes: Record<ButtonSize, string> = {
    default: "h-11 px-5 text-sm",
    sm: "h-9 px-4 text-sm",
    lg: "h-12 px-6 text-sm",
  };

  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  ),
);

Button.displayName = "Button";

