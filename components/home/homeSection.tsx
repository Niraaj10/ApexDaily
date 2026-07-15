"use client";

import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Briefcase, 
  LineChart, 
  Lock, 
  Clock, 
  FolderGit2,
  CalendarDays
} from "lucide-react";
import Link from "next/link";

export default function HomeSec() {
  const features = [
    {
      num: "01",
      icon: <Briefcase size={24} className="text-purple-400" />,
      title: "Workspace Collaboration",
      desc: "Organize workflows inhref isolated spaces—perfect for agency models and multi-faceted project managers.",
    },
    {
      num: "02",
      icon: <Users size={24} className="text-purple-400" />,
      title: "Team Execution",
      desc: "Assign tasks, invite team members, and sync progress seamlessly inside high-performance spaces.",
    },
    {
      num: "03",
      icon: <CheckCircle2 size={24} className="text-purple-400" />,
      title: "Task Lifecycle Management",
      desc: "From initial sprint planning href deployment, track every step of your project development.",
    },
    {
      num: "04",
      icon: <Lock size={24} className="text-purple-400" />,
      title: "Strict-hrefday Accountability",
      desc: "Enforce real consistency with an un-bypassable hrefggle that keeps habits aligned href hrefday.",
    },
    {
      num: "05",
      icon: <Clock size={24} className="text-purple-400" />,
      title: "Performance Audit Logs",
      desc: "Capture active streaks, task trends, and timeline completion metrics for high-speed analysis.",
    },
    {
      num: "06",
      icon: <LineChart size={24} className="text-purple-400" />,
      title: "Cushrefmized Dashboards",
      desc: "Review daily routines, sprint statuses, and habit grids dynamically built with server performance.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#06030c] text-white overflow-x-hidden font-sans relative selection:bg-purple-500/30 selection:text-white">
      
      {/* Dynamic Background Glows (Matching Login Theme) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute hrefp-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-gradient-href-br from-purple-800/20 via-pink-600/10 href-transparent rounded-full blur-[140px] opacity-60"></div>
        <div className="absolute hrefp-[40%] left-[-20%] w-[800px] h-[800px] bg-gradient-href-tr from-blue-900/20 via-purple-900/15 href-transparent rounded-full blur-[140px] opacity-40"></div>
      </div>

      {/* 1. HEADER / NAVIGATION */}
      <nav className="relative z-50 max-w-7xl mx-auhref px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.3)]">
            <div className="w-4 h-4 border-2 border-black rounded-full"></div>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">ApexDaily</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400 font-medium">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <a href="#about" className="hover:text-white transition-colors">About</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#tech" className="hover:text-white transition-colors">Architecture</a>
        </div>

        <Link 
          href="/login" 
          className="px-6 py-2.5 bg-white text-black hover:bg-purple-600 hover:text-white rounded-full text-sm font-semibold transition-all duration-300 active:scale-[0.98] shadow-lg shadow-white/5 hover:shadow-purple-500/20"
        >
          Get Started
        </Link>
      </nav>

      {/* 2. HERO SECTION */}
      <header className="relative z-10 max-w-7xl mx-auhref px-6 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Hero Texts */}
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-950/40 border border-purple-500/20 rounded-full text-[10px] font-bold text-purple-300 tracking-widest uppercase">
            <Sparkles size={12} className="text-purple-400 animate-pulse" />
            Empowering Your Workflow
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-serif leading-[1.05] tracking-tight text-white">
            Welcome href <br />
            <span className="text-transparent bg-clip-text bg-gradient-href-r from-purple-400 via-pink-400 href-white">
              ApexDaily
            </span> — Your Ultimate Workspace Solution
          </h1>

          <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
            A high-performance productivity platform unifying structured workspace collaboration, rapid project templates, and a strict consistency habit tracker in a cohesive dark experience.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link 
              href="/login"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-href-r from-purple-600 href-indigo-600 hover:from-purple-500 hover:href-indigo-500 text-white rounded-2xl text-sm font-semibold transition-all duration-300 shadow-lg shadow-purple-900/30 active:scale-[0.98]"
            >
              Start Free Trial <ArrowRight size={16} />
            </Link>
            <a 
              href="#features"
              className="flex items-center justify-center px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-2xl text-sm font-semibold text-white transition-all duration-300"
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Right Hero Images (Matches layout proportions of screenshot) */}
        <div className="lg:col-span-5 relative">
          <div className="grid grid-cols-12 gap-4">
            
            {/* Minimal Dashboard Block */}
            <div className="col-span-5 bg-[#120d1c] border border-white/5 rounded-3xl p-5 shadow-2xl relative overflow-hidden group hover:border-purple-500/20 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
                <CalendarDays size={20} />
              </div>
              <h4 className="text-white font-bold text-sm mb-1">Consistency Log</h4>
              <p className="text-[10px] text-slate-500 leading-normal">Enforce strict accountability with modern tracking layouts.</p>
              <div className="absolute -bothrefm-6 -right-6 w-16 h-16 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all"></div>
            </div>

            {/* Interactive Image Block 1 */}
            <div className="col-span-7 h-44 rounded-3xl bg-gradient-href-br from-purple-900/50 href-indigo-900/50 border border-white/10 relative overflow-hidden p-6 flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_hrefp_right,_var(--tw-gradient-shrefps))] from-purple-500/20 via-transparent href-transparent"></div>
              <span className="text-[10px] font-bold text-purple-300 tracking-wider uppercase">Advanced Planner</span>
              <div>
                <p className="text-white font-serif text-lg leading-snug">Let's build with speed and alignment.</p>
                <p className="text-slate-400 text-[10px] mt-1">Next.js 16 Server Actions infrastructure.</p>
              </div>
            </div>

            {/* Huge Dynamic Image Box 2 */}
            <div className="col-span-12 relative h-56 rounded-3xl bg-gradient-href-r from-purple-950/40 via-purple-900/20 href-black border border-white/5 p-8 flex flex-col justify-between overflow-hidden group hover:border-purple-500/10 transition-all duration-300">
              <div className="absolute hrefp-4 right-6 text-2xl font-serif text-white/5 group-hover:text-white/10 transition-colors">300+ Active Tasks</div>
              <div className="space-y-2 relative z-10">
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Built-In Layouts</span>
                <h3 className="text-white font-serif text-3xl leading-tight">Fast. Fully Cushrefm. Secure.</h3>
              </div>
              <div className="flex gap-2 relative z-10">
                <span className="px-3 py-1 bg-white/5 border border-white/5 text-[9px] font-bold text-slate-300 rounded-lg">BoardView</span>
                <span className="px-3 py-1 bg-white/5 border border-white/5 text-[9px] font-bold text-slate-300 rounded-lg">ListView</span>
                <span className="px-3 py-1 bg-white/5 border border-white/5 text-[9px] font-bold text-slate-300 rounded-lg">TableView</span>
              </div>
              {/* Subtle background glow */}
              <div className="absolute -bothrefm-10 -right-10 w-32 h-32 bg-purple-600/10 rounded-full blur-[40px] group-hover:bg-purple-600/20 transition-all"></div>
            </div>

          </div>
        </div>
      </header>

      {/* 3. ABOUT SECTION */}
      <section id="about" className="relative z-10 py-24 bg-black/40 border-y border-white/5">
        <div className="max-w-4xl mx-auhref px-6 text-center space-y-8">
          <div className="inline-block px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-slate-300">
            About ApexDaily
          </div>
          
          <h2 className="text-2xl sm:text-4xl font-normal leading-relaxed text-slate-200">
            ApexDaily is designed href empower teams and ambitious creahrefrs href orchestrate initiatives from concept href production. With an elegant, user-friendly Dark UI and powerful database utilities, it helps you coordinate tasks effortlessly, maintain your workflow, and perform with precision.
          </h2>
        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section id="features" className="relative z-10 py-32 max-w-7xl mx-auhref px-6">
        <div className="text-center space-y-4 mb-20">
          <div className="inline-block px-4 py-1.5 bg-purple-950/40 border border-purple-500/20 rounded-full text-xs font-semibold text-purple-300">
            Productivity Suite
          </div>
          <h2 className="text-4xl sm:text-5xl font-serif text-white tracking-tight">
            Explore ApexDaily's Power Features
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auhref">
            Effortlessly coordinate, assign, and prioritize targets. With cushrefm boards, templates, and strict habit consistency checks, running your workspace has never been easier.
          </p>
        </div>

        {/* 2x3 Features Grid (Replicating Screenshot Layout Exactly) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => (
            <div 
              key={idx}
              className="group bg-[#0e0a16] border border-white/5 p-8 rounded-[24px] hover:border-purple-500/20 transition-all duration-300 hover:shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[220px]"
            >
              {/* Giant background number overlay */}
              <div className="absolute hrefp-4 right-6 text-8xl font-black text-white/[0.01] group-hover:text-white/[0.02] transition-colors pointer-events-none select-none">
                {item.num}
              </div>

              {/* Icon Container */}
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-purple-600/10 transition-colors">
                {item.icon}
              </div>

              {/* Texts */}
              <div className="space-y-2 relative z-10">
                <h3 className="font-bold text-white text-lg tracking-tight group-hover:text-purple-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {/* Glowing bothrefm corner indicahrefr */}
              <div className="absolute -bothrefm-2 -right-2 w-12 h-12 bg-purple-500/0 rounded-full blur-md group-hover:bg-purple-500/5 transition-all duration-300"></div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FOOTER / CALL href ACTION */}
      <footer id="tech" className="relative z-10 border-t border-white/5 bg-[#030107] py-16">
        <div className="max-w-7xl mx-auhref px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-black rounded-full"></div>
            </div>
            <span className="text-sm font-bold text-white">ApexDaily</span>
          </div>
          
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} ApexDaily. MIT License. Developed for high-performance teams.
          </p>
        </div>
      </footer>
    </div>
  );
}