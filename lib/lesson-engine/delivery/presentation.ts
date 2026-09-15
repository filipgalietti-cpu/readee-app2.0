import type { SceneDef, InteractionDef } from '../types';
import { presentationKey } from './presentation-key';
import overrides from './presentation-overrides.json';
type Patch={wordImages?:Record<string,string>;items?:Record<string,string>;buckets?:Record<string,string>;markers?:Record<string,number>;lines?:Record<string,string[]>;lineImages?:Record<string,string[]>;matchImages?:Record<string,{src:string;alt:string}>};
const patches=overrides as Record<string,Patch>;
const cache=new WeakMap<object,Map<string,InteractionDef>>();
/** Display-only metadata, selected by exact authored content. Never edits narration or answer keys. */
export function presentInteraction<T extends InteractionDef>(scene: SceneDef|undefined,data:T):T {
 if(!scene)return data;
 const key=presentationKey(scene,data),patch=patches[key];
 if(!patch)return data;
 const previous=cache.get(data)?.get(key);if(previous)return previous as T;
 let result:InteractionDef=data;
 if(data.type==='sort') result={...data,showImages:true,bucketImages:{...patch.buckets,...data.bucketImages},bucketMarkers:{...patch.markers,...data.bucketMarkers},items:data.items.map(item=>({...item,image:item.image??patch.items?.[item.label]}))};
 if(data.type==='choose') result={...data,options:data.options.map(option=>({...option,wordImage:option.wordImage??patch.wordImages?.[option.id],displayLines:option.displayLines??patch.lines?.[option.id],displayImages:option.displayImages??patch.lineImages?.[option.id]}))};
 if(data.type==='match') result={...data,compactImages:true,images:{...patch.matchImages,...data.images}};
 const entries=cache.get(data)??new Map();entries.set(key,result);cache.set(data,entries);
 return result as T;
}
