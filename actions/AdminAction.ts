"use server";

import { api } from "@/lib/api-client";
import { LoginResult } from "@/lib/types";




// ------------------------- AUTHENTIFICATION ---------------------------------
export async function loginAction(params?: { email: string; password: string }) {
  try {
    const result = await api.post("/auth/staff/login", params);
    const payload = (result?.data ?? result) as LoginResult;
    if (!payload?.token || !payload?.user) {
      throw new Error("Réponse inattendue du serveur.");
    }
    return { success: true, data: payload };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}



// ------------------------- CLIENTS ---------------------------------
export async function getClientsAction() {
  try {
    const result = await api.get("/clients");
    return { success: true, data: result.data};
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
