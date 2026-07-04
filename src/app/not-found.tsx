import Link from "next/link";
import Ruby from "@/components/common/Ruby";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-6 py-16 px-4">
      <h1 className="text-5xl font-bold">404</h1>
      <p style={{ color: "var(--text-secondary)" }}>
        お<Ruby reading="さが">探</Ruby>しのページは
        <Ruby reading="み">見</Ruby>つかりませんでした。
      </p>
      <Link
        href="/"
        className="inline-flex items-center min-h-11 px-4 py-2 border rounded-md font-medium hover:opacity-80"
        style={{
          borderColor: "var(--border-card)",
          color: "var(--interactive-primary)",
        }}
      >
        トップへ<Ruby reading="もど">戻</Ruby>る
      </Link>
    </div>
  );
}
