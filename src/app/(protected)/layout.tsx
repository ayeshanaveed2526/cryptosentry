import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import Navbar from "@/components/navbar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Double check auth inside the layout to ensure type-safety of session data
  if (!session || !session.user) {
    redirect("/login");
  }

  const handleSignOut = async () => {
    "use server";
    await signOut({ redirectTo: "/login" });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar user={session.user} signOutAction={handleSignOut} />
      <main className="flex-1 flex flex-col">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
          {children}
        </div>
      </main>
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4">
          &copy; {new Date().getFullYear()} CryptoSentry Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
