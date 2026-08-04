"use client";

import { Icon } from "@repo/ui";
import { useMemo, useState } from "react";
import { PROVINCES } from "./constants";

const SEL =
  "h-11 w-full rounded-md border border-outline bg-surface px-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors";

export function StepLocation() {
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [ward, setWard] = useState("");
  const [areaName, setAreaName] = useState("");
  const [address, setAddress] = useState("");
  const [latLng, setLatLng] = useState<[number, number] | null>(null);

  const provinces = useMemo(() => PROVINCES, []);
  const selProvince = provinces.find((p) => p.name === province);
  const selDistrict = selProvince?.districts.find((d) => d.name === district);
  const selMun = selDistrict?.municipalities.find(
    (m) => m.name === municipality,
  );

  return (
    <div className="flex flex-col gap-md">
      <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
        {(
          [
            {
              label: "Province",
              value: province,
              set: setProvince,
              list: provinces.map((p) => p.name),
              onChange: () => {
                setDistrict("");
                setMunicipality("");
                setWard("");
              },
            },
            {
              label: "District",
              value: district,
              set: setDistrict,
              list: selProvince ? selProvince.districts.map((d) => d.name) : [],
              onChange: () => {
                setMunicipality("");
                setWard("");
              },
            },
            {
              label: "Municipality",
              value: municipality,
              set: setMunicipality,
              list: selDistrict
                ? selDistrict.municipalities.map((m) => m.name)
                : [],
              onChange: () => setWard(""),
            },
            {
              label: "Ward",
              value: ward,
              set: setWard,
              list: selMun
                ? Array.from(
                    { length: selMun.wards },
                    (_, i) => `Ward ${i + 1}`,
                  )
                : [],
              onChange: () => {},
            },
          ] as const
        ).map((f, i) => (
          <div key={f.label} className="flex flex-col gap-xs">
            <label className="font-label-sm text-[13px] font-semibold text-on-surface">
              {f.label}
            </label>
            <select
              className={SEL}
              value={f.value}
              disabled={f.list.length === 0}
              onChange={(e) => {
                f.onChange();
                (f.set as (v: string) => void)(e.target.value);
              }}
            >
              <option value="">Select {f.label.toLowerCase()}</option>
              {f.list.map((v) => (
                <option key={i + v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
        <div className="flex flex-col gap-xs">
          <label className="font-label-sm text-[13px] font-semibold text-on-surface">
            Area name
          </label>
          <input
            type="text"
            value={areaName}
            onChange={(e) => setAreaName(e.target.value)}
            placeholder="e.g. Bhaisepati"
            className="h-11 rounded-md border border-outline bg-surface px-3 text-sm text-on-surface outline-none placeholder:text-on-surface-variant focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          />
        </div>
        <div className="flex flex-col gap-xs">
          <label className="font-label-sm text-[13px] font-semibold text-on-surface">
            Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street / landmark"
            className="h-11 rounded-md border border-outline bg-surface px-3 text-sm text-on-surface outline-none placeholder:text-on-surface-variant focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-col gap-xs">
        <span className="font-label-sm text-[13px] font-semibold text-on-surface">
          Pin on map
        </span>
        <div className="blueprint-grid relative flex h-56 items-center justify-center rounded-2xl border border-outline-variant bg-surface">
          <div className="flex flex-col items-center gap-xs text-center">
            {latLng ? (
              <span className="mono-stat text-sm text-on-surface">
                {latLng[0].toFixed(5)}, {latLng[1].toFixed(5)}
              </span>
            ) : (
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary-container text-primary">
                <Icon name="location_on" className="text-[24px]" />
              </span>
            )}
            <p className="text-[13px] text-on-surface-variant">
              Interactive pin-drop map renders here
            </p>
            <button
              type="button"
              onClick={() => setLatLng([27.7172, 85.324])}
              className="inline-flex items-center gap-1 rounded-md border border-outline-variant px-3 py-1.5 text-[13px] font-medium text-on-surface hover:border-primary hover:text-primary transition-colors cursor-pointer"
            >
              <Icon name="map" className="text-[16px]" />
              Drop pin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
