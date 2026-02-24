import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Member, RegistrationForm, UserProfile } from '../backend';
import { useInternetIdentity } from './useInternetIdentity';

export function useGetAllMembers() {
  const { actor, isFetching } = useActor();

  return useQuery<Member[]>({
    queryKey: ['members'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMembers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegisterMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      fullName: string;
      email: string;
      phoneNumber: string;
      membershipType: string;
      customFields: Array<[string, string]>;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      
      return actor.registerMember(
        data.fullName,
        data.email,
        data.phoneNumber,
        data.membershipType,
        data.customFields
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

export function useGetCurrentForm() {
  const { actor, isFetching } = useActor();

  return useQuery<RegistrationForm | null>({
    queryKey: ['currentForm'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCurrentForm();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUploadForm() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (form: RegistrationForm) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.uploadForm(form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentForm'] });
    },
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}
