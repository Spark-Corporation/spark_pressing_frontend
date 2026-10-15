"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Check, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function score(pw: string): { label: string; pct: number; color: string } {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { label: "Faible", pct: 25, color: "bg-red-500" };
  if (s === 2) return { label: "Moyen", pct: 50, color: "bg-amber-500" };
  if (s === 3) return { label: "Bon", pct: 75, color: "bg-emerald-500" };
  return { label: "Très bon", pct: 100, color: "bg-emerald-600" };
}

export default function NouveauMotDePassePage() {
  const router = useRouter();
  const [mdp, setMdp] = useState("");
  const [confirm, setConfirm] = useState("");
  const force = useMemo(() => score(mdp), [mdp]);

  const handleSave = () => {
    if (mdp.length < 12 || !/[A-Z]/.test(mdp) || !/\d/.test(mdp)) {
      toast.error("Mot de passe trop faible", { description: "12 caractères minimum, une majuscule et un chiffre." });
      return;
    }
    if (mdp !== confirm) {
      toast.error("Confirmation différente", { description: "Les deux mots de passe doivent être identiques." });
      return;
    }
    toast.success("Mot de passe mis à jour", { description: "Toutes les autres sessions sont conservées." });
    router.push("/reinitialisation-reussie");
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl sm:p-8">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-white">
          <KeyRound className="size-5" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Nouveau mot de passe</h1>
        <p className="mt-2 text-[11px] font-bold tracking-wide text-muted-foreground">
          ÉTAPE 3 SUR 3 • SÉCURISATION
        </p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Choisissez un mot de passe robuste, différent des 5 précédents.
        </p>

        <div className="mt-5">
          <Label htmlFor="new-mdp" className="mb-1.5 text-xs font-semibold">
            Nouveau mot de passe
          </Label>
          <Input
            id="new-mdp"
            type="password"
            value={mdp}
            onChange={(e) => setMdp(e.target.value)}
            autoComplete="new-password"
            className="h-11 text-[13px]"
          />
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
              <div className={cn("h-full rounded-full transition-all", force.color)} style={{ width: `${force.pct}%` }} />
            </div>
            <span className="text-[11px] font-bold">{mdp ? force.label : ""}</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">12 caractères minimum, une majuscule et un chiffre.</p>
        </div>

        <div className="mt-4">
          <Label htmlFor="new-confirm" className="mb-1.5 text-xs font-semibold">
            Confirmer le mot de passe
          </Label>
          <Input
            id="new-confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="h-11 text-[13px]"
          />
        </div>

        <Button size="lg" className="mt-5 w-full justify-center gap-1.5 text-xs font-bold" onClick={handleSave}>
          <Check className="size-4" />
          Enregistrer le nouveau mot de passe
        </Button>

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
