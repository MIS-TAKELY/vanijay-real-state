"use client";
import { Icon } from "@repo/ui";
import { appModes } from "constants/varibles-constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

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

  return { onMouseDown, onMouseMove, onMouseUp, onMouseLeave };
}

function AppModeStrip() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { onMouseDown, onMouseMove, onMouseUp, onMouseLeave } =
    useHorizontalDrag(scrollRef);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return (
        pathname === "/" ||
        pathname.startsWith("/listing") ||
        pathname.startsWith("/area-guid")
      );
    }
    return pathname.startsWith(href);
  };

  return (
    <section className="py-8 md:py-10 relative z-10">
      <div className="max-w-container-max mx-auto px-gutter">
        <div
          ref={scrollRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          className="flex gap-6 p-3 overflow-x-auto no-scrollbar snap-x cursor-grab active:cursor-grabbing justify-center"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {appModes.map((mode) => {
            const active = isActive(mode.href);

            const tile = (
              <div
                className={[
                  "relative size-20 md:size-24 rounded-2xl",
                  "flex items-center justify-center",
                  "border transition-all duration-200",
                  "group-hover:-translate-y-1 group-hover:shadow-lg",
                  active
                    ? "bg-primary border-primary text-on-primary shadow-sm"
                    : "bg-primary-container/30 border-primary/20 text-primary",
                ].join(" ")}
              >
                <Icon name={mode.icon} filled className="text-[32px]" />
                {mode.soon && (
                  <span className="absolute -top-2 -right-2 inline-flex items-center rounded-full bg-error px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none text-on-error tracking-wide">
                    Soon
                  </span>
                )}
              </div>
            );

            const label = (
              <span className="font-label-sm text-label-sm text-on-surface text-center leading-snug max-w-[88px]">
                {mode.label}
              </span>
            );

            return (
              <div
                key={mode.id}
                className="group flex flex-col items-center gap-3 min-w-[88px] snap-start"
              >
                {mode.soon ? (
                  <div
                    aria-disabled="true"
                    className="opacity-60 cursor-not-allowed"
                  >
                    {tile}
                  </div>
                ) : (
                  <Link
                    href={mode.href}
                    draggable={false}
                    aria-current={active ? "page" : undefined}
                  >
                    {tile}
                  </Link>
                )}
                {label}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export { AppModeStrip };
