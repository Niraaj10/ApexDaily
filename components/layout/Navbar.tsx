"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

type NavbarProps = {
  user?: {
    name?: string;
    email?: string;
    image?: string;
    // add other fields if needed
  };
};

export default function Navbar({ user }: NavbarProps) {
  console.log('User :', user );
  const { data: session } = useSession();

  return (
    <nav className="h-16 border-b bg-white flex items-center justify-between px-6">
      <div className="font-bold text-xl text-blue-600">Verito Studio</div>
      
      <div className="flex items-center gap-4">
        {session?.user && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{session.user.name}</p>
              <p className="text-xs text-slate-500">{session.user.email}</p>
            </div>
            {/* Using the field we just fixed! */}
            <img 
              src={session.user.image || "https://avatar.vercel.sh/user"} 
              alt="Profile" 
              className="h-10 w-10 rounded-full border"
            />
            <button 
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm text-red-600 hover:bg-red-50 px-3 py-2 rounded-md transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}