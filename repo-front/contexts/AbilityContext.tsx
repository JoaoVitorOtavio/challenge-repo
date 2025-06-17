import { useSelector } from "react-redux";
import { defineAbilityFor } from "@/abilities/defineAbility";
import { PureAbility } from "@casl/ability";
import { createContext, useContext, useMemo } from "react";
import { RootState } from "@/store/store"; // ajuste para seu path

export const AbilityContext = createContext<PureAbility | null>(null);

export function AbilityProvider({ children }: { children: React.ReactNode }) {
  const role = useSelector(
    (state: RootState) => state.user.user?.role || "user"
  );

  const ability = useMemo(() => defineAbilityFor(role), [role]);

  if (!role) return null;

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
}

export function useAbility() {
  const context = useContext(AbilityContext);
  if (!context) {
    throw new Error("useAbility must be used within an AbilityProvider");
  }
  return context;
}
