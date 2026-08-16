"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Icon,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";

export function EligibilityAndDocs() {
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
                  <Label
                    htmlFor="nrn-category"
                    className="mb-xs block text-[11px] font-semibold uppercase tracking-[0.6px] text-on-surface"
                  >
                    Category
                  </Label>
                  <Select>
                    <SelectTrigger id="nrn-category" className="h-10 w-full">
                      <SelectValue placeholder="Select NRN Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nrn">NRN Citizen</SelectItem>
                      <SelectItem value="fcno">FCNO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label
                    htmlFor="nrn-location"
                    className="mb-xs block text-[11px] font-semibold uppercase tracking-[0.6px] text-on-surface"
                  >
                    Location
                  </Label>
                  <Select>
                    <SelectTrigger id="nrn-location" className="h-10 w-full">
                      <SelectValue placeholder="Province / Region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bagmati">Bagmati</SelectItem>
                      <SelectItem value="gandaki">Gandaki</SelectItem>
                      <SelectItem value="koshi">Koshi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label
                    htmlFor="nrn-size"
                    className="mb-xs block text-[11px] font-semibold uppercase tracking-[0.6px] text-on-surface"
                  >
                    Size (Units)
                  </Label>
                  <Select>
                    <SelectTrigger id="nrn-size" className="h-10 w-full">
                      <SelectValue placeholder="Estimated Size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-5">1–5 Aana</SelectItem>
                      <SelectItem value="5-10">5–10 Aana</SelectItem>
                      <SelectItem value="10-plus">10+ Aana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-xs rounded-md bg-primary py-3.5 text-label-sm font-semibold tracking-[0.8px] text-on-primary hover:bg-primary/90 h-auto"
              >
                Check Eligibility
                <Icon name="arrow_forward" className="text-body-lg" />
              </Button>
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

            <Accordion
              type="single"
              collapsible
              defaultValue="nrn"
              className="divide-y divide-outline-variant"
            >
              {documents.map((doc) => (
                <AccordionItem key={doc.id} value={doc.id} className="border-0">
                  <AccordionTrigger className="py-sm text-[15px] text-on-surface hover:text-primary hover:no-underline">
                    {doc.title}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-6 text-on-surface-variant">
                    {doc.detail}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <p className="mt-md border-t border-outline-variant pt-sm text-[11px] text-on-surface-variant">
              Accepted formats: PDF, JPG, PNG (max 10&nbsp;MB per file).
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
