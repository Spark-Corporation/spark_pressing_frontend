"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Calculator,
  Check,
  CheckCircle2,
  Eye,
  FileText,
  Lock,
  Save,
  TrendingUp,
  TriangleAlert,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useGlobalData } from "@/contexts/GlobalContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const checklist = [
  ["Journal vérifié", "57 opérations contrôlées"],
  ["Espèces recomptées", "508 000 FCFA"],
  ["Relevés Mobile Money", "Orange et Wave rapprochés"],
  ["Paiements carte vérifiés", "TPE POS-02 rapproché"],
  ["Anomalies traitées", "Aucune anomalie bloquante"],
  ["Double contrôle effectué", "Grâce A. + Aïcha K."],
];

const moyens = [
  ["Espèces", "508 000", "508 000 FCFA", "text-amber-600"],
  ["Mobile Money", "375 500", "375 500 FCFA", "text-emerald-600"],
  ["Carte / Virement", "100 000", "100 000 FCFA", "text-sky-600"],
];

const operateurs = [
  ["GA", "Grâce Adjoua", "Ouverture • 29 opérations", "bg-primary text-white"],
  ["MK", "Moussa Kouamé", "24 opérations • comptage", "bg-primary text-white"],
  ["AK", "Aïcha Koné", "4 validations • contrôle", "bg-amber-200 text-amber-800"],
];

