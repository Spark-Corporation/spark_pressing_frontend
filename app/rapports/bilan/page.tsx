"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Download,
  FileSpreadsheet,
  FileText,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BILAN_BARS, CAISSIERS, type Caissier } from "../data";

type Periode = "jour" | "semaine" | "mois";

const CAISSIERS_EXTRA: Caissier[] = [
  { initials: "MK", nom: "Mariam Koné", session: "Classeur • 08:00–16:30", recettes: "986 000 FCFA", ventes: 72, panier: "13 694 FCFA", productivite: 66, ecart: "0 FCFA", ecartTone: "emerald", avatarBg: "bg-emerald-100 text-emerald-700" },
  { initials: "MK", nom: "Moussa Kouamé", session: "Caisse • 08:00–18:00", recettes: "912 500 FCFA", ventes: 64, panier: "14 258 FCFA", productivite: 62, ecart: "+1 000 FCFA", ecartTone: "amber", avatarBg: "bg-slate-200 text-slate-600" },
  { initials: "JK", nom: "Jean Koffi", session: "Atelier • 07:30–17:00", recettes: "0 FCFA", ventes: 0, panier: "—", productivite: 58, ecart: "0 FCFA", ecartTone: "emerald", avatarBg: "bg-primary text-white" },
  { initials: "OK", nom: "Odile Kassi", session: "Classement • 09:00–17:30", recettes: "0 FCFA", ventes: 0, panier: "—", productivite: 55, ecart: "0 FCFA", ecartTone: "emerald", avatarBg: "bg-emerald-100 text-emerald-700" },
];

const ALL_CAISSIERS = [...CAISSIERS, ...CAISSIERS_EXTRA];
const PAGE_SIZE = 4;

const ecartBadge: Record<Caissier["ecartTone"], string> = {
  amber: "bg-amber-100 text-amber-700",
  emerald: "bg-emerald-50 text-emerald-700",
  red: "bg-red-50 text-red-500",
};

