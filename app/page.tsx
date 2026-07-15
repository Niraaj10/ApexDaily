import HomeSec from "@/components/home/homeSection";
import {
  Layout,
  CheckCircle2,
  Users,
  MessageSquare,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowRight,
  Star,
  Check,
  Shield,
  GitBranch,
} from "lucide-react";


export default function HomePage() {
  return (
    <div className="bg-[#0d0d0d] text-white overflow-x-hidden">

{/* <HomeSec /> */}

      <Nav />
      <Hero />
      <ValueStrip />
      <Features />
      <HowItWorks />
      <ProductShowcase />
      <Testimonials />
      <Pricing />
      <CtaBanner />
      <Footer />
    </div>
  );
}

// ── Nav ─────────────────────────────────────────────────────────
function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0d0d0d]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <Layout size={16} className="text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight">Flowspace</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-400">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#how-it-works" className="hover:text-white transition">How it works</a>
          <a href="#pricing" className="hover:text-white transition">Pricing</a>
          <a href="#" className="hover:text-white transition">Changelog</a>
        </nav>

        <div className="flex items-center gap-3">
          <a href="/login" className="hidden sm:block text-xs font-bold text-slate-400 hover:text-white transition">
            Sign in
          </a>
          <a
            href="/login"
            className="bg-white text-black px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
          >
            Start free
          </a>
        </div>
      </div>
    </header>
  );
}

