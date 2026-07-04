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
      <rt>{reading}</rt>
    </ruby>
  );
}
