const fs=require("fs"),path=require("path"),{execSync}=require("child_process"),{GoogleAuth}=require("google-auth-library");
const env=fs.readFileSync(path.resolve(__dirname,"..",".env.local"),"utf8");
const m=env.match(/^GOOGLE_APPLICATION_CREDENTIALS=(.*)$/m);
if(m)process.env.GOOGLE_APPLICATION_CREDENTIALS=m[1].trim().replace(/^["']|["']$/g,"");
const PROJECT_ID="readee-487403",LOCATION="us-central1",MODEL="gemini-2.5-pro-preview-tts",SR=22050;
const ENDPOINT=`https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:streamGenerateContent`;
const OUT=process.argv[2];
// firmer, confident options (not soft/breathy) — female-leaning + a couple punchy
const VOICES=[
  ["Kore","firm"],["Pulcherrima","forward"],["Laomedeia","upbeat"],
  ["Sadachbia","lively"],["Gacrux","mature"]
];
const DIR="Read in a confident, warm, grounded tone. Assured, clear and punchy, upbeat like a fun TikTok ad. Not soft, not breathy, not timid.";
const TEXT="Give your child the love of reading. Join Readee today.";
async function tok(){const a=new GoogleAuth({scopes:["https://www.googleapis.com/auth/cloud-platform"]});return (await(await a.getClient()).getAccessToken()).token;}
async function tts(voice,t){
  const body={contents:[{role:"user",parts:[{text:`${DIR} ${TEXT}`}]}],generationConfig:{responseModalities:["AUDIO"],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:voice}}}}};
  const res=await fetch(ENDPOINT,{method:"POST",headers:{Authorization:`Bearer ${t}`,"Content-Type":"application/json"},body:JSON.stringify(body)});
  if(!res.ok)throw new Error(`${res.status}: ${(await res.text()).slice(0,160)}`);
  const json=await res.json(),chunks=Array.isArray(json)?json:[json],bufs=[];
  for(const ch of chunks)for(const p of(ch?.candidates?.[0]?.content?.parts||[]))if(p.inlineData?.data)bufs.push(Buffer.from(p.inlineData.data,"base64"));
  if(!bufs.length)throw new Error("no audio");
  return Buffer.concat(bufs);
}
(async()=>{
  const t=await tok();
  for(const [v,desc] of VOICES){
    process.stdout.write(`  ${v} (${desc}) ... `);
    try{
      const pcm=await tts(v,t);
      const base=`readee-tiktok-${v.toLowerCase()}`;
      const raw=path.join(OUT,base+".raw"),wav=path.join(OUT,base+".wav"),mp3=path.join(OUT,base+".mp3");
      fs.writeFileSync(raw,pcm);
      execSync(`ffmpeg -y -f s16le -ar ${SR} -ac 1 -i "${raw}" "${wav}"`,{stdio:"pipe"});
      execSync(`ffmpeg -y -f s16le -ar ${SR} -ac 1 -i "${raw}" -codec:a libmp3lame -qscale:a 2 "${mp3}"`,{stdio:"pipe"});
      fs.unlinkSync(raw);
      console.log(`${(fs.statSync(wav).size/(SR*2)).toFixed(1)}s`);
    }catch(e){console.log("SKIP ("+e.message+")");}
  }
})().catch(e=>{console.error("FAILED:",e.message);process.exit(1);});
