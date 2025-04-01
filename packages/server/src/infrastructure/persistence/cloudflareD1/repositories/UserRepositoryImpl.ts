import { eq } from 'drizzle-orm';
import { DrizzleD1Database } from 'drizzle-orm/d1';
import { User } from '../../../../domain/models/user/User';
import { UserRepository } from '../../../../domain/repositories/UserRepository';
import * as schema from '../schema';

/**
 * D1データベースを使用したUserRepositoryの実装
 */
export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly db: DrizzleD1Database<typeof schema>) {}

  /**
   * IDによるユーザー取得
   */
  async findById(id: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);

    const user = result[0];
    if (!user) return null;

    return User.create({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      profileImageUrl: user.profileImageUrl,
      hometown: user.hometown,
      expertAreas: user.expertAreas ? JSON.parse(user.expertAreas) : null,
      bio: user.bio,
      trustScore: user.trustScore ?? 50,
      createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
      updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
    });
  }

  /**
   * メールアドレスによるユーザー取得
   */
  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    const user = result[0];
    if (!user) return null;

    return User.create({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      profileImageUrl: user.profileImageUrl,
      hometown: user.hometown,
      expertAreas: user.expertAreas ? JSON.parse(user.expertAreas) : null,
      bio: user.bio,
      trustScore: user.trustScore ?? 50,
      createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
      updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
    });
  }

  /**
   * ユーザーの作成
   */
  async create(user: User): Promise<User> {
    const userData = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      profileImageUrl: user.profileImageUrl,
      hometown: user.hometown,
      expertAreas: user.expertAreas ? JSON.stringify(user.expertAreas) : null,
      bio: user.bio,
      trustScore: user.trustScore,
      createdAt: user.createdAt.getTime(),
      updatedAt: user.updatedAt.getTime(),
    };

    await this.db.insert(schema.users).values(userData);

    return user;
  }

  /**
   * ユーザーの更新
   */
  async update(user: User): Promise<User> {
    const userData = {
      displayName: user.displayName,
      profileImageUrl: user.profileImageUrl,
      hometown: user.hometown,
      expertAreas: user.expertAreas ? JSON.stringify(user.expertAreas) : null,
      bio: user.bio,
      trustScore: user.trustScore,
      updatedAt: user.updatedAt.getTime(),
    };

    await this.db.update(schema.users).set(userData).where(eq(schema.users.id, user.id));

    return user;
  }

  /**
   * ユーザーの削除
   */
  async delete(id: string): Promise<boolean> {
    await this.db.delete(schema.users).where(eq(schema.users.id, id));
    return true;
  }

  /**
   * ユーザー一覧の取得
   */
  async findAll(params: { limit?: number; offset?: number }): Promise<User[]> {
    const limit = params.limit ?? 20;
    const offset = params.offset ?? 0;

    const results = await this.db.select().from(schema.users).limit(limit).offset(offset);

    return results.map((user) =>
      User.create({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        profileImageUrl: user.profileImageUrl,
        hometown: user.hometown,
        expertAreas: user.expertAreas ? JSON.parse(user.expertAreas) : null,
        bio: user.bio,
        trustScore: user.trustScore ?? 50,
        createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
        updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
      })
    );
  }

  /**
   * ユーザー総数の取得
   */
  async count(): Promise<number> {
    const result = await this.db.select({ count: count() }).from(schema.users);

    return result[0]?.count ?? 0;
  }
}

// SQLite count関数
function count() {
  return sql`count(*)`;
}

import { sql } from 'drizzle-orm';
