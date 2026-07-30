import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" }); loadEnv();
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/images";
const GF: Record<string,string> = { K:"kindergarten","1":"1st-grade","2":"2nd-grade","3":"3rd-grade","4":"4th-grade" };
function convUrl(id: string): string | null {
  const m = id.match(/^([A-Za-z]+)\.(K|1|2|3|4)\./) || id.match(/^(K|1|2|3|4)\./);
  const g = (id.match(/\.(K|1|2|3|4)\./)?.[1]) || (id.match(/^(K|1|2|3|4)\./)?.[1]);
  if (!g) return null;
  const std = id.replace(/-[A-Za-z]?\d+$/, "");
  return `${BASE}/${GF[g]}/${std}/${id}.png`;
}
async function head(url: string): Promise<boolean> {
  try { const r = await fetch(url, { method: "HEAD" }); return r.ok; } catch { return false; }
}
(async () => {
  const files = ["kindergarten","1st-grade","2nd-grade","3rd-grade","4th-grade"].map(n=>`app/data/${n}-standards-questions.json`);
  const qs: {id:string; url:string}[] = [];
  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(f,"utf8"));
    for (const s of d.standards) for (const q of s.questions||[]) {
      const url = q.image_url || convUrl(q.id);
      if (url) qs.push({ id:q.id, url });
    }
  }
  let has=0, missing=0; const miss: string[]=[];
  const CONC=60;
  for (let i=0;i<qs.length;i+=CONC){
    const batch=qs.slice(i,i+CONC);
    const res=await Promise.all(batch.map(q=>head(q.url)));
    res.forEach((ok,j)=>{ if(ok)has++; else {missing++; if(miss.length<20)miss.push(batch[j].id);} });
    process.stdout.write(`\r${i+batch.length}/${qs.length}`);
  }
  console.log(`\nHAS real image file: ${has}\nMISSING (404): ${missing}\ntotal checked: ${qs.length}`);
  console.log("sample missing:", miss.join(", "));
})();
