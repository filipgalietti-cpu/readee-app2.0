import type { SceneDef, InteractionDef } from '../types';
/** Exact authored identity: an edited prompt, label or key invalidates the presentation overlay. */
export function presentationKey(scene: SceneDef, data: InteractionDef) {
 const content=data.type==='sort' ? [data.buckets,data.items.map(x=>[x.label,x.spoken,x.bucket])]
  : data.type==='choose' ? [data.options.map(x=>[x.id,x.label,x.spoken]),data.correctId]
  : data.type==='match' ? data.pairs : null;
 return JSON.stringify([scene.id,scene.prompt,scene.evidence,scene.context,scene.narration?.script,data.type,content]);
}
