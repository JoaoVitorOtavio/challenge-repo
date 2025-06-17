const API_URL = "http://localhost:3001";
import { IUser } from "@/commons/interfaces/users";
import { toast } from "react-toastify";

interface LoginPayload {
  email?: string;
  password?: string;
  loginWithJwt?: boolean;
  token?: string;
}

export interface LoginResponse {
  token: string;
  user: Partial<IUser>;
}

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      toast.error(error.message || "Erro ao fazer login!");
      throw new Error(error.message || "Erro ao fazer login");
    }

    const result: LoginResponse = await res.json();

    localStorage.setItem("token", result.token);
    localStorage.setItem("user", JSON.stringify(result.user));

    toast.success("Login feito com sucesso!");
    return result;
  },

  async logout(): Promise<void> {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return Promise.resolve();
  },
};
