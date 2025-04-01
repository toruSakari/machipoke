import { execSync } from 'child_process';
import * as path from 'path';
import { drizzle } from 'drizzle-orm/d1';
import { randomUUID } from 'crypto';
import { CATEGORIES } from '@machipoke/shared';

// シードデータ用SQLファイルのパス
const SEED_SQL_PATH = path.join(__dirname, './seed.sql');

// ユーザーのシードデータ
const users = [
  {
    id: randomUUID(),
    email: 'demo@example.com',
    displayName: 'デモユーザー',
    profileImageUrl: null,
    hometown: '東京都渋谷区',
    expertAreas: JSON.stringify(['東京', '京都', '大阪']),
    bio: 'マチポケのデモユーザーです。様々な隠れた名所を共有します。',
    trustScore: 80,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: randomUUID(),
    email: 'local@example.com',
    displayName: '地元案内人',
    profileImageUrl: null,
    hometown: '京都府京都市',
    expertAreas: JSON.stringify(['京都', '奈良']),
    bio: '京都在住30年の地元民です。観光客が知らない場所をご案内します。',
    trustScore: 95,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

// スポットのシードデータ
const spots = [
  {
    id: randomUUID(),
    name: '秘密の桜並木',
    description:
      '観光客があまり訪れない地元の人だけが知る桜の名所です。春には美しい桜のトンネルが楽しめます。',
    latitude: '35.689',
    longitude: '139.692',
    address: '東京都新宿区XX町X-XX',
    userId: users[0].id, // デモユーザーのID
    hiddenGemRating: 4,
    specialExperience: '早朝に訪れると、ほとんど人がいない状態で桜を楽しめます。',
    bestSeasons: JSON.stringify(['春']),
    bestTimeOfDay: JSON.stringify(['朝', '夕方']),
    visitCount: 42,
    saveCount: 15,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: randomUUID(),
    name: '古民家カフェ「時の流れ」',
    description:
      '築150年の古民家を改装したカフェ。地元の農家から仕入れた新鮮な野菜や果物を使ったメニューが人気です。',
    latitude: '35.021',
    longitude: '135.759',
    address: '京都府京都市XX区XX町X-X',
    userId: users[1].id, // 地元案内人のID
    hiddenGemRating: 5,
    specialExperience:
      '奥の座敷から見える小さな日本庭園が素晴らしいです。店主に声をかければ、庭園に出ることもできます。',
    bestSeasons: JSON.stringify(['春', '秋']),
    bestTimeOfDay: JSON.stringify(['昼', '夕方']),
    visitCount: 78,
    saveCount: 34,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

// カテゴリIDの配列
const categoryIds = CATEGORIES.map((category) => category.id);

// スポットとカテゴリの関連付け
const spotCategories = [
  {
    spotId: spots[0].id,
    categoryId: categoryIds[1], // nature
  },
  {
    spotId: spots[0].id,
    categoryId: categoryIds[5], // photo
  },
  {
    spotId: spots[1].id,
    categoryId: categoryIds[0], // food
  },
  {
    spotId: spots[1].id,
    categoryId: categoryIds[2], // history
  },
];

// 写真データ
const photos = [
  {
    id: randomUUID(),
    spotId: spots[0].id,
    url: '/api/images/sample-sakura.jpg',
    caption: '満開の桜並木',
    createdAt: Date.now(),
  },
  {
    id: randomUUID(),
    spotId: spots[0].id,
    url: '/api/images/sample-sakura-path.jpg',
    caption: '桜のトンネル',
    createdAt: Date.now(),
  },
  {
    id: randomUUID(),
    spotId: spots[1].id,
    url: '/api/images/sample-cafe.jpg',
    caption: '古民家カフェの外観',
    createdAt: Date.now(),
  },
  {
    id: randomUUID(),
    spotId: spots[1].id,
    url: '/api/images/sample-garden.jpg',
    caption: '中庭の日本庭園',
    createdAt: Date.now(),
  },
];

// スクリプトの実行
async function main() {
  console.log('🌱 シードデータの投入を開始します...');

  try {
    // 環境変数を確認
    const isDev = process.env.NODE_ENV !== 'production';

    if (!isDev) {
      console.error('❌ シードスクリプトは開発環境でのみ実行できます');
      process.exit(1);
    }

    console.log('👤 ユーザーデータを投入しています...');
    // SQL文の生成（ユーザー）
    let sql =
      'INSERT INTO users (id, email, display_name, profile_image_url, hometown, expert_areas, bio, trust_score, created_at, updated_at) VALUES\n';

    users.forEach((user, index) => {
      sql += `('${user.id}', '${user.email}', '${user.displayName}', ${
        user.profileImageUrl ? `'${user.profileImageUrl}'` : 'NULL'
      }, `;
      sql += `${user.hometown ? `'${user.hometown}'` : 'NULL'}, `;
      sql += `${user.expertAreas ? `'${user.expertAreas}'` : 'NULL'}, `;
      sql += `${user.bio ? `'${user.bio}'` : 'NULL'}, `;
      sql += `${user.trustScore}, ${user.createdAt}, ${user.updatedAt})`;

      sql += index < users.length - 1 ? ',\n' : ';\n\n';
    });

    console.log('🗺️ スポットデータを投入しています...');
    // SQL文の生成（スポット）
    sql +=
      'INSERT INTO spots (id, name, description, latitude, longitude, address, user_id, hidden_gem_rating, special_experience, best_seasons, best_time_of_day, visit_count, save_count, created_at, updated_at) VALUES\n';

    spots.forEach((spot, index) => {
      sql += `('${spot.id}', '${spot.name}', '${spot.description}', '${spot.latitude}', '${spot.longitude}', `;
      sql += `${spot.address ? `'${spot.address}'` : 'NULL'}, '${spot.userId}', ${
        spot.hiddenGemRating
      }, `;
      sql += `${spot.specialExperience ? `'${spot.specialExperience}'` : 'NULL'}, `;
      sql += `${spot.bestSeasons ? `'${spot.bestSeasons}'` : 'NULL'}, `;
      sql += `${spot.bestTimeOfDay ? `'${spot.bestTimeOfDay}'` : 'NULL'}, `;
      sql += `${spot.visitCount}, ${spot.saveCount}, ${spot.createdAt}, ${spot.updatedAt})`;

      sql += index < spots.length - 1 ? ',\n' : ';\n\n';
    });

    console.log('🏷️ カテゴリデータを投入しています...');
    // SQL文の生成（カテゴリ）
    sql += 'INSERT INTO categories (id, name, description, icon_name) VALUES\n';

    CATEGORIES.forEach((category, index) => {
      sql += `('${category.id}', '${category.name}', '${category.description}', '${category.iconName}')`;
      sql += index < CATEGORIES.length - 1 ? ',\n' : ';\n\n';
    });

    console.log('🔗 スポットとカテゴリの関連データを投入しています...');
    // SQL文の生成（スポットカテゴリ）
    sql += 'INSERT INTO spot_categories (spot_id, category_id) VALUES\n';

    spotCategories.forEach((sc, index) => {
      sql += `('${sc.spotId}', '${sc.categoryId}')`;
      sql += index < spotCategories.length - 1 ? ',\n' : ';\n\n';
    });

    console.log('📸 写真データを投入しています...');
    // SQL文の生成（写真）
    sql += 'INSERT INTO photos (id, spot_id, url, caption, created_at) VALUES\n';

    photos.forEach((photo, index) => {
      sql += `('${photo.id}', '${photo.spotId}', '${photo.url}', `;
      sql += `${photo.caption ? `'${photo.caption}'` : 'NULL'}, ${photo.createdAt})`;
      sql += index < photos.length - 1 ? ',\n' : ';\n';
    });

    // SQLファイルを作成
    require('fs').writeFileSync(SEED_SQL_PATH, sql);

    // SQLを実行
    console.log('🔄 シードデータをデータベースに適用しています...');
    execSync(`npx wrangler d1 execute machipoke-db-dev --local --file=${SEED_SQL_PATH}`, {
      stdio: 'inherit',
    });

    console.log('✅ シードデータの投入が完了しました');
  } catch (error) {
    console.error('❌ シードデータの投入に失敗しました:', error);
    process.exit(1);
  }
}

main().catch(console.error);
