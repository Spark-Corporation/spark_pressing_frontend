"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Bell,
  Check,
  Mail,
  MessageCircle,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FieldLabel, Section } from "../_components";

const EVENEMENTS = [
  ["Dépôt enregistré", "Confirmation, numéro et délai estimé", true, true, "MVP actif"],
  ["En traitement", "Passage en atelier", true, false, "MVP actif"],
  ["Prêt au retrait", "Disponible en agence avec montant restant", true, true, "MVP actif"],
  ["Retard", "Nouveau délai et message d'excuse", true, true, "MVP actif"],
  ["Retrait effectué", "Confirmation de remise des articles", false, true, "MVP actif"],
  ["Paiement reçu", "Confirmation de règlement", true, true, "MVP actif"],
  ["Fidélité", "Points gagnés, palier et expiration", false, true, "Intégration ultérieure"],
] as const;

const VARIABLES = ["{{client.prenom}}", "{{depot.numero}}", "{{agence.nom}}", "{{depot.solde}}", "{{depot.date_limite}}"];

const PREVIEW_VARS: Record<string, string> = {
  "{{client.prenom}}": "Aminata",
  "{{depot.numero}}": "DP-2026-2844",
  "{{agence.nom}}": "Cocody",
  "{{depot.solde}}": "8 300 FCFA",
  "{{depot.date_limite}}": "30/09/2026",
};

const LOGS = [
  ["16:34", "SMS", "Aminata Koné", "Dépôt prêt", "Livré"],
  ["16:12", "E-mail", "Jean M'Bayo", "Paiement reçu", "Ouvert"],
  ["15:58", "SMS", "Fatou Diarra", "Retard", "Livré"],
  ["15:41", "E-mail", "S. Kouassi", "Dépôt enregistré", "Rebond"],
];

const logBadge: Record<string, string> = {
  Livré: "bg-emerald-50 text-emerald-700",
  Ouvert: "bg-sky-100 text-sky-700",
  Rebond: "bg-red-50 text-red-500",
};

