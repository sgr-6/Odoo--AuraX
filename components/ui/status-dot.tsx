// @ts-nocheck
import * as React from "react"
import { cn } from "@/lib/utils"

export type StatusVariant = "present" | "absent" | "leave"

interface StatusDotProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: StatusVariant
}

export function StatusDot({ className, variant = "absent", ...props }: StatusDotProps) {
  return (
    <div
      className={cn(
        "h-3 w-3 rounded-full shrink-0 shadow-sm transition-all duration-300",
        {
          "bg-green-500 shadow-green-500/50 animate-pulse": variant === "present",
          "bg-yellow-500 shadow-yellow-500/50": variant === "absent",
          "bg-blue-500 shadow-blue-500/50": variant === "leave",
        },
        className
      )}
      {...props}
    />
  )
}
