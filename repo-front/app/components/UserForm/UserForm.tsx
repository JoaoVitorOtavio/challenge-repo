"use client";
import { IUser, UserRole } from "@/commons/interfaces/users";
import { userService } from "@/services/userService";
import { updateUser } from "@/store/slices/userSlice";
import { redirect, useParams } from "next/navigation";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { LoaderCircle } from "lucide-react";
import { useAbility } from "@/contexts/AbilityContext";
import { RootState } from "@/store";

const UserForm = ({ isEdit = false }: { isEdit?: boolean }) => {
  const params = useParams();
  const ability = useAbility();
  const dispatch = useDispatch();

  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const currentUser = useSelector((state: RootState) => state.user.user);

  useEffect(() => {
    if (isEdit) {
      if (currentUser?.role !== "admin" && currentUser?.role !== "manager") {
        if (currentUser?.id !== Number(params.id)) {
          return redirect("/403");
        }
      }

      async function getUser() {
        const userId = params.id;
        const user: IUser | null = await userService.findOne(Number(userId));

        if (!user) return redirect("/home");

        setEmail(user.email);
        setName(user.name);
        setPassword(user.password);
        setRole(user.role);
      }

      getUser();
    }
  }, [currentUser?.id, currentUser?.role, isEdit, params.id]);

  const handleSelectChange = (value: UserRole) => setRole(value);

  const handleChange = (
    value: string,
    stateToSet: Dispatch<SetStateAction<string>>
  ) => stateToSet(value);

  const handleSubmit = useCallback(async () => {
    const userId = params.id;
    setIsLoading(true);

    if (isEdit) {
      try {
        const user: IUser = await userService.update(Number(userId), {
          email,
          name,
          password,
          role,
        });

        localStorage.setItem("user", JSON.stringify(user));

        dispatch(updateUser(user));
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        await userService.create({ email, name, password, role });
      } finally {
        setIsLoading(false);
      }
    }

    if (currentUser?.role !== "user") {
      redirect("/users");
    }

    redirect("/home");
  }, [
    currentUser?.role,
    dispatch,
    email,
    isEdit,
    name,
    params.id,
    password,
    role,
  ]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-700 text-center">
          {isEdit ? "Editar Usuário" : "Cadastrar Usuário"}
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleChange(e.target.value, setName)}
              className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => handleChange(e.target.value, setEmail)}
              className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {Number(params.id) !== Number(currentUser?.id) && (
            <div>
              <label className="block text-sm text-gray-600">
                Senha
                <span className="text-xs text-gray-400">
                  {isEdit && " - Opcional"}
                </span>
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => handleChange(e.target.value, setPassword)}
                className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {ability.can("manage", "all") && (
            <div>
              <label className="block text-sm text-gray-600">Role</label>
              <select
                value={role}
                onChange={(e) => handleSelectChange(e.target.value as UserRole)}
                className="w-full mt-1 p-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={UserRole.ADMIN}>Admin</option>
                <option value={UserRole.MANAGER}>Manager</option>
                <option value={UserRole.USER}>User</option>
              </select>
            </div>
          )}
        </div>

        <button
          disabled={isLoading}
          type="button"
          onClick={handleSubmit}
          className="flex items-center cursor-pointer justify-center w-full bg-blue-600 text-white py-2 rounded transition 
             hover:bg-blue-700 
             disabled:hover:bg-blue-600 
             disabled:cursor-not-allowed"
        >
          {isLoading ? <LoaderCircle /> : isEdit ? "Editar" : "Cadastrar"}
        </button>
      </div>
    </div>
  );
};

export default UserForm;
