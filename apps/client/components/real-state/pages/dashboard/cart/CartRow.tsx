import { Button, Icon } from "@repo/ui";
import type { CartItem } from "lib/api/services/cart/types";
import {
  FALLBACK_GRADIENT,
  TYPE_GRADIENTS,
  formatLocation,
  formatNPR,
} from "lib/api/services/properties/types";
import Link from "next/link";

interface CartRowProps {
  item: CartItem;
  busy: boolean;
  onQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export function CartRow({ item, busy, onQuantity, onRemove }: CartRowProps) {
  const property = item.property;
  if (!property) return null;

  const cover = property.media?.find((m) => m.isCover) ?? property.media?.[0];
  const gradient = TYPE_GRADIENTS[property.subCategory] ?? FALLBACK_GRADIENT;

  return (
    <div className="flex flex-col gap-sm rounded-2xl border border-outline-variant border-t-2 border-t-gold/40 bg-surface p-sm shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center">
      <Link
        href={`/${property.slug}`}
        className="relative block h-28 w-full shrink-0 overflow-hidden rounded-xl sm:h-20 sm:w-28"
      >
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element -- external upload URL; see PropertyCard
          <img
            src={cover.url}
            alt={cover.altText ?? property.title}
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${gradient}`} />
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          href={`/${property.slug}`}
          className="block truncate text-sm font-semibold text-on-surface hover:text-primary"
        >
          {property.title}
        </Link>
        <p className="mt-0.5 truncate text-xs text-on-surface-variant">
          {formatLocation(property.location)} · {property.listingCode}
        </p>
        <p className="mono-stat mt-1 text-sm font-semibold text-gold-deep">
          {formatNPR(property.askingPrice)}
        </p>
      </div>

      <div className="flex items-center justify-between gap-sm sm:justify-end">
        <div className="flex items-center gap-1 rounded-md border border-outline-variant px-1 py-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Decrease quantity"
            onClick={() => onQuantity(item.quantity - 1)}
            disabled={busy || item.quantity <= 1}
            className="h-7 w-7 cursor-pointer"
          >
            <Icon name="remove" className="text-[16px]" />
          </Button>
          <span
            className="w-6 text-center text-sm font-medium"
            aria-live="polite"
          >
            {item.quantity}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Increase quantity"
            onClick={() => onQuantity(item.quantity + 1)}
            disabled={busy || item.quantity >= 99}
            className="h-7 w-7 cursor-pointer"
          >
            <Icon name="add" className="text-[16px]" />
          </Button>
        </div>

        <p className="mono-stat w-32 text-right text-sm font-semibold text-on-surface">
          {item.subtotal != null ? formatNPR(item.subtotal) : "—"}
        </p>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Remove from cart"
          onClick={onRemove}
          disabled={busy}
          className="h-9 w-9 cursor-pointer text-on-surface-variant hover:text-error"
        >
          <Icon name="delete" className="text-[20px]" />
        </Button>
      </div>
    </div>
  );
}
