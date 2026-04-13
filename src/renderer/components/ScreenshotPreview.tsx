import React from 'react';

interface ScreenshotPreviewProps {
  readonly dataUrl: string;
}

export function ScreenshotPreview({ dataUrl }: ScreenshotPreviewProps) {
  return (
    <div className="rounded-lg overflow-hidden border border-[#333352] bg-[#0d0d15]">
      <img
        src={dataUrl}
        alt="Screenshot"
        className="w-full h-auto max-h-36 object-contain"
      />
    </div>
  );
}
