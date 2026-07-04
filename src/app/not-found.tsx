import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-6 py-16 px-4">
      <h1 className="text-5xl font-bold">404</h1>
      <p style={{ color: "var(--text-secondary)" }}>
        お探しのページは見つかりませんでした。
      </p>
      <Link
        href="/"
        className="px-4 py-2 border rounded-md font-medium hover:opacity-80"
        style={{
          borderColor: "var(--border-card)",
          color: "var(--interactive-primary)",
        }}
      >
        トップへ戻る
      </Link>
    </div>
  );
}
