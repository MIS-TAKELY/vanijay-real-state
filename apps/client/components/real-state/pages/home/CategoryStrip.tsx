"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useContentStore } from "store/content";

function useHorizontalDrag(ref: React.RefObject<HTMLDivElement | null>) {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  // True once the pointer has actually moved — used to suppress the click
  // that the browser fires after a drag ends, so dragging never navigates.
  const dragMovedRef = useRef(false);

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragMovedRef.current = false;
    setStartX(e.pageX - (ref.current?.offsetLeft || 0));
    setScrollLeft(ref.current?.scrollLeft || 0);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - (ref.current.offsetLeft || 0);
    if (Math.abs(x - startX) > 5) dragMovedRef.current = true;
    const walk = (x - startX) * 1.5;
    ref.current.scrollLeft = scrollLeft - walk;
  };

  const onMouseUp = () => setIsDragging(false);
  const onMouseLeave = () => setIsDragging(false);

  return {
    isDragging,
    dragMovedRef,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
  };
}

function CategoryStrip() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { dragMovedRef, onMouseDown, onMouseMove, onMouseUp, onMouseLeave } =
    useHorizontalDrag(scrollRef);
  const categoriesEnabled = useContentStore((s) => s.categoriesEnabled);
  const categories = useContentStore((s) => s.categories);

  if (!categoriesEnabled || categories.length === 0) return null;

  // Swallow the click that fires right after a mouse drag — releasing a drag
  // over a tile should scroll the strip, not navigate.
  const suppressClickAfterDrag = (e: React.MouseEvent) => {
    if (dragMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      dragMovedRef.current = false;
    }
  };

  return (
    <section className="py-4 relative z-10" aria-label="Property categories">
      <div className="max-w-container-max mx-auto px-gutter">
        {/* Horizontally scrollable row. The inner w-max wrapper centers the
            strip when it fits on wide screens; a plain justify-center on the
            scroll container would clip the leading items on mobile, where the
            row overflows and the clipped items can never be scrolled to. */}
        <div
          ref={scrollRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onClickCapture={suppressClickAfterDrag}
          className="flex overflow-x-auto overscroll-x-contain no-scrollbar snap-x snap-mandatory cursor-grab active:cursor-grabbing p-1 [-webkit-overflow-scrolling:touch] lg:justify-center"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="flex w-max gap-4 md:mx-auto">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/?category=${encodeURIComponent(cat.name.toLowerCase().replace(/ /g, "-"))}`}
                className="group flex flex-col items-center gap-2.5 min-w-[88px] max-w-[104px] snap-start"
                draggable={false}
              >
                <div className="size-20 md:size-24 rounded-2xl overflow-hidden border border-outline-variant bg-surface transition-all duration-200 group-hover:-translate-y-1 group-hover:border-gold/50 group-hover:shadow-lg group-hover:shadow-gold/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                  />
                </div>
                <span className="font-label-sm text-label-sm text-on-surface text-center leading-snug max-w-full whitespace-nowrap truncate transition-colors group-hover:text-navy group-hover:font-semibold">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export { CategoryStrip };
