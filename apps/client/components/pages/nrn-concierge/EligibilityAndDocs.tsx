"use client";

import React, { useState } from "react";
import { Icon } from "@repo/ui";

export function EligibilityAndDocs() {
  const [openDoc, setOpenDoc] = useState<string | null>("nrn");

  const documents = [
    {
      id: "nrn",
      title: "NRN Identity Card",
      detail:
        "A valid NRN ID issued by the Non-Resident Nepali Association confirming your NRN or FCNO status. Upload a clear scan of both sides.",
    },
    {
      id: "passport",
      title: "Current Passport",
      detail:
        "Your current passport establishing identity and citizenship. The bio-data page must be fully legible in the scan.",
    },
    {
      id: "funds",
      title: "Proof of Funds",
      detail:
        "A recent bank statement or formal letter from your financial institution demonstrating sufficient funds for the intended purchase.",
    },
    {
      id: "poa",
      title: "Power of Attorney (POA)",
      detail:
        "A draft POA authorizing our concierge to act on your behalf. We provide the template — you execute it at the nearest Nepali embassy or consulate.",
    },
  ];

  return (
    <section
      id="eligibility"
      className="bg-surface-container-low border-b border-outline-variant scroll-mt-20"
    >
      <div className="mx-auto max-w-container-max px-gutter py-xl">
        {/* Section intro — E-E-A-T content */}
        <div className="mb-xl max-w-2xl">
          <p className="font-label-sm text-[11px] font-bold uppercase tracking-[0.8px] text-on-surface-variant mb-xs">
            Step 01 — Eligibility &amp; Documentation
          </p>
          <h2 className="font-headline-md text-headline-md text-primary mb-sm">
            Check Your Eligibility &amp; Prepare Documents
          </h2>
          <p className="font-body-md text-on-surface-variant leading-relaxed">
            Under Nepal&apos;s Non-Resident Nepali Act, NRN Citizens and Foreign
            Citizens of Nepali Origin (FCNO) may acquire land within prescribed
            limits. Our concierge desk verifies your eligibility and guides you
            through every required document — no in-person visit to Nepal
            necessary.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-md lg:grid-cols-2">
          {/* Eligibility Form */}
          <div className="rounded-2xl border border-outline-variant bg-surface p-lg shadow-sm">
            <div className="mb-md flex items-start justify-between">
              <h3 className="font-headline-md text-lg font-medium leading-7 text-on-surface">
                Check Your Eligibility
              </h3>
              <span className="font-label-sm text-[11px] tracking-[0.4px] text-on-surface-variant">
                Form Ref: NRN-2024-EL
              </span>
            </div>

            <form
              className="space-y-md"
              onSubmit={(e) => e.preventDefault()}
              aria-label="NRN eligibility check form"
            >
              <div className="grid grid-cols-1 gap-md sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="nrn-category"
                    className="mb-xs block text-[11px] font-semibold uppercase tracking-[0.6px] text-on-surface"
                  >
                    Category
                  </label>
                  <select
                    id="nrn-category"
                    className="h-10 w-full cursor-pointer rounded-md border border-outline-variant bg-surface px-3 text-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
                  >
                    <option>Select NRN Status</option>
                    <option>NRN Citizen</option>
                    <option>FCNO</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="nrn-location"
                    className="mb-xs block text-[11px] font-semibold uppercase tracking-[0.6px] text-on-surface"
                  >
                    Location
                  </label>
                  <select
                    id="nrn-location"
                    className="h-10 w-full cursor-pointer rounded-md border border-outline-variant bg-surface px-3 text-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
                  >
                    <option>Province / Region</option>
                    <option>Bagmati</option>
                    <option>Gandaki</option>
                    <option>Koshi</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="nrn-size"
                    className="mb-xs block text-[11px] font-semibold uppercase tracking-[0.6px] text-on-surface"
                  >
                    Size (Units)
                  </label>
                  <select
                    id="nrn-size"
                    className="h-10 w-full cursor-pointer rounded-md border border-outline-variant bg-surface px-3 text-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
                  >
                    <option>Estimated Size</option>
                    <option>1–5 Aana</option>
                    <option>5–10 Aana</option>
                    <option>10+ Aana</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex w-full cursor-pointer items-center justify-center gap-xs rounded-md bg-primary py-3.5 text-[13px] font-semibold tracking-[0.8px] text-on-primary transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Check Eligibility
                <Icon name="arrow_forward" className="text-[18px]" />
              </button>
            </form>
          </div>

          {/* Required Documents Accordion */}
          <div className="rounded-2xl border border-outline-variant bg-surface p-lg shadow-sm">
            <h3 className="mb-md flex items-center gap-sm text-lg font-medium leading-7 text-on-surface">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-container text-primary">
                <Icon name="description" filled className="text-[20px]" />
              </span>
              Required Documents
            </h3>

            <ul className="divide-y divide-outline-variant">
              {documents.map((doc) => (
                <li key={doc.id}>
                  <button
                    type="button"
                    onClick={() => setOpenDoc(openDoc === doc.id ? null : doc.id)}
                    aria-expanded={openDoc === doc.id}
                    className="flex w-full cursor-pointer items-center justify-between py-sm text-left text-[15px] text-on-surface transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-md"
                  >
                    {doc.title}
                    <Icon
                      name="expand_more"
                      className={`text-[20px] text-on-surface-variant transition-transform duration-200 ${
                        openDoc === doc.id ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openDoc === doc.id && (
                    <div className="pb-sm text-sm leading-6 text-on-surface-variant">
                      {doc.detail}
                    </div>
                  )}
                </li>
              ))}
            </ul>

            <p className="mt-md border-t border-outline-variant pt-sm text-[11px] text-on-surface-variant">
              Accepted formats: PDF, JPG, PNG (max 10&nbsp;MB per file).
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}