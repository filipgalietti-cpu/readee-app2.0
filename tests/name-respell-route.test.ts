import { beforeEach, expect, it, vi } from 'vitest';
const s = vi.hoisted(() => ({ user: true, owned: true, saveFails: false, update: vi.fn(), eq: vi.fn(), infer: vi.fn() }));
vi.mock('next/server', () => ({ NextResponse: { json: (body: unknown, options?: ResponseInit) => Response.json(body, options) } }));
vi.mock('@/lib/observability/critical', () => ({ reportFailure: vi.fn() }));
vi.mock('@/lib/audio/name-pronunciation', () => ({ respellNameFromAudio: s.infer }));
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => ({ auth: { getUser: async () => ({ data: { user: s.user ? { id: 'parent-a' } : null } }) } }) }));
vi.mock('@/lib/supabase/admin', () => ({ supabaseAdmin: () => ({ from: () => {
 let saving = false;
 const q = { select: () => q, eq: (...args: unknown[]) => { s.eq(...args); return q; }, update: (v: unknown) => { saving = true; s.update(v); return q; }, maybeSingle: async () => ({ data: s.owned ? { id: 'child' } : null, error: saving && s.saveFails ? new Error('private failure') : null }) };
 return q;
} }) }));
import { POST } from '@/app/api/child-name/respell/route';
const childId = '11111111-1111-4111-8111-111111111111';
const request = (extra: object = { childId }) => new Request('http://localhost/api/child-name/respell', { method: 'POST', body: JSON.stringify({ audioBase64: 'AAAA', mimeType: 'audio/wav', name: 'Filus', ...extra }) });
beforeEach(() => { vi.clearAllMocks(); s.user = true; s.owned = true; s.saveFails = false; s.infer.mockResolvedValue({ saidAs: 'fee-LOOSH', heard: 'Feeloosh' }); });
it('saves only pronunciation, with parent ownership checked again at the write', async () => {
 const response = await POST(request());
 expect(response.status).toBe(200);
 expect(s.update).toHaveBeenCalledWith({ name_said_as: 'fee-LOOSH' });
 expect(s.eq.mock.calls.filter(c => c[0] === 'parent_id')).toEqual([['parent_id','parent-a'], ['parent_id','parent-a']]);
 expect((await response.json()).saidAs).toBe('fee-LOOSH');
});
it('rejects another parent or signed-out request before sending audio to inference', async () => {
 s.owned = false; expect((await POST(request())).status).toBe(403);
 s.user = false; expect((await POST(request())).status).toBe(401);
 expect(s.infer).not.toHaveBeenCalled(); expect(s.update).not.toHaveBeenCalled();
});
it('preserves existing pronunciation when speech is unclear', async () => {
 s.infer.mockResolvedValue({ saidAs: '', heard: '' });
 expect((await POST(request())).status).toBe(200); expect(s.update).not.toHaveBeenCalled();
});
it('reports a save failure without leaking provider details', async () => {
 s.saveFails = true;
 const response = await POST(request()); expect(response.status).toBe(503);
 expect(JSON.stringify(await response.json())).not.toContain('private');
});
it('preserves the settings preview-only mode with no child write', async () => {
 expect((await POST(request({}))).status).toBe(200); expect(s.update).not.toHaveBeenCalled();
});