export default function BilanPage() {
  const router = useRouter();
  const [periode, setPeriode] = useState<Periode>("jour");
  const [dateSel, setDateSel] = useState("today");
  const [agency, setAgency] = useState("cocody");
  const [session, setSession] = useState("all");
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(ALL_CAISSIERS.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const rows = ALL_CAISSIERS.slice(start, start + PAGE_SIZE);

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex flex-wrap items-start gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Retour aux rapports"
          onClick={() => router.back()}
          className="mt-1 bg-primary text-white hover:bg-primary/90 hover:text-white"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Bilan journalier et performance caissiers</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Recettes, mouvements de caisse et performance de chaque session active.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => toast.success("Export Excel", { description: "Bilan du 28 septembre 2026." })}
          >
            <FileSpreadsheet className="size-3.5" />
            Excel
          </Button>
          <Button
            size="lg"
            className="gap-1.5 px-3 text-xs font-bold"
            onClick={() => toast.success("PDF généré", { description: "Bilan journalier archivé." })}
          >
            <FileText className="size-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-white p-3">
        <div className="min-w-40 flex-1">
          <p className="mb-1 text-[10px] font-bold text-muted-foreground">Date</p>
          <Select value={dateSel} onValueChange={(v) => setDateSel(v ?? "today")}>
            <SelectTrigger className="w-full text-xs data-[size=default]:h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Aujourd&apos;hui • 28 sept. 2026</SelectItem>
              <SelectItem value="yesterday">Hier • 27 sept. 2026</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-40 flex-1">
          <p className="mb-1 text-[10px] font-bold text-muted-foreground">Agence</p>
          <Select value={agency} onValueChange={(v) => setAgency(v ?? "cocody")}>
            <SelectTrigger className="w-full text-xs data-[size=default]:h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Cocody Angré", "Bingerville", "Plateau", "Marcory"].map((a) => (
                <SelectItem key={a} value={a.toLowerCase()}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-40 flex-1">
          <p className="mb-1 text-[10px] font-bold text-muted-foreground">Session</p>
          <Select value={session} onValueChange={(v) => setSession(v ?? "all")}>
            <SelectTrigger className="w-full text-xs data-[size=default]:h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les sessions</SelectItem>
              <SelectItem value="matin">Matin • 08:00–13:00</SelectItem>
              <SelectItem value="soir">Soir • 13:00–18:30</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          size="lg"
          className="mt-5 gap-1.5 px-3 text-xs font-bold"
          onClick={() => toast.success("Données actualisées", { description: "Bilan recalculé à l'instant." })}
        >
          <RefreshCw className="size-3.5" />
          Actualiser
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Recettes encaissées", "8 221 000 FCFA", "+11,6 % vs lundi"],
          ["Ventes soldées", "566", "93,4 % des dépôts"],
          ["Impayés ouverts", "582 500 FCFA", "40 dépôts"],
          ["Écart de caisse", "−2 000 FCFA", "Seuil ±5 000"],
        ].map(([label, value, sub]) => (
          <div key={label as string} className="rounded-xl border border-border bg-white p-4">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-xl font-extrabold tracking-tight">{value}</p>
            <p className="mt-1.5 text-[11px] text-muted-foreground">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          {/* Recettes par moyen */}
          <div className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold">Recettes par moyen de paiement</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Encaissements confirmés</p>
              </div>
              <Badge variant="outline" className="border-0 bg-amber-100 text-[10px] font-bold text-amber-700">
                8,22 M FCFA
              </Badge>
            </div>
            <div className="mt-3 flex h-36 items-end gap-1.5">
              {BILAN_BARS.map((b, i) => (
                <div key={i} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1 self-stretch">
                  <span className="text-[10px] font-bold text-muted-foreground">{[11, 105, 112, 115, 169, 199, 142, 150, 211][i]}k</span>
                  <div
                    className={cn("w-full rounded-sm", i === BILAN_BARS.length - 1 ? "bg-secondary" : "bg-emerald-500/25")}
                    style={{ height: `${b.v}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-1 flex gap-1.5">
              {BILAN_BARS.map((b, i) => (
                <span key={i} className="min-w-0 flex-1 text-center text-[10px] text-muted-foreground">
                  {b.h}
                </span>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ["Mobile Money", "3 892 000"],
                ["Espèces", "2 676 500"],
                ["Carte", "1 380 000"],
                ["Virement", "272 500"],
              ].map(([label, v]) => (
                <div key={label as string} className="rounded-lg bg-muted/50 p-2.5 text-center">
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                  <p className="text-xs font-extrabold">{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Soldes + remises */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-white p-4">
              <h2 className="text-[13px] font-bold">Soldes & impayés</h2>
              <div className="mt-2 flex items-end justify-between">
                <div>
                  <p className="text-xl font-extrabold">566</p>
                  <p className="text-[11px] text-emerald-600">Soldes • 93,4%</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-extrabold text-red-500">40</p>
                  <p className="text-[11px] text-red-500">582 500 FCFA</p>
                </div>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[93%] rounded-full bg-emerald-500" />
              </div>
            </div>
            <div className="rounded-xl border border-border bg-white p-4">
              <h2 className="text-[13px] font-bold">Remises accordées</h2>
              <p className="mt-1 text-xs font-semibold">76 remises • 214 500 FCFA • 2,5% du CA</p>
              <p className="mt-2 rounded-lg bg-sky-50 p-2 text-[11px] text-sky-800 ring-1 ring-sky-100">
                <span className="font-bold">0 remises sensibles</span>
                <br />
                Supérieures à 10%, validation manager.
              </p>
            </div>
          </div>

          {/* Caissiers */}
          <div className="rounded-xl border border-border bg-white p-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold">Performance des caissiers</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Tickets, ventes, panier, productivité</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-[11px] font-bold"
                onClick={() => toast.info("Comparaison", { description: "Performance vs août 2026." })}
              >
                Comparer avec août
              </Button>
            </div>
            <div className="mt-3">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">CAISSIER / SESSION</TableHead>
                    <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">RECETTES</TableHead>
                    <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">VENTES</TableHead>
                    <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">PANIER</TableHead>
                    <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">PRODUCTIVITÉ</TableHead>
                    <TableHead className="text-[10px] font-bold tracking-wide text-muted-foreground">ÉCART</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((c) => (
                    <TableRow key={c.nom}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold", c.avatarBg)}>
                            {c.initials}
                          </span>
                          <span>
                            <span className="block text-xs font-bold">{c.nom}</span>
                            <span className="block text-[11px] text-muted-foreground">{c.session}</span>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-bold">{c.recettes}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{c.ventes}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{c.panier}</TableCell>
                      <TableCell>
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${c.productivite}%` }} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("border-0 text-[10px] font-bold", ecartBadge[c.ecartTone])}>
                          {c.ecart}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] text-muted-foreground">
                {start + 1}–{start + rows.length} sur {ALL_CAISSIERS.length} résultats
              </p>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={p === safePage ? "default" : "outline"}
                    size="icon-sm"
                    onClick={() => setPage(p)}
                    className="text-[11px] font-bold"
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Latéral */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-[13px] font-bold">Mouvements hors dépôt</h2>
            <div className="mt-2 space-y-1.5 text-xs">
              {[
                ["Fonds de caisse", "+400 000", ""],
                ["Petites dépenses", "−87 500", "text-red-500"],
                ["Collecte convoyeur", "−1 200 000", "text-red-500"],
                ["Ajustement manager", "+15 000", ""],
              ].map(([label, v, cls]) => (
                <p key={label as string} className="flex justify-between">
                  <span className="text-muted-foreground">{label}</span>
                  <span className={cn("font-bold", cls as string)}>{v}</span>
                </p>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-[13px] font-bold">Rapprochement caisse</h2>
            <div className="mt-2 space-y-1.5 text-xs">
              <p className="flex justify-between"><span className="text-muted-foreground">Solde théorique</span><span className="font-bold">1 253 000</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Comptage déclaré</span><span className="font-bold">1 251 000</span></p>
            </div>
            <p className="mt-2 rounded-lg bg-amber-50 p-2 text-[11px] font-bold text-amber-700 ring-1 ring-amber-100">
              Écart : −2 000 FCFA
              <span className="block font-normal">Dans le seuil : commentaire requis à la clôture.</span>
            </p>
          </div>

          <div className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Check className="size-4 shrink-0 text-emerald-600" />
              <p>Données synchronisées à 10:42 • session POS-02</p>
            </div>
            <div className="mt-3">
              <p className="mb-1 text-[10px] font-bold text-muted-foreground">Résultats :</p>
              <Tabs value={periode} onValueChange={(v) => setPeriode(v as Periode)}>
                <TabsList className="h-7">
                  <TabsTrigger value="jour" className="px-3 text-[11px]">
                    Jour
                  </TabsTrigger>
                  <TabsTrigger value="semaine" className="px-3 text-[11px]">
                    Semaine
                  </TabsTrigger>
                  <TabsTrigger value="mois" className="px-3 text-[11px]">
                    Mois
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full gap-1.5 text-xs font-bold"
              onClick={() => toast.success("Export lancé", { description: "Bilan journalier CSV." })}
            >
              <Download className="size-3.5" />
              Exporter le bilan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
