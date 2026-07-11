"use client";

import { useState } from "react";
import { FiDownload, FiLink, FiCheck, FiShare2 } from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";
import Ruby from "@/components/common/Ruby";
import { openTweetIntent } from "@/lib/share";

export type ShareMethod = "link" | "twitter" | "native";

type Props = {
  getShareUrl: () => string;
  getShareText: () => string;
  shareTitle: string;
  onShare?: (method: ShareMethod) => void;
  onSaveImage: () => void;
};

const iconButtonClass =
  "flex items-center justify-center min-w-11 min-h-11 bg-transparent border-none cursor-pointer text-[var(--interactive-primary)] hover:bg-[var(--surface-brand)] rounded-md";

export default function ShareToolbar({
  getShareUrl,
  getShareText,
  shareTitle,
  onShare,
  onSaveImage,
}: Props) {
  const [copied, setCopied] = useState(false);

  const handleShareLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API が使えない環境（HTTP等）ではフォールバック
      console.warn("Clipboard API not available");
    }
    onShare?.("link");
  };

  const handleShareTwitter = () => {
    openTweetIntent(getShareText(), getShareUrl());
    onShare?.("twitter");
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: shareTitle,
        text: getShareText(),
        url: getShareUrl(),
      });
      onShare?.("native");
    } catch {
      // user cancelled or not supported
    }
  };

  return (
    <div className="flex gap-1 items-center">
      <button
        onClick={handleShareLink}
        aria-label="URLをコピー"
        className={iconButtonClass}
      >
        {copied ? (
          <FiCheck size={20} color="var(--text-success)" />
        ) : (
          <FiLink size={20} />
        )}
      </button>
      <button
        onClick={handleShareTwitter}
        aria-label="Xで共有"
        className={iconButtonClass}
      >
        <FaXTwitter size={20} />
      </button>
      {typeof navigator !== "undefined" && "share" in navigator && (
        <button
          onClick={handleNativeShare}
          aria-label="共有"
          className={iconButtonClass}
        >
          <FiShare2 size={20} />
        </button>
      )}
      <button
        className="flex items-center gap-2 px-3 min-h-11 rounded-md text-white text-sm border-none cursor-pointer bg-[var(--interactive-primary)] hover:bg-[var(--interactive-primary-hover)]"
        onClick={onSaveImage}
      >
        <FiDownload aria-hidden="true" />
        <span>
          <Ruby reading="がぞう">画像</Ruby>として
          <Ruby reading="ほぞん">保存</Ruby>
        </span>
      </button>
    </div>
  );
}
