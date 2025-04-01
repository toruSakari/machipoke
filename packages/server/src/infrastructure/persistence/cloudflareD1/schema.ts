import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

// ユーザーテーブル
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  displayName: text('display_name').notNull(),
  profileImageUrl: text('profile_image_url'),
  hometown: text('hometown'),
  expertAreas: text('expert_areas'), // JSON文字列として保存
  bio: text('bio'),
  trustScore: integer('trust_score').default(50),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// スポットテーブル
export const spots = sqliteTable('spots', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  latitude: text('latitude').notNull(), // 数値を文字列として保存
  longitude: text('longitude').notNull(), // 数値を文字列として保存
  address: text('address'),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  hiddenGemRating: integer('hidden_gem_rating').notNull(),
  specialExperience: text('special_experience'),
  bestSeasons: text('best_seasons'), // JSON文字列として保存
  bestTimeOfDay: text('best_time_of_day'), // JSON文字列として保存
  visitCount: integer('visit_count').default(0),
  saveCount: integer('save_count').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// カテゴリテーブル
export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  iconName: text('icon_name'),
});

// スポットとカテゴリの中間テーブル
export const spotCategories = sqliteTable(
  'spot_categories',
  {
    spotId: text('spot_id')
      .notNull()
      .references(() => spots.id),
    categoryId: text('category_id')
      .notNull()
      .references(() => categories.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.spotId, table.categoryId] }),
    };
  }
);

// 写真テーブル
export const photos = sqliteTable('photos', {
  id: text('id').primaryKey(),
  spotId: text('spot_id')
    .notNull()
    .references(() => spots.id),
  url: text('url').notNull(),
  caption: text('caption'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// コメントテーブル
export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  spotId: text('spot_id')
    .notNull()
    .references(() => spots.id),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// 保存リストテーブル
export const savedLists = sqliteTable('saved_lists', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  isPublic: integer('is_public', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// 保存リストのスポット中間テーブル
export const savedListSpots = sqliteTable(
  'saved_list_spots',
  {
    savedListId: text('saved_list_id')
      .notNull()
      .references(() => savedLists.id),
    spotId: text('spot_id')
      .notNull()
      .references(() => spots.id),
    addedAt: integer('added_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.savedListId, table.spotId] }),
    };
  }
);

// スポット訪問履歴テーブル
export const spotVisits = sqliteTable('spot_visits', {
  id: text('id').primaryKey(),
  spotId: text('spot_id')
    .notNull()
    .references(() => spots.id),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  visitedAt: integer('visited_at', { mode: 'timestamp' }).notNull(),
});

// データベースマイグレーションテーブル（自動マイグレーション用）
export const migrations = sqliteTable('migrations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  appliedAt: integer('applied_at', { mode: 'timestamp' }).notNull(),
});
