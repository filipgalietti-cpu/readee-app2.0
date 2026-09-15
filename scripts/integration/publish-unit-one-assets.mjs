/** Explicit release operation. Publishes only immutable curriculum files; no child data. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
import {parse} from 'dotenv';
const env=parse(readFileSync(process.env.READEE_RELEASE_ENV));
const manifest=JSON.parse(readFileSync('docs/integration/unit-one-assets.json','utf8'));
const digest=createHash('sha256').update(JSON.stringify(manifest.assets)).digest('hex').slice(0,12);
const prefix=`approved-units/k1-2026-09-14-${digest}`;
const client=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
if(!env.NEXT_PUBLIC_SUPABASE_URL?.includes('rwlvjtowmfrrqeqvwolo.supabase.co'))throw Error('Unexpected release project');
const assets=manifest.assets.filter(a=>a.path.startsWith('/lesson-studio/'));
const types={mp3:'audio/mpeg',wav:'audio/wav',webp:'image/webp',png:'image/png',jpg:'image/jpeg',svg:'image/svg+xml',json:'application/json',ogg:'audio/ogg'};
let index=0,verified=0;const failures=[];
async function worker(){while(index<assets.length){const a=assets[index++],key=prefix+a.path;
 try{
 const bytes=readFileSync('release-assets/k-unit-one'+a.path);
 if(createHash('sha256').update(bytes).digest('hex')!==a.sha256)throw Error('Local checksum mismatch');
 const {error}=await client.storage.from('audio').upload(key,bytes,{contentType:types[a.path.split('.').at(-1)],cacheControl:'31536000',upsert:false});
 if(error&&!/already exists|duplicate/i.test(error.message))throw error;
 const url=client.storage.from('audio').getPublicUrl(key).data.publicUrl;
 const response=await fetch(url);
 if(!response.ok)throw Error(`Public asset HTTP ${response.status}`);
 if(createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex')!==a.sha256)throw Error('Remote checksum mismatch');
 verified++;if(verified%200===0)console.log(`${verified}/${assets.length} published and hash verified`);
 }catch(e){failures.push({path:a.path,error:String(e.message)});}
}}
await Promise.all(Array.from({length:6},worker));
const result={base:client.storage.from('audio').getPublicUrl(prefix+'/lesson-studio').data.publicUrl,files:assets.length,verified,failures,immutable:true};
mkdirSync('docs/integration/evidence',{recursive:true});writeFileSync('docs/integration/evidence/published-assets.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result));if(failures.length)process.exitCode=1;
