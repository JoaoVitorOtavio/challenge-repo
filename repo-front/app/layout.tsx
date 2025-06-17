"use client";

import "./globals.css";
import { ToastContainer } from "react-toastify";
import { Suspense, useEffect, useState } from "react";
import { useRouter, usePathname, redirect } from "next/navigation";
import { validateJwt } from "./utils/auth";
import { ReduxProvider } from "../store/provider";
import LoadingSpinner from "./components/Spinner/Spinner";
import { AbilityProvider } from "@/contexts/AbilityContext";
import { AppInitializer } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const isAuthenticated = validateJwt(token);

    const protectedRoutes = [
      /^\/users$/,
      /^\/home$/,
      /^\/create\/user$/,
      /^\/update\/user\/\d+$/,
      /^\/update\/user\/\d+\/password$/,
    ];

    const isProtected = protectedRoutes.some((regex) => regex.test(pathname));

    if (isProtected && !isAuthenticated) {
      setLoading(false);
      redirect("/401");
    } else {
      setLoading(false);
    }
  }, [pathname, router]);

  return (
    <html lang="en">
      <body>
        <ToastContainer position="top-right" autoClose={3000} />
        <ReduxProvider>
          <AppInitializer>
            <AbilityProvider>
              <Suspense fallback={<LoadingSpinner />}>
                {loading ? <LoadingSpinner /> : children}
              </Suspense>
            </AbilityProvider>
          </AppInitializer>
        </ReduxProvider>
      </body>
    </html>
  );
}
