import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationPickerProps {
  initialPosition: {
    lat: number;
    lng: number;
  };
  onPositionChange: (lat: number, lng: number) => void;
  height?: string;
}

function DraggableMarker({
  initialPosition,
  onPositionChange,
}: {
  initialPosition: { lat: number; lng: number };
  onPositionChange: (lat: number, lng: number) => void;
}) {
  const [position, setPosition] = useState(initialPosition);
  const markerRef = useRef<L.Marker | null>(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker) {
        const newPosition = marker.getLatLng();
        setPosition(newPosition);
        onPositionChange(newPosition.lat, newPosition.lng);
      }
    },
  };

  // マップのクリックイベントを処理するコンポーネント
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        onPositionChange(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  return (
    <>
      <MapClickHandler />
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={position}
        ref={markerRef}
      />
    </>
  );
}

export default function LocationPicker({
  initialPosition,
  onPositionChange,
  height = '300px',
}: LocationPickerProps) {
  // Leafletのデフォルトアイコンの問題を修正
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  // 初期位置の検証
  const validInitialPosition = {
    lat: isNaN(initialPosition.lat) ? 35.6895 : initialPosition.lat, // デフォルトは東京
    lng: isNaN(initialPosition.lng) ? 139.6917 : initialPosition.lng,
  };

  return (
    <div style={{ height, width: '100%' }}>
      <MapContainer
        center={[validInitialPosition.lat, validInitialPosition.lng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DraggableMarker
          initialPosition={validInitialPosition}
          onPositionChange={onPositionChange}
        />
      </MapContainer>
    </div>
  );
}
