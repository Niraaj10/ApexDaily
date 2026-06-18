"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      // Logic: After manual sign-up, trigger NextAuth login
      await signIn("credentials", {
        email: form.email,
        password: form.password,
        callbackUrl: "/dashboard",
      });
    } else {
      alert("Registration failed. Email might be taken.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
      <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h2>
      <p className="text-slate-500 mb-8">Join Verito Studio to manage your hustle.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="text" placeholder="Full Name" required
          className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input 
          type="email" placeholder="Email Address" required
          className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input 
          type="password" placeholder="Password (min 8 chars)" required
          className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Register Now"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600">
        Already have an account? <Link href="/login" className="text-blue-600 font-bold">Login</Link>
      </div>
    </div>
  );
}