"use client";

import s from "./OrganicLoader.module.css";

export type OrganicLoaderVariant =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20;

type Props = {
  variant?: OrganicLoaderVariant;
  className?: string;
  "aria-label"?: string;
};

export function OrganicLoader({
  variant = 1,
  className,
  "aria-label": ariaLabel = "Loading",
}: Props) {
  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={`${s.root}${className ? " " + className : ""}`}
    >
      {renderVariant(variant)}
    </div>
  );
}

function renderVariant(v: OrganicLoaderVariant) {
  switch (v) {
    case 1:  return <div className={s.l01} />;
    case 2:  return <Metaballs />;
    case 3:  return <div className={s.l03} />;
    case 4:  return <div className={s.l04}><i /><i /><i /></div>;
    case 5:  return <div className={s.l05}><i /><i /><i /></div>;
    case 6:  return <div className={s.l06}><i /><i /><i /></div>;
    case 7:  return <div className={s.l07} />;
    case 8:  return <SvgMorph />;
    case 9:  return <div className={s.l09} />;
    case 10: return <div className={s.l10}><span /></div>;
    case 11: return <NoiseBlob />;
    case 12: return <div className={s.l12}><i /><i /><i /></div>;
    case 13: return <div className={s.l13}><i /><i /></div>;
    case 14: return <div className={s.l14}><i /><i /></div>;
    case 15: return <div className={s.l15} />;
    case 16: return <div className={s.l16}><i /><i /><i /><i /><i /></div>;
    case 17: return <div className={s.l17} />;
    case 18: return <div className={s.l18}><i /><i /><i /></div>;
    case 19: return <Ribbon />;
    case 20: return <div className={s.l20} />;
  }
}

function Metaballs() {
  return (
    <svg className={s.l02Svg} viewBox="0 0 200 200">
      <g>
        <circle r="22">
          <animate attributeName="cx" values="60;140;60" dur="3.2s" repeatCount="indefinite" />
          <animate attributeName="cy" values="100;100;100" dur="3.2s" repeatCount="indefinite" />
          <animate attributeName="fill" values="#6366f1;#8b5cf6;#6366f1" dur="3.2s" repeatCount="indefinite" />
        </circle>
        <circle r="20">
          <animate attributeName="cx" values="100;100;100" dur="3.2s" repeatCount="indefinite" />
          <animate attributeName="cy" values="60;140;60" dur="3.2s" repeatCount="indefinite" />
          <animate attributeName="fill" values="#8b5cf6;#ec4899;#8b5cf6" dur="3.2s" repeatCount="indefinite" />
        </circle>
        <circle r="24" cx="100" cy="100" fill="#ec4899">
          <animate attributeName="r" values="20;28;20" dur="3.2s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  );
}

function SvgMorph() {
  return (
    <svg className={s.l08Svg} viewBox="0 0 200 200">
      <path>
        <animate
          attributeName="d"
          dur="6s"
          repeatCount="indefinite"
          values="
            M100,30 C150,30 175,65 175,100 C175,140 145,170 100,170 C60,170 25,145 25,100 C25,65 55,30 100,30 Z;
            M100,25 C160,40 180,75 170,115 C160,160 115,180 80,170 C40,160 20,120 30,80 C40,45 70,15 100,25 Z;
            M100,35 C145,25 175,55 175,95 C180,140 140,175 100,170 C55,165 25,135 30,95 C35,60 65,30 100,35 Z;
            M100,30 C150,30 175,65 175,100 C175,140 145,170 100,170 C60,170 25,145 25,100 C25,65 55,30 100,30 Z"
        />
      </path>
    </svg>
  );
}

function NoiseBlob() {
  return (
    <svg className={s.l11Svg} viewBox="0 0 200 200">
      <defs>
        <filter id="oloader-warp-11" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={2} seed={3}>
            <animate attributeName="baseFrequency" dur="9s" values="0.012;0.022;0.012" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale="22" />
        </filter>
      </defs>
      <circle cx="100" cy="100" r="55" fill="url(#oloader-grad-11)" filter="url(#oloader-warp-11)">
        <animate attributeName="r" values="50;62;50" dur="3.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function Ribbon() {
  return (
    <svg className={s.l19Svg} viewBox="0 0 200 200">
      <path d="M40,100 C40,55 75,40 100,70 C125,100 160,80 160,120 C160,160 110,170 90,140 C70,110 40,145 40,100 Z" />
    </svg>
  );
}
