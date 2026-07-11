export function buildShareUrl(params: URLSearchParams): string {
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

export function openTweetIntent(text: string, url: string): void {
  const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  window.open(twitterUrl, "_blank", "noopener,noreferrer");
}

export async function saveElementAsImage(
  element: HTMLElement,
  fileName: string,
): Promise<void> {
  const { default: html2canvas } = await import("html2canvas");
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
  });

  const link = document.createElement("a");
  link.download = fileName;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