export default function CloturePage() {
  const router = useRouter();
  const { updatePath } = useGlobalData();
  const [cloturee, setCloturee] = useState(false);
  const [justification, setJustification] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleCloture = () => {
    setConfirmOpen(false);
    setCloturee(true);
    toast.success("Caisse clôturée", { description: "Journal du 28 septembre 2026 verrouillé définitivement." });
  };

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex flex-wrap items-start gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Retour à la caisse"
          onClick={() => router.back()}
          className="mt-1 bg-primary text-white hover:bg-primary/90 hover:text-white"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="flex flex-wrap items-center gap-2 text-xl font-extrabold tracking-tight sm:text-2xl">
            Clôture et rapprochement journalier
            <Badge
              variant="outline"
              className={cn(
                "border-0 text-[10px] font-bold",
                cloturee ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700",
              )}
            >
              {cloturee ? "Clôturée" : "Prête à clôturer"}
            </Badge>
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Contrôlez les flux, expliquez tout écart et verrouillez la caisse de Bingerville.
          </p>
        </div>
        <Button
          variant="outline"
          size="lg"
          className="gap-1.5 px-3 text-xs font-bold"
          onClick={() => toast.success("Rapport généré", { description: "Clôture_BG_2026-09-28.pdf • 1,8 Mo." })}
        >
          <FileText className="size-3.5" />
          Rapport PDF
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total des recettes", value: "895 500 FCFA", sub: "51 encaissements", icon: TrendingUp, iconBg: "bg-stone-100 text-stone-500", subClass: "" },
          { label: "Total des sorties", value: "92 000 FCFA", sub: "4 mouvements validés", icon: ArrowUpRight, iconBg: "bg-red-50 text-red-500", subClass: "text-red-500" },
          { label: "Solde théorique", value: "983 500 FCFA", sub: "Calcul final à 17:58", icon: Calculator, iconBg: "bg-slate-100 text-slate-500", subClass: "" },
          { label: "Écart final", value: "0 FCFA", sub: "Rapprochement conforme", icon: CheckCircle2, iconBg: "bg-emerald-50 text-emerald-600", subClass: "" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
              <span className={cn("flex size-8 items-center justify-center rounded-lg", k.iconBg)}>
                <k.icon className="size-4" />
              </span>
            </div>
            <p className="mt-2 text-xl font-extrabold tracking-tight">{k.value}</p>
            <p className={cn("mt-1.5 text-[11px] text-muted-foreground", k.subClass)}>{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          {/* Synthèse */}
          <div className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold">Synthèse détaillée</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Tous les mouvements enregistrés entre 08:02 et 18:00.</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs font-bold"
                onClick={() => updatePath("/caisse")}
              >
                Voir le journal
              </Button>
            </div>
            <div className="mt-3 divide-y divide-border text-[13px]">
              {[
                ["Solde d'ouverture", "—", "180 000 FCFA", ""],
                ["Recettes liées aux dépôts", "31 dépôts", "612 500 FCFA", ""],
                ["Paiements de soldes", "18 retraits", "248 000 FCFA", ""],
                ["Entrées hors dépôt", "2 mouvements", "35 000 FCFA", ""],
                ["Sorties hors dépôt", "4 mouvements", "−92 000 FCFA", "text-red-500"],
              ].map(([label, sub, v, cls]) => (
                <div key={label as string} className="flex items-baseline justify-between gap-2 py-2.5">
                  <div>
                    <p className="font-semibold">{label}</p>
                    <p className="text-[11px] text-muted-foreground">{sub}</p>
                  </div>
                  <p className={cn("font-extrabold", cls as string)}>{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-primary p-4 text-white">
              <div>
                <p className="text-[13px] font-bold">Solde théorique de clôture</p>
                <p className="text-[11px] text-white/60">Ouverture + entrées − sorties</p>
              </div>
              <p className="text-xl font-extrabold">983 500 FCFA</p>
            </div>
          </div>

          {/* Rapprochement */}
          <div className="rounded-xl border border-border bg-white p-5">
            <h2 className="text-sm font-bold">Rapprochement par moyen de paiement</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Montants théoriques comparés au comptage ou aux relevés.</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {moyens.map(([label, theo, reel, cls]) => (
                <div key={label as string} className="rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold">{label}</p>
                    <Badge variant="outline" className="border-0 bg-emerald-50 text-[10px] font-bold text-emerald-700">
                      Conforme
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-muted-foreground">THÉORIQUE</p>
                      <p className="text-sm font-extrabold">{theo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground">RÉEL / RELEVÉ</p>
                      <p className={cn("text-sm font-extrabold", cls as string)}>{reel}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Résultat */}
          <div className="rounded-xl border border-border bg-white p-5">
            <h2 className="text-sm font-bold">Résultat du rapprochement</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Le comptage réel correspond au solde théorique.</p>
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                <Check className="size-5 text-emerald-600" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold">Caisse conforme • écart zéro</p>
                <p className="text-[11px] text-muted-foreground">983 500 FCFA théoriques • 983 500 FCFA réellement comptés</p>
              </div>
              <Badge variant="outline" className="shrink-0 gap-1 border-0 bg-emerald-100 text-[10px] font-bold text-emerald-700">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Écart 0 FCFA
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] text-muted-foreground">Comptage saisi par Grâce Adjoua à 17:56 • contrôle Aïcha Koné à 17:58</p>
              <Badge variant="outline" className="border-0 bg-muted text-[10px] font-bold text-foreground">
                Double contrôle OK
              </Badge>
            </div>
          </div>

          {/* Écart */}
          <div className="rounded-xl bg-amber-50 p-5 ring-1 ring-amber-100">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                  <TriangleAlert className="size-4 text-amber-600" />
                </span>
                <div>
                  <h2 className="text-sm font-bold">Si un écart est détecté</h2>
                  <p className="text-[11px] text-amber-700">Exemple : comptage réel 983 000 FCFA • écart −500 FCFA</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-amber-700">Traitement requis</span>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {[
                ["01 • RECOMPTER", "Vérifier les espèces et les justificatifs."],
                ["02 • JUSTIFIER", "Motif et preuve obligatoires si l'écart persiste."],
                ["03 • FAIRE VALIDER", "Approbation manager tracée avant clôture."],
              ].map(([t, d]) => (
                <div key={t} className="rounded-lg bg-white/80 p-3">
                  <p className="text-[11px] font-extrabold text-amber-700">{t}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{d}</p>
                </div>
              ))}
            </div>
            <Label htmlFor="clot-justif" className="mt-3 mb-1.5 text-xs font-semibold">
              Justification obligatoire si l&apos;écart n&apos;est pas nul
            </Label>
            <Select value={justification} onValueChange={(v) => setJustification(v ?? "")}>
              <SelectTrigger id="clot-justif" className="w-full border-amber-200 bg-white text-[13px] data-[size=default]:h-9">
                <SelectValue placeholder="Décrire l'origine probable et l'action corrective…" />
              </SelectTrigger>
              <SelectContent>
                {["Erreur de comptage — recompté et corrigé", "Billet détérioré mis de côté", "Oubli de saisie régularisé", "Autre — voir commentaire"].map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Latéral */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-[13px] font-bold">Checklist de clôture</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">6 étapes obligatoires • 6 terminées</p>
            <div className="mt-3 space-y-3">
              {checklist.map(([title, sub]) => (
                <div key={title as string} className="flex items-start gap-2.5">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-emerald-500 text-white">
                    <Check className="size-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold">{title}</p>
                    <p className="text-[11px] text-muted-foreground">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-[13px] font-bold">Opérateurs de la journée</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">3 personnes ont agi sur cette caisse.</p>
            <div className="mt-3 space-y-2.5">
              {operateurs.map(([initials, nom, sub, bg]) => (
                <div key={nom as string} className="flex items-center gap-2.5">
                  <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold", bg as string)}>
                    {initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold">{nom}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{sub}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0 border-0 bg-muted text-[10px] font-bold text-foreground">
                    Vérifié
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-[13px] font-bold">Anomalies et synchronisation</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">État avant verrouillage du journal.</p>
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted/50 p-2.5 text-xs">
              <Wifi className="size-4 shrink-0 text-emerald-600" />
              <div className="min-w-0 flex-1">
                <p className="font-bold">Toutes les opérations synchronisées</p>
                <p className="text-[11px] text-muted-foreground">Dernière synchro à 17:58:42</p>
              </div>
              <Badge variant="outline" className="shrink-0 border-0 bg-muted text-[10px] font-bold text-muted-foreground">
                0
              </Badge>
            </div>
            <div className="mt-2 space-y-1.5 text-xs">
              {[
                ["Opérations non synchronisées", "0"],
                ["Anomalies non résolues", "0"],
                ["Mouvements en attente d'approbation", "0"],
              ].map(([label, v]) => (
                <p key={label as string} className="flex justify-between">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-bold">{v}</span>
                </p>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-[13px] font-bold">Rapport de clôture</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Généré avec le détail du journal et les signatures.</p>
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted/50 p-2.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
                <FileText className="size-4" />
              </span>
              <div className="min-w-0 flex-1 text-[11px]">
                <p className="truncate font-bold">Clôture_BG_2026-09-28.pdf</p>
                <p className="text-muted-foreground">PDF • 1,8 Mo • prêt à générer</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-1 text-[11px] font-bold"
                onClick={() => toast.success("Aperçu généré", { description: "Clôture_BG_2026-09-28.pdf" })}
              >
                <Eye className="size-3.5" />
                Aperçu PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Barre d'action */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-primary p-4 text-white">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary/20">
          <Lock className="size-5 text-secondary" />
        </span>
        <p className="min-w-0 flex-1 text-xs">
          <span className="block text-[13px] font-extrabold">
            {cloturee ? "Caisse clôturée — journal verrouillé" : "Toutes les conditions de clôture sont remplies"}
          </span>
          <span className="text-white/70">La clôture verrouille définitivement le journal du 28 septembre 2026.</span>
        </p>
        <Button
          variant="outline"
          size="lg"
          className="border-white/20 bg-white px-4 text-xs font-bold text-foreground"
          onClick={() => toast.success("Brouillon enregistré", { description: "Reprenez la clôture à tout moment." })}
        >
          <Save className="size-4" />
          Enregistrer le brouillon
        </Button>
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogTrigger
            render={
              <Button
                size="lg"
                disabled={cloturee}
                className="gap-1.5 bg-secondary px-4 text-xs font-bold text-secondary-foreground hover:bg-secondary/90 disabled:opacity-70"
              >
                <Lock className="size-4" />
                {cloturee ? "Caisse clôturée" : "Clôturer la caisse"}
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clôturer la caisse ?</AlertDialogTitle>
              <AlertDialogDescription>
                Le journal du 28 septembre 2026 (57 opérations • 983 500 FCFA) sera verrouillé définitivement. Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Vérifier encore</AlertDialogCancel>
              <AlertDialogAction onClick={handleCloture}>Clôturer définitivement</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