// ── Hero ────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative pt-20 pb-28 px-6 md:px-8">
      {/* ambient gradient blob */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-br from-indigo-600/25 via-purple-600/15 to-transparent rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* copy */}
        <div>
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[11px] font-bold text-slate-300 tracking-wide">
              Now supporting unlimited workspaces
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold leading-[1.08] tracking-tight mb-6">
            Where scattered work
            <br />
            becomes a{" "}
            <span className="bg-gradient-to-br from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              shipped project.
            </span>
          </h1>

          <p className="text-slate-400 text-base leading-relaxed max-w-md mb-9">
            Flowspace brings every workspace, project, and task onto one clear
            timeline — so your team always knows what&apos;s next, and nothing
            important gets lost in a thread.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="/dashboard"
              className="bg-white text-black px-6 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-200 transition"
            >
              Start for free <ArrowRight size={16} />
            </a>
            <a
              href="/dashboard"
              className="text-sm font-bold text-slate-300 hover:text-white flex items-center gap-2 transition"
            >
              See it in action <ArrowUpRight size={15} />
            </a>
          </div>

          <p className="text-[11px] text-slate-600 font-medium mt-6">
            No credit card required · Free for teams up to 5
          </p>
        </div>

        {/* signature visual — a live kanban preview, styled like the app's own cards */}
        <div className="relative">
          <div className="absolute -inset-6 bg-gradient-to-br from-indigo-600/20 to-purple-600/10 rounded-[2rem] blur-2xl" />
          <div className="relative bg-[#111111] border border-white/5 rounded-2xl p-5 shadow-2xl rotate-1 hover:rotate-0 transition duration-500">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs font-bold text-white">Product Launch</p>
                <p className="text-[10px] text-slate-500">Workspace · Marketing</p>
              </div>
              <div className="flex -space-x-2">
                {["A", "M", "J"].map((i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-slate-800 border-2 border-[#111111] flex items-center justify-center text-[9px] font-bold"
                  >
                    {i}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <KanbanColumn
                title="To do"
                dot="bg-slate-500"
                cards={[
                  { label: "Landing page copy", tag: "Design" },
                  { label: "Pricing page QA", tag: "QA" },
                ]}
              />
              <KanbanColumn
                title="In progress"
                dot="bg-indigo-500"
                cards={[{ label: "Onboarding flow", tag: "Product" }]}
                highlight
              />
              <KanbanColumn
                title="Done"
                dot="bg-green-500"
                cards={[{ label: "Auth & billing", tag: "Backend", done: true }]}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function KanbanColumn({
  title,
  dot,
  cards,
  highlight,
}: {
  title: string;
  dot: string;
  cards: { label: string; tag: string; done?: boolean }[];
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-2.5 space-y-2 ${
        highlight ? "bg-white/[0.03] border border-indigo-500/20" : ""
      }`}
    >
      <div className="flex items-center gap-1.5 px-1 mb-1">
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">
          {title}
        </span>
      </div>
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-[#0d0d0d] border border-white/5 rounded-lg p-2.5"
        >
          <p
            className={`text-[10px] font-semibold leading-tight mb-1.5 ${
              c.done ? "text-slate-500 line-through" : "text-slate-200"
            }`}
          >
            {c.label}
          </p>
          <span className="text-[8px] font-bold text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">
            {c.tag}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Value strip ─────────────────────────────────────────────────
function ValueStrip() {
  const items = [
    { icon: Layout, label: "Unlimited workspaces" },
    { icon: MessageSquare, label: "Comments on every task" },
    { icon: Shield, label: "Role-based access" },
    { icon: TrendingUp, label: "Real-time progress" },
  ];
  return (
    <section className="border-y border-white/5 bg-[#0f0f0f]">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2.5">
            <Icon size={15} className="text-indigo-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-400">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Features ────────────────────────────────────────────────────
function Features() {
  const features = [
    {
      icon: Layout,
      color: "text-blue-500",
      title: "Workspaces",
      desc: "Give every team, client, or department its own space — with its own projects, members, and settings.",
    },
    {
      icon: CheckCircle2,
      color: "text-green-500",
      title: "Projects & tasks",
      desc: "Break big work into tasks with owners and due dates, so it's always clear who's shipping what.",
    },
    {
      icon: Users,
      color: "text-purple-500",
      title: "Team roles",
      desc: "Bring people in with exactly the access they need — from full admin to a single project.",
    },
    {
      icon: MessageSquare,
      color: "text-orange-500",
      title: "Comments",
      desc: "Discuss the work where it lives. Every conversation stays attached to the task it's about.",
    },
    {
      icon: Clock,
      color: "text-pink-500",
      title: "Status tracking",
      desc: "Move tasks through pending, in progress, and done — and see exactly where things stand.",
    },
    {
      icon: GitBranch,
      color: "text-cyan-500",
      title: "Activity history",
      desc: "Every change is logged, so nothing important gets lost when work moves fast.",
    },
  ];

  return (
    <section id="features" className="py-28 px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-xl mb-16">
          <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest mb-3">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Everything a team needs, nothing it doesn&apos;t.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Flowspace is built around three things: workspaces, projects, and
            the people doing the work. That&apos;s it.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group bg-[#111111] border border-white/5 rounded-2xl p-6 hover:border-indigo-500/40 transition"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-5">
                <f.icon size={18} className={f.color} />
              </div>
              <h3 className="font-bold text-white text-sm mb-2">{f.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How it works ────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Create a workspace",
      desc: "Set it up in seconds — name it after your team, client, or department.",
    },
    {
      n: "02",
      title: "Add projects & tasks",
      desc: "Break the work down, set deadlines, and assign owners as you go.",
    },
    {
      n: "03",
      title: "Invite your team",
      desc: "Bring people in with the right role, and watch progress update live.",
    },
  ];

  return (
    <section id="how-it-works" className="py-28 px-6 md:px-8 bg-[#0f0f0f] border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest mb-3">
          How it works
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-16 max-w-xl">
          Up and running before your coffee gets cold.
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={s.n} className="relative">
              <span className="text-5xl font-bold text-white/[0.06] block mb-4">
                {s.n}
              </span>
              <h3 className="font-bold text-white text-base mb-2">{s.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                {s.desc}
              </p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-6 left-full w-8 h-px bg-gradient-to-r from-white/10 to-transparent -translate-x-4" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Product showcase ────────────────────────────────────────────
function ProductShowcase() {
  return (
    <section className="py-28 px-6 md:px-8">
      <div className="max-w-6xl mx-auto text-center mb-14">
        <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest mb-3">
          Your dashboard
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Your whole team, one screen.
        </h2>
      </div>

      <div className="max-w-6xl mx-auto relative">
        <div className="absolute -inset-8 bg-gradient-to-br from-indigo-600/15 to-purple-600/10 rounded-[2.5rem] blur-3xl -z-10" />
        {/* browser chrome */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
            <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
          </div>
          <div className="p-6 md:p-8 grid grid-cols-4 gap-4">
            <MiniStat icon={Users} label="Collaborators" value="24" color="text-purple-500" />
            <MiniStat icon={CheckCircle2} label="Tasks done" value="312" color="text-green-500" />
            <MiniStat icon={Clock} label="Pending" value="18" color="text-orange-500" />
            <MiniStat icon={TrendingUp} label="Projects" value="9" color="text-blue-500" />
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniStat({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-[#0d0d0d] border border-white/5 p-4 rounded-2xl flex flex-col gap-2">
      <Icon size={15} className={color} />
      <div className="flex flex-col">
        <span className="text-xl font-bold text-white">{value}</span>
        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
          {label}
        </span>
      </div>
    </div>
  );
}

// ── Testimonials ────────────────────────────────────────────────
function Testimonials() {
  const quotes = [
    {
      quote:
        "We tried three other tools before this. It's the first one the whole team actually opens every day.",
      name: "Priya Nair",
      role: "Head of Ops, Lumen Studio",
    },
    {
      quote:
        "Workspaces made it easy to keep client work separate without juggling five different logins.",
      name: "Daniel Cho",
      role: "Freelance Designer",
    },
    {
      quote:
        "Comments living on the task instead of buried in a thread has probably saved us an hour a day.",
      name: "Mara Estevez",
      role: "Engineering Lead, Northbeam",
    },
  ];

  return (
    <section className="py-28 px-6 md:px-8 bg-[#0f0f0f] border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest mb-3">
          Testimonials
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-14 max-w-xl">
          Teams that switched, and stayed.
        </h2>

        <div className="grid md:grid-cols-3 gap-5">
          {quotes.map((t) => (
            <div
              key={t.name}
              className="bg-[#111111] border border-white/5 rounded-2xl p-6 flex flex-col"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={12} className="fill-indigo-400 text-indigo-400" />
                ))}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-6 flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-[10px] font-bold">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{t.name}</p>
                  <p className="text-[10px] text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing ─────────────────────────────────────────────────────
function Pricing() {
  return (
    <section id="pricing" className="py-28 px-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest mb-3">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Simple pricing, no surprises.
          </h2>
          <p className="text-slate-400 text-sm">
            Start free. Upgrade when your team grows.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-8">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">
              Team
            </p>
            <div className="flex items-end gap-1 mb-6">
              <span className="text-4xl font-bold text-white">$12</span>
              <span className="text-slate-500 text-xs font-semibold mb-1">
                / user / month
              </span>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "Unlimited workspaces & projects",
                "Unlimited members",
                "Comments & activity history",
                "Role-based permissions",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-xs text-slate-300">
                  <Check size={14} className="text-green-500 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <a
              href="/dashboard"
              className="block text-center bg-white text-black py-3 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
            >
              Start free trial
            </a>
          </div>

          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-indigo-500/30 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-indigo-600/30 to-purple-600/20 rounded-full blur-3xl" />
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-wide mb-4 relative">
              Enterprise
            </p>
            <div className="mb-6 relative">
              <span className="text-4xl font-bold text-white">Custom</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-8 relative max-w-xs">
              For larger orgs that need SSO, audit logs, and a dedicated
              onboarding plan.
            </p>
            <a
              href="#"
              className="relative block text-center border border-white/15 text-white py-3 rounded-xl text-xs font-bold hover:bg-white/5 transition"
            >
              Contact sales
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── CTA banner ──────────────────────────────────────────────────
function CtaBanner() {
  return (
    <section className="relative py-28 px-6 md:px-8 overflow-hidden">
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-br from-indigo-600/25 to-purple-600/15 rounded-full blur-3xl" />
      <div className="relative max-w-2xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          Bring your team into Flowspace.
        </h2>
        <p className="text-slate-400 text-sm mb-8">
          Free for teams up to 5. No credit card required.
        </p>
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-white text-black px-6 py-3.5 rounded-xl text-sm font-bold hover:bg-slate-200 transition"
        >
          Start for free <ArrowRight size={16} />
        </a>
      </div>
    </section>
  );
}

// ── Footer ──────────────────────────────────────────────────────
function Footer() {
  const columns = [
    { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
    { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
    { title: "Resources", links: ["Docs", "Guides", "API", "Status"] },
  ];

  return (
    <footer className="border-t border-white/5 px-6 md:px-8 py-16">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 mb-14">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Layout size={16} className="text-white" />
            </div>
            <span className="font-bold text-sm">Flowspace</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mb-6">
            Workspaces, projects, and tasks — all in one clear timeline for
            your team.
          </p>
          <div className="flex gap-2 max-w-sm">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-[#111111] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none focus:border-indigo-500/50"
            />
            <button className="bg-white text-black px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-200 transition shrink-0">
              Subscribe
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {columns.map((c) => (
            <div key={c.title}>
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                {c.title}
              </h4>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-xs text-slate-400 hover:text-white transition">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[11px] text-slate-600">
          © 2026 Flowspace. All rights reserved.
        </p>
        <div className="flex gap-6 text-[11px] text-slate-600">
          <a href="#" className="hover:text-white transition">Terms</a>
          <a href="#" className="hover:text-white transition">Privacy</a>
        </div>
      </div>
    </footer>
  );
}