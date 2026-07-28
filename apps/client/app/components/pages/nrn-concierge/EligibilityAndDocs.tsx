"use client"

import React, { useState } from 'react'


export function EligibilityAndDocs() {
  const [openDoc, setOpenDoc] = useState<string | null>(null);
  const documents = [
    { id: "nrn", title: "NRN Identity Card" },
    { id: "passport", title: "Current Passport" },
    { id: "funds", title: "Proof of Funds" },
    { id: "poa", title: "Power of Attorney (POA)" },
  ];

  return (
    <section className="px-6 pb-16">
      <div className="mx-auto grid max-w-[1232px] grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Eligibility Form */}
        <div className="border border-[#C2C8C0] bg-white p-8">
          <div className="mb-6 flex items-start justify-between">
            <h2
              className="text-xl font-medium leading-7 text-[#1B1C19]"
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontVariationSettings: "'opsz' 20",
              }}
            >
              Check Your Eligibility
            </h2>
            <span className="text-[11px] tracking-[0.4px] text-[#727972]">
              FORM REF: NRN-2024-EL
            </span>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.6px] text-[#727972]">
                CATEGORY
              </label>
              <select className="h-10 w-full border border-[#C2C8C0] bg-[#FBF9F4] px-3 text-sm text-[#1B1C19] outline-none focus:border-[#244530]">
                <option>Select NRN Status</option>
                <option>NRN Citizen</option>
                <option>FCNO</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.6px] text-[#727972]">
                LOCATION
              </label>
              <select className="h-10 w-full border border-[#C2C8C0] bg-[#FBF9F4] px-3 text-sm text-[#1B1C19] outline-none focus:border-[#244530]">
                <option>Province / Region</option>
                <option>Bagmati</option>
                <option>Gandaki</option>
                <option>Koshi</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.6px] text-[#727972]">
                SIZE (UNITS)
              </label>
              <select className="h-10 w-full border border-[#C2C8C0] bg-[#FBF9F4] px-3 text-sm text-[#1B1C19] outline-none focus:border-[#244530]">
                <option>Estimated Size</option>
                <option>1–5 Aana</option>
                <option>5–10 Aana</option>
                <option>10+ Aana</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            className="w-full bg-[#244530] py-3.5 text-[13px] font-semibold tracking-[0.8px] text-white hover:bg-[#1a3526]"
          >
            CHECK ELIGIBILITY
          </button>
        </div>

        {/* Required Documents Accordion */}
        <div className="border border-[#C2C8C0] bg-white p-8">
          <h2
            className="mb-6 flex items-center gap-2 text-xl font-medium leading-7 text-[#1B1C19]"
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontVariationSettings: "'opsz' 20",
            }}
          >
            <svg
              className="h-5 w-5 text-[#244530]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Required Documents
          </h2>

          <ul className="divide-y divide-[#E8E4DC]">
            {documents.map((doc) => (
              <li key={doc.id}>
                <button
                  type="button"
                  onClick={() => setOpenDoc(openDoc === doc.id ? null : doc.id)}
                  className="flex w-full items-center justify-between py-4 text-left text-[15px] text-[#1B1C19] hover:text-[#244530]"
                >
                  {doc.title}
                  <svg
                    className={`h-4 w-4 text-[#727972] transition-transform ${openDoc === doc.id ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openDoc === doc.id && (
                  <div className="pb-4 text-sm leading-6 text-[#424842]">
                    Upload a clear scan or PDF of your {doc.title.toLowerCase()}
                    . Accepted formats: PDF, JPG, PNG (max 10 MB).
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}