import { SignupForm } from "@/features/auth/signup-form";
import { cookies as getCookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";

export default async function SignupPage() {
  const cookies = await getCookies();
  const accessToken = cookies.get("access_token")?.value;
  if (accessToken) {
    redirect("/", RedirectType.replace);
  }
  return <SignupForm className="bg-card p-12 rounded-lg " />;
}
