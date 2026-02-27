"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const navLinks = [
  { href: "/dashboard", label: "Início",   icon: "⚡" },
  { href: "/content",   label: "Conteúdo", icon: "✍️" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-[#1a2035] bg-[#0A0E1A] sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="bg-[#BFD64B] text-[#0A0E1A] text-[10px] font-bold tracking-widest px-2 py-1 rounded">
            OPE
          </span>
          <span className="font-bold text-[#F0ECE4] text-sm">SQUAD</span>
        </Link>

        {/* Links principais */}
        <div className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#BFD64B]/10 text-[#BFD64B] border border-[#BFD64B]/20"
                    : "text-[#8892a4] hover:text-[#F0ECE4] hover:bg-[#111827]"
                }`}
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
