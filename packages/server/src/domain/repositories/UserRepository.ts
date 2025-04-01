import { User } from '../models/user/User';

/**
 * ユーザーリポジトリインターフェース
 */
export interface UserRepository {
  /**
   * IDによるユーザー取得
   */
  findById(id: string): Promise<User | null>;

  /**
   * メールアドレスによるユーザー取得
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * ユーザーの作成
   */
  create(user: User): Promise<User>;

  /**
   * ユーザーの更新
   */
  update(user: User): Promise<User>;

  /**
   * ユーザーの削除
   */
  delete(id: string): Promise<boolean>;

  /**
   * ユーザー一覧の取得
   */
  findAll(params: {
    limit?: number;
    offset?: number;
  }): Promise<User[]>;

  /**
   * ユーザー総数の取得
   */
  count(): Promise<number>;
}
