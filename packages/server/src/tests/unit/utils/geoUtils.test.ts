import { describe, it, expect } from 'vitest';
import { calculateDistance, getBoundingBox } from '@machipoke/shared';

describe('Geo Utilities', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two coordinates', () => {
      // 東京駅と新宿駅の座標を使用
      const tokyoStation = {
        latitude: 35.6812,
        longitude: 139.7671,
      };

      const shinjukuStation = {
        latitude: 35.6896,
        longitude: 139.7006,
      };

      // 実際の距離は約6.4kmだが、計算には誤差がある
      const distance = calculateDistance(
        tokyoStation.latitude,
        tokyoStation.longitude,
        shinjukuStation.latitude,
        shinjukuStation.longitude
      );

      // 誤差を考慮して約6km前後であることを確認
      expect(distance).toBeGreaterThan(5.5);
      expect(distance).toBeLessThan(7.5);
    });

    it('should return 0 for the same coordinates', () => {
      const coord = {
        latitude: 35.6812,
        longitude: 139.7671,
      };

      const distance = calculateDistance(
        coord.latitude,
        coord.longitude,
        coord.latitude,
        coord.longitude
      );

      expect(distance).toBeCloseTo(0);
    });
  });

  describe('getBoundingBox', () => {
    it('should calculate bounding box around a coordinate', () => {
      const centerLat = 35.6812;
      const centerLon = 139.7671;
      const radiusKm = 5;

      const bbox = getBoundingBox(centerLat, centerLon, radiusKm);

      // 構造の確認
      expect(bbox).toHaveProperty('minLat');
      expect(bbox).toHaveProperty('maxLat');
      expect(bbox).toHaveProperty('minLon');
      expect(bbox).toHaveProperty('maxLon');

      // 中心座標を含むこと
      expect(bbox.minLat).toBeLessThan(centerLat);
      expect(bbox.maxLat).toBeGreaterThan(centerLat);
      expect(bbox.minLon).toBeLessThan(centerLon);
      expect(bbox.maxLon).toBeGreaterThan(centerLon);

      // 大きさの確認（おおよそ半径5kmに相当する緯度・経度の差）
      // 緯度1度はおよそ111km
      const expectedLatDiff = radiusKm / 111;
      expect(bbox.maxLat - centerLat).toBeCloseTo(expectedLatDiff, 1);
      expect(centerLat - bbox.minLat).toBeCloseTo(expectedLatDiff, 1);
    });
  });
});
