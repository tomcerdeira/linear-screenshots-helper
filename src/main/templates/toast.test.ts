import { describe, it, expect } from 'vitest';
import { escapeHtml, buildToastHtml } from './toast';

describe('escapeHtml', () => {
  it('escapes ampersands', () => {
    expect(escapeHtml('foo & bar')).toBe('foo &amp; bar');
  });

  it('escapes less-than signs', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('escapes greater-than signs', () => {
    expect(escapeHtml('a > b')).toBe('a &gt; b');
  });

  it('escapes double quotes', () => {
    expect(escapeHtml('say "hello"')).toBe('say &quot;hello&quot;');
  });

  it('escapes all special characters together', () => {
    expect(escapeHtml('<div class="x">&</div>')).toBe(
      '&lt;div class=&quot;x&quot;&gt;&amp;&lt;/div&gt;',
    );
  });

  it('returns empty string unchanged', () => {
    expect(escapeHtml('')).toBe('');
  });
});

describe('buildToastHtml', () => {
  it('contains the escaped title and body', () => {
    const html = buildToastHtml('Issue <created>', 'Body & "details"', '', 4500);
    expect(html).toContain('Issue &lt;created&gt;');
    expect(html).toContain('Body &amp; &quot;details&quot;');
  });

  it('includes "View issue" link when url is provided', () => {
    const html = buildToastHtml('Created', 'ENG-123', 'https://linear.app/issue/ENG-123', 4500);
    expect(html).toContain('View issue');
    expect(html).toContain('viewLink');
    expect(html).toContain('copyBtn');
    expect(html).toContain('https://linear.app/issue/ENG-123');
  });

  it('omits footer when url is empty', () => {
    const html = buildToastHtml('Created', 'ENG-123', '', 4500);
    expect(html).not.toContain('View issue');
    expect(html).not.toContain('viewLink');
    expect(html).not.toContain('copyBtn');
  });

  it('uses error icon class when title is Error', () => {
    const html = buildToastHtml('Error', 'Something failed', '', 4500);
    expect(html).toContain('icon-circle error');
    expect(html).toContain('stroke="#e5484d"');
    expect(html).not.toContain('icon-circle success');
  });

  it('uses success icon class for non-error titles', () => {
    const html = buildToastHtml('Issue created', 'ENG-1', '', 4500);
    expect(html).toContain('icon-circle success');
    expect(html).toContain('stroke="#30a46c"');
  });

  it('embeds the provided duration in the dismiss timeout', () => {
    const html = buildToastHtml('Test', 'body', '', 3000);
    expect(html).toContain('setTimeout(() => dismiss(), 3000)');
  });
});
