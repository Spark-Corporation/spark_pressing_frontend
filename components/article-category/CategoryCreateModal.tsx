"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { createArticleCategoryAction } from "@/actions/AdminAction";
import { handleApiAction } from "@/functions/handleResponseApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ApiArticleCategory } from "@/lib/types";

interface CategoryCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Appelée avec la catégorie créée (réponse `data` du POST). */
  onCreated?: (category: ApiArticleCategory) => void;
}

/**
 * Modale globale de création d'une catégorie d'articles (POST /article-categories).
 * Réutilisable : page Articles (onglet Catégories) et création d'article.
 */
export default function CategoryCreateModal({
  open,
  onOpenChange,
  onCreated,
}: CategoryCreateModalProps) {
  const { logout } = useAuth();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [shared, setShared] = useState(false);
  const [sortOrder, setSortOrder] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setName("");
    setIcon("");
    setShared(false);
    setSortOrder("");
  };

  const handleSubmit = async () => {
    if (name.trim() === "") {
      toast.error("Nom requis", { description: "Saisissez le nom de la catégorie." });
      return;
    }

    setSaving(true);
    try {
      await handleApiAction({
        action: createArticleCategoryAction,
        params: {
          name: name.trim(),
          ...(icon.trim() ? { icon: icon.trim() } : {}),
          shared,
          ...(sortOrder !== "" ? { sort_order: Number(sortOrder) } : {}),
        },
        logout,
        onSuccess: (data) => {
          toast.success(`Catégorie « ${data.name} » créée`);
          onCreated?.(data);
          onOpenChange(false);
          reset();
        },
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle catégorie d&apos;articles</DialogTitle>
          <DialogDescription>
            Elle sera immédiatement disponible dans le catalogue et les formulaires.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div>
            <Label htmlFor="cat-nom" className="mb-1.5 text-xs font-semibold">
              Nom
            </Label>
            <Input
              id="cat-nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex. Cérémonie"
              aria-invalid={name.trim() === ""}
              className="h-9 text-[13px]"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="cat-icone" className="mb-1.5 text-xs font-semibold">
                Icône
              </Label>
              <Input
                id="cat-icone"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="Ex. suit (optionnel)"
                className="h-9 text-[13px]"
              />
            </div>
            <div>
              <Label htmlFor="cat-ordre" className="mb-1.5 text-xs font-semibold">
                Ordre d&apos;affichage
              </Label>
              <Input
                id="cat-ordre"
                inputMode="numeric"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="0"
                className="h-9 text-[13px]"
              />
            </div>
          </div>
          <Label htmlFor="cat-shared" className="flex cursor-pointer items-center gap-2 text-xs font-semibold">
            <Switch id="cat-shared" checked={shared} onCheckedChange={(v) => setShared(v)} />
            Partagée avec le réseau
          </Label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={saving} className="gap-1.5">
            {saving ? "Création…" : "Créer la catégorie"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
