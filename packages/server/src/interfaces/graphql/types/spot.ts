import { builder } from '../schema';
import { UserType } from './user';

// 季節の列挙型
const SeasonEnum = builder.enumType('Season', {
  values: ['春', '夏', '秋', '冬'] as const,
});

// 時間帯の列挙型
const TimeOfDayEnum = builder.enumType('TimeOfDay', {
  values: ['朝', '昼', '夕方', '夜'] as const,
});

// ソート順の列挙型
const SpotSortEnum = builder.enumType('SpotSort', {
  values: ['newest', 'popular', 'hiddenGem'] as const,
});

// スポット型の定義
export const SpotType = builder.objectRef<any>('Spot');

SpotType.implement({
  fields: (t) => ({
    id: t.exposeString('id'),
    name: t.exposeString('name'),
    description: t.exposeString('description'),
    latitude: t.exposeFloat('latitude'),
    longitude: t.exposeFloat('longitude'),
    address: t.exposeString('address', { nullable: true }),
    categoryIds: t.exposeStringList('categoryIds'),
    userId: t.exposeString('userId'),
    photos: t.exposeStringList('photos'),
    bestSeasons: t.expose('bestSeasons', {
      type: [SeasonEnum],
      nullable: true,
    }),
    bestTimeOfDay: t.expose('bestTimeOfDay', {
      type: [TimeOfDayEnum],
      nullable: true,
    }),
    hiddenGemRating: t.exposeInt('hiddenGemRating'),
    specialExperience: t.exposeString('specialExperience', { nullable: true }),
    visitCount: t.exposeInt('visitCount'),
    saveCount: t.exposeInt('saveCount'),
    createdAt: t.expose('createdAt', { type: 'Date' }),
    updatedAt: t.expose('updatedAt', { type: 'Date' }),

    // ユーザー情報を関連付け
    user: t.field({
      type: UserType,
      nullable: true,
      resolve: async (parent, _, context) => {
        const { getDb } = await import('../../../infrastructure/persistence/cloudflareD1/db');
        const { UserRepositoryImpl } = await import(
          '../../../infrastructure/persistence/cloudflareD1/repositories/UserRepositoryImpl'
        );

        const db = getDb(context.env);
        const userRepository = new UserRepositoryImpl(db);

        return userRepository.findById(parent.userId);
      },
    }),
  }),
});

// スポット作成入力型
builder.inputType('CreateSpotInput', {
  fields: (t) => ({
    name: t.string({ required: true, validate: { minLength: 1, maxLength: 100 } }),
    description: t.string({ required: true, validate: { minLength: 1, maxLength: 2000 } }),
    latitude: t.float({ required: true }),
    longitude: t.float({ required: true }),
    address: t.string(),
    categoryIds: t.stringList({ required: true }),
    photos: t.stringList({ required: true }),
    bestSeasons: t.field({ type: [SeasonEnum] }),
    bestTimeOfDay: t.field({ type: [TimeOfDayEnum] }),
    hiddenGemRating: t.int({ required: true, validate: { min: 1, max: 5 } }),
    specialExperience: t.string({ validate: { maxLength: 1000 } }),
  }),
});

// スポット更新入力型
builder.inputType('UpdateSpotInput', {
  fields: (t) => ({
    name: t.string({ validate: { minLength: 1, maxLength: 100 } }),
    description: t.string({ validate: { minLength: 1, maxLength: 2000 } }),
    address: t.string(),
    categoryIds: t.stringList(),
    photos: t.stringList(),
    bestSeasons: t.field({ type: [SeasonEnum] }),
    bestTimeOfDay: t.field({ type: [TimeOfDayEnum] }),
    hiddenGemRating: t.int({ validate: { min: 1, max: 5 } }),
    specialExperience: t.string({ validate: { maxLength: 1000 } }),
  }),
});

// スポット検索入力型
builder.inputType('SpotSearchInput', {
  fields: (t) => ({
    query: t.string(),
    categoryIds: t.stringList(),
    nearbyLatitude: t.float(),
    nearbyLongitude: t.float(),
    radiusKm: t.float({ defaultValue: 10 }),
    limit: t.int({ defaultValue: 20 }),
    offset: t.int({ defaultValue: 0 }),
    sortBy: t.field({ type: SpotSortEnum, defaultValue: 'newest' }),
  }),
});

// スポット検索結果型
builder.objectType('SpotSearchResult', {
  fields: (t) => ({
    spots: t.field({
      type: [SpotType],
      resolve: (parent) => parent.spots,
    }),
    totalCount: t.int({
      resolve: (parent) => parent.totalCount,
    }),
    hasMore: t.boolean({
      resolve: (parent) => {
        return parent.totalCount > parent.offset + parent.spots.length;
      },
    }),
  }),
});
