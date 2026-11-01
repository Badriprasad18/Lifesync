import axios from 'axios';
import {
  HealthCheckResponse,
  AuthResponse,
  User,
  AssessmentFormData,
  AssessmentDetail,
  AssessmentSummary,
  DashboardSummary,
  DashboardTrends,
  ClusterBenchmark,
  Recommendation,
  RecommendationSummary,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor to inject JWT token when available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('lifesync_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle unauthorized responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on 401 Unauthorized
      localStorage.removeItem('lifesync_token');
    }
    return Promise.reject(error);
  }
);

// Health check
export const fetchHealthCheck = async (): Promise<HealthCheckResponse> => {
  const response = await apiClient.get<HealthCheckResponse>('/health');
  return response.data;
};

// Authentication
export const loginUser = async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  if (response.data.access_token) {
    localStorage.setItem('lifesync_token', response.data.access_token);
  }
  return response.data;
};

export const registerUser = async (payload: {
  email: string;
  password: string;
  full_name: string;
  age: number;
  gender: string;
  height_cm?: number;
  weight_kg?: number;
  occupation?: string;
}): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', payload);
  if (response.data.access_token) {
    localStorage.setItem('lifesync_token', response.data.access_token);
  }
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
};

export const logoutUser = (): void => {
  localStorage.removeItem('lifesync_token');
};

// Assessments
export const createAssessment = async (data: AssessmentFormData): Promise<AssessmentDetail> => {
  const response = await apiClient.post<AssessmentDetail>('/assessment/', data);
  return response.data;
};

export const updateAssessment = async (id: number, data: AssessmentFormData): Promise<AssessmentDetail> => {
  const response = await apiClient.put<AssessmentDetail>(`/assessment/${id}`, data);
  return response.data;
};

export const getAssessment = async (id: number): Promise<AssessmentDetail> => {
  const response = await apiClient.get<AssessmentDetail>(`/assessment/${id}`);
  return response.data;
};

export const listAssessments = async (): Promise<AssessmentSummary[]> => {
  const response = await apiClient.get<AssessmentSummary[]>('/assessment/');
  return response.data;
};

export const deleteAssessment = async (id: number): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(`/assessment/${id}`);
  return response.data;
};

export const updateUserProfile = async (profileData: {
  full_name: string;
  age: number;
  gender: string;
  height_cm?: number;
  weight_kg?: number;
  occupation?: string;
}): Promise<User> => {
  const response = await apiClient.put<User>('/auth/profile', profileData);
  return response.data;
};

// Dashboard
export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await apiClient.get<DashboardSummary>('/dashboard/summary');
  return response.data;
};

export const getDashboardTrends = async (): Promise<DashboardTrends> => {
  const response = await apiClient.get<DashboardTrends>('/dashboard/trends');
  return response.data;
};

export const fetchClusterBenchmarks = async (): Promise<ClusterBenchmark[]> => {
  const response = await apiClient.get<ClusterBenchmark[]>('/dashboard/clusters');
  return response.data;
};

// PDF Report Download
export const downloadAssessmentPdf = async (id: number): Promise<void> => {
  const response = await apiClient.get(`/assessment/${id}/pdf`, {
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `LifeSync_Report_${id}.pdf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Recommendations

export const fetchRecommendations = async (params?: {
  category?: string;
  priority?: string;
  is_completed?: boolean;
  latest_only?: boolean;
}): Promise<Recommendation[]> => {
  const response = await apiClient.get<Recommendation[]>('/recommendations/', { params });
  return response.data;
};

export const fetchRecommendationSummary = async (): Promise<RecommendationSummary> => {
  const response = await apiClient.get<RecommendationSummary>('/recommendations/summary');
  return response.data;
};

export const toggleRecommendation = async (id: number): Promise<{ id: number; is_completed: boolean; message: string }> => {
  const response = await apiClient.patch<{ id: number; is_completed: boolean; message: string }>(
    `/recommendations/${id}/toggle`
  );
  return response.data;
};

export default apiClient;
