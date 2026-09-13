import { expect, it } from 'vitest';
import { savedJourneyHref } from '@/lib/journey/lesson-return';
it('waits for the recorded finish before requesting the Journey completion animation', async () => {
  let resolve!: (value: { saved: boolean }) => void;
  const save = new Promise<{ saved: boolean }>((done) => { resolve = done; });
  let returned = false;
  const navigation = savedJourneyHref('child', 'RF.1.1a', save).then((url) => { returned = true; return url; });
  await Promise.resolve();
  expect(returned).toBe(false);
  resolve({ saved: true });
  expect(await navigation).toBe('/journey?child=child&completed=RF.1.1a');
});
it('never reports completion when persistence is missing, failed, or rejected', async () => {
  expect(await savedJourneyHref('child', 'RF.1.1a', null)).toBe('/journey?child=child');
  expect(await savedJourneyHref('child', 'RF.1.1a', Promise.resolve({ saved: false }))).toBe('/journey?child=child');
  expect(await savedJourneyHref('child', 'RF.1.1a', Promise.reject(new Error('offline')))).toBe('/journey?child=child');
});
