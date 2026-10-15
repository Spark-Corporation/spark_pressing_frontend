"use client";

import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";

export default function ReinitialisationReussiePage() {
  const router = useRouter();

  return (
    <AuthLayout>
      <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-xl sm:p-8">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="size-7" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Accès réinitialisé</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          Votre nouveau mot de passe est actif. Les autres sessions restent connectées et
          l&apos;opération a été consignée au journal.
        </p>
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-sky-50 p-3 text-left ring-1 ring-sky-100">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-sky-600" />
          <p className="text-[11px] leading-snug text-sky-900">
            <span className="font-bold">Session sécurisée</span>
            <br />
            Pensez à activer l&apos;authentification renforcée depuis votre profil.
          </p>
        </div>
        <Button size="lg" className="mt-5 w-full justify-center gap-1.5 text-xs font-bold" onClick={() => router.push("/login")}>
          <ArrowRight className="size-4" />
          Retourner à la connexion
        </Button>
      </div>
    </AuthLayout>
  );
}
