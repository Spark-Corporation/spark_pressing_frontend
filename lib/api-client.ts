import { cookies } from "next/headers";

export const API_BACKEND_URL = process.env.API_BACKEND_URL;

async function handleResponse(response: Response) {
  if (!response.ok) {
    if(response.status === 401) {
      throw new Error("Non autorisé. Veuillez vous connecter.");
    }
    const error = await response.json().catch(() => ({ message: "Erreur inconnue" }));
    throw new Error(error.details || error.error || error.message || "Une erreur est survenue sur le serveur");
  }
  return response.json();
}

export const api = {
  // Fonction GET
  get: async (endpoint: string) => {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const res = await fetch(`${API_BACKEND_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return handleResponse(res);
  },

  // Fonction POST
  post: async (endpoint: string, data: any, isFile: boolean = false) => {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const res = await fetch(`${API_BACKEND_URL}${endpoint}`, {
      method: "POST",
      headers: {
        ...(isFile ? {} : { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: isFile ? data : JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Fonction PUT
  put: async (endpoint: string, data: any) => {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const res = await fetch(`${API_BACKEND_URL}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Fonction PATCH
  patch: async (endpoint: string, data?: any) => {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const res = await fetch(`${API_BACKEND_URL}${endpoint}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Fonction DELETE
  delete: async (endpoint: string) => {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const res = await fetch(`${API_BACKEND_URL}${endpoint}`, {
      method: "DELETE",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return handleResponse(res);
  },
};