/**
 * 2点間の距離を計算する（ハーバーサイン公式）
 * @param lat1 緯度1
 * @param lon1 経度1
 * @param lat2 緯度2
 * @param lon2 経度2
 * @returns 距離（キロメートル）
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // 地球の半径（km）
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 度をラジアンに変換
 */
function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * 指定した座標を中心に、指定した半径（km）内にある矩形の境界を計算
 * マップの検索範囲の絞り込みなどに利用
 */
export function getBoundingBox(
  centerLat: number,
  centerLon: number,
  radiusKm: number
): {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
} {
  // 緯度1度あたりの距離は約111km
  const latDelta = radiusKm / 111;

  // 経度1度あたりの距離は緯度によって変わる
  const lonDelta = radiusKm / (111 * Math.cos(toRad(centerLat)));

  return {
    minLat: centerLat - latDelta,
    maxLat: centerLat + latDelta,
    minLon: centerLon - lonDelta,
    maxLon: centerLon + lonDelta,
  };
}
