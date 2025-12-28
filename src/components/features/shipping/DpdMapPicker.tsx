import React, { useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Modal } from '@/components/ui/Modal';
import { PickupPoint } from '@/types/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Search, MapPin, Navigation } from 'lucide-react';
import { api } from '@/lib/api'; // We'll add a helper here later or call fetch directly
import { Icon } from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
// import 'leaflet/dist/leaflet.css'; // Already in index.html

// Fix for default Leaflet markers in Webpack/Vite
// We'll use a custom DivIcon or a CDN image to be safe
const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface DpdMapPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (point: PickupPoint) => void;
}

// Component to handle map center updates
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

// Mock Fetcher for DPD Points (replace with api call)
const fetchDpdPoints = async (query: string): Promise<PickupPoint[]> => {
    const res = await fetch(`${import.meta.env.BASE_URL === '/' ? '/api' : '/.netlify/functions'}/shipping-dpd-points?query=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to fetch points');
    return res.json();
};

export function DpdMapPicker({ open, onClose, onSelect }: DpdMapPickerProps) {
  const [search, setSearch] = useState('Warszawa');
  const [center, setCenter] = useState<[number, number]>([52.2297, 21.0122]); // Default Warsaw
  
  const { data: points, isLoading, refetch } = useQuery({
    queryKey: ['dpd-points', search],
    queryFn: () => fetchDpdPoints(search),
    enabled: open, // Only fetch when open
    staleTime: 1000 * 60 * 5,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
    // In a real app, we would geocode the search string to setCenter
    // For MVP, we'll rely on the mock backend returning points near the query if it was lat/lon
    // or we just trust the first result's location to center the map.
  };

  // Effect to center map on first result
  useMemo(() => {
    if (points && points.length > 0 && points[0].lat && points[0].lng) {
        setCenter([points[0].lat, points[0].lng]);
    }
  }, [points]);

  const handleLocateMe = () => {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
              setCenter([pos.coords.latitude, pos.coords.longitude]);
              // Trigger a search by lat/lng string or special keyword
              setSearch(`${pos.coords.latitude},${pos.coords.longitude}`);
              setTimeout(() => refetch(), 100);
          });
      }
  };

  return (
    <Modal open={open} onClose={onClose} title="Select DPD Pickup Point" className="h-[600px] flex-row overflow-hidden">
      <div className="flex flex-col md:flex-row h-full w-full">
        
        {/* Sidebar List */}
        <div className="w-full md:w-1/3 bg-background border-r border-border flex flex-col z-10">
          <form onSubmit={handleSearch} className="p-4 border-b border-border space-y-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    placeholder="City or Postcode..." 
                    className="pl-9"
                />
            </div>
            <Button type="button" variant="outline" size="sm" className="w-full gap-2" onClick={handleLocateMe}>
                <Navigation className="w-3 h-3" /> Use my location
            </Button>
            <Button type="submit" className="w-full">Search</Button>
          </form>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {isLoading && <div className="p-4 flex justify-center"><Spinner /></div>}
            
            {!isLoading && points?.map(point => (
                <div 
                    key={point.id} 
                    className="p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer transition-colors group"
                    onClick={() => {
                        if (point.lat && point.lng) setCenter([point.lat, point.lng]);
                    }}
                >
                    <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-sm">{point.id}</h4>
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase">{point.type}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{point.address.line1}</p>
                    <p className="text-xs text-muted-foreground">{point.address.line2}</p>
                    <Button 
                        size="sm" 
                        variant="secondary" 
                        className="w-full mt-2 h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => { e.stopPropagation(); onSelect(point); onClose(); }}
                    >
                        Select
                    </Button>
                </div>
            ))}
            {!isLoading && points?.length === 0 && (
                <p className="text-center text-sm text-muted-foreground p-4">No points found.</p>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="w-full md:w-2/3 h-full relative">
            <MapContainer center={center} zoom={13} className="h-full w-full z-0">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapUpdater center={center} />
                {points?.map(point => (
                     point.lat && point.lng && (
                        <Marker 
                            key={point.id} 
                            position={[point.lat, point.lng]} 
                            icon={customIcon}
                            eventHandlers={{
                                click: () => {
                                    // Optional: Open popup or select in list
                                }
                            }}
                        >
                            <Popup>
                                <div className="text-sm">
                                    <strong className="block mb-1">{point.id}</strong>
                                    <p className="text-xs mb-2">{point.address.line1}</p>
                                    <Button size="sm" className="w-full h-7" onClick={() => { onSelect(point); onClose(); }}>
                                        Select Point
                                    </Button>
                                </div>
                            </Popup>
                        </Marker>
                     )
                ))}
            </MapContainer>
        </div>

      </div>
    </Modal>
  );
}
