import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface SpotMapProps {
  position: [number, number];
  name?: string;
  height?: string;
}

function LeafletMap({ position, name = '', height = '300px' }: SpotMapProps) {
  // Leafletのデフォルトアイコンの問題を修正
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });

  return (
    <div style={{ height, width: '100%' }}>
      <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>{name}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

// 実際に外部に公開されるコンポーネント
export default function SpotMap(props: SpotMapProps) {
  return <LeafletMap {...props} />;
}
