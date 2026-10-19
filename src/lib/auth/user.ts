import { cache } from "react";
import { redirect } from "next/navigation";
import { findSessionUser, readSessionToken } from "./session";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  timezone: string;
  dayStartHour: number;
  locale: string;
};

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = await readSessionToken();
  if (!token) return null;
  return findSessionUser(token);
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
