import { useMutation } from '@tanstack/react-query';
import graphqlClient from '@/graphql/client';
import { LOGIN, REGISTER, REQUEST_PASSWORD_RESET } from '@/graphql/mutations/auth';
import useAuthStore from '@/store/authStore';

// ログインフック
export function useLogin() {
  const { login, setLoading, setError } = useAuthStore();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      setLoading(true);
      try {
        const data = await graphqlClient.request(LOGIN, { email, password });
        return data.login;
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: (data) => {
      login(data.token, data.user);
    },
    onError: (error: any) => {
      setError(error.message || 'ログインに失敗しました');
    },
  });
}

// 新規登録フック
export function useRegister() {
  const { login, setLoading, setError } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      name,
      email,
      password,
    }: { name: string; email: string; password: string }) => {
      setLoading(true);
      try {
        const data = await graphqlClient.request(REGISTER, { name, email, password });
        return data.register;
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: (data) => {
      login(data.token, data.user);
    },
    onError: (error: any) => {
      setError(error.message || '新規登録に失敗しました');
    },
  });
}

// パスワードリセットリクエストフック
export function useRequestPasswordReset() {
  const { setLoading, setError } = useAuthStore();

  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      setLoading(true);
      try {
        const data = await graphqlClient.request(REQUEST_PASSWORD_RESET, { email });
        return data.requestPasswordReset;
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    onError: (error: any) => {
      setError(error.message || 'パスワードリセットリクエストに失敗しました');
    },
  });
}

// ログアウトフック
export function useLogout() {
  const { logout } = useAuthStore();

  return () => {
    logout();
  };
}

// 認証状態フック
export function useAuthState() {
  const { token, user, isAuthenticated, isLoading, error } = useAuthStore();

  return {
    token,
    user,
    isAuthenticated,
    isLoading,
    error,
  };
}
