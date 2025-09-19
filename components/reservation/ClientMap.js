'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default leaflet markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function ClientMap({ center, bikes, onBikeSelect }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, 13, { animate: true });
    }
  }, [center]);

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      whenCreated={(mapInstance) => {
        mapRef.current = mapInstance;
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      {bikes.map((bike) => {
        if (
          !bike.currentLocation ||
          typeof bike.currentLocation.lat !== 'number' ||
          typeof bike.currentLocation.lng !== 'number'
        ) {
          return null;
        }
        return (
          <Marker
            key={bike._id || bike.bikeId}
            position={[bike.currentLocation.lat, bike.currentLocation.lng]}
            eventHandlers={{
              click: () => onBikeSelect(bike),
            }}
          />
        );
      })}
    </MapContainer>
  );
}
