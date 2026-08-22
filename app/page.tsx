import { redirect } from "next/navigation"

export default function Home() {
  // Temporary redirect to the signup or dashboard page
  redirect("/dashboard")
}
