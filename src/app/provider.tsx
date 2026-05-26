"use client";

import { ThemeProvider } from "next-themes";
import { FuriganaProvider } from "@/contexts/FuriganaContext";

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange>
      <FuriganaProvider>{props.children}</FuriganaProvider>
    </ThemeProvider>
  );
}
