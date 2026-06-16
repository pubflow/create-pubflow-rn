import { SecureStorageAdapter } from '@pubflow/react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { User, userSchema } from '@/lib/schemas/user';

import { mockUsers } from './mockUsers';

type UsersSource = 'live' | 'demo';

const PAGE_SIZE = 10;

function extractUsers(payload: any): User[] {
  const candidates = [
    payload?.data?.users,
    payload?.data?.data?.rows,
    payload?.data?.rows,
    payload?.data?.data,
    payload?.data,
    payload?.rows,
    payload,
  ];
  const rows = candidates.find(Array.isArray) ?? [];

  return rows.reduce<User[]>((validUsers, item) => {
    const normalizedUser = {
      id: item.id,
      name: item.name ?? '',
      last_name: item.last_name ?? item.lastName ?? '',
      email: item.email ?? '',
      user_type: item.user_type ?? item.userType ?? 'user',
      picture: item.picture ?? undefined,
      user_name: item.user_name ?? item.userName ?? item.email?.split('@')[0] ?? item.id,
      created_at: item.created_at ?? item.createdAt ?? new Date().toISOString(),
      updated_at: item.updated_at ?? item.updatedAt ?? item.created_at ?? item.createdAt ?? new Date().toISOString(),
    };
    const parsed = userSchema.safeParse(normalizedUser);
    if (parsed.success) {
      validUsers.push(parsed.data);
    }
    return validUsers;
  }, []);
}

async function getStoredSessionId() {
  const storage = new SecureStorageAdapter();
  return (await storage.getItem('session_id')) ?? (await storage.getItem('pubflow_session_id'));
}

async function fetchLiveUsers(searchTerm: string) {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.pml.edu.do';
  const sessionId = await getStoredSessionId();
  const params = new URLSearchParams({
    page: '1',
    limit: String(PAGE_SIZE),
    q: searchTerm,
  });
  const response = await fetch(`${baseUrl}/auth/users?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(sessionId ? { 'X-Session-ID': sessionId } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Live users request failed with status ${response.status}`);
  }

  return extractUsers(await response.json());
}

function filterUsers(users: User[], searchTerm: string) {
  const query = searchTerm.trim().toLowerCase();
  if (!query) return users;

  return users.filter((user) =>
    [user.name, user.last_name, user.email, user.user_name, user.user_type]
      .join(' ')
      .toLowerCase()
      .includes(query)
  );
}

export default function Users() {
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState<User[]>([]);
  const [source, setSource] = useState<UsersSource>('live');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadUsers = useCallback(
    async ({ refreshing: isRefreshing = false } = {}) => {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const liveUsers = await fetchLiveUsers(searchTerm);
        setUsers(liveUsers);
        setSource('live');
      } catch (err) {
        const nextError = err instanceof Error ? err : new Error(String(err));
        if (__DEV__) {
          setUsers(mockUsers);
          setSource('demo');
          setError(nextError);
        } else {
          setUsers([]);
          setSource('live');
          setError(nextError);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [searchTerm]
  );

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const visibleUsers = useMemo(
    () => (source === 'demo' ? filterUsers(users, searchTerm) : users),
    [searchTerm, source, users]
  );

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.userItem}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.name.charAt(0)}
          {item.last_name.charAt(0)}
        </Text>
      </View>
      <View style={styles.userCopy}>
        <Text style={styles.userName}>
          {item.name} {item.last_name}
        </Text>
        <Text style={styles.userEmail}>{item.email}</Text>
      </View>
      <Text style={styles.userType}>{item.user_type}</Text>
    </View>
  );

  if (loading && users.length === 0) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top + 24 }]}>
        <ActivityIndicator color="#006aff" />
        <Text style={styles.stateText}>Loading users...</Text>
      </View>
    );
  }

  if (error && source !== 'demo') {
    return (
      <View style={[styles.centered, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.errorTitle}>Could not load the home screen</Text>
        <Text style={styles.errorText}>{error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadUsers()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 92 }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Pubflow</Text>
          <Text style={styles.title}>Users</Text>
        </View>
        {source === 'demo' ? (
          <View style={styles.demoBadge}>
            <Text style={styles.demoBadgeText}>Demo</Text>
          </View>
        ) : null}
      </View>

      {source === 'demo' && error ? (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Live API unavailable</Text>
          <Text style={styles.noticeText}>Showing demo data until the endpoint responds correctly.</Text>
        </View>
      ) : null}

      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={setSearchTerm}
        placeholder="Search users..."
        placeholderTextColor="#7c8798"
        style={styles.searchInput}
        value={searchTerm}
      />

      <FlatList
        contentContainerStyle={visibleUsers.length === 0 ? styles.emptyList : styles.list}
        data={visibleUsers}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} tintColor="#006aff" onRefresh={() => loadUsers({ refreshing: true })} />
        }
        renderItem={renderUser}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No users found</Text>
            <Text style={styles.emptyText}>Try another search or pull to refresh.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: '#eaf2ff',
    borderRadius: 18,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  avatarText: {
    color: '#006aff',
    fontSize: 13,
    fontWeight: '900',
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: '#f7f9fc',
    flex: 1,
    padding: 20,
  },
  demoBadge: {
    backgroundColor: 'rgba(0, 106, 255, 0.1)',
    borderColor: 'rgba(0, 106, 255, 0.24)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  demoBadgeText: {
    color: '#006aff',
    fontSize: 12,
    fontWeight: '900',
  },
  empty: {
    alignItems: 'center',
    padding: 24,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  emptyTitle: {
    color: '#172033',
    fontSize: 18,
    fontWeight: '900',
  },
  errorText: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  errorTitle: {
    color: '#172033',
    fontSize: 20,
    fontWeight: '900',
  },
  eyebrow: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 8,
  },
  list: {
    gap: 10,
    paddingBottom: 24,
  },
  notice: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    padding: 12,
  },
  noticeText: {
    color: '#9a3412',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  noticeTitle: {
    color: '#7c2d12',
    fontSize: 13,
    fontWeight: '900',
  },
  retryButton: {
    backgroundColor: '#006aff',
    borderRadius: 8,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderColor: '#dbe4f0',
    borderRadius: 8,
    borderWidth: 1,
    color: '#172033',
    fontSize: 15,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  stateText: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 12,
  },
  title: {
    color: '#172033',
    fontSize: 30,
    fontWeight: '900',
    marginTop: 2,
  },
  userCopy: {
    flex: 1,
  },
  userEmail: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 2,
  },
  userItem: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e5edf7',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  userName: {
    color: '#172033',
    fontSize: 16,
    fontWeight: '800',
  },
  userType: {
    color: '#006aff',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});
