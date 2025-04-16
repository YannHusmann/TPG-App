import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.56.1:8000/api';

async function getAuthHeader() {
  const token = await AsyncStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(use_email: string, use_password: string) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ use_email, use_password }),
  });
  return response.json();
}

export async function getMyReports() {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/reports`, { headers });
  return response.json();
}

export async function createReport(data: any) {
  const headers = await getAuthHeader();
  headers['Content-Type'] = 'application/json';
  const response = await fetch(`${API_BASE_URL}/reports`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateReport(id: number, data: any) {
  const headers = await getAuthHeader();
  headers['Content-Type'] = 'application/json';
  const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteReport(id: number) {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
    method: 'DELETE',
    headers,
  });
  return response.json();
}

export async function checkTokenValid() {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/me`, { headers });
  return response.status === 200;
}
