# マチポケ 開発ワークフロー

このドキュメントでは、マチポケプロジェクトの開発ワークフローとGitの使用方法について説明します。

## 開発サイクル

マチポケプロジェクトでは、以下の開発サイクルに従います：

1. **課題の選択**: GitHub Issuesから作業する課題を選択
2. **ブランチの作成**: 新しい機能やバグ修正のためのブランチを作成
3. **開発**: ローカルで実装、テスト
4. **コミット**: 変更を小さな単位でコミット
5. **プルリクエスト**: 変更をプルリクエストとして提出
6. **コードレビュー**: チームメンバーによるレビュー
7. **CI/CD**: 自動テスト、リントのパス確認
8. **マージ**: レビューが承認されたらマージ
9. **デプロイ**: 開発環境、ステージング環境、本番環境へのデプロイ

## ブランチ戦略

### メインブランチ

- **main**: 本番リリース用の安定したコード
- **develop**: 開発用の統合ブランチ、次のリリースの準備

### 作業ブランチ

作業ブランチは以下の命名規則に従います：

- **feature/[issue-number]-[brief-description]**: 新機能の追加
- **bugfix/[issue-number]-[brief-description]**: バグ修正
- **refactor/[issue-number]-[brief-description]**: リファクタリング
- **docs/[issue-number]-[brief-description]**: ドキュメントの更新
- **test/[issue-number]-[brief-description]**: テストの追加・修正
- **release/[version]**: リリース準備用ブランチ
- **hotfix/[issue-number]-[brief-description]**: 緊急バグ修正

例:
```
feature/123-add-spot-detail-page
bugfix/124-fix-map-loading-issue
```

## 開発の流れ

### 1. 環境のセットアップ

開発を始める前に、最新の `develop` ブランチを取得します：

```bash
git checkout develop
git pull origin develop
```

### 2. 新しいブランチの作成

```bash
git checkout -b feature/123-add-spot-detail-page
```

### 3. 開発プロセス

- 小さな単位で変更を加える
- 頻繁にコミットする
- コードスタイルとテストを確認する
- 変更内容が大きい場合は、WIP（Work In Progress）プルリクエストを作成して早めにフィードバックを得る

### 4. 変更のコミット

```bash
git add .
git commit -m "feat(spot): スポット詳細ページの基本レイアウトを追加"
```

[コーディング規約](./coding-standards.md)のコミットメッセージ形式に従ってください。

### 5. リモートへのプッシュ

```bash
git push origin feature/123-add-spot-detail-page
```

### 6. プルリクエストの作成

GitHub上でプルリクエストを作成します。プルリクエストには以下の情報を含めます：

- 関連するIssue番号（例: "Closes #123"）
- 変更の概要
- テスト方法
- スクリーンショット（UI変更がある場合）

### 7. コードレビュー

- レビュアーは変更内容を確認し、フィードバックを提供
- 必要に応じて変更を加え、追加のコミットをプッシュ
- CIパイプラインがすべてのチェックをパスしていることを確認

### 8. マージ

レビューが承認されたら、プルリクエストを `develop` ブランチにマージします。
マージ方法は「Squash and merge」を基本とし、関連する変更を1つのコミットにまとめます。

### 9. ブランチのクリーンアップ

マージ後、作業ブランチをクリーンアップします：

```bash
git checkout develop
git pull origin develop
git branch -d feature/123-add-spot-detail-page
```

## リリースプロセス

### 1. リリースブランチの作成

リリース準備が整ったら、`develop` ブランチから `release` ブランチを作成します：

```bash
git checkout develop
git pull origin develop
git checkout -b release/1.0.0
```

### 2. リリース準備

- バージョン番号の更新
- CHANGELOG.mdの更新
- 最終テストの実施
- 必要に応じたバグ修正

### 3. リリースのマージ

テストが完了したら、`release` ブランチを `main` と `develop` の両方にマージします：

```bash
# mainへのマージ
git checkout main
git merge release/1.0.0
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin main --tags

# developへのマージ
git checkout develop
git merge release/1.0.0
git push origin develop
```

### 4. デプロイ

CIパイプラインを通じて、`main` ブランチから本番環境にデプロイします。

## ホットフィックス

本番環境で緊急のバグが発見された場合：

```bash
git checkout main
git checkout -b hotfix/126-critical-auth-bug
# 修正を実装
git commit -m "fix(auth): クリティカルな認証バグを修正"
```

修正後、`main` と `develop` の両方にマージします：

```bash
# mainへのマージ
git checkout main
git merge hotfix/126-critical-auth-bug
git tag -a v1.0.1 -m "Version 1.0.1"
git push origin main --tags

# developへのマージ
git checkout develop
git merge hotfix/126-critical-auth-bug
git push origin develop
```

## CI/CDパイプライン

GitHub Actionsを使用して以下のCI/CDパイプラインを実行します：

1. **Pull Requestチェック**:
   - コードのリント
   - 型チェック
   - 単体テスト
   - ビルド確認

2. **デプロイメント**:
   - `develop` ブランチへのマージ → 開発環境へのデプロイ
   - `main` ブランチへのマージ → ステージング環境へのデプロイ
   - リリースタグの作成 → 本番環境へのデプロイ

## トラブルシューティング

### 作業中の変更の一時保存

作業中に別のブランチに切り替える必要がある場合：

```bash
git stash
git checkout other-branch
# 作業後
git checkout original-branch
git stash pop
```

### マージ競合の解決

マージ競合が発生した場合：

```bash
git pull origin develop
# 競合を解決
git add .
git commit -m "Resolve merge conflicts"
git push origin feature/123-add-spot-detail-page
```

### コミット履歴の整理

プルリクエスト前にコミット履歴を整理する場合：

```bash
git rebase -i origin/develop
# 対話的なrebaseでコミットを整理
git push origin feature/123-add-spot-detail-page --force
```

**注意**: `--force` オプションは慎重に使用し、共有ブランチでは避けてください。

## 参考リンク

- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
