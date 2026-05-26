import { redirect } from "next/navigation";

export default function UniformNumberRedirect() {
  redirect("/");
  return null;
}
