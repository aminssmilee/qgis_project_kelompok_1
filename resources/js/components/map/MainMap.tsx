import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Billboard } from "./types";
import { DEFAULT_LAMONGAN_CENTER } from "./types";
import { getBillboardMarkerIcon, locationMarkerIcon } from "./leaflet-icons";

// Handle yang di-expose ke parent via ref
export interface MainMapHandle {
    flyTo: (lat: number, lng: number, zoom?: number) => void;
}

interface MainMapProps {
    billboards: Billboard[];
    mapClickMode: boolean;
    onLocationPicked: (lat: string, lng: string) => void;
    onBillboardSelect: (billboard: Billboard) => void;
}

const MainMap = forwardRef<MainMapHandle, MainMapProps>(function MainMap(
    { billboards, mapClickMode, onLocationPicked, onBillboardSelect },
    ref
) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);

    // Expose flyTo ke parent
    useImperativeHandle(ref, () => ({
        flyTo(lat: number, lng: number, zoom = 15) {
            mapInstanceRef.current?.flyTo([lat, lng], zoom, {
                animate: true,
                duration: 0.8,
            });
        },
    }));

    useEffect(() => {
        if (!mapRef.current) return;

        try {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }

            const map = L.map(mapRef.current, {
                center: DEFAULT_LAMONGAN_CENTER,
                zoom: 12,
                zoomControl: true,
                attributionControl: true,
            });

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19,
            }).addTo(map);

            // Mode pick location
            if (mapClickMode) {
                map.on("click", (e: L.LeafletMouseEvent) => {
                    onLocationPicked(
                        e.latlng.lat.toString(),
                        e.latlng.lng.toString()
                    );
                    L.marker([e.latlng.lat, e.latlng.lng], {
                        icon: locationMarkerIcon,
                    })
                        .addTo(map)
                        .bindPopup(
                            `📍 Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}`
                        )
                        .openPopup();
                });
            }

            // Tambah marker setiap billboard
            billboards.forEach((billboard) => {
                const marker = L.marker([billboard.lat, billboard.lng], {
                    icon: getBillboardMarkerIcon(billboard.markerVariant),
                }).addTo(map);

                const tooltipContent = `
                    <div class="p-1 min-w-[150px]">
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
                    // Fokus/zoom ke marker saat diklik
                    map.flyTo([billboard.lat, billboard.lng], 15, {
                        animate: true,
                        duration: 1,
                    });
                });
            });

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

    return (
        <div
            ref={mapRef}
            className="rounded-lg overflow-hidden border-2 border-gray-200"
            style={{ height: "600px", width: "100%" }}
        />
    );
});

export default MainMap;
