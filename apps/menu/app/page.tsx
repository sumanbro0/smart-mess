import { redirect } from "next/navigation";
import Cover from "@/components/ui/cover";

export default function Home() {
  redirect("/foodmaster/login");
  return <Cover />;
}
