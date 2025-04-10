import * as React from "react"
import { cn } from "@/lib/utils"

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, as = "h1", children, ...props }, ref) => {
    const Component = as
    
    return (
      <Component
        ref={ref}
        className={cn(
          "scroll-m-20",
          {
            "text-4xl font-extrabold tracking-tight lg:text-5xl": as === "h1",
            "text-3xl font-semibold tracking-tight": as === "h2",
            "text-2xl font-semibold tracking-tight": as === "h3",
            "text-xl font-semibold tracking-tight": as === "h4",
            "text-lg font-semibold tracking-tight": as === "h5",
            "text-base font-semibold tracking-tight": as === "h6",
          },
          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Heading.displayName = "Heading"

export { Heading } 