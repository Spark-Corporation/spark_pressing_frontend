import { AppIcon, type AppIconName } from "@/components/ui/app-icon";
import { Badge } from "@/components/ui/badge";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#edf0ed]">
      {/* Panneau marque */}
      <aside className="relative hidden w-[42%] shrink-0 flex-col justify-between overflow-hidden bg-primary p-8 text-white lg:flex xl:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-white/5"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/3 -left-32 size-96 rounded-full bg-white/[0.03]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 left-1/4 size-72 rounded-full bg-secondary/10"
        />

        <div className="relative flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-sm font-extrabold text-secondary-foreground">
            ÉP
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-extrabold tracking-wide">SPARK</span>
            <span className="block text-[10px] tracking-[0.2em] text-white/70">PRESSING</span>
          </span>
        </div>

        <div className="relative">
          <Badge className="border-0 bg-secondary/20 text-[10px] font-bold tracking-[0.12em] text-secondary">
            ESPACE PROFESSIONNEL SÉCURISÉ
          </Badge>
          <h1 className="mt-4 text-4xl leading-tight font-extrabold tracking-tight xl:text-5xl">
            L&apos;excellence opérationnelle, à chaque dépôt.
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75">
            Pilotez vos agences, suivez chaque vêtement et offrez une expérience irréprochable.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {(
              [
                ["search", "Traçabilité complète"],
                ["wifi", "Mode hors ligne"],
                ["lock", "Données chiffrées"],
              ] as [AppIconName, string][]
            ).map(([icon, label]) => (
              <div key={label}>
                <span className="flex size-10 items-center justify-center rounded-xl bg-white/10">
                  <AppIcon name={icon} className="size-4 text-secondary" />
                </span>
                <p className="mt-2 text-[11px] font-semibold text-white/85">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-[11px] text-white/60">Session chiffrée • Journalisation • RGPD</p>
      </aside>

      {/* Contenu */}
      <main className="flex min-w-0 flex-1 items-center justify-center p-4 sm:p-8">{children}</main>
    </div>
  );
}
