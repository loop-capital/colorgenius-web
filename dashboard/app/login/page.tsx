"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        window.location.href = "/formulate";
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err: any) {
      setError("Network error: " + err.message);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0A0A1A] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-black text-lg">CG</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Sign in to ColorGenius</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">Email</label>
            <input name="email" type="email" required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
              placeholder="tiche@pleijsalon.com" />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Password</label>
            <input name="password" type="password" required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
              placeholder="••••••••" />
          </div>
          {error && <p className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-white/30 text-sm mt-6">
          <a href="/" className="hover:text-white/60">← Back to home</a>
        </p>
      </div>
    </div>
  );
}
