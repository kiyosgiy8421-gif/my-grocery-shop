"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase"; // Supabase client එක import කරගන්න

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "login" | "signup";
}

export default function AuthModal({
  isOpen,
  onClose,
  defaultMode = "login",
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setMessage(null);
    }
  }, [isOpen, defaultMode]);

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setMessage(null);
    setIsSubmitting(false);
    onClose();
  };

  // Google Login Function
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin, // Login වුණාම ආපහු සයිට් එකටම එන්න
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          setMessage({ type: "error", text: error.message });
        } else {
          handleClose();
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          setMessage({ type: "error", text: error.message });
        } else {
          setMessage({ 
            type: "success", 
            text: "Success! Please check your email or try signing in." 
          });
          setTimeout(() => {
            handleClose();
            router.push("/");
          }, 4000);
        }
      }
    } catch (err: any) {
      setMessage({ type: "error", text: "An error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-green-900">
            {mode === "login" ? "Sign In" : "Create Account"}
          </h2>
          <button onClick={handleClose} className="rounded-full p-2 text-green-600 hover:bg-green-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-green-800">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border border-green-200 px-3 py-2 text-green-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-green-800">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full rounded-lg border border-green-200 px-3 py-2 text-green-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
            />
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${message.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-green-600 py-2.5 font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-70"
          >
            {isSubmitting ? "Please wait..." : mode === "login" ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-green-100"></span></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-green-500">Or continue with</span></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-green-200 bg-white py-2.5 text-sm font-medium text-green-900 transition-colors hover:bg-green-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>

        <p className="mt-4 text-center text-sm text-green-700">
          {mode === "login" ? (
            <> Don&apos;t have an account? <button type="button" onClick={() => setMode("signup")} className="font-medium text-green-800 underline">Sign up</button> </>
          ) : (
            <> Already have an account? <button type="button" onClick={() => setMode("login")} className="font-medium text-green-800 underline">Sign in</button> </>
          )}
        </p>
      </div>
    </>
  );
}