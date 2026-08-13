import { Icon } from "@repo/ui";
import type {
  ApiPropertyLocation,
  ApiPropertyMedia,
} from "lib/api/services/properties/types";
import { ListingVideo } from "./ListingVideo";

type ListingLinksProps = {
  location?: ApiPropertyLocation | null;
  videos: ApiPropertyMedia[];
  cadastralMaps: ApiPropertyMedia[];
};

function isProbablyImage(url: string): boolean {
  return /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(url);
}

export function ListingLinks({
  location,
  videos,
  cadastralMaps,
}: ListingLinksProps) {
  const mapsUrl =
    location?.latitude != null && location?.longitude != null
      ? `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`
      : location
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            [
              location.addressText,
              location.areaName,
              location.municipality,
              location.district,
              location.province,
            ]
              .filter(Boolean)
              .join(", "),
          )}`
        : null;

  const hasMapsOrDocs = Boolean(mapsUrl) || cadastralMaps.length > 0;
  const hasVideos = videos.length > 0;

  if (!hasMapsOrDocs && !hasVideos) return null;

  return (
    <>
      {hasVideos && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-on-surface">
            Video walkthrough
          </h2>
          <div className="flex flex-col gap-4">
            {videos.map((video, idx) => (
              <ListingVideo
                key={`video-${video.url}-${idx}`}
                url={video.url}
                title={
                  videos.length > 1
                    ? `Video walkthrough ${idx + 1}`
                    : "Video walkthrough"
                }
              />
            ))}
          </div>
        </section>
      )}

      {hasMapsOrDocs && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-on-surface">
            Maps & documents
          </h2>

          <ul className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface p-3">
            {mapsUrl && (
              <li>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-on-surface transition hover:bg-surface-container"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-container text-primary">
                    <Icon name="map" className="text-[18px]" />
                  </span>
                  <span className="flex-1">
                    Open in Google Maps
                    {location?.latitude != null &&
                      location?.longitude != null && (
                        <span className="mt-0.5 block text-xs font-normal text-on-surface-variant">
                          {location.latitude.toFixed(5)},{" "}
                          {location.longitude.toFixed(5)}
                        </span>
                      )}
                  </span>
                  <Icon
                    name="open_in_new"
                    className="text-[16px] text-on-surface-variant"
                  />
                </a>
              </li>
            )}

            {cadastralMaps.map((map, idx) => (
              <li key={`cadastral-link-${idx}`}>
                <a
                  href={map.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-on-surface transition hover:bg-surface-container"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-container text-primary">
                    <Icon name="description" className="text-[18px]" />
                  </span>
                  <span className="flex-1 truncate">
                    Cadastral map (Naksa)
                    {cadastralMaps.length > 1 ? ` ${idx + 1}` : ""}
                    <span className="mt-0.5 block truncate text-xs font-normal text-on-surface-variant">
                      {map.altText ?? map.url}
                    </span>
                  </span>
                  <Icon
                    name="open_in_new"
                    className="text-[16px] text-on-surface-variant"
                  />
                </a>
              </li>
            ))}
          </ul>

          {cadastralMaps.some((m) => isProbablyImage(m.url)) && (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {cadastralMaps
                .filter((m) => isProbablyImage(m.url))
                .map((map, idx) => (
                  <a
                    key={`cadastral-img-${idx}`}
                    href={map.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={map.url}
                      alt={map.altText ?? "Cadastral map"}
                      className="h-full w-full object-contain"
                    />
                  </a>
                ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}
