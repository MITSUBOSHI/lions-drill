import Link from "next/link";
import Image from "next/image";
import Logo from "./logo.png";
import { navItems } from "@/constants/navigation";
import Ruby from "@/components/common/Ruby";
import { TEAM } from "@/config/team";

const cardStyles = [
  "feature-card--sky",
  "feature-card--yellow",
  "feature-card--green",
  "feature-card--pink",
  "feature-card--purple",
  "feature-card--orange",
  "feature-card--blue",
] as const;

export default function Home() {
  return (
    <div className="home-shell">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="hero-dots" aria-hidden="true" />
        <div className="hero-content">
          <div className="hero-copy">
            <p className="hero-kicker">
              <span aria-hidden="true">⚾</span>
              <Ruby reading={`${TEAM.shortNameReading}でまなぼう`}>
                {`${TEAM.shortName}で学ぼう`}
              </Ruby>
            </p>
            <h1 id="home-title">
              {TEAM.name}
              <span>
                {TEAM.subtitleSegments.map((seg, i) =>
                  seg.reading ? (
                    <Ruby key={i} reading={seg.reading}>
                      {seg.text}
                    </Ruby>
                  ) : (
                    <span key={i}>{seg.text}</span>
                  ),
                )}
              </span>
            </h1>
            <p className="hero-message">
              <Ruby reading="すきなあそびをえらんで、さっそくはじめよう！">
                好きな遊びをえらんで、さっそくはじめよう！
              </Ruby>
            </p>
          </div>

          <div className="hero-logo-wrap" aria-hidden="true">
            <span className="hero-star hero-star--one">★</span>
            <span className="hero-star hero-star--two">★</span>
            <div className="hero-logo-circle">
              <Image
                src={Logo.src}
                width={184}
                height={184}
                alt={TEAM.logo.alt}
                priority
              />
            </div>
          </div>
        </div>
        <div className="hero-wave" aria-hidden="true" />
      </section>

      <section className="feature-section" aria-labelledby="feature-title">
        <div className="section-heading">
          <span className="section-heading-icon" aria-hidden="true">
            ✨
          </span>
          <div>
            <p>
              <Ruby reading="なにしてあそぶ？">なにして遊ぶ？</Ruby>
            </p>
            <h2 id="feature-title">
              <Ruby reading="めにゅーをえらぼう">メニューをえらぼう</Ruby>
            </h2>
          </div>
        </div>

        <div className="feature-grid">
          {navItems.map((feature, index) => (
            <Link
              key={feature.href}
              href={feature.href}
              className={`feature-card ${cardStyles[index % cardStyles.length]}`}
            >
              <span className="feature-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="feature-icon" aria-hidden="true">
                {feature.icon}
              </span>
              <span className="feature-copy">
                <strong>
                  <Ruby reading={feature.titleReading}>{feature.title}</Ruby>
                </strong>
                <span>
                  <Ruby reading={feature.descReading}>
                    {feature.description}
                  </Ruby>
                </span>
              </span>
              <span className="feature-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
