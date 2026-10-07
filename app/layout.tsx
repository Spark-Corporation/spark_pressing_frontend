import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { GlobalProvider } from "@/contexts/GlobalContext";
import ConditionalLayout from "@/components/layout/ConditionalLayout";

export const metadata: Metadata = {
  title: "Spark Pressing — Dashboard",
  description: "Pilotage du réseau d'agences Spark Pressing",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={cn("h-full", "antialiased", "font-sans")}>
      <body className="flex min-h-full flex-col">
        <Toaster position="top-right" richColors />
        <AuthProvider>
          <GlobalProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
          </GlobalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
