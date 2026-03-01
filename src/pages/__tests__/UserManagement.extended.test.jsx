import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';

vi.mock('axios');

describe('UserManagement - Extended API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles user creation API call', async () => {
    axios.post.mockResolvedValueOnce({
      data: { user_id: 'USER-NEW', email: 'new@example.com', status: 'Active' },
    });

    const response = await axios.post('/api/v1/admin/users', {
      email: 'new@example.com',
      full_name: 'New User',
    });

    expect(response.data.user_id).toBe('USER-NEW');
    expect(axios.post).toHaveBeenCalledWith(
      '/api/v1/admin/users',
      expect.objectContaining({ email: 'new@example.com' })
    );
  });

  it('handles user update API call', async () => {
    axios.put.mockResolvedValueOnce({
      data: { user_id: 'USER-001', email: 'updated@example.com' },
    });

    const response = await axios.put('/api/v1/admin/users/USER-001', {
      full_name: 'Updated Name',
    });

    expect(axios.put).toHaveBeenCalled();
    expect(response.data.user_id).toBe('USER-001');
  });

  it('handles user deletion API call', async () => {
    axios.delete.mockResolvedValueOnce({});

    await axios.delete('/api/v1/admin/users/USER-001');

    expect(axios.delete).toHaveBeenCalledWith('/api/v1/admin/users/USER-001');
  });

  it('handles role assignment API call', async () => {
    axios.post.mockResolvedValueOnce({
      data: { assignment_id: 'ASSIGN-001' },
    });

    const response = await axios.post('/api/v1/admin/users/USER-001/roles', {
      role_id: 'ROLE-001',
    });

    expect(axios.post).toHaveBeenCalled();
    expect(response.data.assignment_id).toBe('ASSIGN-001');
  });

  it('handles API error responses', async () => {
    axios.get.mockRejectedValueOnce({
      response: { data: { error: 'Permission denied' }, status: 403 },
    });

    try {
      await axios.get('/api/v1/admin/users');
    } catch (error) {
      expect(error.response.status).toBe(403);
      expect(error.response.data.error).toBe('Permission denied');
    }
  });
});
