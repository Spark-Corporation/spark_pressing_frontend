"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

export function Section({
  title,
  sub,
  right,
  children,
  className,
}: {
  title: string;
  sub?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-border bg-white p-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold">{title}</h2>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
        {right}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function ToggleRow({
  label,
  sub,
  checked,
  onChange,
  id,
}: {
  label: string;
  sub?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  id?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold">{label}</p>
        {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} id={id} />
    </div>
  );
}

export function CheckRow({
  label,
  sub,
  checked,
  onChange,
  id,
}: {
  label: string;
  sub?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
}) {
  return (
    <Label htmlFor={id} className="flex cursor-pointer items-start gap-2.5 py-1.5 text-xs">
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(v === true)} className="mt-0.5" />
      <span>
        <span className="block font-bold">{label}</span>
        {sub && <span className="block font-normal text-muted-foreground">{sub}</span>}
      </span>
    </Label>
  );
}

export function FieldLabel({ htmlFor, children, required }: { htmlFor?: string; children: ReactNode; required?: boolean }) {
  return (
    <Label htmlFor={htmlFor} className="mb-1.5 text-xs font-semibold">
      {children} {required && <span className="text-red-500">*</span>}
    </Label>
  );
}

/** Compte les clés dont la valeur diffère (comparaison JSON). */
export function dirtyCount(initial: Record<string, unknown>, current: Record<string, unknown>): number {
  return Object.keys({ ...initial, ...current }).filter((k) => JSON.stringify(initial[k]) !== JSON.stringify(current[k])).length;
}
