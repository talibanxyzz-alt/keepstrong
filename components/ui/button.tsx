import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "success" | "warning" | "outline";
  isLoading?: boolean;
}

export const Button = ({
  children,
  variant = "primary",
  className = "",
  isLoading,
  disabled,
  ...props
}: ButtonProps) => {
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90",
    success: "bg-success text-white hover:bg-success/90",
    warning: "bg-warning text-white hover:bg-warning/90",
    outline: "border border-slate/20 bg-transparent hover:bg-cloud text-charcoal",
  };

  return (
    <button
      className={cn(
        "flex items-center justify-center px-4 py-2 rounded-md transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none hover:scale-[1.02]",
        variants[variant],
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
      {children}
    </button>
  );
};
