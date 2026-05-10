import type { AuthUser, UserRole } from '../types';
import { apiClient } from './client';
import { formatApiError } from './formatApiError';

export interface LoginResult {
  success: boolean;
  token?: string;
  user?: AuthUser;
  message?: string;
}

export async function loginApi(email: string, password: string): Promise<LoginResult> {
  const url = 'auth/login';
  try {
    const res = await apiClient.post<{
      success: boolean;
      token?: string;
      user?: AuthUser;
      message?: string;
    }>(url, { email, password });
    if (!res.data.success || !res.data.token || !res.data.user) {
      return { success: false, message: res.data.message || 'Login failed' };
    }
    return {
      success: true,
      token: res.data.token,
      user: res.data.user,
    };
  } catch (e) {
    return { success: false, message: formatApiError(e, url) };
  }
}

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  allergies?: string;
  dietaryPreference?: string;
  preferredLanguage?: string;
}

export async function registerApi(body: RegisterBody): Promise<LoginResult> {
  const url = 'auth/register';
  try {
    const res = await apiClient.post<{
      success: boolean;
      token?: string;
      user?: AuthUser;
      message?: string;
    }>(url, body);
    if (!res.data.success || !res.data.token || !res.data.user) {
      return { success: false, message: res.data.message || 'Registration failed' };
    }
    return {
      success: true,
      token: res.data.token,
      user: res.data.user,
    };
  } catch (e) {
    return { success: false, message: formatApiError(e, url) };
  }
}

export async function fetchMe(): Promise<AuthUser | null> {
  try {
    const res = await apiClient.get<{ success: boolean; user?: AuthUser }>('auth/me');
    if (!res.data.success || !res.data.user) return null;
    return res.data.user;
  } catch {
    return null;
  }
}

export async function updateMeApi(body: {
  name: string;
  allergies?: string;
  dietaryPreference?: string;
  preferredLanguage?: string;
}): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
  const url = 'auth/me';
  try {
    const res = await apiClient.put<{ success: boolean; user?: AuthUser; message?: string }>(
      url,
      body
    );
    return res.data;
  } catch (e) {
    return { success: false, message: formatApiError(e, url) };
  }
}
