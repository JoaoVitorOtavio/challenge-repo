"use client";

import Footer from "@/app/components/Footer/Footer";
import Navbar from "@/app/components/Navbar/Navbar";
import LoadingSpinner from "@/app/components/Spinner/Spinner";
import UserForm from "@/app/components/UserForm/UserForm";
import { useAbility } from "@/contexts/AbilityContext";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function CreateUser() {
  const ability = useAbility();

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);

    if (!ability.can("create", "User")) {
      setIsLoading(false);
      redirect("/403");
    }

    setIsLoading(false);
  }, [ability]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <Navbar />
      <UserForm />
      <Footer />
    </div>
  );
}
