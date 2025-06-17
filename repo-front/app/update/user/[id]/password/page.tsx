"use client";
import Footer from "@/app/components/Footer/Footer";
import Navbar from "@/app/components/Navbar/Navbar";
import { userService } from "@/services/userService";
import { RootState } from "@/store";
import { LoaderCircle } from "lucide-react";
import { redirect, useParams } from "next/navigation";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

export default function UpdateUserPassword() {
  const params = useParams();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [repeatPassword, setRepeatPassword] = useState<string>("");

  const currentUser = useSelector((state: RootState) => state.user.user);

  useEffect(() => {
    if (currentUser?.role !== "admin") {
      if (currentUser?.id !== Number(params.id)) {
        return redirect("/403");
      }
    }
  }, [currentUser?.id, currentUser?.role, params.id]);

  const handleChange = (
    value: string,
    stateToSet: Dispatch<SetStateAction<string>>
  ) => stateToSet(value);

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);

    if (repeatPassword !== newPassword) {
      toast.error("As senhas devem ser iguais!");
      setIsLoading(false);
      return;
    }

    try {
      await userService.updatePassword({
        userId: Number(params.id),
        currentPassword,
        newPassword,
      });
      setIsLoading(false);
      redirect("/home");
    } finally {
      setIsLoading(false);
    }
  }, [currentPassword, newPassword, params.id, repeatPassword]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600">
                Senha Atual:
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) =>
                  handleChange(e.target.value, setCurrentPassword)
                }
                className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600">Nova Senha:</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => handleChange(e.target.value, setNewPassword)}
                className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600">
                Repetir Nova Senha:
              </label>
              <input
                id="repeatPassword"
                type="password"
                value={repeatPassword}
                onChange={(e) =>
                  handleChange(e.target.value, setRepeatPassword)
                }
                className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {newPassword !== repeatPassword && (
                <a className="text-red-500">Senhas não coincidem.</a>
              )}
            </div>
          </div>

          <button
            disabled={isLoading}
            type="button"
            onClick={() => handleSubmit()}
            className="flex items-center cursor-pointer justify-center w-full bg-blue-600 text-white py-2 rounded transition 
             hover:bg-blue-700 
             disabled:hover:bg-blue-600 
             disabled:cursor-not-allowed"
          >
            {isLoading ? <LoaderCircle /> : "Mudar Senha"}
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}
