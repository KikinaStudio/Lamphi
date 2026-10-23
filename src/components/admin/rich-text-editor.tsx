"use client";

import Image from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRef, useState, type ReactNode } from "react";
import { uploadImage } from "../image-upload";

// Éditeur de texte du back-office : le HTML produit est envoyé dans un champ caché.
export function RichTextEditor({
  name,
  defaultValue,
  uploadFolder,
  placeholder = "Rédigez ici… (vous pouvez coller un texte depuis Word ou Google Docs)",
}: {
  name: string;
  defaultValue: string;
  uploadFolder: string;
  placeholder?: string;
}) {
  const [html, setHtml] = useState(defaultValue);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Image,
      Placeholder.configure({ placeholder }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: { class: "rich-text prose prose-lg max-w-none prose-headings:font-serif" },
    },
    onUpdate: ({ editor: current }) => setHtml(current.isEmpty ? "" : current.getHTML()),
  });

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      {editor && <Toolbar editor={editor} uploadFolder={uploadFolder} />}
      <EditorContent editor={editor} className="editor-content" />
      <input type="hidden" name={name} value={html} />
    </div>
  );
}

function Toolbar({ editor, uploadFolder }: { editor: Editor; uploadFolder: string }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current.isActive("bold"),
      italic: current.isActive("italic"),
      underline: current.isActive("underline"),
      h2: current.isActive("heading", { level: 2 }),
      h3: current.isActive("heading", { level: 3 }),
      bulletList: current.isActive("bulletList"),
      orderedList: current.isActive("orderedList"),
      blockquote: current.isActive("blockquote"),
      link: current.isActive("link"),
      canUndo: current.can().undo(),
      canRedo: current.can().redo(),
    }),
  });

  function editLink() {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Adresse du lien (laisser vide pour retirer le lien)", previous ?? "https://");
    if (url === null) return;
    if (url.trim() === "" || url === "https://") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
    }
  }

  async function insertImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const src = await uploadImage(file, uploadFolder);
      editor.chain().focus().setImage({ src, alt: "" }).run();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Envoi impossible.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="sticky top-0 z-10 flex flex-wrap gap-1 border-b border-line bg-paper/95 p-2 backdrop-blur" role="toolbar" aria-label="Mise en forme">
      <ToolButton label="Gras" active={state.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
        <strong>G</strong>
      </ToolButton>
      <ToolButton label="Italique" active={state.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <em className="font-serif">I</em>
      </ToolButton>
      <ToolButton label="Souligné" active={state.underline} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <span className="underline">S</span>
      </ToolButton>
      <Separator />
      <ToolButton label="Titre de section" active={state.h2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        Titre
      </ToolButton>
      <ToolButton label="Sous-titre" active={state.h3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        Sous-titre
      </ToolButton>
      <Separator />
      <ToolButton label="Liste à puces" active={state.bulletList} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        • Liste
      </ToolButton>
      <ToolButton label="Liste numérotée" active={state.orderedList} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1. Liste
      </ToolButton>
      <ToolButton label="Citation" active={state.blockquote} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        « Citation »
      </ToolButton>
      <Separator />
      <ToolButton label="Lien" active={state.link} onClick={editLink}>
        Lien
      </ToolButton>
      <ToolButton label="Insérer une image" onClick={() => fileInput.current?.click()} disabled={uploading}>
        {uploading ? "Envoi…" : "Image"}
      </ToolButton>
      <ToolButton label="Séparateur" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        —
      </ToolButton>
      <Separator />
      <ToolButton label="Annuler" onClick={() => editor.chain().focus().undo().run()} disabled={!state.canUndo}>
        ↶
      </ToolButton>
      <ToolButton label="Rétablir" onClick={() => editor.chain().focus().redo().run()} disabled={!state.canRedo}>
        ↷
      </ToolButton>
      <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={insertImage} />
    </div>
  );
}

function ToolButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      // Garde le curseur dans le texte : le clic ne retire pas le focus de l'éditeur.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`rounded-md px-2.5 py-1.5 text-sm transition disabled:opacity-40 ${
        active ? "bg-ink text-paper" : "text-ink-soft hover:bg-line/60"
      }`}
    >
      {children}
    </button>
  );
}

function Separator() {
  return <span aria-hidden className="mx-1 w-px self-stretch bg-line" />;
}
