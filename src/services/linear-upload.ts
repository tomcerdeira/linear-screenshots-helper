import { getLinearClient } from './linear-client';

export async function uploadScreenshot(pngBuffer: Buffer, filename: string): Promise<string> {
  const client = getLinearClient();

  const uploadPayload = await client.fileUpload('image/png', filename, pngBuffer.byteLength);

  if (!uploadPayload.success || !uploadPayload.uploadFile) {
    throw new Error('Failed to get upload URL from Linear');
  }

  const { uploadUrl, assetUrl, headers: uploadHeaders } = uploadPayload.uploadFile;

  const headers: Record<string, string> = {
    'Content-Type': 'image/png',
    'Cache-Control': 'public, max-age=31536000',
  };

  for (const { key, value } of uploadHeaders) {
    headers[key] = value;
  }

  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers,
    body: pngBuffer,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
  }

  return assetUrl;
}
