import L from "leaflet";

// Fix untuk icon default leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export const locationMarkerIcon = L.icon({
    iconUrl: "/assets/icons/location-marker.png",
    iconSize: [48, 64],
    iconAnchor: [24, 64],
    popupAnchor: [0, -58],
});

export const billboardMarkerIcons = [
    L.icon({
        iconUrl: "/assets/icons/location-marker-wrench.png",
        iconSize: [48, 64],
        iconAnchor: [24, 64],
        popupAnchor: [0, -58],
    }),
    L.icon({
        iconUrl: "/assets/icons/location-marker-star.png",
        iconSize: [48, 64],
        iconAnchor: [24, 64],
        popupAnchor: [0, -58],
    }),
    L.icon({
        iconUrl: "/assets/icons/location-marker-tag.png",
        iconSize: [48, 64],
        iconAnchor: [24, 64],
        popupAnchor: [0, -58],
    }),
    L.icon({
        iconUrl: "/assets/icons/location-marker-crown.png",
        iconSize: [48, 64],
        iconAnchor: [24, 64],
        popupAnchor: [0, -58],
    }),
    L.icon({
        iconUrl: "/assets/icons/location-marker-lock.png",
        iconSize: [48, 64],
        iconAnchor: [24, 64],
        popupAnchor: [0, -58],
    }),
];

export const normalizeBillboards = (
    items: { markerVariant?: number }[],
): any[] =>
    items.map((item, index) => ({
        ...item,
        markerVariant:
            item.markerVariant ?? index % billboardMarkerIcons.length,
    }));

export const getBillboardMarkerIcon = (markerVariant?: number): L.Icon => {
    const variantIndex = markerVariant ?? 0;
    return billboardMarkerIcons[variantIndex % billboardMarkerIcons.length];
};
