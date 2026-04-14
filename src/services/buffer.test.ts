import { describe, it, expect } from 'vitest';
import { dataUrlToBuffer } from './buffer';

describe('dataUrlToBuffer', () => {
  it('converts a PNG data URL to Buffer', () => {
    const base64 = Buffer.from('hello').toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;
    const result = dataUrlToBuffer(dataUrl);
    expect(result.toString()).toBe('hello');
  });

  it('converts a JPEG data URL to Buffer', () => {
    const base64 = Buffer.from('jpeg-data').toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64}`;
    const result = dataUrlToBuffer(dataUrl);
    expect(result.toString()).toBe('jpeg-data');
  });

  it('handles data URL with other image types', () => {
    const base64 = Buffer.from('webp-data').toString('base64');
    const dataUrl = `data:image/webp;base64,${base64}`;
    const result = dataUrlToBuffer(dataUrl);
    expect(result.toString()).toBe('webp-data');
  });

  it('returns a Buffer instance', () => {
    const dataUrl = `data:image/png;base64,${Buffer.from('test').toString('base64')}`;
    expect(Buffer.isBuffer(dataUrlToBuffer(dataUrl))).toBe(true);
  });

  it('handles empty base64 content', () => {
    const dataUrl = 'data:image/png;base64,';
    const result = dataUrlToBuffer(dataUrl);
    expect(result.length).toBe(0);
  });
});
