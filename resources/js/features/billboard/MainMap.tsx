import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Billboard } from "./types";
import { DEFAULT_LAMONGAN_CENTER } from "./types";
import { getBillboardMarkerIcon, locationMarkerIcon } from "./leaflet-icons";

// Helper to determine visual radius range based on billboard size (dimensions)
function getBillboardVisualRadius(size: string): number {
    if (!size || size === "—") return 150; // default 150 meters
    const parts = size.toLowerCase().split("x");
    if (parts.length < 2) return 150;
    const width = parseFloat(parts[0]);
    const height = parseFloat(parts[1]);
    if (isNaN(width) || isNaN(height)) return 150;
    const area = width * height;
    if (area >= 150) return 250; // Large billboard: 250m radius
    if (area >= 50) return 200; // Medium-Large billboard: 200m radius
    if (area >= 20) return 150; // Medium billboard: 150m radius
    return 100; // Small billboard: 100m radius
}

// Handle yang di-expose ke parent via ref
export interface MainMapHandle {
    flyTo: (lat: number, lng: number, zoom?: number) => void;
}

interface MainMapProps {
    billboards: Billboard[];
    selectedBillboard: Billboard | null;
    mapClickMode: boolean;
    onLocationPicked: (lat: string, lng: string) => void;
    onBillboardSelect: (billboard: Billboard) => void;
}

const MainMap = forwardRef<MainMapHandle, MainMapProps>(function MainMap(
    {
        billboards,
        selectedBillboard,
        mapClickMode,
        onLocationPicked,
        onBillboardSelect,
    },
    ref,
) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const selectedCircleRef = useRef<L.Circle | null>(null);

    // Expose flyTo ke parent
    useImperativeHandle(ref, () => ({
        flyTo(lat: number, lng: number, zoom = 15) {
            mapInstanceRef.current?.flyTo([lat, lng], zoom, {
                animate: true,
                duration: 0.8,
            });
        },
    }));

    // Initialize Map and markers
    useEffect(() => {
        if (!mapRef.current) return;

        try {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }

            // Base maps definitions
            const streetLayer = L.tileLayer(
                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                {
                    attribution:
                        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    maxZoom: 19,
                },
            );

            const satelliteLayer = L.tileLayer(
                "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                {
                    attribution:
                        "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
                    maxZoom: 19,
                },
            );

            const darkLayer = L.tileLayer(
                "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
                {
                    attribution:
                        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                    subdomains: "abcd",
                    maxZoom: 20,
                },
            );

            const map = L.map(mapRef.current, {
                center: DEFAULT_LAMONGAN_CENTER,
                zoom: 12,
                zoomControl: true,
                attributionControl: true,
                layers: [streetLayer], // default base layer
            });

            const baseMaps = {
                "Peta Jalan": streetLayer,
                "Citra Satelit": satelliteLayer,
                "Mode Gelap": darkLayer,
            };

            // Overlay Group for visual range circles
            const radiusGroup = L.layerGroup();

            // Mode pick location
            if (mapClickMode) {
                map.on("click", (e: L.LeafletMouseEvent) => {
                    onLocationPicked(
                        e.latlng.lat.toString(),
                        e.latlng.lng.toString(),
                    );
                    L.marker([e.latlng.lat, e.latlng.lng], {
                        icon: locationMarkerIcon,
                    })
                        .addTo(map)
                        .bindPopup(
                            `📍 Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}`,
                        )
                        .openPopup();
                });
            }

            // Tambah marker setiap billboard
            billboards.forEach((billboard) => {
                const marker = L.marker([billboard.lat, billboard.lng], {
                    icon: getBillboardMarkerIcon(billboard.markerVariant),
                }).addTo(map);

                // Add visual radius circle to overlay group
                const radius = getBillboardVisualRadius(billboard.size);
                L.circle([billboard.lat, billboard.lng], {
                    radius: radius,
                    color: "#3b82f6", // tailwind blue-500
                    fillColor: "#93c5fd", // tailwind blue-300
                    fillOpacity: 0.12,
                    weight: 1,
                    dashArray: "4, 4",
                }).addTo(radiusGroup);

                const tooltipContent = `
                    <div class="p-1 min-w-[150px]">
                        ${billboard.photo_url ? `<div class="w-full h-24 mb-2 rounded overflow-hidden"><img src="${billboard.photo_url}" class="w-full h-full object-cover" alt="Billboard" /></div>` : ""}
                        <h3 class="font-bold text-sm text-gray-900">${billboard.name}</h3>
                        <p class="text-xs text-gray-600 mt-1">${billboard.address}</p>
                        <div class="mt-2 text-xs space-y-1">
                            <p><strong>Ukuran:</strong> ${billboard.size}</p>
                            <p class="font-semibold text-blue-600">${billboard.price}</p>
                        </div>
                    </div>
                `;

                // Tooltip muncul saat di-hover dengan detail lengkap
                marker.bindTooltip(tooltipContent, {
                    direction: "top",
                    offset: [0, -30],
                    opacity: 1,
                    className: "bg-white rounded-lg shadow-lg border-0",
                });

                marker.on("click", () => {
                    onBillboardSelect(billboard);
                });
            });

            // Display radius group on the map by default
            radiusGroup.addTo(map);

            const overlays = {
                "Radius Jangkauan": radiusGroup,
            };

            // Add layers control widget (topright)
            L.control
                .layers(baseMaps, overlays, { collapsed: false })
                .addTo(map);

            mapInstanceRef.current = map;
        } catch (error) {
            console.error("Error initializing map:", error);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [billboards, mapClickMode]);

    // Reactive effect for handling selected billboard highlight circle overlay
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        // Clean up previous highlight circle
        if (selectedCircleRef.current) {
            selectedCircleRef.current.remove();
            selectedCircleRef.current = null;
        }

        if (selectedBillboard) {
            const radius = getBillboardVisualRadius(selectedBillboard.size);
            // Draw a high-contrast highlighted visual range circle
            const circle = L.circle(
                [selectedBillboard.lat, selectedBillboard.lng],
                {
                    radius: radius,
                    color: "#ef4444", // tailwind red-500
                    fillColor: "#f87171", // tailwind red-400
                    fillOpacity: 0.22,
                    weight: 2,
                },
            ).addTo(map);

            selectedCircleRef.current = circle;

            // Smoothly center and zoom map viewport to selected billboard
            map.flyTo([selectedBillboard.lat, selectedBillboard.lng], 15, {
                animate: true,
                duration: 1,
            });
        }
    }, [selectedBillboard]);

    return (
        <div
            ref={mapRef}
            className="rounded-lg overflow-hidden border-2 border-gray-200"
            style={{ height: "600px", width: "100%" }}
        />
    );
});

export default MainMap;
