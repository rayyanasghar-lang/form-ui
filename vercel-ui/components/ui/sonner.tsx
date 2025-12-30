"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {

  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card/90 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-foreground group-[.toaster]:border-border/50 group-[.toaster]:shadow-xl group-[.toaster]:shadow-primary/10",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "group-[.toaster]:bg-emerald-500/20 group-[.toaster]:border-emerald-500/50 group-[.toaster]:text-emerald-100",
          error:
            "group-[.toaster]:bg-destructive/20 group-[.toaster]:border-destructive/50 group-[.toaster]:text-red-100",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