export default function NotificationsPage() {
  const router = useRouter();
  const [canaux, setCanaux] = useState<Record<string, { sms: boolean; email: boolean }>>(() =>
    Object.fromEntries(EVENEMENTS.map(([e, , s, m]) => [e, { sms: s, email: m }])),
  );
  const [silencieux, setSilencieux] = useState(true);
  const [debut, setDebut] = useState("20:00");
  const [fin, setFin] = useState("08:00");
  const [consentement, setConsentement] = useState(true);
  const [lienDesinscription, setLienDesinscription] = useState(true);
  const [journaliser, setJournaliser] = useState(true);
  const [fournisseurSms, setFournisseurSms] = useState("Orange Business CI • Production");
  const [fournisseurMail, setFournisseurMail] = useState("Brevo • contact@sparkpressing.ci");
  const [nomModele, setNomModele] = useState("Prêt au retrait — standard");
  const [message, setMessage] = useState(
    "Bonjour {{client.prenom}}, votre dépôt {{depot.numero}} est prêt à l'agence {{agence.nom}}. Reste à payer : {{depot.solde}} FCFA. Retrait avant le {{depot.date_limite}}.",
  );

  const apercu = useMemo(
    () => Object.entries(PREVIEW_VARS).reduce((m, [k, v]) => m.split(k).join(v), message),
    [message],
  );
  const segments = Math.max(1, Math.ceil(message.length / 160));

  const toggleCanal = (event: string, canal: "sms" | "email") =>
    setCanaux((c) => ({ ...c, [event]: { ...c[event], [canal]: !c[event][canal] } }));

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex flex-wrap items-start gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Retour aux paramètres"
          onClick={() => router.back()}
          className="mt-1 bg-primary text-white hover:bg-primary/90 hover:text-white"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Notifications</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Configurez les messages SMS et e-mail envoyés à chaque étape.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => toast.success("Message test envoyé", { description: "+225 07 48 22 19 03." })}
          >
            <Send className="size-3.5" />
            Envoyer un test
          </Button>
          <Button
            size="lg"
            className="gap-1.5 px-4 text-xs font-bold"
            onClick={() => toast.success("Notifications enregistrées", { description: "Modèles et canaux mis à jour." })}
          >
            <Check className="size-4" />
            Enregistrer
          </Button>
        </div>
      </div>

      {/* Canaux */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[13px] font-bold">SMS transactionnels</h2>
            <Badge variant="outline" className="border-0 bg-muted text-[10px] font-bold text-muted-foreground">
              Opérationnel
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">Orange CI • compte vérifié</p>
          <div className="mt-2 grid grid-cols-3 text-center">
            {[["99,2 %", "livrés"], ["1,8 s", "délai moyen"], ["12 480", "crédits"]].map(([v, l]) => (
              <div key={l}>
                <p className="text-sm font-extrabold">{v}</p>
                <p className="text-[11px] text-muted-foreground">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[13px] font-bold">E-mail transactionnel</h2>
            <Badge variant="outline" className="border-0 bg-muted text-[10px] font-bold text-muted-foreground">
              Opérationnel
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">Brevo • domaine authentifié</p>
          <div className="mt-2 grid grid-cols-3 text-center">
            {[["98,6 %", "délivrés"], ["46 %", "ouverts"], ["0,7 %", "rebonds"]].map(([v, l]) => (
              <div key={l}>
                <p className="text-sm font-extrabold">{v}</p>
                <p className="text-[11px] text-muted-foreground">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-dashed border-border bg-white p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[13px] font-bold">Canaux futurs</h2>
            <Badge variant="outline" className="border-0 bg-muted text-[10px] font-bold text-muted-foreground">
              À intégrer
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">WhatsApp Business & push</p>
          <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
            Non inclus dans le MVP. Les événements et consentements sont déjà prêts pour une activation ultérieure.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          {/* Événements */}
          <Section title="Événements et canaux" sub="Activez les notifications selon le cycle du dépôt.">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">ÉVÉNEMENT</TableHead>
                  <TableHead className="text-center text-[10px] font-bold tracking-wide text-muted-foreground">SMS</TableHead>
                  <TableHead className="text-center text-[10px] font-bold tracking-wide text-muted-foreground">E-MAIL</TableHead>
                  <TableHead className="text-right text-[10px] font-bold tracking-wide text-muted-foreground">PORTÉE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {EVENEMENTS.map(([e, sub, , , portee]) => (
                  <TableRow key={e}>
                    <TableCell>
                      <p className="text-xs font-bold">{e}</p>
                      <p className="text-[11px] text-muted-foreground">{sub}</p>
                    </TableCell>
                    {(["sms", "email"] as const).map((c) => (
                      <TableCell key={c} className="text-center">
                        <Switch checked={canaux[e][c]} onCheckedChange={() => toggleCanal(e, c)} aria-label={`${e} ${c}`} size="sm" />
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <Badge variant="outline" className="border-0 bg-muted text-[10px] font-semibold text-foreground">
                        {portee}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Section>

          {/* Modèle */}
          <Section title="Modèle sélectionné • Prêt au retrait" sub="SMS • Français">
            <FieldLabel>Nom interne</FieldLabel>
            <Input value={nomModele} onChange={(e) => setNomModele(e.target.value)} className="h-9 text-[13px]" />
            <div className="mt-3">
              <FieldLabel>Message</FieldLabel>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value.slice(0, 320))} className="min-h-24 font-mono text-[13px]" />
              <p className="mt-1 text-[11px] text-muted-foreground">
                {message.length} / 320 caractères • estimé {segments} SMS
              </p>
            </div>
            <p className="mt-2 text-[11px] font-semibold text-muted-foreground">Variables disponibles</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {VARIABLES.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setMessage((m) => (m + " " + v).slice(0, 320))}
                  className="rounded-md bg-sky-50 px-2 py-1 font-mono text-[11px] font-semibold text-sky-700 ring-1 ring-sky-100 hover:bg-sky-100"
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="lg" className="gap-1.5 px-4 text-xs font-bold" onClick={() => toast.info("Modèle dupliqué", { description: nomModele })}>
                Dupliquer
              </Button>
              <Button size="lg" className="gap-1.5 px-4 text-xs font-bold" onClick={() => toast.success("Modèle enregistré", { description: `${segments} SMS estimé.` })}>
                <Check className="size-4" />
                Enregistrer le modèle
              </Button>
            </div>
          </Section>

          {/* Logs */}
          <Section
            title="Logs récents"
            sub="Historique des 7 derniers jours."
            right={
              <Button variant="outline" size="sm" className="gap-1 text-[11px] font-bold" onClick={() => toast.success("Logs exportés", { description: "7 derniers jours en CSV." })}>
                Exporter les logs
              </Button>
            }
          >
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {["Heure", "Canal", "Destinataire", "Événement", "Statut"].map((h) => (
                    <TableHead key={h} className="text-[10px] font-bold tracking-wide text-muted-foreground">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {LOGS.map(([h, canal, dest, evt, statut], i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs text-muted-foreground">{h}</TableCell>
                    <TableCell className="text-xs">{canal}</TableCell>
                    <TableCell className="text-xs font-semibold">{dest}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{evt}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("border-0 text-[10px] font-bold", logBadge[statut])}>
                        {statut}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Section>
        </div>

        {/* Latéral */}
        <div className="space-y-4">
          <Section title="Aperçu du message">
            <div className="mx-auto max-w-64 rounded-2xl border border-border bg-muted/40 p-3">
              <div className="rounded-xl bg-white p-3 shadow-sm">
                <p className="flex items-center gap-1.5 text-[11px] font-extrabold">
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[8px] text-white">S</span>
                  SPARK PRESSING
                </p>
                <p className="mt-1.5 text-[11px] leading-snug">{apercu}</p>
                <p className="mt-1 text-right text-[10px] text-muted-foreground">16:31 • Livré</p>
              </div>
            </div>
          </Section>

          <Section title="Horaires silencieux" sub="Aucun message marketing sur cette plage.">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold">Activer les horaires silencieux</p>
              <Switch checked={silencieux} onCheckedChange={setSilencieux} aria-label="Horaires silencieux" />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <FieldLabel>Début</FieldLabel>
                <Input value={debut} onChange={(e) => setDebut(e.target.value)} className="h-9 text-[13px]" />
              </div>
              <div>
                <FieldLabel>Fin</FieldLabel>
                <Input value={fin} onChange={(e) => setFin(e.target.value)} className="h-9 text-[13px]" />
              </div>
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Les confirmations de paiement et alertes urgentes sont envoyées immédiatement.
            </p>
          </Section>

          <Section title="Consentement et conformité">
            <div className="divide-y divide-border">
              {(
                [
                  ["Vérifier le consentement marketing", "Bloque les campagnes sans accord explicite.", consentement, setConsentement],
                  ["Inclure un lien de désinscription", "Obligatoire dans chaque e-mail promotionnel.", lienDesinscription, setLienDesinscription],
                  ["Journaliser les preuves", "Horodatage, source et version du consentement.", journaliser, setJournaliser],
                ] as [string, string, boolean, (v: boolean) => void][]
              ).map(([label, sub, v, set]) => (
                <div key={label} className="flex items-center gap-2 py-1.5">
                  <div className="min-w-0 flex-1 text-xs">
                    <p className="font-bold">{label}</p>
                    <p className="text-[11px] text-muted-foreground">{sub}</p>
                  </div>
                  <Switch checked={v} onCheckedChange={set} aria-label={label} size="sm" />
                </div>
              ))}
            </div>
          </Section>

          <Section title="Fournisseurs">
            <FieldLabel>SMS</FieldLabel>
            <div className="relative">
              <MessageCircle className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={fournisseurSms} onChange={(e) => setFournisseurSms(e.target.value)} className="h-9 pl-9 text-[13px]" />
            </div>
            <div className="mt-2">
              <FieldLabel>E-mail</FieldLabel>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={fournisseurMail} onChange={(e) => setFournisseurMail(e.target.value)} className="h-9 pl-9 text-[13px]" />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full gap-1.5 text-[11px] font-bold"
              onClick={() => toast.success("Configuration vérifiée", { description: "Orange CI + Brevo opérationnels." })}
            >
              <Bell className="size-3.5" />
              Vérifier la configuration
            </Button>
          </Section>
        </div>
      </div>
    </div>
  );
}
