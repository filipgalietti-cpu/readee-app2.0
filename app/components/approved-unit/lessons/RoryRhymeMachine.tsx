import type { CSSProperties } from "react";
/** Lesson-owned animation; the shared Luna interaction owns recognition and evidence. */
export default function RoryRhymeMachine({ target, state, heard, goal=1, words=[] }: { target: string; state: string; heard: string; goal?:number; words?:string[] }) {
  const happy=state==="accepted",retry=state==="retry",listening=state==="listening";
  const label=happy?(words.length>=goal ? "Three rhymes!" : `${words.length} of ${goal} rhymes`):state==="duplicate"?"Try a new word":retry?"Try another word":state==="unclear"?"Let’s listen again":listening?"Rory is listening":"Your turn";
  // Azure capitalizes final transcripts; keep this word-level display stable.
  const word=heard.toLowerCase().replace(/[.!?]+$/," ").trim();
  return <div className="rory-input-machine" data-reaction={state}>
    <div className="rory-robot-stage">
      <svg className="rory-live-robot" viewBox="0 0 240 300" role="img" aria-label={happy?"Rory celebrates your rhyme with raised arms":retry?"Rory tilts his head and encourages another try":"Rory the blue robot listens to your word"}>
        <ellipse cx="120" cy="279" rx="76" ry="9" fill="#354d56" opacity=".12"/>
        <g className="rory-live-body" stroke="#305765" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
          <path d="M90 228v32m60-32v32" strokeWidth="16"/>
          <path d="M70 255h31v19H57q0-19 13-19zm69 0h31q13 0 13 19h-44z" fill="#719fac"/>
          <g className="rory-arm rory-arm-left"><path d="M64 157 40 180 30 205" fill="none" strokeWidth="12"/><circle cx="40" cy="180" r="9" fill="#f5cd77"/><path d="M30 202q-17 0-18 18l10-5 8 12 8-12 10 5q-1-18-18-18z" fill="#96c3c9"/></g>
          <g className="rory-arm rory-arm-right"><path d="m176 157 24 23 10 25" fill="none" strokeWidth="12"/><circle cx="200" cy="180" r="9" fill="#f5cd77"/><path d="M210 202q-17 0-18 18l10-5 8 12 8-12 10 5q-1-18-18-18z" fill="#96c3c9"/></g>
          <rect x="62" y="140" width="116" height="98" rx="27" fill="#83b4be"/>
          <rect x="84" y="164" width="72" height="47" rx="12" fill="#edf4ee" strokeWidth="3"/>
          {happy?<path className="rory-chest-check" d="m100 185 13 12 27-28" fill="none" stroke="#418557" strokeWidth="7"/>:<g className="rory-equalizer" stroke="#6e5bff" strokeWidth="6"><path d="M101 181v13"/><path d="M114 173v29"/><path d="M127 179v17"/><path d="M140 183v9"/></g>}
          <g className="rory-robot-head">
            <path d="M120 43V24"/><circle className="rory-antenna" cx="120" cy="20" r="9" fill={happy?"#8ac884":"#b0a4f8"}/>
            <rect x="43" y="66" width="17" height="39" rx="8" fill="#edbf69"/><rect x="180" y="66" width="17" height="39" rx="8" fill="#edbf69"/>
            <rect x="55" y="45" width="130" height="106" rx="33" fill="#99c5cd"/>
            <rect x="69" y="62" width="102" height="65" rx="22" fill="#f5f1dc" strokeWidth="3"/>
            {happy?<g fill="none"><path d="M84 89q11-17 22 0m28 0q11-17 22 0"/><path d="M107 103q13 20 27 0"/></g>:<><ellipse className="rory-eye" cx="96" cy="86" rx="7" ry="10" fill="#305765" stroke="none"/><ellipse className="rory-eye" cx="145" cy="86" rx="7" ry="10" fill="#305765" stroke="none"/><path d={retry?"M108 109q12-5 25 0":"M108 104q12 12 25 0"} fill="none"/></>}
            <circle cx="82" cy="106" r="5" fill="#e9a69a" stroke="none"/><circle cx="159" cy="106" r="5" fill="#e9a69a" stroke="none"/>
          </g>
        </g>
      </svg>
      {happy&&<div className="rory-rhyme-sparks" aria-hidden="true">{Array.from({length:8},(_,i)=><i key={i} style={{"--spark":i} as CSSProperties}/>)}</div>}
    </div>
    <div className="rory-rhyme-console">
      <div className="rory-console-top" aria-hidden="true"><i/><i/><i/></div>
      <div className="rory-word-windows">
        <div className="rory-word-ticket"><span>{target}</span>{happy&&<b aria-hidden="true">✓</b>}</div>
        <div className="rory-word-link" aria-hidden="true">{happy?"↔":"↓"}</div>
        <div className="rory-word-ticket rory-word-output"><span className="rory-heard-word">{word||<span className="rory-listening-dots" aria-hidden="true"><i/><i/><i/></span>}</span>{happy&&<b aria-hidden="true">✓</b>}</div>
      </div>
      {goal>1&&<ol className="rory-word-collection" aria-label="Your rhyme collection">{Array.from({length:goal},(_,index)=><li key={index} data-filled={!!words[index]} aria-label={words[index] ? `Rhyme ${index+1}: ${words[index]}` : `Rhyme ${index+1}: not yet`}><span>{words[index]||index+1}</span>{words[index]&&<b aria-hidden="true">✓</b>}</li>)}</ol>}
      <div className="rory-machine-verdict" role="status">{label}</div>
      <div className="rory-console-belt" aria-hidden="true"><svg className="rory-console-gear" viewBox="0 0 60 60"><path d="M24 3h12l2 9 8 5 8-2 6 10-7 6v9l-9 5-2 10H29l-4-9-9-2-8 3-6-11 7-6 2-9-2-8 10-6z"/><circle cx="30" cy="30" r="10"/></svg><div><i/><i/><i/><i/><i/></div></div>
    </div>
  </div>;
}
