import { Button, Icon } from "@repo/ui";
import { properties } from "constants/varibles-constants";
import Link from "next/link";
import { PropertyHorizontalCard } from "components/common/PropertyHorizontalCard";

function PropertyCarousel() {
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
              <Icon name="arrow_forward" className="text-data-table" />
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
        <div className="flex gap-md overflow-x-auto pb-lg pt-2 no-scrollbar snap-x">
          {properties.map((property) => (
            <PropertyHorizontalCard
              key={property.id}
              id={property.id}
              title={property.title}
              location={property.location}
              price={property.price}
              image={property.image}
              listingType="For Sale"
              beds={0}
              baths={0}
              sqft={property.size}
              alt={property.alt}
              href={`/listing/${property.id}`}
              badge={`LKP/VER-${property.plotId.slice(-2)}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export { PropertyCarousel };
