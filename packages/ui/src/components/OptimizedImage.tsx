"use client"

import React, { useState } from "react";
import { cn } from "@/lib/utils";

/** Common image breakpoints for responsive images */
const IMAGE_BREAKPOINTS = [320, 480, 640, 768, 1024, 1280, 1536, 1920];

/** Cloudinary regex for URL detection */
const CLOUDINARY_BASE = /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/;

/**
 * Optimize image URL for Cloudinary or Unsplash
 */
function optimizeImageUrl(src: string | undefined, width: number): string {
  if (!src) return "";

  const cloudinary = src.match(CLOUDINARY_BASE);
  if (cloudinary) {
    const [, base, rest = ""] = cloudinary;
    const slashIdx = rest.indexOf("/");
    const head = slashIdx === -1 ? rest : rest.slice(0, slashIdx);
    let tail = slashIdx === -1 ? "" : rest.slice(slashIdx + 1);
    
    const transform = `f_auto,q_auto,w_${width}`;
    return `${base}${transform}/${tail}`;
  }

  try {
    const url = new URL(src);
    if (url.hostname === "images.unsplash.com") {
      url.searchParams.set("auto", "format");
      url.searchParams.set("q", "70");
      url.searchParams.set("w", String(width));
      if (!url.searchParams.get("fit")) url.searchParams.set("fit", "crop");
      return url.toString();
    }
    return src;
  } catch {
    return src;
  }
}

/**
 * Generate a srcSet string from an image URL and widths array.
 */
function generateSrcSet(
  src: string,
  widths: number[] = IMAGE_BREAKPOINTS
): string {
  return widths.map((w) => `${optimizeImageUrl(src, w)} ${w}w`).join(", ");
}

/**
 * Get blur data URL for placeholder effect during image loading.
 * Uses a tiny base64 encoded SVG for minimal payload (~200 bytes).
 */
function getBlurDataURL(
  width: number = 32,
  height: number = 32,
  color: string = "#f0f0f0"
): string {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Cfilter id='b'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23b)' fill='${encodeURIComponent(color)}'/%3E%3C/svg%3E`;
}

export interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'srcSet' | 'decoding' | 'loading' | 'fetchPriority'> {
  /** Image source URL */
  src: string;
  
  /** Alt text for accessibility */
  alt: string;
  
  /** Desired display width in CSS pixels */
  width?: number;
  
  /** Desired display height in CSS pixels */
  height?: number;
  
  /** Whether this is an above-the-fold / critical image */
  priority?: boolean;
  
  /** Image position for loading strategy: "above" (LCP/hero), "below" (lazy), "hero" (above fold but not LCP) */
  position?: "above" | "below" | "hero" | "lcp";
  
  /** Enable blur placeholder effect */
  blurPlaceholder?: boolean;
  
  /** Blur placeholder color */
  blurColor?: string;
  
  /** Sizes attribute for responsive images */
  sizes?: string;
  
  /** Custom srcSet or enable automatic generation (true = auto, string = custom, false = none) */
  srcSet?: string | boolean | undefined;
  
  /** Breakpoints for srcSet generation */
  breakpoints?: number[];
  
  /** Show loading spinner while image loads */
  showLoader?: boolean;
  
  /** Class name for the wrapper/container */
  containerClassName?: string;
  
  /** Additional class names */
  className?: string;
}

const LOADING_SPINNER = `
  <svg class="animate-spin absolute inset-0 m-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
`;

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  position = "below",
  blurPlaceholder = false,
  blurColor = "#f0f0f0",
  sizes,
  srcSet: customSrcSet,
  breakpoints = IMAGE_BREAKPOINTS,
  showLoader = true,
  containerClassName,
  className,
  style,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Determine loading strategy based on position
  const isAboveFold = priority || position === "above" || position === "lcp" || position === "hero";
  
  // Generate srcSet if not provided and we have a valid src
  const generatedSrcSet = !customSrcSet && src ? 
    generateSrcSet(src, breakpoints) : 
    undefined;
  
  // Use custom srcSet if provided, otherwise generated
  const effectiveSrcSet = customSrcSet === true ? generatedSrcSet : 
                         customSrcSet === false ? undefined : 
                         customSrcSet || generatedSrcSet;
  
  // Generate blur placeholder data URL
  const blurDataURL = blurPlaceholder ? getBlurDataURL(32, 32, blurColor) : undefined;
  
  // Determine sizes attribute
  const effectiveSizes = sizes || (isAboveFold ? "100vw" : `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw`);
  
  // Calculate aspect ratio for CLS prevention
  const aspectRatioStyle = height && width ? 
    { aspectRatio: `${width}/${height}` } as React.CSSProperties : 
    undefined;
  
  // Define image loading properties
  const loading: "eager" | "lazy" = isAboveFold ? "eager" : "lazy";
  const decoding: "sync" | "async" = isAboveFold ? "sync" : "async";
  const fetchPriority: "high" | "low" | "auto" = isAboveFold ? "high" : "low";
  
  // Image element props
  const imgProps = {
    src: imageError ? undefined : src,
    alt,
    width,
    height,
    loading,
    decoding,
    fetchPriority,
    draggable: false,
    onLoad: (e: React.SyntheticEvent<HTMLImageElement>) => {
      setImageLoaded(true);
      onLoad?.(e);
    },
    onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
      setImageError(true);
      onError?.(e);
    },
    "data-loaded": imageLoaded || undefined,
    ...props,
  };
  
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        containerClassName
      )}
      style={{
        ...aspectRatioStyle,
        // Ensure the container has a minimum size
        minHeight: height ? `${height}px` : undefined,
      }}
    >
      {/* Blur placeholder background */}
      {blurPlaceholder && (
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-300",
            imageLoaded ? "opacity-0" : "opacity-100"
          )}
          style={{
            backgroundImage: `url(${blurDataURL})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-hidden
        />
      )}
      
      {/* Loading indicator */}
      {showLoader && !imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-muted-foreground">
            {LOADING_SPINNER}
          </div>
        </div>
      )}
      
      {/* Error state */}
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <span className="text-sm text-muted-foreground">Failed to load</span>
        </div>
      )}
      
      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        draggable={false}
        className={cn(
          "relative z-10 h-full w-full object-cover transition-opacity duration-300",
          imageLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        style={style}
        onLoad={(e) => {
          setImageLoaded(true);
          onLoad?.(e);
        }}
        onError={(e) => {
          setImageError(true);
          onError?.(e);
        }}
      />
    </div>
  );
}