import React from "react";
import { Button, Badge, Icon } from "@repo/ui";

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

const properties: Property[] = [
  {
    id: "1",
    location: "Bhaktapur - Sector 04",
    title: "Mountain View Estate Plot",
    plotId: "BK-44102",
    size: "4.5 Aana",
    price: "रू 24,500,000",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBx-ORyBwj6oYzqTpSn7QY5OrynAjIRBEV2P7G2FywW2BzOy8a7IzdlJT29eEjpoupPL1YnAa8yYlQ6BjtpIZMmR2LbRtlUJlyOEYqxzMC-jm-4x1d2P0JvzgnCkJIPIs0oy6wNCB1Z805bMMnonOW_knMwjt1MmUtBwNnz8kTcACoolXkspjN4v_v1oADoElqpg16XpBAyxYdWxzjimrlhFGfvcdVhWYaaVIEDxc3btiLVXxTuFprmfQRQ5F7XttVB37wYmSayQgg",
    alt: "Prime Land Plot",
  },
  {
    id: "2",
    location: "Lalitpur - Patan Heritage",
    title: "Refurbished Commercial Loft",
    plotId: "LT-9902",
    size: "1,200 SqFt",
    price: "रू 52,000,000",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCwGcMtLGfKoSUnpWGH9wo0TgdIPN-bGosQvG_M-vjID8DcCpHH3H5OAM0-BytOMK7bd6glY7y1BzBqiKXomRnnksOwzZw1pF-ck_W3QBaa0ArIR1dy8r3m_NOP4-XUp7Vw75zyNsRVBgU89V6ev1Cr2lvMZgocxGOFDL-5Idsf4fYV08M0F8BTP3x-TvDvTEx94p_v63b3e0TSQi7n-nNjDdkpOexp7AdsULBXzHON29G4XASR8-EAPwtfavJZ2pXf2jVJm0QDVFM",
    alt: "Commercial Loft",
  },
  {
    id: "3",
    location: "Pokhara - Lakeside South",
    title: "Fertile Multi-Use Plot",
    plotId: "PK-1108",
    size: "1.2 Ropani",
    price: "रू 18,700,000",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCkgfgcvBCs4awPzbDmkhjk-YlSQy_V72_mpHIHTEsNoYYsIvhraaMfRtx7uP1mEbwYmRs3X20z-ekTobs1kndsP5aXB2cP9r_dFiOY6wqYaAPakTuvtt5lddIV7JOfZPCovWkoLZgXgcJ-MtVjymoZuAE7c0SJvrYMabmjJKvoTjgXSYFCWehPWaLtk5MIRzDH-R-qBNPz7OEZvv6bmOH5uG3Are5nnyRTpqbcNzigMbzsg4QR4xwpJ7rQsSrfvG_9FTO9y8fYvgw",
    alt: "Fertile Plot",
  },
];

function PropertyCard({ property }: { property: Property }) {
  return (
    <div className="min-w-[320px] bg-surface border border-outline-variant hover:shadow-lg transition-all relative hover:-translate-y-1 snap-start property-card">
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
        <h4 className="font-label-sm text-label-sm text-outline mb-xs uppercase tracking-wider">
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
        <div className="flex justify-between items-center mb-lg">
          <h2 className="font-headline-md text-headline-md text-primary">
            Recently Verified
          </h2>
          <div className="flex gap-sm">
            <Button variant="ghost" size="sm">
              <Icon name="chevron_left" />
            </Button>
            <Button variant="ghost" size="sm">
              <Icon name="chevron_right" />
            </Button>
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
