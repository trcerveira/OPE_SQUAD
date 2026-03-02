import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Pending page removed — all users now have access.
// Redirect to dashboard if logged in, sign-in if not.
export default async function PendingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  redirect("/dashboard");
}
