import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// マイグレーションディレクトリのパス
const MIGRATIONS_DIR = path.join(__dirname, '../migrations');

// スクリプトの実行
async function main() {
  console.log('🚀 マイグレーションを開始します...');

  try {
    // 先にスキーマからマイグレーションファイルを生成
    console.log('📄 マイグレーションファイルを生成しています...');
    execSync('npx drizzle-kit generate', { stdio: 'inherit' });

    // SQLファイルを取得
    const sqlFiles = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith('.sql'))
      .sort(); // 名前で並べ替え（通常は番号順になる）

    if (sqlFiles.length === 0) {
      console.log('📭 適用するマイグレーションがありません');
      return;
    }

    // 環境変数を確認
    const isDev = process.env.NODE_ENV !== 'production';

    // ローカル開発環境の場合
    if (isDev) {
      console.log('🔧 開発環境用のD1データベースを作成します...');
      try {
        // データベースが存在しない場合は作成
        execSync('npx wrangler d1 create machipoke-db-dev', { stdio: 'inherit' });
        console.log('✅ D1データベースを作成しました');
      } catch (error) {
        // データベースが既に存在する場合はエラーがスローされるが無視
        console.log('ℹ️ D1データベースは既に存在します');
      }

      // マイグレーションを実行
      console.log('🔄 マイグレーションを実行します...');
      for (const sqlFile of sqlFiles) {
        const filePath = path.join(MIGRATIONS_DIR, sqlFile);
        console.log(`🔨 適用中: ${sqlFile}`);

        // wranglerコマンドでSQLを実行
        execSync(`npx wrangler d1 execute machipoke-db-dev --local --file=${filePath}`, {
          stdio: 'inherit',
        });
      }

      console.log('✅ マイグレーションが完了しました');
    } else {
      // 本番環境の場合（デプロイ先のD1に適用）
      console.log('🔄 本番環境のマイグレーションを実行します...');

      // マイグレーションを実行
      for (const sqlFile of sqlFiles) {
        const filePath = path.join(MIGRATIONS_DIR, sqlFile);
        console.log(`🔨 適用中: ${sqlFile}`);

        // wranglerコマンドでSQLを実行（--local フラグなし）
        execSync(`npx wrangler d1 execute machipoke-db --file=${filePath}`, {
          stdio: 'inherit',
        });
      }

      console.log('✅ 本番環境のマイグレーションが完了しました');
    }
  } catch (error) {
    console.error('❌ マイグレーションに失敗しました:', error);
    process.exit(1);
  }
}

main().catch(console.error);
