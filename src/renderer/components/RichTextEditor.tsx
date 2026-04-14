import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
// eslint-disable-next-line import/no-unresolved
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold, Italic, Strikethrough, Underline as UnderlineIcon,
  Link as LinkIcon, Quote, Code, List, ListOrdered, Heading2, X,
} from 'lucide-react';
import TurndownService from 'turndown';

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
});

interface RichTextEditorProps {
  readonly onChange: (markdown: string) => void;
  readonly placeholder?: string;
}

export function RichTextEditor({ onChange, placeholder = 'Add description...' }: RichTextEditorProps) {
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
      Placeholder.configure({ placeholder }),
    ],
    editorProps: {
      attributes: {
        class: 'prose-editor focus:outline-none min-h-[40px] text-[14px] text-[#b4b5c8]',
      },
      handleKeyDown: (_view, event) => {
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) return false;
        return false;
      },
    },
    onUpdate: ({ editor: e }) => {
      const html = e.getHTML();
      const md = html === '<p></p>' ? '' : turndown.turndown(html);
      onChange(md);
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href;
    const url = window.prompt('URL', prev ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  const clearFormatting = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().clearNodes().unsetAllMarks().run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-col flex-1">
      {editor && (
        <BubbleMenu editor={editor}>
          <div className="flex items-center gap-0.5 bg-[#232326] border border-[#3b3b40] rounded-lg px-1 py-0.5 shadow-xl shadow-black/50">
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
            <BubbleBtn onClick={setLink} active={editor.isActive('link')} title="Link">
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
        </BubbleMenu>
      )}

      <EditorContent editor={editor} className="flex-1 overflow-y-auto" />
    </div>
  );
}

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
          ? 'text-[#e2e2ea] bg-[#2c2c30]'
          : 'text-[#6f6f78] hover:text-[#e2e2ea] hover:bg-[#2c2c30]'
      }`}
    >
      {children}
    </button>
  );
}

function BubbleDivider() {
  return <div className="w-px h-4 bg-[#3b3b40] mx-0.5" />;
}
