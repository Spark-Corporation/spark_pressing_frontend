"use client";

import { useState } from "react";
import {
  ArrowRight,
  KeyRound,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { loginAction } from "@/actions/AdminAction";
import { handleApiAction } from "@/functions/handleResponseApi";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { StaffUser, User } from "@/lib/types";

function toAppUser(u: StaffUser): User {
  const [firstName = "", ...rest] = (u.fullname || "").split(" ");
  return {
    id: String(u.id),
    firstName,
    lastName: rest.join(" ") || "—",
    status: u.status ? "Actif" : "Inactif",
    role: u.roles?.[0] ?? "staff",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export default function LoginPage() {
  const router = useRouter();
  const { login: saveSession, setLoading, isLoading } = useAuth();
  const [identifiant, setIdentifiant] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [souvenir, setSouvenir] = useState(true);

  const handleLogin = () => {
    if (!identifiant.trim() || !motDePasse) {
      toast.error("Identifiants incomplets", { description: "Saisissez votre e-mail et votre mot de passe." });
      return;
    }
    handleApiAction({
      action: loginAction,
      params: { email: identifiant.trim(), password: motDePasse },
      setLoading,
      onSuccess: (data) => {
        saveSession(data.token, toAppUser(data.user));
        toast.success(`Bienvenue ${data.user.fullname}`, {
          description: `${data.user.agency?.name ?? ""} • ${(data.user.roles ?? []).join(", ")}`,
        });
      },
    });
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl sm:p-8">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight">Bienvenue</h1>
          <Badge variant="outline" className="gap-1 border-0 bg-emerald-50 text-[10px] font-bold text-emerald-700">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            En ligne
          </Badge>
        </div>
        <p className="mt-1 text-[13px] text-muted-foreground">Compte caissier, manager ou administrateur.</p>

        <div className="mt-5">
          <Label htmlFor="login-id" className="mb-1.5 text-xs font-semibold">
            Identifiant ou e-mail
          </Label>
          <div className="relative">
            <UserIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="login-id"
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
              placeholder="prenom.nom@spark.ci"
              autoComplete="username"
              className="h-11 border-primary/50 pl-9 text-[13px] focus-visible:border-primary"
            />
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="login-mdp" className="mb-1.5 text-xs font-semibold">
            Mot de passe
          </Label>
          <div className="relative">
            <KeyRound className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="login-mdp"
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              autoComplete="current-password"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="h-11 pl-9 text-[13px]"
            />
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">12 caractères minimum recommandés</p>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <Label htmlFor="login-souvenir" className="flex cursor-pointer items-center gap-2 text-xs font-medium">
            <Checkbox id="login-souvenir" checked={souvenir} onCheckedChange={(v) => setSouvenir(v === true)} />
            Se souvenir de moi
          </Label>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs font-bold"
            onClick={() => router.push("/mot-de-passe-oublie")}
          >
            Mot de passe oublié ?
          </Button>
        </div>

        <Button
          size="lg"
          disabled={isLoading}
          className="mt-5 gap-1.5 bg-secondary px-6 text-xs font-bold text-secondary-foreground hover:bg-secondary/90"
          onClick={handleLogin}
        >
          <ArrowRight className="size-4" />
          {isLoading ? "Connexion…" : "Se connecter"}
        </Button>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-sky-50 p-3 ring-1 ring-sky-100">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-sky-600" />
          <p className="text-[11px] leading-snug text-sky-900">
            <span className="font-bold">Connexion sécurisée</span>
            <br />
            Après 5 échecs, accès limité pendant 15 minutes.
          </p>
        </div>

        <p className="mt-4 text-[11px] text-muted-foreground">
          Besoin d&apos;aide ? <span className="mx-1">•</span> Support interne
        </p>
      </div>
    </AuthLayout>
  );
}
