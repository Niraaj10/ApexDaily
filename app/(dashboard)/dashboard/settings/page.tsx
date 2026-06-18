"use client";

import { useSession } from "next-auth/react";
import { User, Bell, Lock, Globe } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();

  const sections = [
    { title: "Profile Info", icon: User, desc: "Update your name and photo." },
    { title: "Notifications", icon: Bell, desc: "Manage your email alerts." },
    { title: "Security", icon: Lock, desc: "Change password and 2FA." },
    { title: "Appearance", icon: Globe, desc: "Toggle between light and dark mode." },
  ];

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-slate-500">Manage your Verito Studio account preferences.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-sm">
        {sections.map((section) => (
          <div key={section.title} className="p-6 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
                <section.icon size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-900">{section.title}</p>
                <p className="text-sm text-slate-500">{section.desc}</p>
              </div>
            </div>
            <button className="text-sm font-bold text-blue-600">Edit</button>
          </div>
        ))}
      </div>
    </div>
  );
}