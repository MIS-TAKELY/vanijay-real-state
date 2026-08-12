"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DetailCard } from "./components/DetailCard";
import {
  CompassRose,
  HintBar,
  MobileListToggle,
} from "./components/MapControls";
import { Sidebar } from "./components/Sidebar";
import { StreetViewModal } from "./components/StreetViewModal";
import { DARK_MAP_STYLE } from "./config";
import { loadGoogleMaps } from "./googleMapsLoader";
import type { Marker, ModalTab } from "./types";
import { computeAvgChange, getTrendColor, getTrendLabel } from "./utils";

import { NEPAL_GEOJSON } from "./nepalGeoJson";

interface GoogleNepalMapProps {
  markers?: Marker[];
  apiKey?: string;
  className?: string;
  height?: string | number;
  defaultShowList?: boolean;
  onMarkerSelect?: (marker: Marker | null) => void;
}

const DEFAULT_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

export function GoogleNepalMap({
  markers = [],
  apiKey = DEFAULT_API_KEY,
  className,
  height = "clamp(420px, 52vh, 620px)",
  defaultShowList = true,
  onMarkerSelect,
}: GoogleNepalMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const googleMapRef = useRef<any | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const overlaysRef = useRef<Map<number, any>>(new Map());
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showList, setShowList] = useState(defaultShowList);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<ModalTab>("streetview");
  const [apiLoaded, setApiLoaded] = useState(false);

  const selectedMarker = markers.find((m) => m.id === selectedId) ?? null;
  const avgChange = computeAvgChange(markers);

  // Load Google Maps API once
  useEffect(() => {
    if (!apiKey) return;
    loadGoogleMaps(apiKey).then((api) => {
      if (api) setApiLoaded(true);
    });
  }, [apiKey]);

  // Create the map once the API is loaded
  useEffect(() => {
    if (!apiLoaded || !mapRef.current || googleMapRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const google = (window as unknown as { google: { maps: any } }).google;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 28.3949, lng: 84.124 },
      zoom: 7,
      minZoom: 6,
      maxZoom: 18,
      styles: DARK_MAP_STYLE,
      disableDefaultUI: true,
      zoomControl: false,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
    });

    googleMapRef.current = map;

    map.data.addGeoJson(NEPAL_GEOJSON);
    map.data.setStyle({
      fillColor: "transparent",
      fillOpacity: 0,
      strokeColor: "#4ade80",
      strokeWeight: 1,
      strokeOpacity: 0.85,
      clickable: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.data.addListener("mouseover", (event: any) => {
      map.data.overrideStyle(event.feature, {
        fillColor: "#4ade80",
        fillOpacity: 0.2,
        strokeColor: "#4ade80",
        strokeWeight: 1.5,
        strokeOpacity: 1,
      });
      if (mapRef.current) mapRef.current.style.cursor = "pointer";
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.data.addListener("mouseout", (event: any) => {
      map.data.revertStyle(event.feature);
      if (mapRef.current) mapRef.current.style.cursor = "";
    });

    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 200;
    shadowCanvas.height = 200;
    const ctx = shadowCanvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(100, 100, 0, 100, 100, 100);
      gradient.addColorStop(0, "rgba(52, 211, 153, 0.4)");
      gradient.addColorStop(0.5, "rgba(16, 185, 129, 0.15)");
      gradient.addColorStop(1, "rgba(16, 185, 129, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 200, 200);
    }
  }, [apiLoaded]);

  // Sync HTML pin overlays with markers + selection
  useEffect(() => {
    if (!apiLoaded) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const windowAny = window as unknown as { google: { maps: any } };
    const google = windowAny.google;
    const map = googleMapRef.current;
    if (!map) return;

    // Remove all existing overlays
    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current.clear();

    // Custom OverlayView class for HTML pins
    class HtmlPinOverlay extends google.maps.OverlayView {
      private div: HTMLDivElement | null = null;
      constructor(
        private el: HTMLElement,
        private lat: number,
        private lng: number,
      ) {
        super();
      }
      onAdd() {
        this.div = this.el as HTMLDivElement;
        this.getPanes()?.overlayMouseTarget.appendChild(this.div);
      }
      draw() {
        const pos = this.getProjection()?.fromLatLngToDivPixel(
          new google.maps.LatLng(this.lat, this.lng),
        );
        if (pos && this.div) {
          this.div.style.position = "absolute";
          this.div.style.left = `${pos.x - 44}px`;
          this.div.style.top = `${pos.y - 54}px`;
        }
      }
      onRemove() {
        this.div?.parentNode?.removeChild(this.div);
        this.div = null;
      }
    }

    markers.forEach((marker) => {
      const el = document.createElement("div");
      el.innerHTML = buildPinHtml(marker, marker.id === selectedId, false);
      el.style.cursor = "pointer";
      el.style.zIndex = "300";
      el.style.pointerEvents = "auto";

      const overlay = new HtmlPinOverlay(el, marker.lat, marker.lng);
      overlay.setMap(map);
      overlaysRef.current.set(marker.id, overlay);

      el.addEventListener("click", () => {
        setSelectedId(marker.id);
        onMarkerSelect?.(marker);
        map.panTo({ lat: marker.lat, lng: marker.lng });
        map.setZoom(12);
      });
    });
  }, [markers, apiLoaded, selectedId, onMarkerSelect]);

  const handleMarkerClick = useCallback(
    (marker: Marker) => {
      setSelectedId(marker.id);
      onMarkerSelect?.(marker);
      googleMapRef.current?.panTo({ lat: marker.lat, lng: marker.lng });
      googleMapRef.current?.setZoom(12);
    },
    [onMarkerSelect],
  );

  const handleSatelliteZoom = useCallback(() => {
    setModalTab("satellite");
    setModalOpen(true);
  }, []);

  const handleStreetView = useCallback(() => {
    setModalTab("streetview");
    setModalOpen(true);
  }, []);

  if (!apiKey) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d1a14",
          color: "#f87171",
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      </div>
    );
  }

  if (!apiLoaded) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d1a14",
          color: "#4ade80",
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        Loading map...
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        display: "flex",
        height,
        width: "100%",
        position: "relative",
        background: "#0d1a14",
        overflow: "clip",
      }}
    >
      <div
        ref={mapRef}
        style={{ flex: 1, height: "100%", position: "relative" }}
      >
        <CompassRose />
        <HintBar />
        <MobileListToggle
          showList={showList}
          onToggle={() => setShowList((v) => !v)}
        />
      </div>
      {selectedMarker && (
        <DetailCard
          marker={selectedMarker}
          onClose={() => {
            setSelectedId(null);
            onMarkerSelect?.(null);
          }}
          onSatelliteZoom={handleSatelliteZoom}
          onStreetView={handleStreetView}
        />
      )}
      <Sidebar
        markers={markers}
        selectedId={selectedId}
        avgChange={avgChange}
        onMarkerClick={handleMarkerClick}
        showList={showList}
        listRef={{ current: null }}
      />
      {modalOpen && selectedMarker && (
        <StreetViewModal
          marker={selectedMarker}
          tab={modalTab}
          onTabChange={setModalTab}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

function buildPinHtml(
  marker: Marker,
  selected: boolean,
  hottest: boolean,
): string {
  const c = getTrendColor(marker.trend, marker.tier);
  const bg = selected ? "#1a3326" : "#ffffff";
  const fg = selected ? "#ffffff" : "#111827";
  const sub = selected ? "rgba(255,255,255,0.75)" : c;
  const hotBadge = hottest
    ? `<span style="position:absolute;top:-7px;right:-4px;background:${c};color:#fff;font-size:8px;font-weight:800;letter-spacing:0.08em;padding:1px 5px;border-radius:99px;z-index:2">HOT</span>`
    : "";

  return `
<div style="width:88px;display:flex;flex-direction:column;align-items:center;${
    selected
      ? "filter:drop-shadow(0 12px 24px rgba(0,0,0,0.45));transform:scale(1.15) translateY(-3px);"
      : "filter:drop-shadow(0 3px 8px rgba(0,0,0,0.22));transform:scale(1);"
  }transform-origin:bottom center;transition:transform 0.28s cubic-bezier(.175,.885,.32,1.275),filter 0.28s ease">
  <div style="background:${bg};border:2px solid ${
    selected ? "#244530" : "#e5e7eb"
  };border-left:4px solid ${c};border-radius:10px;padding:4px 8px;position:relative;width:88px;box-sizing:border-box;text-align:center">
    ${hotBadge}
    <div style="font-size:11px;font-weight:700;color:${fg};letter-spacing:-0.02em;white-space:nowrap;font-family:'IBM Plex Mono',monospace;line-height:1.2">${
      marker.price
    }</div>
    <div style="font-size:9px;font-weight:700;color:${sub};margin-top:1px;line-height:1.2">${getTrendLabel(marker.trend)} ${marker.change}</div>
    <div style="font-size:8px;font-weight:600;color:${
      selected ? "rgba(255,255,255,0.6)" : "#6b7280"
    };margin-top:1px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${marker.area}</div>
  </div>
  <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid ${
    selected ? "#244530" : "#e5e7eb"
  };margin-top:-1px"></div>
</div>`;
}
