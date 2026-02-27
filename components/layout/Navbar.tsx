"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const navLinks = [
  { href: "/dashboard",  label: "Início",    icon: "⚡" },
  { href: "/editorial",  label: "Editorial", icon: "🏛️" },
  { href: "/content",    label: "Conteúdo",  icon: "✍️" },
  { href: "/settings",   label: "Marca",     icon: "🎨" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      className="border-b sticky top-0 z-50"
      style={{ backgroundColor: "var(--bg)", borderColor: "var(--surface)" }}
    >
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold tracking-widest px-2 py-1 rounded"
            style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}
          >
            OPB
          </span>
          <span className="font-bold text-sm" style={{ color: "var(--text)" }}>
            CREW
          </span>
        </Link>

        {/* Links principais */}
        <div className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
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
                <span>{link.icon}</span>
                <span>{link.label}</span>
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
