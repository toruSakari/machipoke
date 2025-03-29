# マチポケ バックアップと復元ガイド

このドキュメントでは、マチポケプロジェクトのデータバックアップと災害復旧手順について説明します。

## 目次

1. [バックアップ戦略](#バックアップ戦略)
2. [データベース（D1）のバックアップ](#データベースd1のバックアップ)
3. [ストレージ（R2）のバックアップ](#ストレージr2のバックアップ)
4. [KVストアのバックアップ](#kvストアのバックアップ)
5. [コードベースのバックアップ](#コードベースのバックアップ)
6. [設定情報のバックアップ](#設定情報のバックアップ)
7. [定期バックアップの自動化](#定期バックアップの自動化)
8. [データ復元手順](#データ復元手順)
9. [災害復旧計画](#災害復旧計画)
10. [バックアップテスト](#バックアップテスト)
11. [トラブルシューティング](#トラブルシューティング)

## バックアップ戦略

マチポケでは以下のデータをバックアップします：

1. **データベース（Cloudflare D1）**：スポット情報、ユーザーデータなどの構造化データ
2. **画像ストレージ（Cloudflare R2）**：ユーザーがアップロードした画像
3. **キャッシュデータ（Cloudflare KV）**：一時的なキャッシュデータ
4. **コードベース**：アプリケーションコードとインフラ設定
5. **環境変数と設定情報**：API キーなどの設定情報

各環境（開発、ステージング、本番）でバックアップを取得し、次のスケジュールで実行します：

| データ種別 | 頻度 | 保持期間 |
|---------|------|-------|
| データベース（D1） | 日次 | 30日間 |
| 画像ストレージ（R2） | 週次 | 90日間 |
| KVストア | 週次 | 30日間 |
| コードベース | 変更毎 (コミット時) | 無期限 |
| 環境変数と設定 | 変更毎 | 1年間 |

## データベース（D1）のバックアップ

Cloudflare D1データベースのバックアップ手順を説明します。

### 手動バックアップ

Wrangler CLIを使用してD1データベースをエクスポートします：

```bash
# 本番環境のデータベースをエクスポート
npx wrangler d1 export machipoke-prod > backups/$(date +"%Y%m%d")-machipoke-prod.sql

# ステージング環境のデータベースをエクスポート
npx wrangler d1 export machipoke-staging > backups/$(date +"%Y%m%d")-machipoke-staging.sql

# 開発環境のデータベースをエクスポート
npx wrangler d1 export machipoke-dev > backups/$(date +"%Y%m%d")-machipoke-dev.sql
```

### 自動バックアップスクリプト

GitHub Actionsを使用した自動バックアップスクリプト例：

```yaml
# .github/workflows/backup-database.yml
name: Database Backup

on:
  schedule:
    # 毎日深夜3時に実行
    - cron: '0 3 * * *'
  workflow_dispatch: # 手動実行用

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install wrangler
        run: npm install -g wrangler
      - name: Create backup directory
        run: mkdir -p backups
      - name: Backup production database
        run: npx wrangler d1 export machipoke-prod > backups/$(date +"%Y%m%d")-machipoke-prod.sql
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      - name: Upload backup to R2 Storage
        run: |
          # バックアップファイル名を変数に保存
          BACKUP_FILE="backups/$(date +"%Y%m%d")-machipoke-prod.sql"
          
          # R2ストレージにアップロード
          npx wrangler r2 object put backups/database/$(date +"%Y%m%d")-machipoke-prod.sql --file="$BACKUP_FILE" --bucket=machipoke-backups
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      - name: Clean up old backups
        run: |
          # 30日以上前のバックアップを削除
          find backups -name "*-machipoke-prod.sql" -type f -mtime +30 -delete
```

## ストレージ（R2）のバックアップ

Cloudflare R2ストレージのバックアップ手順を説明します。

### 手動バックアップ

R2バケットの内容を別のバケットにコピーする方法：

```bash
# バックアップ用スクリプト

# バケット内の全オブジェクトリストを取得
npx wrangler r2 object list machipoke-images-prod --json > images-list.json

# 各オブジェクトをバックアップバケットにコピー
cat images-list.json | jq -r '.[].key' | while read -r key; do
  npx wrangler r2 object get machipoke-images-prod "$key" --file temp-file
  npx wrangler r2 object put "backups/images/$(date +"%Y%m%d")/$key" --file temp-file --bucket machipoke-backups
  rm temp-file
done
```

### 自動バックアップスクリプト

Pythonを使用した自動バックアップスクリプト例：

```python
# scripts/backup_r2.py

import os
import json
import subprocess
import datetime

def backup_r2_objects():
    today = datetime.datetime.now().strftime("%Y%m%d")
    backup_prefix = f"backups/images/{today}/"
    
    # 環境変数からAPIトークンを取得
    api_token = os.environ.get("CLOUDFLARE_API_TOKEN")
    if not api_token:
        raise ValueError("CLOUDFLARE_API_TOKEN environment variable is not set")
        
    # Wranglerでオブジェクト一覧を取得
    result = subprocess.run(
        ["npx", "wrangler", "r2", "object", "list", "machipoke-images-prod", "--json"],
        capture_output=True,
        text=True,
        env={**os.environ, "CLOUDFLARE_API_TOKEN": api_token}
    )
    
    if result.returncode != 0:
        raise RuntimeError(f"Failed to list objects: {result.stderr}")
    
    objects = json.loads(result.stdout)
    
    # 各オブジェクトをバックアップ
    for obj in objects:
        key = obj["key"]
        print(f"Backing up {key}...")
        
        # オブジェクトを取得
        get_result = subprocess.run(
            ["npx", "wrangler", "r2", "object", "get", "machipoke-images-prod", key, "--file", "temp-file"],
            capture_output=True,
            text=True,
            env={**os.environ, "CLOUDFLARE_API_TOKEN": api_token}
        )
        
        if get_result.returncode != 0:
            print(f"Warning: Failed to get object {key}: {get_result.stderr}")
            continue
        
        # バックアップバケットにプット
        put_result = subprocess.run(
            ["npx", "wrangler", "r2", "object", "put", f"{backup_prefix}{key}", "--file", "temp-file", "--bucket", "machipoke-backups"],
            capture_output=True,
            text=True,
            env={**os.environ, "CLOUDFLARE_API_TOKEN": api_token}
        )
        
        if put_result.returncode != 0:
            print(f"Warning: Failed to put object {key}: {put_result.stderr}")
        
        # 一時ファイルの削除
        os.remove("temp-file")

if __name__ == "__main__":
    backup_r2_objects()
```

### GitHub Actionsからの実行

```yaml
# .github/workflows/backup-images.yml
name: Backup R2 Images

on:
  schedule:
    # 毎週日曜日3時に実行
    - cron: '0 3 * * 0'
  workflow_dispatch: # 手動実行用

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install wrangler
        run: npm install -g wrangler
      - name: Run backup script
        run: python scripts/backup_r2.py
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

## KVストアのバックアップ

Cloudflare KVストアのバックアップ手順を説明します。

### 手動バックアップ

```bash
# KV名前空間のIDを取得
KV_NAMESPACE_ID=$(npx wrangler kv:namespace list | grep "MACHIPOKE_KV_PROD" | awk '{print $2}')

# KV全キーの一覧を取得
npx wrangler kv:key list --namespace-id=$KV_NAMESPACE_ID > kv-keys.json

# 各キーの値を取得し、JSONファイルにバックアップ
cat kv-keys.json | jq -c '.[]' | while read -r key_obj; do
  key=$(echo $key_obj | jq -r '.name')
  value=$(npx wrangler kv:key get --namespace-id=$KV_NAMESPACE_ID "$key")
  echo "{"key": "$key", "value": $value}" >> kv-backup-$(date +"%Y%m%d").json
done
```

### 自動バックアップスクリプト

JavaScriptを使用したKVバックアップスクリプト：

```javascript
// scripts/backup-kv.js
const { exec } = require('child_process');
const fs = require('fs');
const util = require('util');
const execPromise = util.promisify(exec);

async function backupKV() {
  try {
    // KV名前空間のIDを取得
    const { stdout: namespaceOutput } = await execPromise('npx wrangler kv:namespace list');
    const kvMatch = namespaceOutput.match(/MACHIPOKE_KV_PRODs+([a-f0-9]+)/);
    
    if (!kvMatch || !kvMatch[1]) {
      throw new Error('Could not find KV namespace ID');
    }
    
    const kvNamespaceId = kvMatch[1];
    console.log(`Found KV namespace ID: ${kvNamespaceId}`);
    
    // キー一覧を取得
    const { stdout: keysOutput } = await execPromise(`npx wrangler kv:key list --namespace-id=${kvNamespaceId}`);
    const keys = JSON.parse(keysOutput);
    
    // バックアップ用の配列
    const backupData = [];
    
    // 各キーの値を取得
    for (const keyObj of keys) {
      const key = keyObj.name;
      console.log(`Backing up key: ${key}`);
      
      try {
        const { stdout: valueOutput } = await execPromise(`npx wrangler kv:key get --namespace-id=${kvNamespaceId} "${key}"`);
        
        // 値がJSONかテキストか確認
        let value;
        try {
          value = JSON.parse(valueOutput);
        } catch {
          value = valueOutput;
        }
        
        backupData.push({ key, value });
      } catch (keyError) {
        console.error(`Error backing up key ${key}:`, keyError);
      }
    }
    
    // バックアップをファイルに保存
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const backupFileName = `kv-backup-${date}.json`;
    
    fs.writeFileSync(backupFileName, JSON.stringify(backupData, null, 2));
    console.log(`Backup saved to ${backupFileName}`);
    
    // R2にバックアップをアップロード
    await execPromise(`npx wrangler r2 object put backups/kv/${backupFileName} --file=${backupFileName} --bucket=machipoke-backups`);
    console.log(`Backup uploaded to R2`);
    
  } catch (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  }
}

backupKV();
```

## コードベースのバックアップ

コードベースは主にGitHubによってバックアップされます。さらに安全性を高めるためのバックアップ方法を説明します。

### GitHubリポジトリのバックアップ

```bash
# リポジトリをクローンし、全ブランチとタグを取得
git clone --mirror https://github.com/your-organization/machipoke.git machipoke-backup

# バックアップを圧縮
tar -czf machipoke-backup-$(date +"%Y%m%d").tar.gz machipoke-backup

# バックアップを別のストレージに保存する（例：R2）
npx wrangler r2 object put backups/code/machipoke-backup-$(date +"%Y%m%d").tar.gz --file=machipoke-backup-$(date +"%Y%m%d").tar.gz --bucket=machipoke-backups
```

### GitHub Actionsでの自動バックアップ

```yaml
# .github/workflows/backup-repository.yml
name: Backup Repository

on:
  schedule:
    # 毎月如1日に実行
    - cron: '0 0 1 * *'
  workflow_dispatch: # 手動実行用

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Clone repository (mirror)
        run: |
          git clone --mirror https://x-access-token:${{ secrets.GITHUB_TOKEN }}@github.com/${{ github.repository }}.git repo-backup
      - name: Create archive
        run: |
          tar -czf repo-backup-$(date +"%Y%m%d").tar.gz repo-backup
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install wrangler
        run: npm install -g wrangler
      - name: Upload to R2
        run: |
          npx wrangler r2 object put backups/code/repo-backup-$(date +"%Y%m%d").tar.gz --file=repo-backup-$(date +"%Y%m%d").tar.gz --bucket=machipoke-backups
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

## 設定情報のバックアップ

環境変数やAPIキーなどの設定情報をバックアップする手順を説明します。

### 手動バックアップ

```bash
# Cloudflareの環境変数をバックアップ

# 本番環境のシークレット一覧を取得
npx wrangler secret list --env=production > secrets-prod-$(date +"%Y%m%d").txt

# GitHubのリポジトリシークレットや変数は、GitHub APIを使用してバックアップ
# （注意：実際のシークレット値はAPIから取得できないため、別途管理が必要）
```

### 環境変数管理ツール

安全なシークレット管理のために、HashiCorp VaultやAWS Secrets Managerなどのシークレット管理サービスを使用することも検討してください。これらのサービスは、シークレットのバージョン管理と自動バックアップ機能を提供します。

## 定期バックアップの自動化

すべてのバックアップスクリプトを自動化するための包括的なシステムを作成します。

### マスターバックアップワークフロー

```yaml
# .github/workflows/master-backup.yml
name: Master Backup

on:
  schedule:
    # 毎日深夜2時に実行
    - cron: '0 2 * * *'
  workflow_dispatch: # 手動実行用

jobs:
  backup-database:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install wrangler
        run: npm install -g wrangler
      - name: Daily Database Backup
        run: |
          mkdir -p backups
          TIMESTAMP=$(date +\"%Y%m%d-%H%M%S\")
          npx wrangler d1 export machipoke-prod > backups/machipoke-prod-${TIMESTAMP}.sql
          # バックアップをR2に保存
          npx wrangler r2 object put backups/database/machipoke-prod-${TIMESTAMP}.sql --file=backups/machipoke-prod-${TIMESTAMP}.sql --bucket=machipoke-backups
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

  weekly-storage-backup:
    runs-on: ubuntu-latest
    # 毎週日曜日のみ実行
    if: github.event_name == 'schedule' && github.event.schedule == '0 2 * * 0'
    steps:
      - uses: actions/checkout@v3
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          npm install -g wrangler
          pip install requests
      - name: Weekly R2 Storage Backup
        run: python scripts/backup_r2.py
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

  weekly-kv-backup:
    runs-on: ubuntu-latest
    # 毎週日曜日のみ実行
    if: github.event_name == 'schedule' && github.event.schedule == '0 2 * * 0'
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install -g wrangler
      - name: Weekly KV Backup
        run: node scripts/backup-kv.js
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

  monthly-code-backup:
    runs-on: ubuntu-latest
    # 毎月如1日のみ実行
    if: github.event_name == 'schedule' && github.event.schedule == '0 2 1 * *'
    steps:
      - name: Clone repository (mirror)
        run: |
          git clone --mirror https://x-access-token:${{ secrets.GITHUB_TOKEN }}@github.com/${{ github.repository }}.git repo-backup
      - name: Create archive
        run: |
          TIMESTAMP=$(date +\"%Y%m%d-%H%M%S\")
          tar -czf repo-backup-${TIMESTAMP}.tar.gz repo-backup
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install wrangler
        run: npm install -g wrangler
      - name: Upload to R2
        run: |
          TIMESTAMP=$(date +\"%Y%m%d-%H%M%S\")
          npx wrangler r2 object put backups/code/repo-backup-${TIMESTAMP}.tar.gz --file=repo-backup-${TIMESTAMP}.tar.gz --bucket=machipoke-backups
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

  cleanup-old-backups:
    runs-on: ubuntu-latest
    needs: [backup-database, weekly-storage-backup, weekly-kv-backup, monthly-code-backup]
    if: always()
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install -g wrangler
      - name: Cleanup old backups
        run: node scripts/cleanup-backups.js
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

## データ復元手順

バックアップからデータを復元する手順を説明します。

### データベース（D1）の復元

```bash
# R2からバックアップファイルを取得
npx wrangler r2 object get backups/database/machipoke-prod-20230901.sql --file=restore-machipoke-prod.sql --bucket=machipoke-backups

# データベースを復元
npx wrangler d1 import machipoke-prod ./restore-machipoke-prod.sql
```

### ストレージ（R2）の復元

R2オブジェクトの復元スクリプト：

```python
# scripts/restore_r2.py

import os
import json
import subprocess
import argparse

def restore_r2_objects(backup_date):
    backup_prefix = f\"backups/images/{backup_date}/\"
    
    # 環境変数からAPIトークンを取得
    api_token = os.environ.get(\"CLOUDFLARE_API_TOKEN\")
    if not api_token:
        raise ValueError(\"CLOUDFLARE_API_TOKEN environment variable is not set\")
        
    # バックアップ一覧を取得
    result = subprocess.run(
        [\"npx\", \"wrangler\", \"r2\", \"object\", \"list\", \"machipoke-backups\", \"--prefix\", backup_prefix, \"--json\"],
        capture_output=True,
        text=True,
        env={**os.environ, \"CLOUDFLARE_API_TOKEN\": api_token}
    )
    
    if result.returncode != 0:
        raise RuntimeError(f\"Failed to list backup objects: {result.stderr}\")
    
    objects = json.loads(result.stdout)
    
    # 各オブジェクトを復元
    for obj in objects:
        key = obj[\"key\"]
        destination_key = key.replace(backup_prefix, \"\")
        print(f\"Restoring {key} to {destination_key}...\")
        
        # バックアップからオブジェクトを取得
        get_result = subprocess.run(
            [\"npx\", \"wrangler\", \"r2\", \"object\", \"get\", \"machipoke-backups\", key, \"--file\", \"temp-file\"],
            capture_output=True,
            text=True,
            env={**os.environ, \"CLOUDFLARE_API_TOKEN\": api_token}
        )
        
        if get_result.returncode != 0:
            print(f\"Warning: Failed to get object {key}: {get_result.stderr}\")
            continue
        
        # 本番バケットに復元
        put_result = subprocess.run(
            [\"npx\", \"wrangler\", \"r2\", \"object\", \"put\", destination_key, \"--file\", \"temp-file\", \"--bucket\", \"machipoke-images-prod\"],
            capture_output=True,
            text=True,
            env={**os.environ, \"CLOUDFLARE_API_TOKEN\": api_token}
        )
        
        if put_result.returncode != 0:
            print(f\"Warning: Failed to restore object {destination_key}: {put_result.stderr}\")
        
        # 一時ファイルの削除
        os.remove(\"temp-file\")

if __name__ == \"__main__\":
    parser = argparse.ArgumentParser(description='Restore R2 objects from backup')
    parser.add_argument('backup_date', help='Backup date in YYYYMMDD format')
    args = parser.parse_args()
    
    restore_r2_objects(args.backup_date)
```

### KVストアの復元

```javascript
// scripts/restore-kv.js
const { exec } = require('child_process');
const fs = require('fs');
const util = require('util');
const execPromise = util.promisify(exec);

async function restoreKV(backupDate) {
  try {
    // バックアップファイルをR2から取得
    const backupFileName = `kv-backup-${backupDate}.json`;
    await execPromise(`npx wrangler r2 object get backups/kv/${backupFileName} --file=${backupFileName} --bucket=machipoke-backups`);
    
    console.log(`Retrieved backup file: ${backupFileName}`);
    
    // KV名前空間のIDを取得
    const { stdout: namespaceOutput } = await execPromise('npx wrangler kv:namespace list');
    const kvMatch = namespaceOutput.match(/MACHIPOKE_KV_PROD\\s+([a-f0-9]+)/);
    
    if (!kvMatch || !kvMatch[1]) {
      throw new Error('Could not find KV namespace ID');
    }
    
    const kvNamespaceId = kvMatch[1];
    console.log(`Found KV namespace ID: ${kvNamespaceId}`);
    
    // バックアップファイルを読み込み
    const backupData = JSON.parse(fs.readFileSync(backupFileName, 'utf8'));
    
    // 各キーを復元
    for (const { key, value } of backupData) {
      console.log(`Restoring key: ${key}`);
      
      // 値がオブジェクトか文字列かを確認
      const valueStr = typeof value === 'object' ? JSON.stringify(value) : value;
      
      // 一時ファイルに書き出し
      fs.writeFileSync('temp-value.txt', valueStr);
      
      // KVに書き込み
      await execPromise(`npx wrangler kv:key put --namespace-id=${kvNamespaceId} \"${key}\" --path=temp-value.txt`);
      
      // 一時ファイルの削除
      fs.unlinkSync('temp-value.txt');
    }
    
    console.log('KV restoration completed successfully');
    
  } catch (error) {
    console.error('Restoration failed:', error);
    process.exit(1);
  }
}

// コマンドライン引数からバックアップ日付を取得
const backupDate = process.argv[2];
if (!backupDate || !/^\\d{8}$/.test(backupDate)) {
  console.error('Please provide a valid backup date in YYYYMMDD format');
  process.exit(1);
}

restoreKV(backupDate);
```

## 災害復旧計画

災害時や重大な障害時にシステムを復元する手順を詳細に説明します。

### 復旧プロセス

1. **状況の評価**
   - 障害の種類と影響範囲の特定
   - 復旧に必要なリソースの見積もり

2. **復旧チームの結成**
   - 復旧責任者の指定
   - 影響を受けたステークホルダーへの通知

3. **バックアップからの復元**
   - 適切なバックアップポイントの選択
   - 各コンポーネントの復元手順の実行

4. **システムの検証**
   - 復元したシステムの動作確認
   - データ整合性の確認

5. **本番環境への移行**
   - トラフィックの切り替え
   - 最終動作確認

### 復旧時間目標（RTO）と復旧ポイント目標（RPO）

| 環境 | RTO（復旧時間目標） | RPO（復旧ポイント目標） |
|--------|-----------------|------------------|
| 本番 | 4時間以内 | 24時間以内 |
| ステージング | 8時間以内 | 48時間以内 |
| 開発 | 24時間以内 | 1週間以内 |

### 障害復旧手順スクリプト

```bash
#!/bin/bash
# disaster_recovery.sh - マチポケの障害復旧手順

# 復旧するバックアップの日付
BACKUP_DATE=\"$1\"

if [ -z \"$BACKUP_DATE\" ]; then
  echo \"Usage: $0 YYYYMMDD\"
  exit 1
fi

echo \"Starting disaster recovery process using backup from $BACKUP_DATE\"

# 1. データベースの復元
echo \"Restoring database...\"
npx wrangler r2 object get backups/database/machipoke-prod-${BACKUP_DATE}.sql --file=restore-machipoke-prod.sql --bucket=machipoke-backups
npx wrangler d1 import machipoke-prod ./restore-machipoke-prod.sql

# 2. KVストアの復元
echo \"Restoring KV store...\"
node scripts/restore-kv.js $BACKUP_DATE

# 3. R2ストレージの復元
echo \"Restoring R2 storage...\"
python scripts/restore_r2.py $BACKUP_DATE

# 4. システムの検証
echo \"Verifying system integrity...\"
# テストスクリプト例：

```bash
#!/bin/bash
# test_backup_recovery.sh - バックアップと復元プロセスのテスト

# 仕様に基づいてテスト環境を作成

# テスト用DBのセットアップ
echo "Setting up test database..."
npx wrangler d1 create machipoke-test

# テストデータの投入
echo "Inserting test data..."
npx wrangler d1 execute machipoke-test --command="CREATE TABLE test_table (id TEXT PRIMARY KEY, name TEXT, created_at INTEGER)"
npx wrangler d1 execute machipoke-test --command="INSERT INTO test_table (id, name, created_at) VALUES ('1', 'Test Data 1', $(date +%s))"
npx wrangler d1 execute machipoke-test --command="INSERT INTO test_table (id, name, created_at) VALUES ('2', 'Test Data 2', $(date +%s))"

# バックアップの実行
echo "Creating backup..."
npx wrangler d1 export machipoke-test > test-backup.sql

# データの破損をシミュレート
echo "Simulating data corruption..."
npx wrangler d1 execute machipoke-test --command="DELETE FROM test_table WHERE id = '1'"

# 破損後の状態を確認
echo "Verifying data corruption..."
COUNT=$(npx wrangler d1 execute machipoke-test --command="SELECT COUNT(*) as count FROM test_table" --json | jq '.[0].count')
if [ "$COUNT" -ne 1 ]; then
  echo "Corruption verified: Only $COUNT records found instead of 2"
else
  echo "Corruption simulation failed"
  exit 1
fi

# バックアップからの復元
echo "Restoring from backup..."
npx wrangler d1 import machipoke-test ./test-backup.sql

# 復元結果の検証
echo "Verifying restoration..."
COUNT=$(npx wrangler d1 execute machipoke-test --command="SELECT COUNT(*) as count FROM test_table" --json | jq '.[0].count')
if [ "$COUNT" -eq 2 ]; then
  echo "TEST PASSED: Backup and recovery successful. Found $COUNT records as expected."
else
  echo "TEST FAILED: Recovery unsuccessful. Found $COUNT records instead of 2."
  exit 1
fi

# クリーンアップ
echo "Cleaning up test environment..."
npx wrangler d1 delete machipoke-test --confirmed
rm test-backup.sql

echo "Backup and recovery test completed."
```

## トラブルシューティング

バックアップと復元の過程で発生する可能性のある問題とその解決方法を説明します。

### バックアップの問題

| 問題 | 原因 | 解決方法 |
|---------|------|--------|
| バックアップ失敗 | APIトークンの権限不足 | APIトークンの権限を確認し、必要に応じて更新 |
| バックアップの時間が長い | データ量が多い | 差分バックアップストラテジーを実装 |
| 破損したバックアップ | ストレージの問題や転送エラー | 定期的なバックアップバリデーションと冗長バックアップの保持 |

### 復元の問題

| 問題 | 原因 | 解決方法 |
|---------|------|--------|
| 復元失敗 | バックアップファイルが見つからない | 正しいパスとファイル名を確認、列挙コマンドで確認 |
| データ整合性の問題 | 部分的な復元で不整合が発生 | すべてのコンポーネントを同じポイントに復元 |
| 権限の問題 | 復元環境の権限が不足 | 復元前に権限を確認、必要に応じて権限を付与 |

### トラブルシューティングステップ

1. **バックアップファイルの確認**
   ```bash
   # R2バケットのバックアップ一覧を確認
   npx wrangler r2 object list machipoke-backups --prefix="backups/database/" --delimiter="/"
   ```

2. **バックアップの整合性チェック**
   ```bash
   # SQLiteバックアップファイルの整合性チェック
   npx wrangler r2 object get backups/database/machipoke-prod-20230901.sql --file=check-backup.sql --bucket=machipoke-backups
   sqlite3 :memory: ".read check-backup.sql" ".tables"
   ```

3. **復元プロセスのデバッグ**
   ```bash
   # ベルボーズモードで復元スクリプトを実行
   bash -x disaster_recovery.sh 20230901
   ```

4. **部分的な復元テスト**
   ```bash
   # データベースのみ復元してチェック
   npx wrangler r2 object get backups/database/machipoke-prod-20230901.sql --file=restore-test.sql --bucket=machipoke-backups
   npx wrangler d1 import machipoke-test ./restore-test.sql
   ```

## 付録: クリーンアップスクリプト

古いバックアップを自動的に削除するスクリプト例：

```javascript
// scripts/cleanup-backups.js
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function cleanupOldBackups() {
  try {
    console.log('Starting backup cleanup process...');
    
    // 現在の日付のミリ秒タイムスタンプを取得
    const now = Date.now();
    
    // 保持期間の設定（ミリ秒）
    const RETENTION_PERIODS = {
      database: 30 * 24 * 60 * 60 * 1000, // 30日
      images: 90 * 24 * 60 * 60 * 1000,  // 90日
      kv: 30 * 24 * 60 * 60 * 1000,      // 30日
      code: 365 * 24 * 60 * 60 * 1000,   // 1年
    };
    
    // 各バックアップタイプごとにクリーンアップ
    for (const [type, retentionPeriod] of Object.entries(RETENTION_PERIODS)) {
      console.log(`Processing ${type} backups...`);
      
      // バックアップ一覧を取得
      const { stdout } = await execPromise(`npx wrangler r2 object list machipoke-backups --prefix="backups/${type}/" --json`);
      const objects = JSON.parse(stdout);
      
      // 各バックアップオブジェクトを処理
      for (const obj of objects) {
        // ファイル名から日付を抽出するための正規表現
        const dateMatch = obj.key.match(/(\d{8})/); // YYYYMMDD形式の日付を検索
        
        if (!dateMatch) {
          console.log(`Could not extract date from ${obj.key}, skipping...`);
          continue;
        }
        
        // ファイルの日付をタイムスタンプに変換
        const dateStr = dateMatch[1];
        const year = parseInt(dateStr.substring(0, 4));
        const month = parseInt(dateStr.substring(4, 6)) - 1; // 月は0から11
        const day = parseInt(dateStr.substring(6, 8));
        
        const fileDate = new Date(year, month, day).getTime();
        
        // 保持期間を過ぎたファイルを削除
        if (now - fileDate > retentionPeriod) {
          console.log(`Deleting old backup: ${obj.key} (${new Date(fileDate).toISOString().split('T')[0]})`);
          
          await execPromise(`npx wrangler r2 object delete machipoke-backups ${obj.key}`);
          console.log(`Deleted ${obj.key}`);
        }
      }
    }
    
    console.log('Backup cleanup completed successfully.');
    
  } catch (error) {
    console.error('Backup cleanup failed:', error);
    process.exit(1);
  }
}

cleanupOldBackups();
```

## まとめ

このドキュメントでは、マチポケプロジェクトのデータ保護に関する包括的な戦略と手順を説明しました。定期的なバックアップ、正確な復元プロセス、および定期的なテストにより、システムの信頼性と可用性を確保します。

バックアップと復旧のプロセスは定期的に見直し、プロジェクトの成長に合わせて、必要に応じて更新してください。リプトを実行

echo \"Disaster recovery process completed\"
```

## バックアップテスト

バックアップと復元プロセスを定期的にテストする手順を説明します。

### テスト計画

1. **四半期テスト**
   - 3ヶ月ごとに完全な復旧テストを実施
   - 結果を文書化し、問題点を特定して改善

2. **月次テスト**
   - 毎月、サンプルデータでバックアップと復元をテスト
   - ネガティブテスト（意図的なファイル破損など）も実施

3. **自動化テスト**
   - バックアップファイルの存在と整合性を確認する自動チェックを実装
   - 結果をチームに自動通知

### テストスクリプ