"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon,
  Heading1, Heading2, Heading3, AlignLeft,
  List, ListOrdered, Minus, Link as LinkIcon,
  Image as ImageIcon, Undo2, Redo2, Loader2,
} from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary/upload";
import type { UploadSignature } from "@/lib/cloudinary/types";

interface RichTextEditorProps {
  name: string;
  defaultValue?: string;
  placeholder?: string;
}

export function RichTextEditor({
  name,
  defaultValue = "",
  placeholder = "Start writing lesson content…",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [isEmpty, setIsEmpty] = useState(!defaultValue.trim());
  const [uploading, setUploading] = useState(false);

  // Initialise editor with existing HTML on mount (runs once)
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = defaultValue;
    }
    if (hiddenRef.current) {
      hiddenRef.current.value = defaultValue;
    }
    setIsEmpty(!defaultValue.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sync = useCallback(() => {
    if (!editorRef.current || !hiddenRef.current) return;
    hiddenRef.current.value = editorRef.current.innerHTML;
    const hasContent =
      !!editorRef.current.textContent?.trim() ||
      !!editorRef.current.querySelector("img");
    setIsEmpty(!hasContent);
  }, []);

  /** Thin wrapper around the (deprecated but universally supported) execCommand API. */
  const exec = useCallback(
    (command: string, value?: string) => {
      editorRef.current?.focus();
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      document.execCommand(command, false, value);
      sync();
    },
    [sync],
  );

  const handleLink = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      const url = prompt("Enter URL:");
      if (url) exec("insertHTML", `<a href="${url}" target="_blank" rel="noopener">${url}</a>`);
    } else {
      const url = prompt("Enter URL for selected text:");
      if (url) exec("createLink", url);
    }
  }, [exec]);

  const handleImageFile = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const res = await fetch("/api/upload?folder=lesson-images");
        if (!res.ok) throw new Error("Could not get upload signature");
        const sig: UploadSignature = await res.json();
        const url = await uploadToCloudinary(file, sig);
        exec("insertImage", url);
      } catch (err) {
        console.error("Image upload failed:", err);
        alert("Image upload failed. Please check your Cloudinary configuration.");
      } finally {
        setUploading(false);
      }
    },
    [exec],
  );

  const btn =
    "p-1.5 rounded hover:bg-slate-200 text-[#1e293b]/60 hover:text-[#0f172a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const sep = <div className="mx-1 h-4 w-px bg-border" />;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      {/* Hidden form field — updated on every keystroke */}
      <input type="hidden" name={name} ref={hiddenRef} />

      {/* Hidden file input for image uploads */}
      <input
        type="file"
        ref={fileRef}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleImageFile(f);
          e.target.value = "";
        }}
      />

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-slate-50 px-2 py-1.5">
        <button type="button" title="Bold (Ctrl+B)" onClick={() => exec("bold")} className={btn}>
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button type="button" title="Italic (Ctrl+I)" onClick={() => exec("italic")} className={btn}>
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button type="button" title="Underline (Ctrl+U)" onClick={() => exec("underline")} className={btn}>
          <UnderlineIcon className="h-3.5 w-3.5" />
        </button>

        {sep}

        <button type="button" title="Heading 1" onClick={() => exec("formatBlock", "h1")} className={btn}>
          <Heading1 className="h-3.5 w-3.5" />
        </button>
        <button type="button" title="Heading 2" onClick={() => exec("formatBlock", "h2")} className={btn}>
          <Heading2 className="h-3.5 w-3.5" />
        </button>
        <button type="button" title="Heading 3" onClick={() => exec("formatBlock", "h3")} className={btn}>
          <Heading3 className="h-3.5 w-3.5" />
        </button>
        <button type="button" title="Paragraph" onClick={() => exec("formatBlock", "p")} className={btn}>
          <AlignLeft className="h-3.5 w-3.5" />
        </button>

        {sep}

        <button type="button" title="Bullet list" onClick={() => exec("insertUnorderedList")} className={btn}>
          <List className="h-3.5 w-3.5" />
        </button>
        <button type="button" title="Numbered list" onClick={() => exec("insertOrderedList")} className={btn}>
          <ListOrdered className="h-3.5 w-3.5" />
        </button>

        {sep}

        <button type="button" title="Horizontal rule" onClick={() => exec("insertHorizontalRule")} className={btn}>
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button type="button" title="Insert / wrap link" onClick={handleLink} className={btn}>
          <LinkIcon className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          title={uploading ? "Uploading image…" : "Insert image"}
          disabled={uploading}
          onClick={() => !uploading && fileRef.current?.click()}
          className={btn}
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ImageIcon className="h-3.5 w-3.5" />
          )}
        </button>

        {sep}

        <button type="button" title="Undo (Ctrl+Z)" onClick={() => exec("undo")} className={btn}>
          <Undo2 className="h-3.5 w-3.5" />
        </button>
        <button type="button" title="Redo (Ctrl+Y)" onClick={() => exec("redo")} className={btn}>
          <Redo2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* ── Editable area ── */}
      <div className="relative">
        {/* Placeholder — shown only when editor is empty */}
        {isEmpty && (
          <p className="pointer-events-none absolute left-4 top-4 select-none text-sm text-[#1e293b]/30">
            {placeholder}
          </p>
        )}

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={sync}
          className="
            min-h-[320px] p-4 text-sm text-[#1e293b] focus:outline-none

            [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-[#0f172a] [&_h1]:mt-5 [&_h1]:mb-2
            [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-[#0f172a] [&_h2]:mt-4 [&_h2]:mb-1.5
            [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-[#0f172a] [&_h3]:mt-3 [&_h3]:mb-1

            [&_p]:mb-3 [&_p]:leading-relaxed

            [&_ul]:list-disc [&_ul]:list-inside [&_ul]:mb-3 [&_ul]:space-y-1
            [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:mb-3 [&_ol]:space-y-1
            [&_li]:text-[#1e293b]/80 [&_li]:leading-relaxed

            [&_a]:text-[#3D2DFF] [&_a]:underline [&_a]:underline-offset-2

            [&_img]:rounded-xl [&_img]:max-w-full [&_img]:my-3 [&_img]:block

            [&_hr]:border-border [&_hr]:my-4

            [&_strong]:font-semibold [&_em]:italic [&_u]:underline

            [&_blockquote]:border-l-4 [&_blockquote]:border-[#3D2DFF]/30
            [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[#1e293b]/60 [&_blockquote]:my-3
          "
        />
      </div>
    </div>
  );
}
