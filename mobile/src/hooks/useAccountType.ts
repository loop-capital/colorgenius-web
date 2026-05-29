// ============================================================
// useAccountType — Fetch & cache current stylist account type
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE, getAuthToken } from '../api/client';

export type AccountType =
  | 'stylist'
  | 'beta_tester'
  | 'brand_ambassador'
  | 'brand_account';

export interface AccountPermissions {
  canConvertToBrand: boolean;
  canSendToTraining: boolean;
  canManageAmbassadors: boolean;
  canExportTrainingData: boolean;
}

export interface AccountTypeData {
  type: AccountType;
  brandId?: string;
  permissions: AccountPermissions;
}

const CACHE_KEY = 'cg_account_type_cache';
const CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes

interface CachedEntry {
  data: AccountTypeData;
  ts: number;
}

export function useAccountType(): {
  data: AccountTypeData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const [data, setData] = useState<AccountTypeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAccountType = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Try cache first
      const cachedRaw = await AsyncStorage.getItem(CACHE_KEY);
      if (cachedRaw) {
        const cached: CachedEntry = JSON.parse(cachedRaw);
        if (Date.now() - cached.ts < CACHE_TTL_MS) {
          setData(cached.data);
          setIsLoading(false);
          return;
        }
      }

      // 2. Fetch from API
      const token = await getAuthToken();
      if (!token) {
        // No auth — assume default stylist
        const fallback: AccountTypeData = {
          type: 'stylist',
          permissions: {
            canConvertToBrand: false,
            canSendToTraining: false,
            canManageAmbassadors: false,
            canExportTrainingData: false,
          },
        };
        setData(fallback);
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ data: fallback, ts: Date.now() }));
        return;
      }

      const cleanToken = token.replace(/[^A-Za-z0-9._~+/=-]/g, '');
      const res = await fetch(`${API_BASE}/v1/stylists/me`, {
        headers: { Authorization: 'Bearer ' + cleanToken },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to fetch account type`);
      }

      const json = await res.json();
      const fetched: AccountTypeData = {
        type: json.type || 'stylist',
        brandId: json.brandId || undefined,
        permissions: json.permissions || {
          canConvertToBrand: false,
          canSendToTraining: false,
          canManageAmbassadors: false,
          canExportTrainingData: false,
        },
      };

      setData(fetched);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ data: fetched, ts: Date.now() }));
    } catch (err: any) {
      console.error('[useAccountType] Error:', err);
      setError(err);
      // Fallback to default stylist on error
      const fallback: AccountTypeData = {
        type: 'stylist',
        permissions: {
          canConvertToBrand: false,
          canSendToTraining: false,
          canManageAmbassadors: false,
          canExportTrainingData: false,
        },
      };
      setData(fallback);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccountType();
  }, [fetchAccountType]);

  const refetch = useCallback(() => {
    fetchAccountType();
  }, [fetchAccountType]);

  return { data, isLoading, error, refetch };
}
