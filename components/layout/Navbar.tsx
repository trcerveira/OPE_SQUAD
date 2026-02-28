"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const navLinks = [
  { href: "/dashboard",  label: "Início",      icon: "⚡" },
  { href: "/genius",     label: "Genius Zone", icon: "🧬" },
  { href: "/manifesto",  label: "Manifesto",   icon: "📜" },
  { href: "/voz-dna",    label: "Voz & DNA",   icon: "🎙️" },
  { href: "/editorial",  label: "Editorial",   icon: "🏛️" },
  { href: "/calendario", label: "Calendário",  icon: "📅" },
  { href: "/content",    label: "Conteúdo",    icon: "✍️" },
  { href: "/design",     label: "Design",      icon: "🖼️" },
  { href: "/settings",   label: "Marca",       icon: "🎨" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      className="border-b sticky top-0 z-50"
      style={{ backgroundColor: "var(--bg)", borderColor: "var(--surface)" }}
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <span
            className="text-[10px] font-bold tracking-widest px-2 py-1 rounded"
            style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}
          >
            OPB
          </span>
          <span className="font-bold text-sm hidden sm:block" style={{ color: "var(--text)" }}>
            CREW
          </span>
        </Link>

        {/* Links — scrolláveis em mobile */}
        <div className="flex items-center gap-0.5 overflow-x-auto flex-1 scrollbar-none">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0"
                style={
                  isActive
                    ? {
                        backgroundColor: "var(--accent)22",
                        color: "var(--accent)",
                        border: "1px solid var(--accent)44",
                      }
                    : {
                        color: "#8892a4",
                      }
                }
              >
                <span className="text-sm">{link.icon}</span>
                {/* Label visível só em ecrãs grandes ou quando activo */}
                <span className={isActive ? "block" : "hidden lg:block"}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Avatar */}
        <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
      </div>
    </nav>
  );
}
