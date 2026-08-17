// MapTypeStyle entries for Google Maps dark theme (navy + gold brand palette)
export const DARK_MAP_STYLE: Array<{
  featureType?: string;
  elementType?: string;
  stylers: Array<Record<string, string>>;
}> = [
  { elementType: "geometry", stylers: [{ color: "#0b1424" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0b1424" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#9db8d8" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#e8d9a8" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8fa8c8" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#14263f" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#16283f" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#2a4a75" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8fa8c8" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#14263f" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0a1626" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#5b8dd6" }],
  },
];
