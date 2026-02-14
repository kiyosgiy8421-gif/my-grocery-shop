"use client";

import { LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const { user, signOut, openAuthModal } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-green-100 bg-white px-4 py-3 md:px-6">
      <h1 className="text-xl font-bold text-green-800 md:text-2xl">
        Fresh Grocery
      </h1>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="hidden text-sm text-green-700 sm:inline">
              {user.email}
            </span>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 rounded-lg border border-green-200 px-3 py-1.5 text-sm font-medium text-green-800 transition-colors hover:bg-green-50"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={() => openAuthModal("login")}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
