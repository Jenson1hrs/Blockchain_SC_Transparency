import { apiClient } from './client';
import { formatApiError } from './formatApiError';
import type { LikertResponses } from '../constants/likertQuestions';

export interface SubmitFeedbackPayload {
  category: string;
  likertResponses: LikertResponses;
  message?: string;
  role?: string;
}

export async function submitFeedback(payload: SubmitFeedbackPayload): Promise<void> {
  const path = '/feedback';
  try {
    const res = await apiClient.post<{ success: boolean; message?: string }>(path, payload);
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to submit feedback');
    }
  } catch (e) {
    throw new Error(formatApiError(e, path));
  }
}
