"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Bell,
  Check,
  Minus,
  Plus,
  Printer,
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
import { Textarea } from "@/components/ui/textarea";
import type { Retrait } from "../data";
import { formatFCFA } from "../data";
import type { RetraitDetail } from "./detail";

const MOYENS = ["Espèces", "Mobile Money", "Carte"];

function maskPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.length < 9) return phone;
  return `${d.slice(0, 4)} ••• •• ${d.slice(-2)}`;
}

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function RetraitTraitView({ retrait, detail }: { retrait: Retrait; detail: RetraitDetail }) {
  const router = useRouter();
  const { updatePath } = useGlobalData();

  const robe = detail.articles.find((a) => a.controleRequis);
  const [mode, setMode] = useState<"total" | "partiel">(robe ? "partiel" : "total");
  const [qtes, setQtes] = useState<Record<string, number>>(() =>
    Object.fromEntries(detail.articles.map((a) => [a.id, a.controleRequis ? 0 : a.total])),
  );
  const [etat, setEtat] = useState<"conforme" | "reserve" | "anomalie">("conforme");
  const [remarques, setRemarques] = useState(detail.remarques);
  const [receptionnaire, setReceptionnaire] = useState<"elle" | "tiers">("elle");
  const [nomRecep, setNomRecep] = useState(retrait.client);
  const [signed, setSigned] = useState(false);
  const [moyen, setMoyen] = useState("Espèces");
  const [recu, setRecu] = useState(String(retrait.reste));
  const [paid, setPaid] = useState(retrait.reste <= 0);
  const [derogation, setDerogation] = useState(false);
  const [audit, setAudit] = useState(
    retrait.code === "BG-02641"
      ? [
          { text: "Dépôt ouvert pour retrait", sub: "Aïcha Koné • POS-02", heure: "10:37" },
          { text: "Retrait partiel sélectionné", sub: "6 pièces sur 7", heure: "10:39" },
          { text: "Identité confirmée", sub: "Aminata Diarra", heure: "10:41" },
        ]
      : [{ text: "Dépôt ouvert pour retrait", sub: "Aïcha Koné • POS-02", heure: "10:37" }],
  );

  const totalPieces = detail.articles.reduce((n, a) => n + a.total, 0);
  const selectedPieces = useMemo(
    () => detail.articles.reduce((n, a) => n + Math.min(qtes[a.id] ?? 0, a.total), 0),
    [detail.articles, qtes],
  );
  const recuValue = Number(recu.replace(/[^0-9]/g, "")) || 0;
  const monnaie = Math.max(0, recuValue - retrait.reste);
  const canConfirm = (paid || derogation) && signed;

  const setModeAndQtes = (m: "total" | "partiel") => {
    setMode(m);
    setQtes(Object.fromEntries(detail.articles.map((a) => [a.id, m === "total" ? a.total : a.controleRequis ? 0 : a.total])));
  };

  const toggleArticle = (id: string, total: number, controleRequis?: boolean) => {
    const current = qtes[id] ?? 0;
    if (current === 0 && controleRequis) {
      toast.warning("Contrôle requis", { description: "Cette pièce nécessite un contrôle complémentaire avant remise." });
    }
    setQtes((q) => ({ ...q, [id]: current > 0 ? 0 : total }));
  };

  const bump = (id: string, total: number, delta: number) =>
    setQtes((q) => ({ ...q, [id]: Math.min(total, Math.max(0, (q[id] ?? 0) + delta)) }));

  const pushAudit = (text: string, sub: string) =>
    setAudit((a) => [{ text, sub, heure: "À l'instant" }, ...a]);

  const handleEncaisser = () => {
    if (paid) return;
    if (recuValue < retrait.reste) {
      toast.error("Montant insuffisant", { description: `Il manque ${formatFCFA(retrait.reste - recuValue)} FCFA.` });
      return;
    }
    setPaid(true);
    pushAudit("Solde encaissé", `${formatFCFA(retrait.reste)} FCFA • ${moyen}`);
    toast.success("Paiement enregistré", { description: `${formatFCFA(retrait.reste)} FCFA • ${moyen}.` });
  };

  const handleDerogation = () => {
    if (derogation) return;
    setDerogation(true);
    pushAudit("Dérogation manager accordée", `Solde de ${formatFCFA(retrait.reste)} FCFA — auditée`);
    toast.success("Dérogation accordée", { description: "Autorisation manager journalisée." });
  };

  const handleConfirm = () => {
    if (!canConfirm) {
      if (!signed) toast.error("Signature requise", { description: "Faites signer le réceptionnaire." });
      else toast.error("Paiement requis", { description: "Encaissez le solde ou demandez une dérogation." });
      return;
    }
    toast.success("Retrait confirmé", { description: `${selectedPieces} pièces remises à ${receptionnaire === "elle" ? retrait.client : nomRecep}.` });
    updatePath("/retraits");
  };

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex flex-wrap items-start gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Retour au centre de retrait"
          onClick={() => router.back()}
          className="mt-1 bg-primary text-white hover:bg-primary/90 hover:text-white"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="flex flex-wrap items-center gap-2 text-xl font-extrabold tracking-tight sm:text-2xl">
            Traiter le retrait
            <Badge variant="outline" className="border-0 bg-muted text-[10px] font-bold text-muted-foreground">
              {retrait.code}
            </Badge>
            {mode === "partiel" && (
              <Badge variant="outline" className="border-0 bg-sky-100 text-[10px] font-bold text-sky-700">
                Retrait partiel
              </Badge>
            )}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Vérifiez les pièces, identifiez le réceptionnaire et finalisez l&apos;encaissement.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="lg" className="gap-1.5 px-3 text-xs font-bold" onClick={() => router.back()}>
            <ArrowLeft className="size-3.5" />
            Retour à la liste
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => toast.success("Bon envoyé à l'impression")}
          >
            <Printer className="size-3.5" />
            Imprimer le bon
          </Button>
          <Button
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => toast.success("Client notifié", { description: `${retrait.client} • ${retrait.phone}.` })}
          >
            <Bell className="size-4" />
            Notifier le client
          </Button>
        </div>
      </div>

      {/* Bandeau info */}
      <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-white p-4 sm:grid-cols-3 xl:grid-cols-6">
        {[
          ["CLIENT", `${retrait.client}`, `${retrait.phone} • Cliente depuis mars 2025`, true],
          ["DÉPÔT", retrait.code, detail.createdAt, false],
          ["AGENCE", retrait.agency, detail.reception, false],
          ["COMMANDE", detail.commande, detail.retraitPrevu, false],
          ["TOTAL", `${formatFCFA(retrait.total)} FCFA`, `Acompte • ${formatFCFA(detail.acompte)} FCFA`, false],
        ].map(([label, v, sub, avatar]) => (
          <div key={label as string} className="flex items-center gap-2">
            {avatar ? (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[11px] font-bold text-amber-800">
                {initialsOf(retrait.client)}
              </span>
            ) : null}
            <div className="min-w-0">
              <p className="text-[10px] font-bold tracking-wide text-muted-foreground">{label}</p>
              <p className="truncate text-xs font-bold">{v}</p>
              <p className="truncate text-[11px] text-muted-foreground">{sub}</p>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-2 ring-1 ring-emerald-100">
          <Check className="size-4 shrink-0 text-emerald-600" />
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-emerald-800">Atelier terminé</p>
            <p className="text-[11px] font-bold text-amber-600">{formatFCFA(retrait.reste)} FCFA dus</p>
          </div>
        </div>
      </div>

      {/* Chronologie */}
      <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold">Chronologie atelier</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Traçabilité complète de la prise en charge</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-[11px] font-semibold text-muted-foreground"
            onClick={() => toast.info("Traçabilité", { description: `Historique complet du dépôt ${retrait.code}.` })}
          >
            Voir les détails
          </Button>
        </div>
        <div className="mt-4 flex items-start">
          {detail.chrono.map((c, i) => {
            const doneStep = i < detail.chrono.length - 1;
            return (
              <div key={i} className="min-w-0 flex-1">
                <div className="flex items-center">
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full",
                      doneStep ? "bg-emerald-500 text-white" : i === detail.chrono.length - 2 ? "bg-secondary text-white" : "border border-border bg-white text-muted-foreground",
                    )}
                  >
                    {doneStep ? <Check className="size-3.5" /> : <span className="size-1.5 rounded-full bg-current" />}
                  </span>
                  {i < detail.chrono.length - 1 && (
                    <span className={cn("mx-1 h-0.5 flex-1 rounded-full", doneStep ? "bg-emerald-500" : "bg-border")} />
                  )}
                </div>
                <p className="mt-1.5 truncate text-[11px] font-bold">{c.title}</p>
                <p className="truncate text-[10px] text-muted-foreground">{c.sub}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          {/* Vérification articles */}
          <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
            <h2 className="text-sm font-bold">Vérification des articles</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {selectedPieces} pièces sur {totalPieces} sélectionnées pour ce retrait
            </p>
            <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
              {(["total", "partiel"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModeAndQtes(m)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-bold transition-colors",
                    mode === m ? "bg-amber-100 text-amber-800 shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {m === "total" ? `Retrait total • ${totalPieces} pièces` : `Retrait partiel • ${selectedPieces} pièces`}
                </button>
              ))}
            </div>
            {mode === "partiel" && robe && (
              <p className="mt-1.5 text-[11px] text-muted-foreground">La robe restera disponible à l&apos;agence.</p>
            )}
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[10px] font-bold tracking-wide text-muted-foreground">
                    <th className="w-8 pb-2">SÉL.</th>
                    <th className="pb-2">ARTICLE / ÉTAT DES PIÈCES</th>
                    <th className="pb-2">TOTAL</th>
                    <th className="pb-2">À RETIRER</th>
                    <th className="pb-2 text-right">VÉRIFICATION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {detail.articles.map((a) => {
                    const q = qtes[a.id] ?? 0;
                    return (
                      <tr key={a.id}>
                        <td className="py-2.5 pr-2">
                          <Checkbox checked={q > 0} onCheckedChange={() => toggleArticle(a.id, a.total, a.controleRequis)} aria-label={a.label} />
                        </td>
                        <td className="py-2.5 pr-2">
                          <p className="font-semibold">{a.label}</p>
                          <p className="text-[11px] text-muted-foreground">{a.detail}</p>
                        </td>
                        <td className="py-2.5 pr-2 text-muted-foreground">{a.total} pièce{a.total > 1 ? "s" : ""}</td>
                        <td className="py-2.5 pr-2">
                          <div className="flex w-fit items-center rounded-md border border-border">
                            <button type="button" aria-label={`Moins de ${a.label}`} onClick={() => bump(a.id, a.total, -1)} className="flex size-6 items-center justify-center text-muted-foreground hover:text-foreground">
                              <Minus className="size-3" />
                            </button>
                            <span className="min-w-6 text-center text-xs font-bold">{q}</span>
                            <button type="button" aria-label={`Plus de ${a.label}`} onClick={() => bump(a.id, a.total, 1)} className="flex size-6 items-center justify-center text-muted-foreground hover:text-foreground">
                              <Plus className="size-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 text-right">
                          {a.controleRequis ? (
                            <Badge variant="outline" className="border-0 bg-amber-100 text-[10px] font-bold text-amber-700">
                              Contrôle requis
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-0 bg-emerald-50 text-[10px] font-bold text-emerald-700">
                              Conforme
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-1 rounded-lg bg-emerald-50/60 px-3 py-2 text-[11px] ring-1 ring-emerald-100">
              <span className="font-bold text-emerald-800">{selectedPieces} pièces conformes prêtes à être remises</span>
              {robe && qtes[robe.id] === 0 && (
                <span className="text-muted-foreground">1 robe délicate • nouveau retrait requis</span>
              )}
            </div>
          </div>

          {/* État + remarques */}
          <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
            <h2 className="text-sm font-bold">État des pièces et remarques</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Consignez toute réserve avant remise</p>
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {(
                [
                  ["conforme", "Conforme"],
                  ["reserve", "Réserve client"],
                  ["anomalie", "Anomalie constatée"],
                ] as const
              ).map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setEtat(v)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs font-bold transition-colors",
                    etat === v ? "border-amber-300 bg-amber-50 text-amber-800" : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <Label htmlFor="ret-remarques" className="mt-3 mb-1.5 text-xs font-semibold">
              Remarques de remise
            </Label>
            <Textarea id="ret-remarques" value={remarques} onChange={(e) => setRemarques(e.target.value)} className="min-h-20 text-[13px]" />
          </div>

          {/* Réceptionnaire */}
          <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
            <h2 className="text-sm font-bold">Réceptionnaire</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Confirmez la personne qui récupère les pièces</p>
            <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
              {(["elle", "tiers"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setReceptionnaire(v);
                    if (v === "elle") setNomRecep(retrait.client);
                    else setNomRecep("");
                  }}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-bold transition-colors",
                    receptionnaire === v ? "bg-amber-100 text-amber-800 shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {v === "elle" ? "Cliente elle-même" : "Tiers autorisé"}
                </button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="ret-nom" className="mb-1.5 text-xs font-semibold">
                  Nom du réceptionnaire
                </Label>
                <Input
                  id="ret-nom"
                  value={nomRecep}
                  onChange={(e) => setNomRecep(e.target.value)}
                  disabled={receptionnaire === "elle"}
                  className="h-9 text-[13px]"
                />
              </div>
              <div>
                <Label className="mb-1.5 text-xs font-semibold">Signature ou confirmation</Label>
                <button
                  type="button"
                  onClick={() => {
                    setSigned(true);
                    pushAudit("Identité confirmée", nomRecep || retrait.client);
                    toast.success("Identité confirmée", { description: nomRecep || retrait.client });
                  }}
                  className={cn(
                    "flex h-9 w-full items-center justify-center gap-1.5 rounded-md border border-dashed text-xs transition-colors",
                    signed ? "border-emerald-300 bg-emerald-50 font-bold text-emerald-700" : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {signed ? (
                    <>
                      <Check className="size-3.5" />
                      Identité confirmée
                    </>
                  ) : (
                    "Signer dans cette zone"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Journal */}
          <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold">Journal d&apos;audit</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Actions enregistrées sur ce retrait</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-[11px] font-semibold text-muted-foreground"
                onClick={() => toast.info("Journal complet", { description: `Traçabilité du dépôt ${retrait.code}.` })}
              >
                Journal complet
              </Button>
            </div>
            <div className="mt-3 space-y-2.5">
              {audit.map((a, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <Check className="size-3.5" />
                  </span>
                  <p className="min-w-0 flex-1">
                    <span className="font-bold">{a.text}</span>
                    <span className="block text-[11px] text-muted-foreground">{a.sub}</span>
                  </p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{a.heure}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Latéral */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-[13px] font-bold">Solde et encaissement</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Montant à régulariser avant remise</p>
            <div className="mt-3 space-y-1.5 text-xs">
              <p className="flex justify-between"><span className="text-muted-foreground">Total du dépôt</span><span className="font-semibold">{formatFCFA(retrait.total)} FCFA</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Acompte encaissé</span><span className="font-semibold">−{formatFCFA(detail.acompte)} FCFA</span></p>
              <p className="flex justify-between text-[13px]"><span className="font-bold text-amber-700">Montant restant</span><span className="font-extrabold text-amber-600">{formatFCFA(retrait.reste)} FCFA</span></p>
            </div>
            {!paid && !derogation && retrait.reste > 0 && (
              <div className="mt-2 rounded-lg bg-red-50 p-2.5 text-[11px] ring-1 ring-red-100">
                <p className="font-bold text-red-600">Retrait bloqué • solde impayé</p>
                <p className="mt-0.5 leading-snug text-red-600/80">La politique Bingerville exige le règlement du solde. Une dérogation manager peut être autorisée et sera auditée.</p>
              </div>
            )}
            {(paid || derogation) && (
              <div className="mt-2 rounded-lg bg-emerald-50 p-2.5 text-[11px] ring-1 ring-emerald-100">
                <p className="font-bold text-emerald-700">{paid ? "Solde encaissé — retrait débloqué" : "Dérogation accordée — retrait débloqué"}</p>
              </div>
            )}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button
                size="sm"
                className="bg-amber-500 text-xs font-bold text-white hover:bg-amber-600"
                disabled={paid}
                onClick={handleEncaisser}
              >
                Encaisser {formatFCFA(retrait.reste)} FCFA
              </Button>
              <Button variant="outline" size="sm" className="text-xs font-bold" disabled={derogation || paid} onClick={handleDerogation}>
                Demander une dérogation
              </Button>
            </div>
            <Label className="mt-3 mb-1.5 text-xs font-semibold">Mode de paiement</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {MOYENS.map((m) => (
                <Button
                  key={m}
                  variant={moyen === m ? "outline" : "ghost"}
                  size="sm"
                  onClick={() => setMoyen(m)}
                  className={cn("h-8 text-[11px] font-semibold", moyen === m && "border-primary bg-primary/5 text-foreground")}
                >
                  {m}
                </Button>
              ))}
            </div>
            <Label htmlFor="ret-recu" className="mt-3 mb-1.5 text-xs font-semibold">
              Montant reçu
            </Label>
            <Input
              id="ret-recu"
              inputMode="numeric"
              value={recu}
              onChange={(e) => setRecu(e.target.value.replace(/[^0-9]/g, ""))}
              className="h-9 text-[13px]"
            />
            <p className="mt-2 flex justify-between text-xs">
              <span className="text-muted-foreground">Monnaie à rendre</span>
              <span className="font-bold">{formatFCFA(monnaie)} FCFA</span>
            </p>
          </div>

          <div className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-[13px] font-bold">Après confirmation</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Documents et information client</p>
            <div className="mt-3 space-y-2 text-xs">
              <p className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-emerald-600" />
                <span className="flex-1">Imprimer le bon de retrait</span>
                <span className="text-[11px] text-muted-foreground">POS-02 prêt</span>
              </p>
              <p className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-emerald-600" />
                <span className="flex-1">Notifier le client par SMS</span>
                <span className="text-[11px] text-muted-foreground">{maskPhone(retrait.phone)}</span>
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-[13px] font-bold">Réseau et synchronisation</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Continuité de service {retrait.agency}</p>
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted/50 p-2.5 text-[11px]">
              <Check className="size-4 shrink-0 text-emerald-600" />
              <p className="flex-1 font-semibold">En ligne • synchronisé</p>
              <p className="text-muted-foreground">Dernière synchro. à 10:41</p>
            </div>
            <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
              Si la connexion est perdue, le retrait sera chiffré localement, mis en file et synchronisé automatiquement.
            </p>
          </div>

          <div className="rounded-xl bg-primary p-4 text-white">
            <p className="flex items-center justify-between text-xs font-bold">
              <span>{paid || derogation ? "Prêt à confirmer" : "Paiement requis avant confirmation"}</span>
              <span>{formatFCFA(paid ? 0 : retrait.reste)} FCFA</span>
            </p>
            <Button
              className="mt-3 w-full justify-center gap-1.5 bg-white text-xs font-bold text-primary hover:bg-white/90"
              onClick={handleConfirm}
            >
              <Check className="size-4" />
              Confirmer le retrait
            </Button>
            <p className="mt-2 text-center text-[11px] text-white/70">
              La remise, le paiement et le journal seront enregistrés ensemble.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
