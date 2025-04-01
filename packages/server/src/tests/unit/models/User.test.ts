import { describe, it, expect } from 'vitest';
import { User } from '../../../domain/models/user/User';

describe('User Domain Model', () => {
  const userId = 'test-user-id';
  const userEmail = 'test@example.com';
  const userName = 'Test User';

  it('should create a user with required fields', () => {
    const user = User.create({
      id: userId,
      email: userEmail,
      displayName: userName,
    });

    expect(user).toBeDefined();
    expect(user.id).toBe(userId);
    expect(user.email).toBe(userEmail);
    expect(user.displayName).toBe(userName);
    expect(user.trustScore).toBe(50); // デフォルト値
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });

  it('should create a user with all fields', () => {
    const now = new Date();
    const profileImageUrl = 'https://example.com/image.jpg';
    const hometown = '東京都渋谷区';
    const expertAreas = ['東京', '大阪'];
    const bio = 'Test user bio';
    const trustScore = 75;

    const user = User.create({
      id: userId,
      email: userEmail,
      displayName: userName,
      profileImageUrl,
      hometown,
      expertAreas,
      bio,
      trustScore,
      createdAt: now,
      updatedAt: now,
    });

    expect(user).toBeDefined();
    expect(user.id).toBe(userId);
    expect(user.email).toBe(userEmail);
    expect(user.displayName).toBe(userName);
    expect(user.profileImageUrl).toBe(profileImageUrl);
    expect(user.hometown).toBe(hometown);
    expect(user.expertAreas).toEqual(expertAreas);
    expect(user.bio).toBe(bio);
    expect(user.trustScore).toBe(trustScore);
    expect(user.createdAt).toBe(now);
    expect(user.updatedAt).toBe(now);
  });

  it('should update user fields', () => {
    const user = User.create({
      id: userId,
      email: userEmail,
      displayName: userName,
    });

    const newName = 'Updated Name';
    const newBio = 'Updated bio';

    const updatedUser = user.update({
      displayName: newName,
      bio: newBio,
    });

    expect(updatedUser).toBeDefined();
    expect(updatedUser.id).toBe(userId);
    expect(updatedUser.email).toBe(userEmail); // 変更されないフィールド
    expect(updatedUser.displayName).toBe(newName); // 変更されたフィールド
    expect(updatedUser.bio).toBe(newBio); // 変更されたフィールド
    expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(user.updatedAt.getTime()); // 更新日時が更新されていること
  });

  it('should update trust score', () => {
    const user = User.create({
      id: userId,
      email: userEmail,
      displayName: userName,
    });

    const newScore = 80;
    const updatedUser = user.updateTrustScore(newScore);

    expect(updatedUser.trustScore).toBe(newScore);
    expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(user.updatedAt.getTime());
  });

  it('should increment trust score', () => {
    const user = User.create({
      id: userId,
      email: userEmail,
      displayName: userName,
      trustScore: 60,
    });

    const incrementAmount = 15;
    const updatedUser = user.incrementTrustScore(incrementAmount);

    expect(updatedUser.trustScore).toBe(75); // 60 + 15
    expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(user.updatedAt.getTime());
  });

  it('should clamp trust score to valid range (0-100)', () => {
    const user = User.create({
      id: userId,
      email: userEmail,
      displayName: userName,
    });

    // スコアが最大値を超える場合
    const tooHighScore = user.updateTrustScore(150);
    expect(tooHighScore.trustScore).toBe(100);

    // スコアが最小値を下回る場合
    const tooLowScore = user.updateTrustScore(-50);
    expect(tooLowScore.trustScore).toBe(0);
  });

  it('should convert to object', () => {
    const user = User.create({
      id: userId,
      email: userEmail,
      displayName: userName,
    });

    const userObject = user.toObject();

    expect(userObject).toEqual({
      id: userId,
      email: userEmail,
      displayName: userName,
      profileImageUrl: null,
      hometown: null,
      expertAreas: null,
      bio: null,
      trustScore: 50,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  });
});
