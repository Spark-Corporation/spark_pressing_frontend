/* ---------------------------------- Auth ---------------------------------- */

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  token: string | null;
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}