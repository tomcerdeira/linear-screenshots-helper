import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
// eslint-disable-next-line import/no-unresolved
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import {
  Bold, Italic, Strikethrough, Underline as UnderlineIcon,
  Link as LinkIcon, Quote, Code, List, ListOrdered, Heading2, X, Check, Trash2,
} from 'lucide-react';

type TurndownInstance = { turndown: (html: string) => string };
let turndownPromise: Promise<TurndownInstance> | null = null;
function getTurndown(): Promise<TurndownInstance> {
  if (!turndownPromise) {
    turndownPromise = import('turndown').then(({ default: TurndownService }) => new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-',
    }));
  }
  return turndownPromise;
}

interface RichTextEditorProps {
  readonly onChange: (markdown: string) => void;
  readonly placeholder?: string;
}

export interface RichTextEditorHandle {
  focus(): void;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(function RichTextEditor(
  { onChange, placeholder = 'Add description...' },
  ref,
) {
  const latestCallIdRef = useRef(0);
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-[#5e6ad2] underline' },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'inline-image',
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    editorProps: {
      attributes: {
        class: 'prose-editor focus:outline-none min-h-[40px] text-[14px] text-[#b4b5c8]',
      },
      handleKeyDown: (_view, event) => {
        if (event.key === 'Tab') return false;
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) return false;
        return false;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (const item of items) {
          if (item.type.startsWith('image/')) {
            event.preventDefault();
            const file = item.getAsFile();
            if (!file) return true;

            fileToDataUrl(file).then((dataUrl) => {
              const { state } = view;
              const tr = state.tr.replaceSelectionWith(
                state.schema.nodes.image.create({ src: dataUrl }),
              );
              view.dispatch(tr);
            });
            return true;
          }
        }
        return false;
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (!files?.length) return false;

        for (const file of files) {
          if (file.type.startsWith('image/')) {
            event.preventDefault();

            fileToDataUrl(file).then((dataUrl) => {
              const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
              if (!coordinates) return;
              const tr = view.state.tr.insert(
                coordinates.pos,
                view.state.schema.nodes.image.create({ src: dataUrl }),
              );
              view.dispatch(tr);
            });
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor: e }) => {
      const html = e.getHTML();
      if (html === '<p></p>') {
        onChange('');
        return;
      }
      const myCallId = ++latestCallIdRef.current;
      getTurndown().then((td) => {
        if (myCallId !== latestCallIdRef.current) return;
        onChange(td.turndown(html));
      });
    },
  });

  const openLinkInput = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href as string | undefined;
    setLinkUrl(prev ?? '');
  }, [editor]);

  const applyLink = useCallback(
    (url: string) => {
      if (!editor) return;
      const trimmed = url.trim();
      if (trimmed === '') {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
      } else {
        const href = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
        editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
      }
      setLinkUrl(null);
    },
    [editor],
  );

  const removeLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setLinkUrl(null);
  }, [editor]);

  const clearFormatting = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().clearNodes().unsetAllMarks().run();
  }, [editor]);

  useImperativeHandle(
    ref,
    () => ({
      focus() {
        editor?.commands.focus('end');
      },
    }),
    [editor],
  );

  if (!editor) return null;

  return (
    <div className="flex flex-col flex-1">
      {editor && (
        <BubbleMenu editor={editor}>
          {linkUrl !== null ? (
            <LinkInput
              initial={linkUrl}
              hasLink={editor.isActive('link')}
              onSubmit={applyLink}
              onRemove={removeLink}
              onCancel={() => setLinkUrl(null)}
            />
          ) : (
          <div className="flex items-center gap-0.5 bg-surface-raised border border-border-subtle rounded-lg px-1 py-0.5 shadow-xl shadow-black/50">
            <BubbleBtn
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive('heading', { level: 2 })}
              title="Heading"
            >
              <Heading2 className="w-4 h-4" />
            </BubbleBtn>
            <BubbleBtn
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </BubbleBtn>
            <BubbleBtn
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </BubbleBtn>
            <BubbleBtn
              onClick={() => editor.chain().focus().toggleStrike().run()}
              active={editor.isActive('strike')}
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </BubbleBtn>
            <BubbleBtn
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              active={editor.isActive('underline')}
              title="Underline"
            >
              <UnderlineIcon className="w-4 h-4" />
            </BubbleBtn>
            <BubbleDivider />
            <BubbleBtn onClick={openLinkInput} active={editor.isActive('link')} title="Link">
              <LinkIcon className="w-4 h-4" />
            </BubbleBtn>
            <BubbleBtn
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive('blockquote')}
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </BubbleBtn>
            <BubbleBtn onClick={clearFormatting} active={false} title="Clear formatting">
              <X className="w-4 h-4" />
            </BubbleBtn>
            <BubbleDivider />
            <BubbleBtn
              onClick={() => editor.chain().focus().toggleCode().run()}
              active={editor.isActive('code')}
              title="Inline code"
            >
              <Code className="w-4 h-4" />
            </BubbleBtn>
            <BubbleBtn
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive('bulletList')}
              title="Bullet list"
            >
              <List className="w-4 h-4" />
            </BubbleBtn>
            <BubbleBtn
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive('orderedList')}
              title="Numbered list"
            >
              <ListOrdered className="w-4 h-4" />
            </BubbleBtn>
          </div>
          )}
        </BubbleMenu>
      )}

      <EditorContent editor={editor} className="flex-1 overflow-y-auto" />
    </div>
  );
});

function BubbleBtn({
  onClick,
  active,
  title,
  children,
}: {
  readonly onClick: () => void;
  readonly active: boolean;
  readonly title: string;
  readonly children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'text-content bg-surface-hover'
          : 'text-content-muted hover:text-content hover:bg-surface-hover'
      }`}
    >
      {children}
    </button>
  );
}

function BubbleDivider() {
  return <div className="w-px h-4 bg-border-subtle mx-0.5" />;
}

function LinkInput({
  initial,
  hasLink,
  onSubmit,
  onRemove,
  onCancel,
}: {
  readonly initial: string;
  readonly hasLink: boolean;
  readonly onSubmit: (url: string) => void;
  readonly onRemove: () => void;
  readonly onCancel: () => void;
}) {
  const [value, setValue] = useState(initial || 'https://');
  const inputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  return (
    <div className="flex items-center gap-1 bg-surface-raised border border-border-subtle rounded-lg px-1.5 py-1 shadow-xl shadow-black/50">
      <input
        ref={inputRef}
        type="url"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onSubmit(value);
          } else if (e.key === 'Escape') {
            e.preventDefault();
            onCancel();
          }
        }}
        placeholder="https://..."
        className="bg-transparent text-[13px] text-content placeholder-content-ghost focus:outline-none w-56 px-1"
      />
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onSubmit(value)}
        title="Apply"
        className="p-1.5 rounded text-content-muted hover:text-content hover:bg-surface-hover transition-colors"
      >
        <Check className="w-4 h-4" />
      </button>
      {hasLink && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onRemove}
          title="Remove link"
          className="p-1.5 rounded text-content-muted hover:text-feedback-error hover:bg-surface-hover transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onCancel}
        title="Cancel"
        className="p-1.5 rounded text-content-muted hover:text-content hover:bg-surface-hover transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
