import { afterEach, expect, it, vi } from 'vitest';
vi.mock('@/lib/observability/critical', () => ({ reportFailure: vi.fn() }));
import { startNamePronunciation, settleNamePronunciation } from '@/lib/audio/background-name';
import { namePreviewBlobUrl } from '@/lib/audio/preview-url';
import { reportFailure } from '@/lib/observability/critical';
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });
it('keeps a name request alive across the screen handoff and holds report submission until saving finishes', async () => {
 let finish!: (r: Response) => void;
 const fetcher = vi.fn((_url: string, _init: RequestInit) => new Promise<Response>(r => { finish = r; }));
 vi.stubGlobal('fetch', fetcher);
 const recording = { audioBase64: 'AAAA', mimeType: 'audio/wav', name: 'Filus' };
 startNamePronunciation('reader-a', recording);
 startNamePronunciation('reader-a', recording);
 expect(fetcher).toHaveBeenCalledTimes(1);
 expect(JSON.parse(fetcher.mock.calls[0][1].body as string)).toEqual({ ...recording, childId: 'reader-a' });
 let canSubmit = false;
 const settled = settleNamePronunciation('reader-a').then(() => { canSubmit = true; });
 await Promise.resolve(); expect(canSubmit).toBe(false);
 // A second reader does not wait for the first reader's recording.
 await settleNamePronunciation('reader-b');
 finish(Response.json({ ok: true, saidAs: 'fee-LOOSH' }));
 await settled; expect(canSubmit).toBe(true);
});
it('does not fail placement saving when optional pronunciation fails', async () => {
 vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 503 })));
 startNamePronunciation('reader-c', { audioBase64: 'AAAA', mimeType: 'audio/wav', name: 'Filus' });
 await expect(settleNamePronunciation('reader-c')).resolves.toBeUndefined();
 expect(reportFailure).toHaveBeenCalledWith('placement.name_pronunciation', expect.any(Error), { route: '/placement' });
});
it('decodes the real preview response to a policy-compatible blob and preserves the audio bytes', async () => {
 const url = namePreviewBlobUrl('data:audio/mpeg;base64,SUQz');
 expect(url).toMatch(/^blob:/);
 const response = await fetch(url);
 expect(response.headers.get('content-type')).toBe('audio/mpeg');
 expect(await response.text()).toBe('ID3');
 URL.revokeObjectURL(url);
 expect(() => namePreviewBlobUrl('data:text/html;base64,SUQz')).toThrow();
});
