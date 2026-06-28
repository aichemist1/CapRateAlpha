"use client";

import { useState, useTransition } from "react";

type CopyButtonProps = {
  value: string;
  label?: string;
  iconOnly?: boolean;
};

export function CopyButton({
  value,
  label = "Copy",
  iconOnly = false
}: CopyButtonProps) {
  const [message, setMessage] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      startTransition(() => {
        setMessage("Copied");
        window.setTimeout(() => setMessage(""), 1800);
      });
    } catch {
      startTransition(() => {
        setMessage("Copy failed");
        window.setTimeout(() => setMessage(""), 1800);
      });
    }
  }

  return (
    <span className="copy-control">
      <button
        aria-label={label}
        className={iconOnly ? "icon-button" : "button button-secondary"}
        onClick={handleCopy}
        title={label}
        type="button"
      >
        {iconOnly ? (
          <svg aria-hidden="true" className="icon-copy" viewBox="0 0 16 16">
            <path
              d="M5 2.5h6A1.5 1.5 0 0 1 12.5 4v7A1.5 1.5 0 0 1 11 12.5H5A1.5 1.5 0 0 1 3.5 11V4A1.5 1.5 0 0 1 5 2.5Zm0 1a.5.5 0 0 0-.5.5v7A.5.5 0 0 0 5 11.5h6a.5.5 0 0 0 .5-.5V4a.5.5 0 0 0-.5-.5H5Z"
              fill="currentColor"
            />
            <path
              d="M2.5 5.5a.5.5 0 0 1 1 0V12A1.5 1.5 0 0 0 5 13.5h5.5a.5.5 0 0 1 0 1H5A2.5 2.5 0 0 1 2.5 12V5.5Z"
              fill="currentColor"
            />
          </svg>
        ) : (
          label
        )}
      </button>
      <span aria-live="polite" className="footer-note">
        {isPending ? "..." : message}
      </span>
    </span>
  );
}
