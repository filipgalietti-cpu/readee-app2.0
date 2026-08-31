const fs=require("fs"),path=require("path"),{execSync}=require("child_process"),{GoogleAuth}=require("google-auth-library");
const env=fs.readFileSync(path.resolve(__dirname,"..",".env.local"),"utf8");
const m=env.match(/^GOOGLE_APPLICATION_CREDENTIALS=(.*)$/m);
if(m)process.env.GOOGLE_APPLICATION_CREDENTIALS=m[1].trim().replace(/^["']|["']$/g,"");
const PROJECT_ID="readee-487403",LOCATION="us-central1",MODEL="gemini-2.5-pro-preview-tts",VOICE="Kore",SR=22050;
const ENDPOINT=`https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:streamGenerateContent`;
const NAME="readee-tiktok-kore-placement-url";
const DIR="Read in a confident, warm, grounded tone. Assured, clear and punchy, upbeat like a fun TikTok ad. Not soft, not breathy, not timid.";
const TEXT="Give your child the love of reading. Take your free placement exam today at learn dot readee dot app.";
(async()=>{
  const auth=new GoogleAuth({scopes:["https://www.googleapis.com/auth/cloud-platform"]});
  const tok=(await(await auth.getClient()).getAccessToken()).token;
  const body={contents:[{role:"user",parts:[{text:`${DIR} ${TEXT}`}]}],generationConfig:{responseModalities:["AUDIO"],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:VOICE}}}}};
  const res=await fetch(ENDPOINT,{method:"POST",headers:{Authorization:`Bearer ${tok}`,"Content-Type":"application/json"},body:JSON.stringify(body)});
  if(!res.ok)throw new Error(`API ${res.status}: ${(await res.text()).slice(0,300)}`);
  const json=await res.json(),chunks=Array.isArray(json)?json:[json],bufs=[];
  for(const ch of chunks)for(const p of(ch?.candidates?.[0]?.content?.parts||[]))if(p.inlineData?.data)bufs.push(Buffer.from(p.inlineData.data,"base64"));
  for(const OUT of process.argv.slice(2)){
    const raw=path.join(OUT,NAME+".raw"),wav=path.join(OUT,NAME+".wav"),mp3=path.join(OUT,NAME+".mp3");
    fs.writeFileSync(raw,Buffer.concat(bufs));
    execSync(`ffmpeg -y -f s16le -ar ${SR} -ac 1 -i "${raw}" "${wav}"`,{stdio:"pipe"});
    execSync(`ffmpeg -y -f s16le -ar ${SR} -ac 1 -i "${raw}" -codec:a libmp3lame -qscale:a 2 "${mp3}"`,{stdio:"pipe"});
    fs.unlinkSync(raw);
    console.log("wrote to",OUT);
  }
})().catch(e=>{console.error("FAILED:",e.message);process.exit(1);});
