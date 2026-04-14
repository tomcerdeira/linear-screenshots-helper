import React from 'react';

interface ScreenshotPreviewProps {
  readonly dataUrl: string;
}

export function ScreenshotPreview({ dataUrl }: ScreenshotPreviewProps) {
  return (
    <div className="rounded-md overflow-hidden border border-border bg-[#18181b]">
      <img
        src={dataUrl}
        alt="Screenshot"
        className="w-full h-auto max-h-40 object-contain"
      />
    </div>
  );
}
