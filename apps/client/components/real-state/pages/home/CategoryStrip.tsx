"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { Icon } from "@repo/ui";
import { useContentStore } from "store/content";

function useHorizontalDrag(ref: React.RefObject<HTMLDivElement | null>) {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (ref.current?.offsetLeft || 0));
    setScrollLeft(ref.current?.scrollLeft || 0);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - (ref.current.offsetLeft || 0);
    const walk = (x - startX) * 1.5;
    ref.current.scrollLeft = scrollLeft - walk;
  };

  const onMouseUp = () => setIsDragging(false);
  const onMouseLeave = () => setIsDragging(false);

  return { isDragging, onMouseDown, onMouseMove, onMouseUp, onMouseLeave };
}

function CategoryStrip() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { onMouseDown, onMouseMove, onMouseUp, onMouseLeave } =
    useHorizontalDrag(scrollRef);
  const categoriesEnabled = useContentStore((s) => s.categoriesEnabled);
  const categories = useContentStore((s) => s.categories);

  if (!categoriesEnabled || categories.length === 0) return null;

  return (
    <section className="py-4 relative z-10">
      <div className="max-w-container-max mx-auto px-gutter">

        {/* Horizontally scrollable row */}
        <div
          ref={scrollRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          className="flex gap-4 overflow-x-auto no-scrollbar snap-x cursor-grab active:cursor-grabbing justify-center p-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/?category=${encodeURIComponent(cat.name.toLowerCase().replace(/ /g, "-"))}`}
              className="group flex flex-col items-center gap-3 min-w-[88px] snap-start"
              draggable={false}
            >
              <div className="size-20 md:size-24 rounded-2xl overflow-hidden border border-outline-variant bg-surface transition-all duration-200 group-hover:-translate-y-1 group-hover:border-gold/50 group-hover:shadow-lg group-hover:shadow-gold/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <span className="font-label-sm text-label-sm text-on-surface text-center leading-snug transition-colors group-hover:text-navy group-hover:font-semibold">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export { CategoryStrip };
