import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import graphqlClient from '@/graphql/client';
import { GET_SPOTS, GET_SPOT_BY_ID, GET_NEARBY_SPOTS } from '@/graphql/queries/spots';
import {
  CREATE_SPOT,
  UPDATE_SPOT,
  ADD_COMMENT,
  SAVE_SPOT,
  UNSAVE_SPOT,
} from '@/graphql/mutations/spots';
import type { Spot, SpotFilter, CreateSpotInput, UpdateSpotInput } from '@/types/spot';

// スポット一覧取得フック
export function useSpots(filters?: SpotFilter) {
  return useQuery({
    queryKey: ['spots', filters],
    queryFn: async () => {
      const variables: any = { limit: 50 };
      if (filters?.category) variables.category = filters.category;

      const data = await graphqlClient.request(GET_SPOTS, variables);
      return data.spots as Spot[];
    },
  });
}

// スポット詳細取得フック
export function useSpotById(id: string | undefined) {
  return useQuery({
    queryKey: ['spot', id],
    queryFn: async () => {
      if (!id) throw new Error('Spot ID is required');
      const data = await graphqlClient.request(GET_SPOT_BY_ID, { id });
      return data.spot as Spot;
    },
    enabled: !!id, // IDがある場合のみクエリを実行
  });
}

// 付近のスポット取得フック
export function useNearbySpots(
  latitude: number,
  longitude: number,
  distance: number = 5,
  limit: number = 10
) {
  return useQuery({
    queryKey: ['nearbySpots', latitude, longitude, distance, limit],
    queryFn: async () => {
      const data = await graphqlClient.request(GET_NEARBY_SPOTS, {
        latitude,
        longitude,
        distance,
        limit,
      });
      return data.nearbySpots;
    },
    enabled: !!latitude && !!longitude, // 座標がある場合のみクエリを実行
  });
}

// スポット作成ミューテーションフック
export function useCreateSpot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSpotInput) => {
      const data = await graphqlClient.request(CREATE_SPOT, { input });
      return data.createSpot as Spot;
    },
    onSuccess: () => {
      // 作成成功後にスポットリストを更新
      queryClient.invalidateQueries({ queryKey: ['spots'] });
    },
  });
}

// スポット更新ミューテーションフック
export function useUpdateSpot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateSpotInput }) => {
      const data = await graphqlClient.request(UPDATE_SPOT, { id, input });
      return data.updateSpot as Spot;
    },
    onSuccess: (data) => {
      // 更新成功後に関連するクエリを更新
      queryClient.invalidateQueries({ queryKey: ['spots'] });
      queryClient.invalidateQueries({ queryKey: ['spot', data.id] });
    },
  });
}

// コメント追加ミューテーションフック
export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ spotId, content }: { spotId: string; content: string }) => {
      const data = await graphqlClient.request(ADD_COMMENT, { spotId, content });
      return data.addComment;
    },
    onSuccess: (_, variables) => {
      // コメント追加成功後にスポット詳細を更新
      queryClient.invalidateQueries({ queryKey: ['spot', variables.spotId] });
    },
  });
}

// スポット保存ミューテーションフック
export function useSaveSpot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (spotId: string) => {
      const data = await graphqlClient.request(SAVE_SPOT, { spotId });
      return data.saveSpot;
    },
    onSuccess: () => {
      // 保存成功後にユーザープロフィールの保存済みスポットを更新
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
}

// スポット保存解除ミューテーションフック
export function useUnsaveSpot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (spotId: string) => {
      const data = await graphqlClient.request(UNSAVE_SPOT, { spotId });
      return data.unsaveSpot;
    },
    onSuccess: () => {
      // 保存解除成功後にユーザープロフィールの保存済みスポットを更新
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
}
