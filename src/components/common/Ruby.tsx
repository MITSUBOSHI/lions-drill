"use client";

import { useFurigana } from "@/contexts/FuriganaContext";

type RubyProps = {
  children: string;
  reading: string;
};

export default function Ruby({ children, reading }: RubyProps) {
  const { furigana } = useFurigana();

  if (!furigana) {
    return <>{children}</>;
  }

  return (
    <ruby>
      {children}
      <rt style={{ fontSize: "0.6em", lineHeight: 1 }}>{reading}</rt>
    </ruby>
  );
}
