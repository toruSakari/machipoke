import { Spot, SpotGeoJSON } from '@/types/spot';

/**
 * スポットデータをGeoJSON形式に変換する関数
 */
export function convertSpotsToGeoJSON(spots: Spot[]): SpotGeoJSON {
  return {
    type: 'FeatureCollection',
    features: spots.map((spot) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [spot.longitude, spot.latitude], // GeoJSONは[経度, 緯度]の順
      },
      properties: {
        id: spot.id,
        name: spot.name,
        category: spot.category,
        secretLevel: spot.secretLevel,
        rating: spot.rating,
      },
    })),
  };
}

/**
 * 2点間の距離を計算する関数（ハーバーサイン公式による）
 * @param lat1 地点1の緯度
 * @param lon1 地点1の経度
 * @param lat2 地点2の緯度
 * @param lon2 地点2の経度
 * @returns 距離（キロメートル単位）
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // 地球の半径（キロメートル）
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

/**
 * 度からラジアンに変換する関数
 */
function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * 指定した地点を中心とする円を描画するためのGeoJSONを生成する関数
 * @param centerLat 中心の緯度
 * @param centerLon 中心の経度
 * @param radiusKm 半径（キロメートル単位）
 * @returns GeoJSON形式のオブジェクト
 */
export function createCircleGeoJSON(centerLat: number, centerLon: number, radiusKm: number) {
  const points = 64; // 円を近似するための点の数
  const coordinates = [];

  for (let i = 0; i < points; i++) {
    const angle = (i * 360) / points;
    const dx = radiusKm / 111.32; // 1度あたりの距離は約111.32km（赤道付近）
    const dy = radiusKm / (111.32 * Math.cos(toRad(centerLat)));

    const lat = centerLat + dx * Math.sin(toRad(angle));
    const lon = centerLon + dy * Math.cos(toRad(angle));

    coordinates.push([lon, lat]);
  }

  // 円を閉じるために最初の点を最後にも追加
  coordinates.push(coordinates[0]);

  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [coordinates],
    },
    properties: {
      radius: radiusKm,
    },
  };
}
