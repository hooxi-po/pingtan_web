import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // base: 统一 hover/active/focus 与尺寸间距规则
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-[0.98] shadow-sm hover:shadow-md",
  {
    variants: {
      variant: {
        default:
          // 统一后：去掉重复的 active，保留主色及 hover 微调
          "bg-[#0A84FF] text-white hover:bg-[#0A84FF]/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-white/40 bg-white/30 backdrop-blur-md text-foreground shadow-xs hover:bg-white/40 dark:bg-white/10 dark:border-white/10 dark:hover:bg-white/20",
        secondary:
          "bg-secondary/80 text-secondary-foreground hover:bg-secondary/90 shadow-xs",
        ghost:
          "hover:bg-white/40 dark:hover:bg-white/10 backdrop-blur-sm",
        link: "text-[#0A84FF] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 has-[>svg]:px-4",
        sm: "h-9 rounded-xl gap-1.5 px-4 has-[>svg]:px-3.5",
        lg: "h-12 rounded-2xl px-7 has-[>svg]:px-5",
        icon: "size-11 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }