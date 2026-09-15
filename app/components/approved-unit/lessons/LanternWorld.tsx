"use client";
import { useId } from "react";
import { lanternAsset, lanternFormLessons, lanternGlyphTransform } from "@/app/data/lesson-packages/letter-pairs";

type Props = { props: Record<string, string | number | boolean> };
function Lantern({ letters, active, caption, word, index, largeLetters }: { largeLetters: boolean; letters: string; active: boolean; caption: string; word: number; index: number }) {
  const id = useId();
  const form = lanternFormLessons[letters];
  const words = caption.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z]/g, ""));
  // Shape emphasis follows the recorded narration's measured word index.
  const teaching = form && caption === form.description && active;
  return <div className="lantern-hanging" data-lit={active} style={{ "--lantern-delay": `${index * -1.3}s` } as React.CSSProperties}>
    <svg className="lantern-lamp" viewBox="0 0 150 214" role="img" aria-label={letters.length === 1 ? `${letters === letters.toUpperCase() ? "Uppercase" : "Lowercase"} ${letters}` : `${letters[0]} and ${letters[1]}, letter partners`}>
      <defs>
        <radialGradient id={id}><stop offset="0" stopColor="#fff3b3" stopOpacity=".75"/><stop offset="1" stopColor="#edc970" stopOpacity="0"/></radialGradient>
      </defs>
      <ellipse className="lantern-light" cx="75" cy="110" rx="74" ry="82" fill={`url(#${id})`} />
      <path d="M75 0V24M52 46V35C52 8 98 8 98 35V46" fill="none" stroke="#796645" strokeWidth="3" />
      <path d="M34 46C7 64 10 151 34 169Q75 183 116 169C140 151 143 64 116 46Q75 34 34 46Z" fill={active ? "#fff2c3" : "#ede4d1"} stroke="#ab8750" strokeWidth="2.5" />
      <path d="M34 48C26 81 26 137 34 167M116 48C124 81 124 137 116 167" fill="none" stroke="#d2b67c" strokeWidth="5" />
      <path d="M24 64Q75 55 126 64M18 87Q75 79 132 87M18 139Q75 148 132 139M25 160Q75 170 125 160" fill="none" stroke="#d2b67c" strokeWidth="1" opacity=".45" />
      <rect x="34" y="42" width="82" height="7" rx="3" fill="#947140" />
      <rect x="34" y="167" width="82" height="7" rx="3" fill="#947140" />
      {form ? <g data-letter-form={letters} transform={lanternGlyphTransform(letters, largeLetters ? 1.05 : .8)} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7">
        {form.parts.map((part, i) => {
          const at = words.indexOf(part.cue);
          const lit = teaching && at >= 0 && word >= at;
          return <path key={part.path} d={part.path} data-shape-part={part.cue} data-emphasized={lit || undefined} stroke={lit ? "#7755cc" : "#3e3544"} className="lantern-letter-stroke" />;
        })}
      </g> : <text x="75" y="110" dominantBaseline="central" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={letters.length > 1 ? 57 : 78} fill="#3e3544">{letters}</text>}
      <path d="M75 174V192M69 193V207M75 192V211M81 193V207" stroke="#ac8147" strokeWidth="3" strokeLinecap="round" />
    </svg>
    {letters.length === 1 && <span className="lantern-form-label">{letters === letters.toUpperCase() ? "Uppercase" : "Lowercase"}</span>}
  </div>;
}
export default function LanternWorld({ props }: Props) {
  if (props.image) return <img className="lantern-scene" src={String(props.image)} alt={String(props.alt || "")} />;
  const groups = String(props.letters || "B b").split(" ");
  const celebration = !!props.celebration;
  return <div className={`lantern-world ${celebration ? "lantern-celebration" : ""}`} data-print-size={String(props.variant || "regular")}>
    {celebration && <img className="lantern-celebration-backdrop" src={lanternAsset("opening.webp")} alt="The lantern garden glowing at dusk" />}
    <div className="lantern-canopy">
      {groups.map((letters, index) => <Lantern key={letters} letters={letters} active={!props.activeForm || props.activeForm === letters} caption={String(props.narrationCaption || "")} word={Number(props.narrationWord ?? -1)} index={index} largeLetters={!!props.largeLetters} />)}
    </div>
  </div>;
}
