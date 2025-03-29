# マチポケ CI/CD詳細設定ガイド

このドキュメントでは、マチポケプロジェクトのCI/CD（継続的インテグレーション/継続的デプロイメント）パイプラインの詳細な設定方法について説明します。

## 目次

1. [CI/CD概要](#cicd概要)
2. [GitHub Actionsの設定](#github-actionsの設定)
3. [環境別のワークフロー](#環境別のワークフロー)
4. [テスト自動化](#テスト自動化)
5. [デプロイメント自動化](#デプロイメント自動化)
6. [シークレットと環境変数](#シークレットと環境変数)
7. [品質チェック](#品質チェック)
8. [通知設定](#通知設定)
9. [パイプラインのモニタリング](#パイプラインのモニタリング)
10. [トラブルシューティング](#トラブルシューティング)

## CI/CD概要

マチポケプロジェクトでは、GitHub Actionsを使用してCI/CDパイプラインを構築しています。このパイプラインにより、以下のプロセスを自動化しています：

1. コードの検証（リント、型チェック）
2. テストの実行（単体テスト、統合テスト）
3. ビルドプロセス
4. 環境別のデプロイメント
5. 品質チェック

### CI/CDフロー図

```
コードプッシュ/PR → コード検証 → テスト → ビルド → デプロイ → 通知
```

### ブランチ戦略とデプロイ先

| ブランチ | イベント | デプロイ先 | 説明 |
|---------|--------|----------|------|
| `develop` | プッシュ | 開発環境 | 開発中の機能テスト用 |
| `release/*` | プッシュ | ステージング環境 | リリース前の検証用 |
| `main` | プッシュ | 本番環境 | 本番リリース用 |

## GitHub Actionsの設定

GitHub Actionsのワークフローは、リポジトリの`.github/workflows/`ディレクトリに設定ファイルを配置することで定義します。

### メインワークフロー設定

プロジェクトのルートディレクトリに`.github/workflows/main.yml`ファイルを作成します：

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop, 'release/**' ]
  pull_request:
    branches: [ main, develop ]

jobs:
  validate:
    name: Validate Code
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run linting
        run: npm run lint
      - name: Check types
        run: npm run typecheck

  test:
    name: Run Tests
    needs: validate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run unit tests
        run: npm run test:unit
      - name: Run integration tests
        run: npm run test:integration
  
  build:
    name: Build
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build client
        run: npm run build:client
      - name: Build server
        run: npm run build:server
      - name: Upload client artifacts
        uses: actions/upload-artifact@v3
        with:
          name: client-dist
          path: packages/client/dist
      - name: Upload server artifacts
        uses: actions/upload-artifact@v3
        with:
          name: server-dist
          path: packages/server/dist

  deploy-development:
    name: Deploy to Development
    if: github.ref == 'refs/heads/develop'
    needs: build
    runs-on: ubuntu-latest
    environment: development
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Download client artifacts
        uses: actions/download-artifact@v3
        with:
          name: client-dist
          path: packages/client/dist
      - name: Download server artifacts
        uses: actions/download-artifact@v3
        with:
          name: server-dist
          path: packages/server/dist
      - name: Deploy client to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: machipoke-frontend
          directory: ./packages/client/dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
          branch: develop
      - name: Deploy server to Cloudflare Workers
        working-directory: ./packages/server
        run: npx wrangler deploy --env=development
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

  deploy-staging:
    name: Deploy to Staging
    if: startsWith(github.ref, 'refs/heads/release/')
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Download client artifacts
        uses: actions/download-artifact@v3
        with:
          name: client-dist
          path: packages/client/dist
      - name: Download server artifacts
        uses: actions/download-artifact@v3
        with:
          name: server-dist
          path: packages/server/dist
      - name: Deploy client to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: machipoke-frontend
          directory: ./packages/client/dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
          branch: staging
      - name: Deploy server to Cloudflare Workers
        working-directory: ./packages/server
        run: npx wrangler deploy --env=staging
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

  deploy-production:
    name: Deploy to Production
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Download client artifacts
        uses: actions/download-artifact@v3
        with:
          name: client-dist
          path: packages/client/dist
      - name: Download server artifacts
        uses: actions/download-artifact@v3
        with:
          name: server-dist
          path: packages/server/dist
      - name: Deploy client to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: machipoke-frontend
          directory: ./packages/client/dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
          branch: main
      - name: Deploy server to Cloudflare Workers
        working-directory: ./packages/server
        run: npx wrangler deploy --env=production
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

  notify:
    name: Send Notification
    needs: [deploy-development, deploy-staging, deploy-production]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - name: Send Slack notification
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          fields: repo,message,commit,author,action,eventName,ref,workflow
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        if: always()
```

## 環境別のワークフロー

環境ごとに異なるワークフローを設定する場合は、個別のYAMLファイルを作成することもできます。

### 開発環境用ワークフロー

`.github/workflows/development.yml`：

```yaml
name: Development CI/CD

on:
  push:
    branches: [ develop ]
  pull_request:
    branches: [ develop ]

jobs:
  # 開発環境専用のジョブ設定
  # ...
```

### ステージング環境用ワークフロー

`.github/workflows/staging.yml`：

```yaml
name: Staging CI/CD

on:
  push:
    branches: [ 'release/**' ]

jobs:
  # ステージング環境専用のジョブ設定
  # ...
```

### 本番環境用ワークフロー

`.github/workflows/production.yml`：

```yaml
name: Production CI/CD

on:
  push:
    branches: [ main ]

jobs:
  # 本番環境専用のジョブ設定（追加の承認プロセスなど）
  # ...
```

## テスト自動化

### 単体テスト設定

単体テストをCI/CDパイプラインに組み込む手順:

1. テスト実行用のジョブを設定:

```yaml
test-unit:
  name: Unit Tests
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Run unit tests
      run: npm run test:unit
    - name: Upload test coverage
      uses: actions/upload-artifact@v3
      with:
        name: coverage-report
        path: coverage/
```

2. `package.json`のテストスクリプト設定:

```json
"scripts": {
  "test:unit": "vitest run --coverage",
  "test:unit:watch": "vitest"
}
```

### 統合テスト設定

Miniflare（Cloudflare Workersエミュレーター）を使用した統合テスト設定:

```yaml
test-integration:
  name: Integration Tests
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Run integration tests
      run: npm run test:integration
    - name: Upload test logs
      uses: actions/upload-artifact@v3
      with:
        name: integration-test-logs
        path: logs/
      if: always()
```

### E2Eテスト設定（Playwright）

Playwright を使用したE2Eテスト設定:

```yaml
test-e2e:
  name: E2E Tests
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Install Playwright
      run: npx playwright install --with-deps
    - name: Build app
      run: npm run build
    - name: Start app in background
      run: npm run start:test &
    - name: Wait for app to start
      run: npx wait-on http://localhost:3000
    - name: Run E2E tests
      run: npm run test:e2e
    - name: Upload Playwright report
      uses: actions/upload-artifact@v3
      with:
        name: playwright-report
        path: playwright-report/
      if: always()
```

## デプロイメント自動化

### Cloudflare Pages デプロイ設定

フロントエンドをCloudflare Pagesにデプロイする詳細設定:

```yaml
deploy-frontend:
  name: Deploy Frontend
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Build frontend
      working-directory: ./packages/client
      run: npm run build
    - name: Deploy to Cloudflare Pages
      uses: cloudflare/pages-action@v1
      with:
        apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        projectName: machipoke-frontend
        directory: ./packages/client/dist
        gitHubToken: ${{ secrets.GITHUB_TOKEN }}
        # 環境変数の設定
        env:
          - name: API_URL
            value: ${{ vars.API_URL }}
          - name: MAPBOX_ACCESS_TOKEN
            value: ${{ secrets.MAPBOX_ACCESS_TOKEN }}
```

### Cloudflare Workers デプロイ設定

バックエンドをCloudflare Workersにデプロイする詳細設定:

```yaml
deploy-backend:
  name: Deploy Backend
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Build backend
      working-directory: ./packages/server
      run: npm run build
    - name: Deploy to Cloudflare Workers
      working-directory: ./packages/server
      run: |
        # 環境に応じたデプロイ先を設定
        if [[ "${{ github.ref }}" == "refs/heads/main" ]]; then
          ENV="production"
        elif [[ "${{ github.ref }}" == "refs/heads/release/"* ]]; then
          ENV="staging"
        else
          ENV="development"
        fi
        
        echo "Deploying to $ENV environment..."
        npx wrangler deploy --env=$ENV
      env:
        CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

### データベースマイグレーション

デプロイ時にデータベースマイグレーションを実行する設定:

```yaml
database-migration:
  name: Run Database Migrations
  runs-on: ubuntu-latest
  needs: build
  steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Apply migrations to development
      if: github.ref == 'refs/heads/develop'
      run: npx wrangler d1 migrations apply machipoke-dev
      env:
        CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    - name: Apply migrations to staging
      if: startsWith(github.ref, 'refs/heads/release/')
      run: npx wrangler d1 migrations apply machipoke-staging
      env:
        CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    - name: Apply migrations to production
      if: github.ref == 'refs/heads/main'
      run: npx wrangler d1 migrations apply machipoke-prod
      env:
        CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

## シークレットと環境変数

GitHub Actionsのシークレットと環境変数の管理方法：

### シークレットの設定

GitHubリポジトリの設定ページで、以下のシークレットを設定します：

1. リポジトリ設定ページを開く（`Settings` > `Secrets and variables` > `Actions`）
2. `New repository secret`をクリック
3. 以下のシークレットを追加：

| シークレット名 | 説明 |
|--------------|------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare APIトークン |
| `CLOUDFLARE_ACCOUNT_ID` | CloudflareアカウントのアカウントID |
| `MAPBOX_ACCESS_TOKEN` | Mapbox APIトークン |
| `SLACK_WEBHOOK_URL` | Slack通知用のWebhook URL |

### 環境変数の設定

リポジトリの環境変数も同様に設定します：

1. リポジトリ設定ページを開く（`Settings` > `Secrets and variables` > `Actions`）
2. `Variables`タブを選択
3. `New repository variable`をクリック
4. 以下の変数を追加：

| 変数名 | 説明 |
|-------|------|
| `API_URL` | バックエンドAPIのURL（環境ごとに異なる） |
| `IMAGE_CDN_URL` | 画像配信用CDN URL |

### 環境別変数の設定

環境ごとに異なる変数を設定する場合は、GitHub Environmentsを使用します：

1. リポジトリ設定ページを開く（`Settings` > `Environments`）
2. 各環境（`development`, `staging`, `production`）を作成
3. 各環境に固有のシークレットと変数を設定

## 品質チェック

コード品質を向上させるための自動チェック：

### ESLintとPrettier

```yaml
lint:
  name: Lint Code
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Lint code
      run: npm run lint
    - name: Check formatting
      run: npm run format:check
```

### コードカバレッジレポート

```yaml
code-coverage:
  name: Code Coverage
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Run tests with coverage
      run: npm run test:coverage
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        token: ${{ secrets.CODECOV_TOKEN }}
        directory: ./coverage
        flags: unittests
        fail_ci_if_error: true
```

### 依存関係チェック

```yaml
dependency-review:
  name: Dependency Review
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Dependency Review
      uses: actions/dependency-review-action@v2
```

## 通知設定

CI/CDパイプラインの結果を通知するための設定：

### Slack通知

```yaml
slack-notification:
  name: Send Slack Notification
  runs-on: ubuntu-latest
  needs: [deploy-frontend, deploy-backend]
  if: always()
  steps:
    - name: Send Slack Success Message
      if: ${{ !contains(needs.*.result, 'failure') }}
      uses: 8398a7/action-slack@v3
      with:
        status: custom
        fields: workflow,job,commit,repo,ref,author,took
        custom_payload: |
          {
            "attachments": [
              {
                "color": "good",
                "blocks": [
                  {
                    "type": "section",
                    "text": {
                      "type": "mrkdwn",
                      "text": ":white_check_mark: *デプロイ成功*\n*${{ github.workflow }}*\nリポジトリ: ${{ github.repository }}\nブランチ: ${{ github.ref_name }}\nコミット: ${{ github.sha }}\n作者: ${{ github.actor }}"
                    }
                  }
                ]
              }
            ]
          }
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        
    - name: Send Slack Failure Message
      if: ${{ contains(needs.*.result, 'failure') }}
      uses: 8398a7/action-slack@v3
      with:
        status: custom
        fields: workflow,job,commit,repo,ref,author,took
        custom_payload: |
          {
            "attachments": [
              {
                "color": "danger",
                "blocks": [
                  {
                    "type": "section",
                    "text": {
                      "type": "mrkdwn",
                      "text": ":x: *デプロイ失敗*\n*${{ github.workflow }}*\nリポジトリ: ${{ github.repository }}\nブランチ: ${{ github.ref_name }}\nコミット: ${{ github.sha }}\n作者: ${{ github.actor }}"
                    }
                  }
                ]
              }
            ]
          }
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### メール通知

```yaml
email-notification:
  name: Send Email Notification
  runs-on: ubuntu-latest
  needs: [deploy-frontend, deploy-backend]
  if: failure()
  steps:
    - name: Send mail
      uses: dawidd6/action-send-mail@v3
      with:
        server_address: smtp.gmail.com
        server_port: 465
        username: ${{ secrets.EMAIL_USERNAME }}
        password: ${{ secrets.EMAIL_PASSWORD }}
        subject: GitHub Actions Deploy Failed
        to: team@example.com
        from: GitHub Actions
        body: |
          デプロイが失敗しました。
          
          ワークフロー: ${{ github.workflow }}
          リポジトリ: ${{ github.repository }}
          ブランチ: ${{ github.ref_name }}
          コミット: ${{ github.sha }}
          作者: ${{ github.actor }}
          
          詳細はGitHub Actionsのログを確認してください。
```

## パイプラインのモニタリング

CI/CDパイプラインのモニタリングと分析：

### ワークフロー実行時間の最適化

ジョブの実行時間を短縮するためのテクニック：

1. **キャッシュの活用**：依存パッケージやビルド結果をキャッシュする

```yaml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-npm-
```

2. **マトリックスビルド**：複数の環境で並列テストを実行

```yaml
test:
  runs-on: ubuntu-latest
  strategy:
    matrix:
      node-version: [16.x, 18.x]
  steps:
    - uses: actions/checkout@v3
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
```

### デプロイ履歴の追跡

デプロイ履歴を記録し、監査できるように設定:

```yaml
record-deployment:
  name: Record Deployment
  runs-on: ubuntu-latest
  needs: [deploy-frontend, deploy-backend]
  if: success()
  steps:
    - name: Create deployment record
      uses: chrnorm/deployment-action@v2
      with:
        token: ${{ secrets.GITHUB_TOKEN }}
        environment: ${{ github.ref == 'refs/heads/main' && 'production' || github.ref == 'refs/heads/develop' && 'development' || 'staging' }}
        description: "Deploy from GitHub Actions"
```

## トラブルシューティング

CI/CDパイプラインで発生する一般的な問題と解決方法：

### ビルド失敗

ビルドが失敗する場合の対処法:

1. パッケージのバージョン競合のチェック
2. ノード環境のバージョン確認
3. 依存関係の完全なクリーンインストール

```yaml
- name: Clean install dependencies
  run: |
    rm -rf node_modules
    npm cache clean --force
    npm ci
```

### デプロイ失敗

デプロイが失敗する場合の対処法:

1. Cloudflare認証情報の確認
2. ビルド成果物のパスが正しいか確認
3. 必要な権限が設定されているか確認

```yaml
- name: Debug environment
  run: |
    ls -la ./packages/client/dist
    wrangler --version
```

### テスト失敗

テストが失敗する場合の対処法:

1. 失敗したテストの詳細ログを確認
2. テスト環境の違いを検証
3. フラッキーテスト（不安定なテスト）を特定して修正

```yaml
- name: Run tests with verbose logging
  run: npm run test -- --verbose
```

### デバッグガイド

パイプラインのデバッグ方法:

1. `actions/setup-node`のバージョンを確認
2. ワークフローの各ステップで詳細なログを有効にする
3. 依存関係のインストールログを確認

```yaml
- name: Debug npm dependency tree
  run: npm list --depth=1
```

## 付録

### GitHub Actions設定例

完全な設定例は[こちら](https://github.com/yourorg/machipoke/blob/main/.github/workflows/main.yml)で確認できます。

### 参考リンク

- [GitHub Actions公式ドキュメント](https://docs.github.com/ja/actions)
- [Cloudflare Pages GitHub Integration](https://developers.cloudflare.com/pages/platform/github-integration/)
- [Wrangler CI/CD設定](https://developers.cloudflare.com/workers/wrangler/ci-cd/)
