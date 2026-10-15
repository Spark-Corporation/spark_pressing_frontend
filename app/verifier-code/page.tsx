"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CODE_LEN = 6;

export default function VerifierCodePage() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(CODE_LEN).fill(""));
  const [cooldown, setCooldown] = useState(45);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const setDigit = (i: number, v: string) => {
    const d = v.replace(/[^0-9]/g, "").slice(-1);
    setDigits((list) => {
      const next = [...list];
      next[i] = d;
      return next;
    });
    if (d && i < CODE_LEN - 1) refs.current[i + 1]?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "Enter") handleValidate();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, CODE_LEN);
    if (!text) return;
    e.preventDefault();
    setDigits(text.split("").concat(Array(CODE_LEN).fill("")).slice(0, CODE_LEN));
    refs.current[Math.min(text.length, CODE_LEN - 1)]?.focus();
  };

  const handleValidate = () => {
    if (digits.some((d) => !d)) {
      toast.error("Code incomplet", { description: "Saisissez les 6 chiffres reçus." });
      return;
    }
    toast.success("Identité vérifiée", { description: "Définissez votre nouveau mot de passe." });
    router.push("/nouveau-mot-de-passe");
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl sm:p-8">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-white">
          <ShieldCheck className="size-5" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Vérifiez votre identité</h1>
        <p className="mt-2 text-[11px] font-bold tracking-wide text-muted-foreground">
          ÉTAPE 2 SUR 3 • CODE À 6 CHIFFRES
        </p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Saisissez le code envoyé il y a quelques instants. Il expire dans 10 minutes.
        </p>

        <div className="mt-5 flex justify-between gap-2" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <Input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => handleKey(i, e)}
              inputMode="numeric"
              maxLength={1}
              aria-label={`Chiffre ${i + 1}`}
              className="h-12 w-full text-center text-lg font-extrabold"
            />
          ))}
        </div>

        <Button size="lg" className="mt-5 w-full justify-center gap-1.5 text-xs font-bold" onClick={handleValidate}>
          <KeyRound className="size-4" />
          Valider le code
        </Button>

        <div className="mt-3 text-center text-xs text-muted-foreground">
          {cooldown > 0 ? (
            <p>
              Renvoyer le code dans{" "}
              <span className="font-bold text-foreground">
                {String(Math.floor(cooldown / 60)).padStart(2, "0")}:{String(cooldown % 60).padStart(2, "0")}
              </span>
            </p>
          ) : (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs font-bold"
              onClick={() => {
                setCooldown(45);
                toast.success("Nouveau code envoyé", { description: "Valable 10 minutes." });
              }}
            >
              Renvoyer un code
            </Button>
          )}
        </div>

        <Button
          variant="link"
          size="sm"
          className="mt-2 h-auto gap-1 p-0 text-xs font-bold"
          onClick={() => router.push("/login")}
        >
          <ArrowLeft className="size-3.5" />
          Revenir à la connexion
        </Button>
      </div>
    </AuthLayout>
  );
}
