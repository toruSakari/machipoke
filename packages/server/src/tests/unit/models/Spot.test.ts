import { describe, it, expect } from 'vitest';
import { Spot } from '../../../domain/models/spot/Spot';

describe('Spot Domain Model', () => {
  const spotId = 'test-spot-id';
  const spotName = 'Test Spot';
  const spotDescription = 'This is a test spot description';
  const latitude = 35.6895;
  const longitude = 139.6917;
  const userId = 'test-user-id';
  const categoryIds = ['category-1', 'category-2'];
  const photos = ['photo1.jpg', 'photo2.jpg'];
  const hiddenGemRating = 4;

  it('should create a spot with required fields', () => {
    const spot = Spot.create({
      id: spotId,
      name: spotName,
      description: spotDescription,
      latitude,
      longitude,
      categoryIds,
      userId,
      photos,
      hiddenGemRating,
    });

    expect(spot).toBeDefined();
    expect(spot.id).toBe(spotId);
    expect(spot.name).toBe(spotName);
    expect(spot.description).toBe(spotDescription);
    expect(spot.latitude).toBe(latitude);
    expect(spot.longitude).toBe(longitude);
    expect(spot.categoryIds).toEqual(categoryIds);
    expect(spot.userId).toBe(userId);
    expect(spot.photos).toEqual(photos);
    expect(spot.hiddenGemRating).toBe(hiddenGemRating);
    expect(spot.visitCount).toBe(0); // デフォルト値
    expect(spot.saveCount).toBe(0); // デフォルト値
    expect(spot.createdAt).toBeInstanceOf(Date);
    expect(spot.updatedAt).toBeInstanceOf(Date);
  });

  it('should create a spot with all fields', () => {
    const now = new Date();
    const address = '東京都新宿区XX町X-XX';
    const bestSeasons = ['春', '秋'];
    const bestTimeOfDay = ['朝', '夕方'];
    const specialExperience = '特別な体験の説明文';
    const visitCount = 42;
    const saveCount = 15;

    const spot = Spot.create({
      id: spotId,
      name: spotName,
      description: spotDescription,
      latitude,
      longitude,
      address,
      categoryIds,
      userId,
      photos,
      bestSeasons,
      bestTimeOfDay,
      hiddenGemRating,
      specialExperience,
      visitCount,
      saveCount,
      createdAt: now,
      updatedAt: now,
    });

    expect(spot).toBeDefined();
    expect(spot.id).toBe(spotId);
    expect(spot.name).toBe(spotName);
    expect(spot.description).toBe(spotDescription);
    expect(spot.latitude).toBe(latitude);
    expect(spot.longitude).toBe(longitude);
    expect(spot.address).toBe(address);
    expect(spot.categoryIds).toEqual(categoryIds);
    expect(spot.userId).toBe(userId);
    expect(spot.photos).toEqual(photos);
    expect(spot.bestSeasons).toEqual(bestSeasons);
    expect(spot.bestTimeOfDay).toEqual(bestTimeOfDay);
    expect(spot.hiddenGemRating).toBe(hiddenGemRating);
    expect(spot.specialExperience).toBe(specialExperience);
    expect(spot.visitCount).toBe(visitCount);
    expect(spot.saveCount).toBe(saveCount);
    expect(spot.createdAt).toBe(now);
    expect(spot.updatedAt).toBe(now);
  });

  it('should update spot fields', () => {
    const spot = Spot.create({
      id: spotId,
      name: spotName,
      description: spotDescription,
      latitude,
      longitude,
      categoryIds,
      userId,
      photos,
      hiddenGemRating,
    });

    const newName = 'Updated Spot Name';
    const newDescription = 'Updated description';
    const newAddress = '東京都渋谷区XX町X-XX';

    const updatedSpot = spot.update({
      name: newName,
      description: newDescription,
      address: newAddress,
    });

    expect(updatedSpot).toBeDefined();
    expect(updatedSpot.id).toBe(spotId);
    expect(updatedSpot.name).toBe(newName); // 変更されたフィールド
    expect(updatedSpot.description).toBe(newDescription); // 変更されたフィールド
    expect(updatedSpot.address).toBe(newAddress); // 変更されたフィールド
    expect(updatedSpot.latitude).toBe(latitude); // 変更されないフィールド
    expect(updatedSpot.longitude).toBe(longitude); // 変更されないフィールド
    expect(updatedSpot.userId).toBe(userId); // 変更されないフィールド
    expect(updatedSpot.updatedAt.getTime()).toBeGreaterThan(spot.updatedAt.getTime()); // 更新日時が更新されていること
  });

  it('should increment visit count', () => {
    const spot = Spot.create({
      id: spotId,
      name: spotName,
      description: spotDescription,
      latitude,
      longitude,
      categoryIds,
      userId,
      photos,
      hiddenGemRating,
      visitCount: 10,
    });

    const updatedSpot = spot.incrementVisitCount();

    expect(updatedSpot.visitCount).toBe(11); // 10 + 1
    expect(updatedSpot.updatedAt.getTime()).toBeGreaterThan(spot.updatedAt.getTime());
  });

  it('should increment save count', () => {
    const spot = Spot.create({
      id: spotId,
      name: spotName,
      description: spotDescription,
      latitude,
      longitude,
      categoryIds,
      userId,
      photos,
      hiddenGemRating,
      saveCount: 5,
    });

    const updatedSpot = spot.incrementSaveCount();

    expect(updatedSpot.saveCount).toBe(6); // 5 + 1
    expect(updatedSpot.updatedAt.getTime()).toBeGreaterThan(spot.updatedAt.getTime());
  });

  it('should convert to object', () => {
    const spot = Spot.create({
      id: spotId,
      name: spotName,
      description: spotDescription,
      latitude,
      longitude,
      categoryIds,
      userId,
      photos,
      hiddenGemRating,
    });

    const spotObject = spot.toObject();

    expect(spotObject).toEqual({
      id: spotId,
      name: spotName,
      description: spotDescription,
      latitude,
      longitude,
      address: null,
      categoryIds,
      userId,
      photos,
      bestSeasons: null,
      bestTimeOfDay: null,
      hiddenGemRating,
      specialExperience: null,
      visitCount: 0,
      saveCount: 0,
      createdAt: spot.createdAt,
      updatedAt: spot.updatedAt,
    });
  });
});
