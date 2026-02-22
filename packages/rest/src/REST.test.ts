import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { REST } from './REST.js';
import { Routes } from '@fluxer-selfbot/types';

describe('REST', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('constructor and setToken', () => {
    const rest = new REST();
    expect(rest.token).toBeNull();
    rest.setToken('abc123');
    expect(rest.token).toBe('abc123');
    rest.setToken(null);
    expect(rest.token).toBeNull();
  });

  it('setToken returns this for chaining', () => {
    const rest = new REST();
    expect(rest.setToken('x')).toBe(rest);
  });

  it('get delegates to requestManager', async () => {
    const rest = new REST();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: () => Promise.resolve('{"id":"1"}'),
      headers: new Headers(),
    });
    const result = await rest.get('/channels/1');
    expect(result).toEqual({ id: '1' });
  });

  it('post sends body', async () => {
    const rest = new REST();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: () => Promise.resolve('{}'),
      headers: new Headers(),
    });
    await rest.post('/channels', { body: { name: 'test' } });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: '{"name":"test"}',
      }),
    );
  });

  it('Routes is exposed', () => {
    expect(REST.Routes).toBe(Routes);
  });
});
