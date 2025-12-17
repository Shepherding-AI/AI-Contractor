import React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border bg-white shadow-sm", className)} {...props} />;
}
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 border-b", className)} {...props} />;
}
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}
export function Button({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  const base = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition border";
  const styles =
    variant === "primary"
      ? "bg-black text-white border-black hover:bg-zinc-800"
      : variant === "secondary"
      ? "bg-white text-black border-zinc-200 hover:bg-zinc-50"
      : variant === "danger"
      ? "bg-red-600 text-white border-red-600 hover:bg-red-700"
      : "bg-transparent text-black border-transparent hover:bg-zinc-100";
  return <button className={cn(base, styles, className)} {...props} />;
}
export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200",
        className
      )}
      {...props}
    />
  );
}
export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200 min-h-[110px]",
        className
      )}
      {...props}
    />
  );
}
export function Label({ className, ...props }: React.HTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium text-zinc-700", className)} {...props} />;
}
export function Pill({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs bg-zinc-50", className)} {...props} />;
}
