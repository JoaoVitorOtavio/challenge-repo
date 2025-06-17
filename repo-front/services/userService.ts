const API_URL = "http://localhost:3001";
import { IUser } from "@/commons/interfaces/users";
import { toast } from "react-toastify";

export const userService = {
  async findOne(userId: number): Promise<IUser | null> {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/users/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const error = await res.json();
      toast.error(error.message || "Erro ao buscar usuario!");

      return null;
    }

    const result: IUser = await res.json();

    return result;
  },
  async findAll(): Promise<IUser[]> {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const error = await res.json();
      toast.error(error.message || "Erro ao buscar usuarios!");

      return [];
    }

    const result: IUser[] = await res.json();

    return result;
  },

  async updatePassword({
    userId,
    currentPassword,
    newPassword,
  }: {
    userId: number;
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/users/${userId}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const result = await res.json();

        throw new Error(result.message || "Erro ao atualizar senha");
      }

      toast.success("Senha atualizada com sucesso!");
      return;
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Erro ao atualizar senha!");
        throw new Error(error.message || "Erro ao atualizar senha");
      } else {
        toast.error("Erro ao atualizar senha!");
        throw new Error("Erro ao atualizar senha");
      }
    }
  },

  async update(userId: number, user: Partial<IUser>): Promise<IUser> {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      });

      if (!res.ok) {
        const result = await res.json();

        throw new Error(result.message || "Erro ao atualizar usuário");
      }

      const result: IUser = await res.json();

      toast.success("Usuario atualizado com sucesso!");
      return result;
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Erro ao atualizar usuario!");
        throw new Error(error.message || "Erro ao atualizar usuario!");
      } else {
        toast.error("Erro ao atualizar usuario!");
        throw new Error("Erro ao atualizar usuario!");
      }
    }
  },
  async create(user: Partial<IUser>): Promise<IUser> {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      });

      if (!res.ok) {
        const result = await res.json();

        throw new Error(result.message || "Erro ao criar usuário");
      }

      const result: IUser = await res.json();

      toast.success("Usuario criado com sucesso!");
      return result;
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Erro ao criar usuario!");
        throw new Error(error.message || "Erro ao criar usuario!");
      } else {
        toast.error("Erro ao criar usuario!");
        throw new Error("Erro ao criar usuario!");
      }
    }
  },
  async delete(userId: number): Promise<void> {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const result = await res.json();

        throw new Error(result.message || "Erro ao deletar usuário");
      }

      toast.success("Usuario deletado com sucesso!");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Erro ao deletar usuario!");
        throw new Error(error.message || "Erro ao deletar usuario!");
      } else {
        toast.error("Erro ao deletar usuario!");
        throw new Error("Erro ao deletar usuario!");
      }
    }
  },
};
