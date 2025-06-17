import { PureAbility, AbilityBuilder } from "@casl/ability";

export type Actions = "manage" | "create" | "read" | "update" | "delete";
export type Subjects = "User" | "all";

export function defineAbilityFor(role: string) {
  const { can, cannot, build } = new AbilityBuilder<
    PureAbility<[Actions, Subjects]>
  >(PureAbility);

  if (role === "admin") {
    can("manage", "all");
  } else if (role === "manager") {
    can("read", "User");
    can("update", "User");
    cannot("delete", "User");
  } else {
    cannot("read", "User");
  }

  return build();
}
