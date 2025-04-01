import { gql } from 'graphql-request';
import type { User } from '@/types/user';

// ログインミューテーション
export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
        avatar
        bio
        location
      }
    }
  }
`;

// 新規登録ミューテーション
export const REGISTER = gql`
  mutation Register($name: String!, $email: String!, $password: String!) {
    register(name: $name, email: $email, password: $password) {
      token
      user {
        id
        name
        email
        avatar
        bio
        location
      }
    }
  }
`;

// パスワードリセットリクエストミューテーション
export const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email) {
      success
      message
    }
  }
`;

// 型定義
export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginData {
  login: AuthResponse;
}

export interface RegisterData {
  register: AuthResponse;
}

export interface RequestPasswordResetData {
  requestPasswordReset: {
    success: boolean;
    message: string;
  };
}
