/**
 * スポットドメインモデル
 */
export class Spot {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly address: string | null,
    public readonly categoryIds: string[],
    public readonly userId: string,
    public readonly photos: string[],
    public readonly bestSeasons: ('春' | '夏' | '秋' | '冬')[] | null,
    public readonly bestTimeOfDay: ('朝' | '昼' | '夕方' | '夜')[] | null,
    public readonly hiddenGemRating: number,
    public readonly specialExperience: string | null,
    public readonly visitCount: number,
    public readonly saveCount: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * スポットモデルを作成
   */
  public static create(params: {
    id: string;
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    address?: string | null;
    categoryIds: string[];
    userId: string;
    photos: string[];
    bestSeasons?: ('春' | '夏' | '秋' | '冬')[] | null;
    bestTimeOfDay?: ('朝' | '昼' | '夕方' | '夜')[] | null;
    hiddenGemRating: number;
    specialExperience?: string | null;
    visitCount?: number;
    saveCount?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }): Spot {
    const now = new Date();

    return new Spot(
      params.id,
      params.name,
      params.description,
      params.latitude,
      params.longitude,
      params.address || null,
      params.categoryIds,
      params.userId,
      params.photos,
      params.bestSeasons || null,
      params.bestTimeOfDay || null,
      params.hiddenGemRating,
      params.specialExperience || null,
      params.visitCount ?? 0,
      params.saveCount ?? 0,
      params.createdAt || now,
      params.updatedAt || now
    );
  }

  /**
   * スポット情報を更新
   */
  public update(params: {
    name?: string;
    description?: string;
    address?: string | null;
    categoryIds?: string[];
    photos?: string[];
    bestSeasons?: ('春' | '夏' | '秋' | '冬')[] | null;
    bestTimeOfDay?: ('朝' | '昼' | '夕方' | '夜')[] | null;
    hiddenGemRating?: number;
    specialExperience?: string | null;
  }): Spot {
    return new Spot(
      this.id,
      params.name ?? this.name,
      params.description ?? this.description,
      this.latitude,
      this.longitude,
      params.address !== undefined ? params.address : this.address,
      params.categoryIds ?? this.categoryIds,
      this.userId,
      params.photos ?? this.photos,
      params.bestSeasons !== undefined ? params.bestSeasons : this.bestSeasons,
      params.bestTimeOfDay !== undefined ? params.bestTimeOfDay : this.bestTimeOfDay,
      params.hiddenGemRating ?? this.hiddenGemRating,
      params.specialExperience !== undefined ? params.specialExperience : this.specialExperience,
      this.visitCount,
      this.saveCount,
      this.createdAt,
      new Date()
    );
  }

  /**
   * 訪問数をインクリメント
   */
  public incrementVisitCount(): Spot {
    return new Spot(
      this.id,
      this.name,
      this.description,
      this.latitude,
      this.longitude,
      this.address,
      this.categoryIds,
      this.userId,
      this.photos,
      this.bestSeasons,
      this.bestTimeOfDay,
      this.hiddenGemRating,
      this.specialExperience,
      this.visitCount + 1,
      this.saveCount,
      this.createdAt,
      new Date()
    );
  }

  /**
   * 保存数をインクリメント
   */
  public incrementSaveCount(): Spot {
    return new Spot(
      this.id,
      this.name,
      this.description,
      this.latitude,
      this.longitude,
      this.address,
      this.categoryIds,
      this.userId,
      this.photos,
      this.bestSeasons,
      this.bestTimeOfDay,
      this.hiddenGemRating,
      this.specialExperience,
      this.visitCount,
      this.saveCount + 1,
      this.createdAt,
      new Date()
    );
  }

  /**
   * オブジェクトに変換
   */
  public toObject() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      latitude: this.latitude,
      longitude: this.longitude,
      address: this.address,
      categoryIds: this.categoryIds,
      userId: this.userId,
      photos: this.photos,
      bestSeasons: this.bestSeasons,
      bestTimeOfDay: this.bestTimeOfDay,
      hiddenGemRating: this.hiddenGemRating,
      specialExperience: this.specialExperience,
      visitCount: this.visitCount,
      saveCount: this.saveCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
