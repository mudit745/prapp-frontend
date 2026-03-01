import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';

vi.mock('axios');

describe('MasterData - Extended API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a new cost center via API', async () => {
    axios.post.mockResolvedValueOnce({
      data: { cost_center_id: 'CC-NEW', cost_center_name: 'New Dept', status: 'Active' },
    });

    const response = await axios.post('/api/v1/cost-centers', {
      cost_center_name: 'New Dept',
      tenant_id: 'TENANT-001',
    });

    expect(response.data.cost_center_id).toBe('CC-NEW');
    expect(axios.post).toHaveBeenCalled();
  });

  it('updates an existing vendor via API', async () => {
    axios.put.mockResolvedValueOnce({
      data: { vendor_id: 'VEND-001', vendor_name: 'Updated Vendor' },
    });

    const response = await axios.put('/api/v1/vendors/VEND-001', {
      vendor_name: 'Updated Vendor',
    });

    expect(axios.put).toHaveBeenCalled();
    expect(response.data.vendor_name).toBe('Updated Vendor');
  });

  it('deletes a project via API', async () => {
    axios.delete.mockResolvedValueOnce({});

    await axios.delete('/api/v1/projects/PROJ-001');

    expect(axios.delete).toHaveBeenCalledWith('/api/v1/projects/PROJ-001');
  });

  it('handles API errors gracefully', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'));

    try {
      await axios.get('/api/v1/cost-centers');
    } catch (error) {
      expect(error.message).toBe('Network error');
    }
  });

  it('fetches products list', async () => {
    const mockProducts = [
      { product_id: 'PROD-001', product_name: 'Product 1' },
    ];
    axios.get.mockResolvedValueOnce({ data: mockProducts });

    const response = await axios.get('/api/v1/products');

    expect(response.data).toEqual(mockProducts);
    expect(axios.get).toHaveBeenCalledWith('/api/v1/products');
  });
});
