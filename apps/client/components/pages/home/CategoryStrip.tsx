"use client";

import { useState, useRef } from "react";
import { Icon } from "@repo/ui";
import { categories } from "constants/varibles-constants";

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
  const { onMouseDown, onMouseMove, onMouseUp, onMouseLeave } = useHorizontalDrag(scrollRef);

  return (
    <section className="py-10 md:py-14 relative z-10">
      <div className="max-w-container-max mx-auto px-gutter">
        {/* Section header */}
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-headline-md text-headline-md text-primary">
            Browse by Category
          </h2>
          <a
            href="#"
            className="hidden sm:inline-flex items-center gap-1 font-label-sm text-sm text-primary font-semibold hover:underline underline-offset-4"
          >
            See All
            <Icon name="arrow_forward" className="text-data-table" />
          </a>
        </div>

        {/* Horizontally scrollable row */}
        <div
          ref={scrollRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          className="flex gap-4 overflow-x-auto no-scrollbar snap-x cursor-grab active:cursor-grabbing justify-center"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((cat) => (
            <a
              key={cat.name}
              href="#"
              className="group flex flex-col items-center gap-3 min-w-[88px] snap-start"
              draggable={false}
            >
              <div
                className="size-20 md:size-24 rounded-2xl overflow-hidden border border-outline-variant bg-surface transition-transform duration-200 group-hover:-translate-y-1 group-hover:shadow-lg"
              >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <span className="font-label-sm text-label-sm text-on-surface text-center leading-snug">
                {cat.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export { CategoryStrip };
