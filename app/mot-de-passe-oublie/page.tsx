"use client";

import { useState } from "react";
import {
  ArrowLeft,
  KeyRound,
  Mail,
  MessageSquare,
  Send,
  Timer,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function MotDePasseOubliePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [canal, setCanal] = useState<"email" | "sms">("email");
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    if (!/.+@.+\..+/.test(email.trim())) {
      toast.error("E-mail invalide", { description: "Saisissez votre e-mail professionnel." });
      return;
    }
    setSending(true);
    window.setTimeout(() => {
      toast.success("Code envoyé", {
        description: canal === "email" ? `E-mail envoyé à ${email.trim()}.` : "SMS envoyé au •••• 42.",
      });
      router.push("/verifier-code");
    }, 600);
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl sm:p-8">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-white">
          <KeyRound className="size-5" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Réinitialiser l&apos;accès</h1>
        <p className="mt-2 text-[11px] font-bold tracking-wide text-muted-foreground">
          ÉTAPE 1 SUR 3 • VÉRIFICATION
        </p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Un code à 6 chiffres valable 10 minutes vous sera envoyé.
        </p>

        <div className="mt-5">
          <Label htmlFor="reset-email" className="mb-1.5 text-xs font-semibold">
            E-mail professionnel
          </Label>
          <div className="relative">
            <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="reset-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="prenom.nom@spark.ci"
              autoComplete="email"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="h-11 pl-9 text-[13px]"
            />
          </div>
        </div>

        <p className="mt-4 mb-1.5 text-xs font-semibold">Recevoir le code par</p>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["email", "E-mail", Mail],
              ["sms", "SMS •••• 42", MessageSquare],
            ] as const
          ).map(([v, label, Icon]) => (
            <button
              key={v}
              type="button"
              onClick={() => setCanal(v)}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-bold transition-colors",
                canal === v ? "border-primary bg-primary/5" : "border-border text-muted-foreground",
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        <Button size="lg" disabled={sending} className="mt-4 w-full justify-center gap-1.5 text-xs font-bold" onClick={handleSend}>
          <Send className="size-4" />
          {sending ? "Envoi…" : "Envoyer le code sécurisé"}
        </Button>

        <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 ring-1 ring-amber-100">
          <Timer className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <p className="text-[11px] leading-snug text-amber-900">
            <span className="font-bold">Contrôle anti-abus actif</span>
            <br />
            2 demandes toutes les 15 minutes ; tentatives consignées.
          </p>
        </div>

        <Button
          variant="link"
          size="sm"
          className="mt-3 h-auto gap-1 p-0 text-xs font-bold"
          onClick={() => router.push("/login")}
        >
          <ArrowLeft className="size-3.5" />
          Revenir à la connexion
        </Button>
      </div>
    </AuthLayout>
  );
}
