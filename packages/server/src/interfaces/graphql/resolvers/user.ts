import { builder } from '../schema';
import { UserType } from '../types/user';
import { User } from '../../../domain/models/user/User';
import { UserRepositoryImpl } from '../../../infrastructure/persistence/cloudflareD1/repositories/UserRepositoryImpl';
import { getDb } from '../../../infrastructure/persistence/cloudflareD1/db';
import { ERROR_CODES } from '@machipoke/shared';

// ユーザー関連のクエリ
builder.queryFields((t) => ({
  // ログイン中のユーザー情報を取得
  me: t.field({
    type: UserType,
    nullable: true,
    resolve: async (_, __, context) => {
      if (!context.isAuthenticated || !context.userId) {
        return null;
      }

      const db = getDb(context.env);
      const userRepository = new UserRepositoryImpl(db);

      return userRepository.findById(context.userId);
    },
  }),

  // IDによるユーザー取得
  user: t.field({
    type: UserType,
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_, args, context) => {
      const db = getDb(context.env);
      const userRepository = new UserRepositoryImpl(db);

      return userRepository.findById(args.id);
    },
  }),

  // ユーザー一覧取得
  users: t.field({
    type: [UserType],
    args: {
      limit: t.arg.int({ defaultValue: 20 }),
      offset: t.arg.int({ defaultValue: 0 }),
    },
    resolve: async (_, args, context) => {
      // 管理者権限のチェック（実際の実装では適切な権限チェックが必要）
      if (!context.isAuthenticated) {
        throw new Error('認証が必要です');
      }

      const db = getDb(context.env);
      const userRepository = new UserRepositoryImpl(db);

      return userRepository.findAll({
        limit: args.limit,
        offset: args.offset,
      });
    },
  }),
}));

// ユーザー関連のミューテーション
builder.mutationFields((t) => ({
  // ユーザー登録
  createUser: t.field({
    type: UserType,
    args: {
      input: t.arg({ type: 'CreateUserInput', required: true }),
    },
    resolve: async (_, args, context) => {
      const db = getDb(context.env);
      const userRepository = new UserRepositoryImpl(db);

      // メールアドレスの重複チェック
      const existingUser = await userRepository.findByEmail(args.input.email);
      if (existingUser) {
        throw new Error(`このメールアドレスは既に登録されています: ${args.input.email}`);
      }

      // 新規ユーザーの作成
      const user = User.create({
        id: crypto.randomUUID(),
        email: args.input.email,
        displayName: args.input.displayName,
        profileImageUrl: args.input.profileImageUrl || null,
        hometown: args.input.hometown || null,
        expertAreas: args.input.expertAreas || null,
        bio: args.input.bio || null,
      });

      return userRepository.create(user);
    },
  }),

  // ユーザー情報更新
  updateUser: t.field({
    type: UserType,
    args: {
      id: t.arg.string({ required: true }),
      input: t.arg({ type: 'UpdateUserInput', required: true }),
    },
    resolve: async (_, args, context) => {
      // 認証と権限チェック
      if (!context.isAuthenticated) {
        throw new Error('認証が必要です');
      }

      // 自分自身のプロフィールのみ更新可能
      if (context.userId !== args.id) {
        throw new Error('他のユーザーのプロフィールは更新できません');
      }

      const db = getDb(context.env);
      const userRepository = new UserRepositoryImpl(db);

      // 更新対象のユーザーを取得
      const existingUser = await userRepository.findById(args.id);
      if (!existingUser) {
        throw new Error(`ユーザーが見つかりません: ${args.id}`);
      }

      // ユーザー情報を更新
      const updatedUser = existingUser.update({
        displayName: args.input.displayName,
        profileImageUrl: args.input.profileImageUrl,
        hometown: args.input.hometown,
        expertAreas: args.input.expertAreas,
        bio: args.input.bio,
      });

      return userRepository.update(updatedUser);
    },
  }),

  // ユーザー削除
  deleteUser: t.field({
    type: 'Boolean',
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_, args, context) => {
      // 認証と権限チェック
      if (!context.isAuthenticated) {
        throw new Error('認証が必要です');
      }

      // 自分自身のアカウントのみ削除可能
      if (context.userId !== args.id) {
        throw new Error('他のユーザーのアカウントは削除できません');
      }

      const db = getDb(context.env);
      const userRepository = new UserRepositoryImpl(db);

      // ユーザーの存在確認
      const existingUser = await userRepository.findById(args.id);
      if (!existingUser) {
        throw new Error(`ユーザーが見つかりません: ${args.id}`);
      }

      // ユーザーの削除
      return userRepository.delete(args.id);
    },
  }),
}));
