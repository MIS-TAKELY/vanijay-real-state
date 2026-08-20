import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import React from "react";

import { cn } from "../lib/utils";

type ImageSource = string | StaticImageData;

interface BrandLogoProps {
  /** Roundel/emblem image (e.g. `logo.webp`). */
  logoSrc: ImageSource;
  /** Optional wordmark image (e.g. `logo-text.webp`). */
  logoTextSrc?: ImageSource;
  /** Accessible label; also used as the image alt. Defaults to `MALPOTH`. */
  alt?: string;
  /** `aria-label` override for the link. Defaults to `${alt} home`. */
  ariaLabel?: string;
  /** Link target for the logo. Defaults to `/`. */
  href?: string;
  /**
   * `light` renders the roundel directly on the (light) header; `dark` wraps
   * both roundel and wordmark on white chips so they stay legible on dark
   * navbars (e.g. the metals app).
   */
  variant?: "light" | "dark";
  /** Whether to render the wordmark. Defaults to `true`. */
  showText?: boolean;
  className?: string;
  logoClassName?: string;
  wordmarkClassName?: string;
}

function BrandLogo({
  // logoSrc,
  logoTextSrc,
  alt = "MALPOTH",
  ariaLabel,
  href = "/",
  variant = "light",
  showText = true,
  className,
  logoClassName,
  wordmarkClassName,
}: BrandLogoProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel ?? `${alt} home`}
      className={cn("group flex items-center", className)}
    >
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-sm transition-transform duration-200 group-hover:scale-105 sm:h-12 sm:w-12",
          variant === "dark"
            ? "border-gold/50 bg-white p-0.5 ring-1 ring-gold/40"
            : "border-gold/50",
          logoClassName,
        )}
      >
        <Image
          src={logoSrc}
          alt={alt}
          width={46}
          height={46}
          className="h-full w-full rounded-full object-contain"
        />
      </span>
      {showText && logoTextSrc && (
        <span
          className={cn(
            "hidden md:block",
            variant === "dark" &&
              "flex h-7 items-center rounded-md bg-white px-2 shadow-sm",
            wordmarkClassName,
          )}
        >
          <Image
            src={logoTextSrc}
            alt={alt}
            width={120}
            height={36}
            className="h-[18px] w-auto object-contain"
          />
        </span>
      )}
    </Link>
  );
}

export { BrandLogo };
export type { BrandLogoProps };