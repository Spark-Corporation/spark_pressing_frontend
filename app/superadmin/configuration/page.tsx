"use client";

import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Mail,
  Save,
  Server,
  Settings,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const sections = [
  { id: "general", label: "Général", icon: Settings },
  { id: "securite", label: "Sécurité", icon: Shield },
  { id: "integrations", label: "Intégrations", icon: Server },
  { id: "notifications", label: "Notifications", icon: Mail },
  { id: "facturation", label: "Facturation", icon: CreditCard },
];

export default function SuperAdminConfigurationPage() {
  const [section, setSection] = useState("general");
  const [saved, setSaved] = useState(false);
  const [maintMode, setMaintMode] = useState(false);
  const [sso, setSso] = useState(true);
  const [mfa, setMfa] = useState(true);
  const [auditRetention, setAuditRetention] = useState("12");

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">Superadministration</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Configuration</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Paramètres globaux de la plateforme SPARK Cloud.
          </p>
        </div>
        <Button size="lg" className="gap-1.5 px-3 text-xs font-bold" onClick={handleSave}>
          <Save className="size-4" />
          Enregistrer les modifications
        </Button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
          <CheckCircle2 className="size-4 text-emerald-500" />
          Configuration enregistrée avec succès.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="space-y-1">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors",
                section === s.id
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <s.icon className={cn("size-4", section === s.id ? "text-secondary" : "")} />
              {s.label}
            </button>
          ))}
        </nav>

        <div className="space-y-6">
          {section === "general" && (
            <>
              <div className="rounded-xl border border-border bg-white p-5">
                <h2 className="text-sm font-bold">Paramètres généraux</h2>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Configuration de base de la plateforme.
                </p>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Nom de la plateforme</label>
                    <Input defaultValue="SPARK Cloud" className="h-9 text-[13px]" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Domaine principal</label>
                    <Input defaultValue="sparkpressing.com" className="h-9 text-[13px]" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Fuseau horaire</label>
                    <Select defaultValue="africa/abidjan">
                      <SelectTrigger className="h-9 text-[13px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="africa/abidjan">Africa/Abidjan (GMT)</SelectItem>
                        <SelectItem value="africa/douala">Africa/Douala (GMT+1)</SelectItem>
                        <SelectItem value="africa/dakar">Africa/Dakar (GMT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Devise par défaut</label>
                    <Select defaultValue="XOF">
                      <SelectTrigger className="h-9 text-[13px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="XOF">FCFA (XOF)</SelectItem>
                        <SelectItem value="XAF">FCFA (XAF)</SelectItem>
                        <SelectItem value="NGN">Naira (NGN)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3">
                  <div>
                    <p className="text-[13px] font-semibold">Mode maintenance</p>
                    <p className="text-[11px] text-muted-foreground">
                      Désactive l&apos;accès aux tenants pendant les opérations critiques.
                    </p>
                  </div>
                  <Switch checked={maintMode} onCheckedChange={(v) => setMaintMode(!!v)} />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-white p-5">
                <h2 className="text-sm font-bold">Limites plateforme</h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Tenants max</label>
                    <Input defaultValue="100" className="h-9 text-[13px]" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Agences / tenant</label>
                    <Input defaultValue="25" className="h-9 text-[13px]" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Utilisateurs / tenant</label>
                    <Input defaultValue="200" className="h-9 text-[13px]" />
                  </div>
                </div>
              </div>
            </>
          )}

          {section === "securite" && (
            <>
              <div className="rounded-xl border border-border bg-white p-5">
                <h2 className="text-sm font-bold">Sécurité & authentification</h2>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Politiques de sécurité appliquées à tous les tenants.
                </p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3">
                    <div>
                      <p className="text-[13px] font-semibold">SSO (Single Sign-On)</p>
                      <p className="text-[11px] text-muted-foreground">
                        Connexion unifiée via le fournisseur d&apos;identité.
                      </p>
                    </div>
                    <Switch checked={sso} onCheckedChange={(v) => setSso(!!v)} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3">
                    <div>
                      <p className="text-[13px] font-semibold">Authentification à deux facteurs (2FA)</p>
                      <p className="text-[11px] text-muted-foreground">
                        Obligatoire pour les rôles Admin et Superadmin.
                      </p>
                    </div>
                    <Switch checked={mfa} onCheckedChange={(v) => setMfa(!!v)} />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Durée de session (min)</label>
                    <Input defaultValue="480" className="h-9 text-[13px]" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Rétention audit (mois)</label>
                    <Select value={auditRetention} onValueChange={(v) => setAuditRetention(v ?? "12")}>
                      <SelectTrigger className="h-9 text-[13px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 mois</SelectItem>
                        <SelectItem value="12">12 mois</SelectItem>
                        <SelectItem value="24">24 mois</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                <AlertCircle className="size-4 shrink-0 text-amber-500" />
                La désactivation du 2FA affecte la sécurité de tous les tenants. Procédez avec prudence.
              </div>
            </>
          )}

          {section === "integrations" && (
            <div className="rounded-xl border border-border bg-white p-5">
              <h2 className="text-sm font-bold">Intégrations techniques</h2>
              <div className="mt-4 space-y-4">
                {[
                  { name: "API principale", url: "api.sparkpressing.com", status: "Sain", color: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
                  { name: "Service de synchronisation", url: "sync.platform", status: "Sain", color: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
                  { name: "File d'impression", url: "print.queue", status: "Dégradé", color: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
                  { name: "Service SMS", url: "sms.gateway", status: "Sain", color: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
                ].map((svc) => (
                  <div key={svc.name} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                    <div>
                      <p className="text-[13px] font-semibold">{svc.name}</p>
                      <p className="text-[11px] text-muted-foreground">{svc.url}</p>
                    </div>
                    <Badge variant="outline" className={cn("gap-1 border-0 text-[10px] font-semibold", svc.color)}>
                      <span className={cn("size-1.5 rounded-full", svc.dot)} />
                      {svc.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === "notifications" && (
            <div className="rounded-xl border border-border bg-white p-5">
              <h2 className="text-sm font-bold">Notifications globales</h2>
              <div className="mt-4 space-y-3">
                {[
                  { label: "Alertes d&apos;incident P1", desc: "Notification immédiate à l&apos;équipe plateforme", enabled: true },
                  { label: "Rappel de renouvellement de licence", desc: "30 jours avant expiration", enabled: true },
                  { label: "Rapport hebdomadaire de santé", desc: "Tous les lundis à 08:00", enabled: true },
                  { label: "Alertes de quota tenant", desc: "Quand un tenant dépasse 90 % de son quota", enabled: false },
                ].map((n) => (
                  <div key={n.label} className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3">
                    <div>
                      <p className="text-[13px] font-semibold">{n.label}</p>
                      <p className="text-[11px] text-muted-foreground">{n.desc}</p>
                    </div>
                    <Switch defaultChecked={n.enabled} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === "facturation" && (
            <div className="rounded-xl border border-border bg-white p-5">
              <h2 className="text-sm font-bold">Facturation plateforme</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Devise de facturation</label>
                  <Select defaultValue="XOF">
                    <SelectTrigger className="h-9 text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XOF">FCFA (XOF)</SelectItem>
                      <SelectItem value="XAF">FCFA (XAF)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Jour d&apos;échéance mensuelle</label>
                  <Select defaultValue="1">
                    <SelectTrigger className="h-9 text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1er du mois</SelectItem>
                      <SelectItem value="5">5 du mois</SelectItem>
                      <SelectItem value="15">15 du mois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-[11px] font-medium text-muted-foreground">IBAN / Compte de collecte</label>
                  <Input defaultValue="CI-XXXX-XXXX-XXXX-XXXX" className="h-9 font-mono text-[13px]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
