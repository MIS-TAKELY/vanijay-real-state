"use client";

import { cn } from "@repo/ui";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";

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
  maxLength,
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
        "suneditor-wrapper rounded-lg border border-outline-variant bg-surface transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30",
        ariaInvalid && "border-error",
        className,
      )}
      id={id ? `${id}-wrapper` : undefined}
    >
      <SunEditor
        defaultValue={value}
        onChange={handleChange}
        placeholder={placeholder}
        height="200px"
        setOptions={{
          buttonList: [
            ["bold", "italic", "underline"],
            ["list"],
            ["link"],
            ["removeFormat"],
          ],
          charCounter: false,
          maxCharCount: maxLength,
          resizingBar: true,
          showPathLabel: false,
          popupDisplay: "full",
        }}
        setDefaultStyle="font-family: inherit; font-size: 14px; line-height: 1.6;"
      />
    </div>
  );
}
