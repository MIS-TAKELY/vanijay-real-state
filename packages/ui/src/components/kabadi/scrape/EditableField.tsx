"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "../../../lib/utils";

export interface EditableFieldProps {
  value: string;
  onChange?: (v: string) => void;
  editable?: boolean;
  tag?: "span" | "p" | "h1" | "h2" | "h3";
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}

export function EditableField({
  value,
  onChange,
  editable,
  tag: Tag = "span",
  className,
  placeholder,
  multiline = false,
}: EditableFieldProps) {
  const ref = useRef<HTMLElement>(null);
  const [focused, setFocused] = useState(false);

  const handleBlur = useCallback(() => {
    setFocused(false);
    if (ref.current && onChange) {
      const newValue = ref.current.textContent ?? "";
      if (newValue !== value) {
        onChange(newValue);
      }
    }
  }, [onChange, value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!multiline && e.key === "Enter") {
        e.preventDefault();
        ref.current?.blur();
      }
    },
    [multiline],
  );

  if (!editable) {
    return (
      <Tag className={className}>
        {value || (
          <span className="text-muted-foreground/50">{placeholder}</span>
        )}
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref as React.Ref<any>}
      contentEditable
      suppressContentEditableWarning
      className={cn(
        "relative outline-none",
        focused && "ring-2 ring-primary/30",
        !focused && "hover:ring-1 hover:ring-primary/20",
        !value &&
          "before:pointer-events-none before:absolute before:inset-0 before:flex before:items-center before:text-muted-foreground/50",
        className,
      )}
      style={
        !value
          ? ({ "--tw-ring-color": "rgba(16,48,80,0.2)" } as React.CSSProperties)
          : undefined
      }
      data-placeholder={!value ? placeholder : undefined}
      onFocus={() => setFocused(true)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      dangerouslySetInnerHTML={{ __html: value || "" }}
    />
  );
}
