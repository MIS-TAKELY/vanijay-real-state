"use client";

import { cn } from "@repo/ui";
import dynamic from "next/dynamic";
import "suneditor/dist/css/suneditor.min.css";

const SunEditor = dynamic(() => import("suneditor-react"), {
  ssr: false,
});

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  id?: string;
  "aria-invalid"?: boolean;
}

/**
 * Rich text editor powered by SunEditor.
 * Stores content as HTML string in the draft.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "Describe the plot, access, nearby facilities, and verification highlights…",
  className,
  id,
  "aria-invalid": ariaInvalid,
}: RichTextEditorProps) {
  const handleChange = (content: string) => {
    onChange(content);
  };

  return (
    <div
      className={cn(
        "suneditor-wrapper rounded-xl border border-outline-variant bg-surface overflow-hidden transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
        ariaInvalid && "border-error focus-within:border-error focus-within:ring-error/20",
        className,
      )}
      id={id ? `${id}-wrapper` : undefined}
    >
      <SunEditor
        defaultValue={value}
        onChange={handleChange}
        placeholder={placeholder}
        height="auto"
        setOptions={{
          minHeight: "180px",
          buttonList: [
            ["bold", "italic", "underline"],
            ["list"],
            ["link"],
            ["removeFormat"],
          ],
          resizingBar: false,
          showPathLabel: false,
          charCounter: false,
          popupDisplay: "full",
        }}
        setDefaultStyle="font-family: inherit; font-size: 14px; line-height: 1.65; color: #1b1c19;"
      />
    </div>
  );
}
