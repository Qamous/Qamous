import { describe, expect, it, vi } from 'vitest';
import { apiJson } from '../api';

describe('free-limit responses', () => {
  it('surfaces a database or AI cutoff without a retry or paid fallback', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const response = new Response(JSON.stringify({message:'The free service limit is temporarily unavailable. Please try again later.'}), {status:503});
    await expect(apiJson(response)).rejects.toThrow('free service limit');
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('surfaces daily email caps and handles a non-JSON platform cutoff', async () => {
    await expect(apiJson(new Response(JSON.stringify({message:'Daily email limit reached'}), {status:429}))).rejects.toThrow('Daily email limit reached');
    await expect(apiJson(new Response('Daily request quota exhausted', {status:503}))).rejects.toThrow('Temporarily unavailable');
  });
});
