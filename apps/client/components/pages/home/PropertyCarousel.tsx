import React from "react";
import Link from "next/link";
import { Button, Badge, Icon } from "@repo/ui";
import { properties } from "constants/varibles-constants";

interface Property {
  id: string;
  location: string;
  title: string;
  plotId: string;
  size: string;
  price: string;
  image: string;
  alt: string;
}



function PropertyCard({ property }: { property: Property }) {
  return (
    <div className="min-w-[320px] max-w-[360px] flex-1 bg-surface border border-outline-variant rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl hover:border-primary/50 transition-[transform,box-shadow,border-color] duration-300 relative hover:-translate-y-1 snap-start property-card">
      <div className="relative h-48 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={property.alt}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          src={property.image}
        />
        <div className="absolute top-sm left-sm verification-stamp">
          Verified
        </div>
      </div>
      <div className="p-md">
        <h4 className="font-label-sm text-label-sm text-on-surface-variant mb-xs uppercase tracking-wider">
          {property.location}
        </h4>
        <p className="font-body-md font-semibold text-on-surface mb-xs">
          {property.title}
        </p>
        <p className="font-body-md text-on-surface-variant text-sm mb-md mono-stat uppercase text-[11px]">
          Plot ID: {property.plotId} • {property.size}
        </p>
        <div className="pt-md border-t border-outline-variant flex justify-between items-center">
          <span className="mono-stat text-data-price text-primary tracking-tighter font-bold">
            {property.price}
          </span>
          <Badge variant="secondary">
            LKP/VER-{property.plotId.slice(-2)}
          </Badge>
        </div>
      </div>
    </div>
  );
}

export function PropertyCarousel() {
  return (
    <section className="py-xl relative z-10 overflow-hidden">
      <div className="max-w-container-max mx-auto px-gutter">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-md mb-lg">
          <div>
            <p className="font-label-sm text-[11px] uppercase tracking-widest text-on-surface-variant font-bold mb-xs">
              Freshly Indexed
            </p>
            <h2 className="font-headline-md text-headline-md text-primary">
              Recently Verified
            </h2>
          </div>
          <div className="flex items-center gap-md">
            <Link
              href="/listings"
              className="hidden sm:inline-flex items-center gap-xs font-label-sm text-sm text-primary font-semibold hover:underline underline-offset-4 cursor-pointer"
            >
              View all listings
              <Icon name="arrow_forward" className="text-[16px]" />
            </Link>
            <div className="flex gap-sm">
              <Button variant="outline" size="icon" aria-label="Previous listings">
                <Icon name="chevron_left" />
              </Button>
              <Button variant="outline" size="icon" aria-label="Next listings">
                <Icon name="chevron_right" />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex gap-md overflow-x-auto pb-lg no-scrollbar snap-x">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}
