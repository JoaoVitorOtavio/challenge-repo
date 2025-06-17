"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { IUser } from "@/commons/interfaces/users";
import { setLoading, setUser } from "@/store/slices/userSlice";

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setLoading(true));
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      localStorage.removeItem("token");
      dispatch(setLoading(false));
    }

    if (storedUser) {
      try {
        const user: IUser = JSON.parse(storedUser);
        dispatch(setUser(user));
      } finally {
        dispatch(setLoading(false));
      }
    }
  }, [dispatch]);

  return <>{children}</>;
}
