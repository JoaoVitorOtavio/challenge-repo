"use client";
import { validateJwt } from "@/app/utils/auth";
import { authService, LoginResponse } from "@/services/authService";
import { setToken, setUser } from "@/store/slices/userSlice";
import { redirect } from "next/navigation";
import {
  useState,
  SetStateAction,
  Dispatch,
  useCallback,
  useEffect,
} from "react";
import { useDispatch } from "react-redux";

const Login = () => {
  const dispatch = useDispatch();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [jwtToken, setJwtToken] = useState<string>("");
  const [loginWithJwt, setLoginWithJwt] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const isAuthenticated = validateJwt(token);

    if (isAuthenticated) {
      redirect("/users");
    }
  }, []);

  const handleChange = (
    value: string,
    stateToSet: Dispatch<SetStateAction<string>>
  ) => {
    stateToSet(value);
  };

  const handleLogin = useCallback(async () => {
    const response: LoginResponse = await authService.login({
      loginWithJwt,
      token: jwtToken,
      email,
      password,
    });

    dispatch(setToken(response.token));
    dispatch(setUser(response.user));

    redirect("/home");
  }, [dispatch, email, jwtToken, loginWithJwt, password]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-700 text-center">
          {loginWithJwt ? "Login com JWT" : "Login"}
        </h1>

        <div className="space-y-4">
          {!loginWithJwt ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleChange(e.target.value, setEmail)}
                  placeholder="Digite seu email"
                  className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => handleChange(e.target.value, setPassword)}
                  placeholder="Digite sua senha"
                  className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Token JWT
              </label>
              <textarea
                value={jwtToken}
                onChange={(e) => handleChange(e.target.value, setJwtToken)}
                placeholder="Cole aqui seu token JWT"
                rows={4}
                className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          {!loginWithJwt ? (
            <button
              onClick={handleLogin}
              className="cursor-pointer w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Entrar
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition cursor-pointer"
            >
              Entrar com JWT
            </button>
          )}

          <button
            onClick={() => setLoginWithJwt(!loginWithJwt)}
            className="cursor-pointer w-full border border-gray-400 text-gray-700 py-2 rounded hover:bg-gray-100 transition text-sm"
          >
            {loginWithJwt ? "Voltar para login padrão" : "Login com JWT"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
