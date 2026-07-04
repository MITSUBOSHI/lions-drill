import Link from "next/link";
import Image from "next/image";
import Logo from "./logo.png";
import { navItems } from "@/constants/navigation";
import Ruby from "@/components/common/Ruby";
import { TEAM } from "@/config/team";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-8 px-4">
      <Image src={Logo.src} width={160} height={160} alt={TEAM.logo.alt} />
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-4xl md:text-5xl font-bold text-center">
          {TEAM.name}
        </h1>
        <p className="text-lg text-[var(--text-secondary)]">
          {TEAM.subtitleSegments.map((seg, i) =>
            seg.reading ? (
              <Ruby key={i} reading={seg.reading}>
                {seg.text}
              </Ruby>
            ) : (
              <span key={i}>{seg.text}</span>
            ),
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-[900px]">
        {navItems.map((feature) => (
          <Link key={feature.href} href={feature.href}>
            <div className="p-6 border border-[var(--border-card)] rounded-lg bg-[var(--surface-card)] cursor-pointer transition-all duration-200 hover:border-[var(--interactive-primary)] hover:-translate-y-0.5 hover:shadow-md h-full">
              <div className="flex flex-col gap-3 items-start">
                <span className="text-3xl" aria-hidden="true">
                  {feature.icon}
                </span>
                <h2 className="text-lg font-bold">
                  <Ruby reading={feature.titleReading}>{feature.title}</Ruby>
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  <Ruby reading={feature.descReading}>
                    {feature.description}
                  </Ruby>
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
