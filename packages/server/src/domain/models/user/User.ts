/**
 * ユーザードメインモデル
 */
export class User {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly displayName: string,
    public readonly profileImageUrl: string | null,
    public readonly hometown: string | null,
    public readonly expertAreas: string[] | null,
    public readonly bio: string | null,
    public readonly trustScore: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * ユーザーモデルを作成
   */
  public static create(params: {
    id: string;
    email: string;
    displayName: string;
    profileImageUrl?: string | null;
    hometown?: string | null;
    expertAreas?: string[] | null;
    bio?: string | null;
    trustScore?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }): User {
    const now = new Date();

    return new User(
      params.id,
      params.email,
      params.displayName,
      params.profileImageUrl || null,
      params.hometown || null,
      params.expertAreas || null,
      params.bio || null,
      params.trustScore ?? 50,
      params.createdAt || now,
      params.updatedAt || now
    );
  }

  /**
   * ユーザー情報を更新
   */
  public update(params: {
    displayName?: string;
    profileImageUrl?: string | null;
    hometown?: string | null;
    expertAreas?: string[] | null;
    bio?: string | null;
  }): User {
    return new User(
      this.id,
      this.email,
      params.displayName ?? this.displayName,
      params.profileImageUrl !== undefined ? params.profileImageUrl : this.profileImageUrl,
      params.hometown !== undefined ? params.hometown : this.hometown,
      params.expertAreas !== undefined ? params.expertAreas : this.expertAreas,
      params.bio !== undefined ? params.bio : this.bio,
      this.trustScore,
      this.createdAt,
      new Date()
    );
  }

  /**
   * 信頼スコアを更新
   */
  public updateTrustScore(newScore: number): User {
    // 0-100の範囲に制限
    const clampedScore = Math.max(0, Math.min(100, newScore));

    return new User(
      this.id,
      this.email,
      this.displayName,
      this.profileImageUrl,
      this.hometown,
      this.expertAreas,
      this.bio,
      clampedScore,
      this.createdAt,
      new Date()
    );
  }

  /**
   * 信頼スコアを増加
   */
  public incrementTrustScore(amount: number): User {
    return this.updateTrustScore(this.trustScore + amount);
  }

  /**
   * オブジェクトに変換
   */
  public toObject() {
    return {
      id: this.id,
      email: this.email,
      displayName: this.displayName,
      profileImageUrl: this.profileImageUrl,
      hometown: this.hometown,
      expertAreas: this.expertAreas,
      bio: this.bio,
      trustScore: this.trustScore,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
