import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui";

export const HOME_FAQ_ITEMS: Array<{ q: string; a: string }> = [
  {
    q: "What is MALPOTH?",
    a: "MALPOTH is Nepal's archive of record for land and property — a marketplace where every listing is field-verified and cross-referenced against the official cadastral record (Naksa) and the Malpot land ownership ledger before publication. It covers land, homes, commercial and industrial property across 74 districts of Nepal.",
  },
  {
    q: "How does MALPOTH verify property listings?",
    a: "Every listing is cross-referenced against the official cadastral record (Naksa) and the Malpot land ownership ledger, then field-verified by our survey team. Ownership history is reviewed for disputes, liens and encumbrances. Listings that cannot be reconciled with the official record are not published.",
  },
  {
    q: "Which areas of Nepal does MALPOTH cover?",
    a: "MALPOTH indexes property across 74 districts, from 77 Land Revenue Offices — including Kathmandu, Lalitpur and Bhaktapur in the Kathmandu Valley, Pokhara in Gandaki, and districts across the Terai plains.",
  },
  {
    q: "Can foreigners buy land in Nepal?",
    a: "Under Nepali law, foreign nationals are restricted from purchasing land. Non-Resident Nepalis (NRN citizens) and Foreign Citizens of Nepali Origin (FCNO) may acquire land within prescribed limits under the Non-Resident Nepali Act. MALPOTH's NRN Concierge service handles the full remote purchase process.",
  },
  {
    q: "What land measurement units are used in Nepal?",
    a: "Nepal uses two traditional systems: Ropani-Aana-Paisa-Daam in the hills (1 Ropani = 16 Aana, 1 Aana = 342.25 sq ft) and Bigha-Katha-Dhur in the Terai (1 Bigha = 20 Katha, 1 Katha = 364.5 sq ft). MALPOTH provides a free land unit converter for exact conversions to square feet, square meters, acres and hectares.",
  },
];

export function AboutArchive() {
  return (
    <section
      className="border-t border-outline-variant bg-surface-container-low"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-container-max px-gutter py-xl">
        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <h2
              id="faq-heading"
              className="font-headline-md mb-4 text-lg font-semibold tracking-tight text-navy"
            >
              Frequently asked questions
            </h2>
            <Accordion type="single" collapsible>
              {HOME_FAQ_ITEMS.map((item, idx) => (
                <AccordionItem
                  key={item.q}
                  value={`home-faq-${idx}`}
                  className="border-outline-variant"
                >
                  <AccordionTrigger className="text-sm font-semibold text-on-surface hover:text-primary">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-on-surface-variant">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
