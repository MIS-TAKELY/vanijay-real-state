// MapTypeStyle entries for Google Maps dark theme
export const DARK_MAP_STYLE: Array<{
  featureType?: string;
  elementType?: string;
  stylers: Array<Record<string, string>>;
}> = [
  { elementType: "geometry", stylers: [{ color: "#0d1a14" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0d1a14" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#4ade80" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d1fae5" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#86efac" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#14332a" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1a3326" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#244530" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b7280" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#14332a" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0a140d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#2563eb" }],
  },
];
