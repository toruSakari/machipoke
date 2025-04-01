import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// マイグレーションディレクトリのパス
const MIGRATIONS_DIR = path.join(__dirname, '../migrations');

// スクリプトの実行
async function main() {
  console.log('📊 マイグレーションステータスを確認しています...');

  try {
    // SQLファイルを取得
    const sqlFiles = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith('.sql'))
      .sort(); // 名前で並べ替え

    if (sqlFiles.length === 0) {
      console.log('📭 マイグレーションファイルが存在しません');
      return;
    }

    console.log(`📋 合計 ${sqlFiles.length} 件のマイグレーションファイル:`);

    // 各マイグレーションファイルの情報を表示
    sqlFiles.forEach((sqlFile, index) => {
      const filePath = path.join(MIGRATIONS_DIR, sqlFile);
      const stats = fs.statSync(filePath);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const statementCount = (fileContent.match(/;/g) || []).length;

      console.log(`${index + 1}. ${sqlFile}`);
      console.log(`   作成日時: ${stats.mtime.toLocaleString()}`);
      console.log(`   サイズ: ${stats.size} バイト`);
      console.log(`   SQLステートメント数: ${statementCount}`);
      console.log('-------------------------');
    });

    // 環境変数を確認
    const isDev = process.env.NODE_ENV !== 'production';

    // データベースの状態を確認
    console.log('🔍 データベースの状態を確認しています...');

    try {
      // マイグレーションテーブルの存在確認
      const dbName = isDev ? 'machipoke-db-dev' : 'machipoke-db';
      const result = execSync(
        `npx wrangler d1 execute ${dbName} ${
          isDev ? '--local' : ''
        } --command="SELECT name FROM sqlite_master WHERE type='table' AND name='migrations';"`,
        { encoding: 'utf8' }
      );

      if (result.includes('migrations')) {
        // 適用済みマイグレーションの確認
        const migrationsResult = execSync(
          `npx wrangler d1 execute ${dbName} ${
            isDev ? '--local' : ''
          } --command="SELECT name, applied_at FROM migrations ORDER BY applied_at;"`,
          { encoding: 'utf8' }
        );

        console.log('✅ 適用済みマイグレーション:');
        console.log(migrationsResult);
      } else {
        console.log(
          '❓ migrationsテーブルが見つかりません。マイグレーションがまだ実行されていない可能性があります。'
        );
      }
    } catch (error) {
      console.error('❌ データベースの状態確認に失敗しました:', error);
    }
  } catch (error) {
    console.error('❌ マイグレーションステータスの確認に失敗しました:', error);
    process.exit(1);
  }
}

main().catch(console.error);
