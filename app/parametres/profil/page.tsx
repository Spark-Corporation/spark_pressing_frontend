"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Globe,
  KeyRound,
  Laptop,
  Lock,
  LogOut,
  Mail,
  MessageCircle,
  Monitor,
  Save,
  ShieldCheck,
  Smartphone,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useGlobalData } from "@/contexts/GlobalContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Session {
  id: string;
  device: string;
  detail: string;
  icon: React.ElementType;
  current?: boolean;
}

const SESSIONS_INIT: Session[] = [
  { id: "s1", device: "MacBook Pro 14", detail: "Douala, Cameroun • Maintenant", icon: Laptop, current: true },
  { id: "s2", device: "iPhone 15 Pro", detail: "Douala, Cameroun • Hier, 20:16", icon: Smartphone },
  { id: "s3", device: "Dell Latitude • Caisse", detail: "Agence Akwa • 26 sept., 18:02", icon: Monitor },
];

function passwordScore(pw: string): { label: string; pct: number; color: string } {
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

export default function ProfilPage() {
  const router = useRouter();
  const { profileUser } = useGlobalData();
  const nameParts = (profileUser?.nom ?? "Nadine Essomba").split(" ");
  const [prenom, setPrenom] = useState(nameParts[0] ?? "Nadine");
  const [nom, setNom] = useState(nameParts.slice(1).join(" ") || "Essomba");
  const [email, setEmail] = useState(profileUser?.email ?? "nadine.essomba@spark-pressing.cm");
  const [telephone, setTelephone] = useState("+237 6 99 24 18 07");
  const [fonction, setFonction] = useState(profileUser?.role ?? "Responsable d'agence");
  const initials = `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase() || "NE";
  const [agence, setAgence] = useState("Akwa - Douala");
  const [affectations, setAffectations] = useState<string[]>(["Bonapriso", "Bali"]);
  const [langue, setLangue] = useState("Français (Cameroun)");
  const [fuseau, setFuseau] = useState("Afrique/Douala • UTC+1");
  const [resume, setResume] = useState(true);
  const [alertes, setAlertes] = useState(false);
  const [whatsapp, setWhatsapp] = useState(true);
  const [telPro, setTelPro] = useState(true);
  const [posteCaisse, setPosteCaisse] = useState(true);
  const [mdpActuel, setMdpActuel] = useState("••••••••••");
  const [mdpNouveau, setMdpNouveau] = useState("••••••••••••");
  const [submitted, setSubmitted] = useState(false);
  const [sessions, setSessions] = useState<Session[]>(SESSIONS_INIT);

  const force = useMemo(() => passwordScore(mdpNouveau.replace(/•/g, "")), [mdpNouveau]);

  const toggleAff = (a: string) =>
    setAffectations((l) => (l.includes(a) ? l.filter((x) => x !== a) : [...l, a]));

  const handleSave = () => {
    setSubmitted(true);
    if (!prenom.trim() || !nom.trim() || !/.+@.+\..+/.test(email.trim())) {
      toast.error("Informations incomplètes", { description: "Prénom, nom et e-mail valide requis." });
      return;
    }
    toast.success("Profil mis à jour", { description: "Modifications sensibles journalisées." });
  };

  const handlePassword = () => {
    const clean = mdpNouveau.replace(/•/g, "");
    if (clean.length < 12 || !/[A-Z]/.test(clean) || !/\d/.test(clean)) {
      toast.error("Mot de passe trop faible", { description: "12 caractères minimum, une majuscule et un chiffre." });
      return;
    }
    setMdpActuel("••••••••••");
    setMdpNouveau("••••••••••••");
    toast.success("Mot de passe mis à jour", { description: "Autres sessions conservées." });
  };

  const err = (invalid: boolean) =>
    submitted && invalid ? <p className="mt-1 text-[11px] font-medium text-red-500">Ce champ est obligatoire.</p> : null;

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex flex-wrap items-start gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Retour"
          onClick={() => router.back()}
          className="mt-1 bg-primary text-white hover:bg-primary/90 hover:text-white"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground">COMPTE PERSONNEL</p>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Profil et sécurité staff</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Gérez votre identité, vos préférences et la sécurité de votre accès. Les modifications sensibles sont consignées dans le journal d&apos;activité.
          </p>
        </div>
        <Button size="lg" className="gap-1.5 px-4 text-xs font-bold" onClick={handleSave}>
          <Save className="size-4" />
          Enregistrer les modifications
        </Button>
      </div>

      {/* Carte identité */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-primary p-4 text-white sm:p-5">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-stone-200 text-lg font-extrabold text-primary">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-lg font-extrabold">
            {prenom} {nom}
            <Badge className="border-0 bg-white/15 text-[10px] font-bold text-white">Compte actif</Badge>
          </p>
          <p className="text-[11px] text-white/70">{fonction} • Matricule STF-0284</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {["Akwa - principale", "Bonapriso", "Bali"].map((a) => (
              <Badge key={a} variant="outline" className="border-white/20 bg-white/10 text-[10px] font-semibold text-white">
                {a}
              </Badge>
            ))}
          </div>
        </div>
        <div className="text-right text-[11px] text-white/70">
          <p>Dernière connexion</p>
          <p className="font-bold text-white">Aujourd&apos;hui, 08:42</p>
          <p>Douala • Chrome macOS</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="space-y-4">
          {/* Identité */}
          <section className="rounded-xl border border-border bg-white p-5">
            <h2 className="text-sm font-bold">Identité et coordonnées</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Informations visibles par votre équipe.</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="pf-prenom" className="mb-1.5 text-xs font-semibold">
                  Prénom <span className="text-red-500">*</span>
                </Label>
                <Input id="pf-prenom" value={prenom} onChange={(e) => setPrenom(e.target.value)} aria-invalid={submitted && !prenom.trim()} className="h-9 text-[13px]" />
                {err(!prenom.trim())}
              </div>
              <div>
                <Label htmlFor="pf-nom" className="mb-1.5 text-xs font-semibold">
                  Nom <span className="text-red-500">*</span>
                </Label>
                <Input id="pf-nom" value={nom} onChange={(e) => setNom(e.target.value)} aria-invalid={submitted && !nom.trim()} className="h-9 text-[13px]" />
                {err(!nom.trim())}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="pf-email" className="mb-1.5 text-xs font-semibold">
                  Adresse e-mail professionnelle <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="pf-email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={submitted && !/.+@.+\..+/.test(email.trim())} className="h-9 pl-9 text-[13px]" />
                </div>
                {err(!/.+@.+\..+/.test(email.trim()))}
              </div>
              <div>
                <Label htmlFor="pf-tel" className="mb-1.5 text-xs font-semibold">
                  Téléphone
                </Label>
                <Input id="pf-tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} className="h-9 text-[13px]" />
              </div>
              <div>
                <Label htmlFor="pf-fonction" className="mb-1.5 text-xs font-semibold">
                  Fonction
                </Label>
                <Input id="pf-fonction" value={fonction} onChange={(e) => setFonction(e.target.value)} className="h-9 text-[13px]" />
              </div>
            </div>
          </section>

          {/* Rôle */}
          <section className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold">Rôle et affectations</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Droits accordés par l&apos;administrateur du pressing.</p>
              </div>
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-[10px] font-bold text-amber-700">
                Géré par l&apos;administrateur
              </Badge>
            </div>
            <Label htmlFor="pf-role" className="mt-3 mb-1.5 text-xs font-semibold">
              Rôle
            </Label>
            <Select value="Responsable d'agence" onValueChange={() => toast.info("Rôle verrouillé", { description: "Contactez votre administrateur." })}>
              <SelectTrigger id="pf-role" className="w-full text-[13px] data-[size=default]:h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Responsable d'agence">Responsable d&apos;agence</SelectItem>
              </SelectContent>
            </Select>
            <Label htmlFor="pf-agence" className="mt-3 mb-1.5 text-xs font-semibold">
              Agence principale
            </Label>
            <Select value={agence} onValueChange={(v) => setAgence(v ?? "Akwa - Douala")}>
              <SelectTrigger id="pf-agence" className="w-full text-[13px] data-[size=default]:h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Akwa - Douala", "Bonapriso", "Bali", "Deido"].map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-3 mb-1.5 text-xs font-semibold">Affectations complémentaires</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {["Bonapriso", "Bali", "Deido"].map((a) => (
                <Label key={a} htmlFor={`pf-aff-${a}`} className="flex cursor-pointer items-center gap-2 text-xs font-medium">
                  <Checkbox id={`pf-aff-${a}`} checked={affectations.includes(a)} onCheckedChange={() => toggleAff(a)} />
                  {a}
                </Label>
              ))}
            </div>
          </section>

          {/* Préférences */}
          <section className="rounded-xl border border-border bg-white p-5">
            <h2 className="text-sm font-bold">Préférences</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Adaptez l&apos;interface à votre façon de travailler.</p>
            <Label htmlFor="pf-langue" className="mt-3 mb-1.5 text-xs font-semibold">
              Langue de l&apos;interface
            </Label>
            <Select value={langue} onValueChange={(v) => { setLangue(v ?? langue); toast.success("Langue mise à jour"); }}>
              <SelectTrigger id="pf-langue" className="w-full text-[13px] data-[size=default]:h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Français (Cameroun)", "Français (Côte d'Ivoire)", "Anglais"].map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Label htmlFor="pf-fuseau" className="mt-3 mb-1.5 text-xs font-semibold">
              Fuseau horaire
            </Label>
            <Select value={fuseau} onValueChange={(v) => setFuseau(v ?? fuseau)}>
              <SelectTrigger id="pf-fuseau" className="w-full text-[13px] data-[size=default]:h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Afrique/Douala • UTC+1", "Afrique/Abidjan • UTC+0", "Europe/Paris • UTC+2"].map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-3 space-y-3">
              {[
                ["Résumé quotidien", "Activité, retards et encaissements à 18:00", resume, setResume, Mail],
                ["Alertes sonores atelier", "Jouer un son pour les urgences et changements d'étape", alertes, setAlertes, Volume2],
                ["Notifications WhatsApp", "Recevoir les alertes critiques sur le numéro professionnel", whatsapp, setWhatsapp, MessageCircle],
              ].map(([label, sub, v, set, Icon]) => (
                <div key={label as string} className="flex items-center gap-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                    {(() => {
                      const I = Icon as React.ElementType;
                      return <I className="size-4 text-muted-foreground" />;
                    })()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold">{label as string}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{sub as string}</p>
                  </div>
                  <Switch checked={v as boolean} onCheckedChange={set as (b: boolean) => void} aria-label={label as string} />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          {/* Mot de passe */}
          <section className="rounded-xl border border-border bg-white p-5">
            <h2 className="text-sm font-bold">Changer le mot de passe</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Dernière modification le 12 août 2026.</p>
            <Label htmlFor="pf-mdpa" className="mt-3 mb-1.5 text-xs font-semibold">
              Mot de passe actuel
            </Label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="pf-mdpa" type="password" value={mdpActuel} onChange={(e) => setMdpActuel(e.target.value)} className="h-9 pl-9 text-[13px]" />
            </div>
            <Label htmlFor="pf-mdpn" className="mt-3 mb-1.5 text-xs font-semibold">
              Nouveau mot de passe
            </Label>
            <Input id="pf-mdpn" type="password" value={mdpNouveau} onChange={(e) => setMdpNouveau(e.target.value)} className="h-9 text-[13px]" />
            <p className="mt-1 text-[11px] text-muted-foreground">12 caractères minimum, une majuscule et un chiffre.</p>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                <div className={cn("h-full rounded-full transition-all", force.color)} style={{ width: `${force.pct}%` }} />
              </div>
              <span className="text-[11px] font-bold">{force.label}</span>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="mt-3 w-full justify-center gap-1.5 text-xs font-bold"
              onClick={handlePassword}
            >
              <KeyRound className="size-4" />
              Mettre à jour le mot de passe
            </Button>
          </section>

          {/* Auth renforcée */}
          <section className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold">Authentification renforcée</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Protection recommandée pour les comptes staff.</p>
              </div>
              <Badge variant="outline" className="gap-1 border-0 bg-emerald-50 text-[10px] font-bold text-emerald-700">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Activée
              </Badge>
            </div>
            <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-border p-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <ShieldCheck className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold">Application d&apos;authentification</p>
                <p className="text-[11px] text-muted-foreground">Configurée le 04 juin 2026 • 8 codes de secours</p>
              </div>
            </div>
          </section>

          {/* Sessions */}
          <section className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold">Sessions actives</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">{sessions.length} appareils connectés sur votre compte.</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto shrink-0 gap-1 p-0 text-[11px] font-bold text-red-600"
                onClick={() => {
                  setSessions((s) => s.filter((x) => x.current));
                  toast.success("Sessions fermées", { description: "Seule la session actuelle reste active." });
                }}
              >
                <LogOut className="size-3.5" />
                Déconnecter les autres
              </Button>
            </div>
            <div className="mt-3 space-y-2">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center gap-2.5 rounded-lg border border-border p-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                    <s.icon className="size-4 text-muted-foreground" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                      {s.device}
                      {s.current && (
                        <Badge variant="outline" className="border-0 bg-emerald-50 px-1.5 text-[10px] font-bold text-emerald-700">
                          Session actuelle
                        </Badge>
                      )}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">{s.detail}</p>
                  </div>
                  {s.current ? (
                    <span className="shrink-0 text-[11px] text-muted-foreground">Approuvée</span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto shrink-0 p-0 text-[11px] font-bold text-red-600"
                      onClick={() => {
                        setSessions((list) => list.filter((x) => x.id !== s.id));
                        toast.info("Appareil déconnecté", { description: s.device });
                      }}
                    >
                      Déconnecter
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Appareils */}
          <section className="rounded-xl border border-border bg-white p-5">
            <h2 className="text-sm font-bold">Appareils autorisés</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Connexion sans validation supplémentaire.</p>
            <div className="mt-3 space-y-2.5">
              {[
                ["iPhone professionnel", "Autorisé jusqu'au 04 décembre 2026", telPro, setTelPro, Smartphone],
                ["Poste de caisse Akwa", "Appareils gérés par l'organisation", posteCaisse, setPosteCaisse, Monitor],
              ].map(([label, sub, v, set, Icon]) => (
                <div key={label as string} className="flex items-center gap-2.5 rounded-lg border border-border p-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                    {(() => {
                      const I = Icon as React.ElementType;
                      return <I className="size-4 text-muted-foreground" />;
                    })()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold">{label as string}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{sub as string}</p>
                  </div>
                  <Switch checked={v as boolean} onCheckedChange={set as (b: boolean) => void} aria-label={label as string} />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Infos globe */}
      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Globe className="size-3.5" />
        Fuseau appliqué aux horodatages : {fuseau} • Langue : {langue}
      </p>
    </div>
  );
}
