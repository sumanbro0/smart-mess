import { LoginForm } from "@/features/auth/login-form";
import { cookies as getCookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";

export default async function LoginPage() {
  const cookies = await getCookies();
  const accessToken = cookies.get("access_token")?.value;
  if (accessToken) {
    redirect("/", RedirectType.replace);
  }
  return <LoginForm className="bg-card p-12 rounded-lg " />;
}
