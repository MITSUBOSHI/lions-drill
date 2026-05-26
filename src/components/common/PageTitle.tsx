"use client";

import Ruby from "@/components/common/Ruby";

type PageTitleProps = {
  title: string;
  reading: string;
};

export default function PageTitle({ title, reading }: PageTitleProps) {
  return (
    <h1 className="text-4xl font-bold">
      <Ruby reading={reading}>{title}</Ruby>
    </h1>
  );
}
