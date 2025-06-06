"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteUser, setUsers } from "../../store/slices/userSlice";
import { RootState } from "../../store/store";
import { userService } from "@/services/userService";
import { redirect } from "next/navigation";
import LoadingSpinner from "../components/Spinner/Spinner";
import { IUser } from "@/commons/interfaces/users";
import Navbar from "../components/Navbar/Navbar";

export default function Users() {
  const dispatch = useDispatch();
  const users = useSelector((state: RootState) => state.user.users);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchUsers() {
      const result = await userService.findAll();
      dispatch(setUsers(result));
      setIsLoading(false);
    }

    fetchUsers();
  }, [dispatch]);

  const handleDelete = async (id: number) => {
    try {
      setIsLoading(true);
      await userService.delete(id);
      dispatch(deleteUser(id));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  if (users.length === 0)
    return (
      <h1 className="text-3xl mt-8 font-bold text-center mb-8">
        Nenhum usuário cadastrado!
      </h1>
    );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-3xl font-bold text-center mb-8">Usuários</h1>

        <div className="space-y-4 max-w-4xl mx-auto">
          {users.map((user: IUser) => (
            <div
              key={user.id}
              className="bg-white shadow rounded-md p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="space-y-1">
                <p>
                  <strong>ID:</strong> {user.id}
                </p>
                <p>
                  <strong>Nome:</strong> {user.name}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Role:</strong> {user.role}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => redirect(`/update/user/${user.id}`)}
                  className="cursor-pointer px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="cursor-pointer px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Deletar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
