import React from "react";
import { Button, Icon } from "@repo/ui";

const mapMarkers = [
  { price: "रू 22.4M", change: "4.2%", trend: "up", top: "1/4", left: "1/3" },
  { price: "रू 15.8M", change: "0.0%", trend: "flat", top: "1/2", left: "1/2" },
  { price: "रू 34.2M", change: "8.1%", trend: "up", top: "3/4", left: "3/4" },
];

export function MapExplorer() {
  return (
    <section className="py-xl bg-surface-container border-y border-outline-variant relative z-10">
      <div className="max-w-container-max mx-auto px-gutter">
        <div className="flex justify-between items-end mb-lg">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary mb-xs">
              Market Explorer
            </h2>
            <p className="font-body-md text-on-surface-variant">
              Real-time valuation trends across major survey sectors.
            </p>
          </div>
          <button className="font-label-sm text-label-sm text-primary flex items-center gap-xs hover:underline">
            Launch Full Map <Icon name="open_in_new" className="text-[18px]" />
          </button>
        </div>
        <div className="relative w-full h-[500px] bg-white border border-outline-variant blueprint-grid overflow-hidden group">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Cadastral Map"
              className="w-full h-full object-cover opacity-60 mix-blend-multiply"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgSVil646QlfEDIiSZ8Bc_IitCqMYn19S_Eh4vWAMa-jxB0dl42Q7h0ija38v-R2o3zTv0Vvp5cNdsALDwr_jl6_7mRB9sybnnIGPuZJ0EBIACQiM6Qn250gcL97f8t0eUn63X8dI7HTEnUFmVHOOpZLWRq1HiNaixH_0JTJKOywGhn5g9KOPn-2jf9ehS8YZf6vzzOSLaQeWaA6sCckBOBHWV3ntX9_ekqXJDBHxvlq4vwsP4H7DzSwe5OzYqMhNyMDq8I_NpjIM"
            />
          </div>
          {mapMarkers.map((marker, i) => (
            <div
              key={i}
              className="absolute group/pin cursor-pointer"
              style={{ top: marker.top, left: marker.left }}
            >
              <div className="bg-surface border border-primary px-sm py-xs flex flex-col shadow-md transition-transform group-hover/pin:-translate-y-1">
                <span className="mono-stat text-data-table text-primary tracking-tighter font-bold">
                  {marker.price}
                </span>
                <div
                  className={`flex items-center gap-xs text-[10px] font-bold ${
                    marker.trend === "up" ? "text-error" : "text-on-secondary-container"
                  }`}
                >
                  <Icon
                    name={marker.trend === "up" ? "trending_up" : "trending_flat"}
                    className="text-[12px]"
                  />{" "}
                  {marker.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
