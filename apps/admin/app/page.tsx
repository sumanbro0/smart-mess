import { healthCheckHealthGet } from "@/client";
import { redirect } from "next/navigation";

export default async function Home() {
  const res = await healthCheckHealthGet();
  console.log(res.data);
  redirect("/dashboard");
}
