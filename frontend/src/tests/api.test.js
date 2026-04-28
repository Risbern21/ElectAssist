import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock firebase so fetchClient doesn't try to get a real token
vi.mock('../lib/firebase', () => ({
  auth: { currentUser: null },
}));

// We'll spy on global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Helper to build a successful fetch response
const makeResponse = (data, ok = true, status = 200) => ({
  ok,
  status,
  json: async () => data,
});

// Re-import after mocks are in place
import { candidateApi, chatApi, timelineApi, videoApi, authApi, adminApi } from '../lib/api';

describe('API library', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // candidateApi
  // -----------------------------------------------------------------------
  describe('candidateApi.getAll', () => {
    it('fetches /candidates when ward is All', async () => {
      mockFetch.mockResolvedValueOnce(makeResponse([{ id: '1', name: 'Alice' }]));
      const result = await candidateApi.getAll('All');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/candidates'),
        expect.any(Object)
      );
      expect(result).toHaveLength(1);
    });

    it('appends ward query param when ward is specified', async () => {
      mockFetch.mockResolvedValueOnce(makeResponse([]));
      await candidateApi.getAll('Ward 1');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('ward=Ward%201'),
        expect.any(Object)
      );
    });

    it('returns empty array on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network down'));
      const result = await candidateApi.getAll();
      expect(result).toEqual([]);
    });
  });

  describe('candidateApi.create', () => {
    it('sends POST request with candidate data', async () => {
      const newCandidate = { name: 'Bob', party: 'Blue', ward: 'Ward 2' };
      mockFetch.mockResolvedValueOnce(makeResponse({ id: 'new-id', ...newCandidate }));
      const result = await candidateApi.create(newCandidate);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/candidates'),
        expect.objectContaining({ method: 'POST' })
      );
      expect(result.id).toBe('new-id');
    });
  });

  describe('candidateApi.delete', () => {
    it('sends DELETE request with correct candidate ID in URL', async () => {
      mockFetch.mockResolvedValueOnce(makeResponse({ status: 'success' }));
      await candidateApi.delete('cand-123');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/candidates/cand-123'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  // -----------------------------------------------------------------------
  // chatApi
  // -----------------------------------------------------------------------
  describe('chatApi.sendMessage', () => {
    it('sends POST to /chat with query in body', async () => {
      mockFetch.mockResolvedValueOnce(makeResponse({ answer: 'Test answer' }));
      const result = await chatApi.sendMessage('Who is Alice?');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/chat'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ query: 'Who is Alice?' }),
        })
      );
      expect(result.answer).toBe('Test answer');
    });

    it('throws error on API failure', async () => {
      mockFetch.mockResolvedValueOnce(makeResponse({ detail: 'Server error' }, false, 500));
      await expect(chatApi.sendMessage('test')).rejects.toThrow('Server error');
    });
  });

  // -----------------------------------------------------------------------
  // timelineApi
  // -----------------------------------------------------------------------
  describe('timelineApi.getStages', () => {
    it('fetches /elections/timeline', async () => {
      mockFetch.mockResolvedValueOnce(makeResponse([{ title: 'Stage 1' }]));
      const result = await timelineApi.getStages();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/elections/timeline'),
        expect.any(Object)
      );
      expect(result[0].title).toBe('Stage 1');
    });

    it('returns empty array on error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('fail'));
      const result = await timelineApi.getStages();
      expect(result).toEqual([]);
    });
  });

  // -----------------------------------------------------------------------
  // adminApi
  // -----------------------------------------------------------------------
  describe('adminApi.verifyStatus', () => {
    it('returns true when backend responds isAdmin: true', async () => {
      mockFetch.mockResolvedValueOnce(makeResponse({ isAdmin: true }));
      const result = await adminApi.verifyStatus();
      expect(result).toBe(true);
    });

    it('returns false on non-admin response', async () => {
      mockFetch.mockResolvedValueOnce(makeResponse({ isAdmin: false }));
      const result = await adminApi.verifyStatus();
      expect(result).toBe(false);
    });

    it('returns false on fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Unauthorized'));
      const result = await adminApi.verifyStatus();
      expect(result).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // Auth header injection
  // -----------------------------------------------------------------------
  describe('Authorization header', () => {
    it('injects Bearer token when user is logged in', async () => {
      // Override the firebase mock for this test to simulate a logged-in user
      const { auth } = await import('../lib/firebase');
      auth.currentUser = {
        getIdToken: vi.fn().mockResolvedValue('fake-jwt-token'),
      };

      mockFetch.mockResolvedValueOnce(makeResponse([]));
      await candidateApi.getAll();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer fake-jwt-token',
          }),
        })
      );

      // Cleanup
      auth.currentUser = null;
    });

    it('does NOT inject auth header when no user is logged in', async () => {
      mockFetch.mockResolvedValueOnce(makeResponse([]));
      await candidateApi.getAll();

      const callArgs = mockFetch.mock.calls[0][1];
      expect(callArgs.headers?.Authorization).toBeUndefined();
    });
  });
});
