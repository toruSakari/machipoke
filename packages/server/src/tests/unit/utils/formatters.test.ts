import { describe, it, expect } from 'vitest';
import { formatDate, formatNumber, parseJapaneseAddress } from '@machipoke/shared';

describe('Formatter Utilities', () => {
  describe('formatDate', () => {
    it('should format date with default format', () => {
      const date = new Date(2023, 0, 15); // 2023-01-15
      const formatted = formatDate(date);

      expect(formatted).toBe('2023-01-15');
    });

    it('should format date with custom format', () => {
      const date = new Date(2023, 0, 15, 14, 30, 45); // 2023-01-15 14:30:45

      expect(formatDate(date, 'yyyy/MM/dd')).toBe('2023/01/15');
      expect(formatDate(date, 'yyyy年MM月dd日')).toBe('2023年01月15日');
      expect(formatDate(date, 'yyyy-MM-dd HH:mm')).toBe('2023-01-15 14:30');
      expect(formatDate(date, 'HH時mm分ss秒')).toBe('14時30分45秒');
    });

    it('should return empty string for invalid date', () => {
      const invalidDate = new Date('invalid');
      expect(formatDate(invalidDate)).toBe('');
    });
  });

  describe('formatNumber', () => {
    it('should format number with thousands separator', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1234567)).toBe('1,234,567');
      expect(formatNumber(1234.56)).toBe('1,234.56');
    });

    it('should handle zero and negative numbers', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(-1000)).toBe('-1,000');
    });
  });

  describe('parseJapaneseAddress', () => {
    it('should parse complete Japanese address', () => {
      const address = '東京都渋谷区神宮前1-2-3';
      const parsed = parseJapaneseAddress(address);

      expect(parsed).toEqual({
        prefecture: '東京都',
        city: '渋谷区',
        address: '神宮前1-2-3',
      });
    });

    it('should handle prefecture variants', () => {
      expect(parseJapaneseAddress('北海道札幌市中央区北1条西2')).toEqual({
        prefecture: '北海道',
        city: '札幌市中央区',
        address: '北1条西2',
      });

      expect(parseJapaneseAddress('大阪府大阪市中央区難波5-1-60')).toEqual({
        prefecture: '大阪府',
        city: '大阪市中央区',
        address: '難波5-1-60',
      });

      expect(parseJapaneseAddress('京都府京都市東山区祇園町北側')).toEqual({
        prefecture: '京都府',
        city: '京都市東山区',
        address: '祇園町北側',
      });

      expect(parseJapaneseAddress('神奈川県横浜市中区山下町')).toEqual({
        prefecture: '神奈川県',
        city: '横浜市中区',
        address: '山下町',
      });
    });

    it('should handle addresses with towns and villages', () => {
      expect(parseJapaneseAddress('長野県北佐久郡軽井沢町大字長倉')).toEqual({
        prefecture: '長野県',
        city: '北佐久郡軽井沢町',
        address: '大字長倉',
      });
    });

    it('should handle addresses without city part', () => {
      expect(parseJapaneseAddress('沖縄県中頭郡')).toEqual({
        prefecture: '沖縄県',
        city: '',
        address: '中頭郡',
      });
    });

    it('should handle non-standard addresses', () => {
      const nonStandardAddress = 'どこか知らない場所';
      const parsed = parseJapaneseAddress(nonStandardAddress);

      expect(parsed).toEqual({
        prefecture: '',
        city: '',
        address: nonStandardAddress,
      });
    });
  });
});
