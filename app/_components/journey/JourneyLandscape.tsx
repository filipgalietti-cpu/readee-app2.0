import type { JourneyTheme as Theme } from "@/lib/journey/adventure-view";
import type { MapGeometry } from "./geometry";

function Tree({
  x,
  y,
  size = 1,
  color = "#87a68a",
  pine = false,
  artAspect = 1,
}: {
  x: number;
  y: number;
  size?: number;
  color?: string;
  pine?: boolean;
  artAspect?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size} ${size * artAspect})`}>
      <ellipse cy="42" rx="30" ry="9" fill="#647957" opacity=".18" />
      <path d="M-4 10 L-3 41 Q0 45 5 41 L4 8" fill="#a08466" />
      {pine ? (
        <>
          <path d="M0 -48 L-32 4 H-20 L-39 24 Q0 34 39 24 L20 4 H32Z" fill={color} />
          <path d="M0 -40 V24 L25 26Z" fill="#3c695c" opacity=".16" />
        </>
      ) : (
        <>
          <path
            d="M-31 1 C-49 -18 -19 -51 0 -49 C24 -51 47 -21 33 -1 C53 18 12 37 0 24 C-25 39 -51 16 -31 1Z"
            fill={color}
          />
          <path
            d="M5 -36 C34 -25 35 10 12 25 C43 23 46 5 32 -2 C43 -16 23 -41 5 -36"
            fill="#315945"
            opacity=".18"
          />
          <ellipse cx="-12" cy="-19" rx="12" ry="17" fill="#fff" opacity=".2" />
        </>
      )}
    </g>
  );
}
function Flower({
  x,
  y,
  color,
  artAspect = 1,
}: {
  x: number;
  y: number;
  color: string;
  artAspect?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(1 ${artAspect})`}>
      <path d="M0 0 V13 M0 9 Q-10 3 -7 11" stroke="#93a67a" strokeWidth="2" fill="none" />
      <path d="M0-6 C-7-11-11-3-6 0 C-13 6-4 12 0 6 C7 12 12 3 6 0 C12-6 4-11 0-6" fill={color} />
      <circle r="2.5" fill="#e8ba66" />
    </g>
  );
}

/** Regional scenery only: these landmarks never imply a curriculum relationship. */
function RegionalArtwork({
  theme,
  mobile,
  height,
  artAspect,
}: {
  theme: Theme;
  mobile: boolean;
  height: number;
  artAspect: number;
}) {
  return (
    <g
      data-region-artwork={theme}
      transform={
        mobile
          ? `translate(75 ${height - 500}) scale(.6)`
          : `translate(130 520) scale(1 ${artAspect})`
      }
    >
      {theme === "garden" ? (
        <>
          <path d="M-100 10 Q0-15 100 10 L82 53 Q0 76-84 51Z" fill="#bccf97" />
          {[-55, 0, 55].map((x, i) => (
            <g key={x} transform={`translate(${x} ${i % 2 ? 12 : 0})`}>
              <path
                d="M-21 16L14 8L26 35L-12 44Z"
                fill="#b99872"
                stroke="#e0c69f"
                strokeWidth="4"
              />
              <path d="M0 26V-5" stroke="#5e7d46" strokeWidth="3" />
              <path d="M0 15Q-28-8-17-13Q1-11 0 15M0 5Q7-23 22-19Q26-3 0 5" fill="#819e62" />
              <circle cy="-9" r="7" fill={i === 1 ? "#c1a3cd" : "#e7b96c"} />
            </g>
          ))}
          <path
            d="M90 2h21v26H90zM111 10l17-12 4 6-21 20M90 5Q70-7 76 17H90"
            fill="#9dbac0"
            stroke="#698f96"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </>
      ) : theme === "woods" ? (
        <>
          <path d="M-96 44Q0 9 105 45Q0 74-96 44" fill="#a8bda2" />
          <path d="M-50-25H50V48H-50Z" fill="#bca584" stroke="#867452" strokeWidth="3" />
          <path d="M-67-23L0-72L67-23L59-12L0-52L-59-12Z" fill="#537563" />
          <path d="M-23 48V-7Q0-29 23-7V48Z" fill="#587466" />
          <path d="M-13-1Q-4-5 0 0Q7-5 14-1V18Q7 15 0 20Q-6 15-13 18Z" fill="#fff5d7" />
          <path d="M0 0V20" stroke="#baa980" />
          <path d="M-60 50H60" stroke="#9b865f" strokeWidth="7" strokeLinecap="round" />
          <path d="M78 38V-34H61" fill="none" stroke="#8d795b" strokeWidth="3" />
          <path d="M58-31H72L74-10H56Z" fill="#edcb80" stroke="#97835b" strokeWidth="2" />
        </>
      ) : (
        <>
          <path d="M-95 20Q0-15 100 22L77 54Q0 72-75 53Z" fill="#d7c493" />
          <path d="M-69 8L37-7L71 35L-39 50Z" fill="#c0a4a9" />
          <path
            d="M-48 6L-17 47M-15 0L15 42M20-4L51 38M-60 20L47 6M-48 35L60 22"
            stroke="#ead9ce"
            strokeWidth="3"
          />
          <path
            d="M-24-21Q-7-30 7-19Q26-29 44-20V14Q23 7 7 19Q-8 9-24 17Z"
            fill="#fff8e9"
            stroke="#a48d6e"
            strokeWidth="2"
          />
          <path d="M7-19V19M-17-12L0-9M16-10L35-12M-17-4L0-1" stroke="#cabb9b" strokeWidth="2" />
          <path d="M-89 0Q-94-17-79-21Q-66-20-70-3" fill="none" stroke="#a28d69" strokeWidth="3" />
          <path d="M-96-4H-65L-68 19H-92Z" fill="#c3aa7d" />
        </>
      )}
    </g>
  );
}

/** Lightweight hand-drawn SVG terrain. Presentation themes never enter curriculum data. */
export default function JourneyLandscape({
  geometry: g,
  theme,
  artAspect = 1,
}: {
  geometry: MapGeometry;
  theme: Theme;
  artAspect?: number;
}) {
  const woods = theme === "woods",
    valley = theme === "valley";
  const base = woods ? "#dfe9db" : valley ? "#eee5d5" : "#e7ecd4";
  const foliage = woods ? "#638b75" : valley ? "#a2a282" : "#89a47b";
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${g.width} ${g.height}`}
      preserveAspectRatio="none"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <defs>
        <pattern id={`paper-${theme}`} width="27" height="27" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="5" r=".7" fill="#a0a589" opacity=".16" />
        </pattern>
      </defs>
      <rect width={g.width} height={g.height} fill="#f8f7ef" />
      {g.mobile ? (
        <>
          <path
            d={`M-40 110 Q120 10 360 80 V${g.height} H0 Q-30 750 35 570 T-40 110`}
            fill={base}
          />
          <path d={`M340 350 Q270 550 335 760 T270 ${g.height} H400 V350Z`} fill="#b4d8d9" />
          <path d="M-40 440 Q50 340 120 405 T180 550 Q60 600 -40 550Z" fill="#cad9b9" />
        </>
      ) : (
        <>
          <path
            d="M-60 310 Q-10 108 160 140 Q260 30 452 112 Q641 56 772 75 Q942 6 1070 187 L1050 515 Q890 624 704 560 Q495 652 329 562 Q71 636 -60 455Z"
            fill="#d9d7bc"
          />
          <path
            d="M-60 293 Q-10 91 160 123 Q260 13 452 95 Q641 39 772 58 Q942-11 1070 170 L1050 498 Q890 607 704 543 Q495 635 329 545 Q71 619 -60 438Z"
            fill={base}
          />
          <path
            d="M510 570 Q607 477 660 493 Q735 492 742 540 Q792 562 915 491 Q1016 449 1030 530 V640 H475Z"
            fill="#afd3d6"
          />
          <path
            d="M519 582 Q622 496 653 505 M778 570 Q868 568 935 518"
            fill="none"
            stroke="#eaf5f3"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path d="M430 105 Q480 32 562 89 Q599 106 631 135 Q522 177 430 105" fill="#cddbb7" />
          <path d="M30 550 Q95 452 172 490 T380 560 Q210 641 30 550" fill="#ccd9b5" />
          <g transform="translate(783 525) rotate(-15)">
            <rect x="-40" y="-10" width="80" height="32" rx="4" fill="#b29978" />
            {[-30, -15, 0, 15, 30].map((x) => (
              <path key={x} d={`M${x} -10 V22`} stroke="#e1c7a2" strokeWidth="3" />
            ))}
            <path d="M-43-10H43M-43 22H43" stroke="#8e795d" strokeWidth="5" strokeLinecap="round" />
          </g>
          <g opacity=".7">
            <path d="M80 80 Q105 67 126 83" fill="none" stroke="#d7d5bd" strokeWidth="2" />
            <path
              d="M585 30 Q593 22 601 30 Q609 22 617 30"
              fill="none"
              stroke="#a5b5a8"
              strokeWidth="2.5"
            />
          </g>
        </>
      )}
      <rect width={g.width} height={g.height} fill={`url(#paper-${theme})`} />
      <RegionalArtwork theme={theme} mobile={g.mobile} height={g.height} artAspect={artAspect} />
      {(g.mobile
        ? [
            [295, 130, 0.7],
            [310, 620, 0.6],
            [45, 470, 0.7],
            [40, g.height - 180, 0.65],
            [285, g.height - 75, 0.7],
          ]
        : [
            [100, 218, 1.05],
            [165, 206, 0.75],
            [435, 420, 0.8],
            [530, 500, 1.1],
            [580, 465, 0.75],
            [770, 86, 0.8],
            [955, 345, 1.1],
            [905, 390, 0.8],
            [40, 415, 0.8],
          ]
      ).map(([x, y, size], i) => (
        <Tree
          key={i}
          x={x}
          y={y}
          size={size}
          color={i % 3 === 0 ? (valley ? "#bda075" : foliage) : foliage}
          pine={woods || i === 5}
          artAspect={artAspect}
        />
      ))}
      {(g.mobile
        ? [
            [30, 200],
            [305, 355],
            [55, 580],
            [290, 800],
            [195, g.height - 80],
          ]
        : [
            [190, 490],
            [220, 495],
            [390, 170],
            [608, 305],
            [645, 292],
            [735, 475],
            [90, 355],
            [958, 235],
          ]
      ).map(([x, y], i) => (
        <Flower key={i} x={x} y={y} artAspect={artAspect} color={i % 2 ? "#c2a9d6" : "#e8c7b4"} />
      ))}
      <g transform={g.mobile ? "translate(310 440)" : "translate(588 145)"}>
        <ellipse cx="0" cy="19" rx="22" ry="5" fill="#768768" opacity=".2" />
        <path d="M-19 12L-3 9L19 12V19L-3 17L-19 20Z" fill="#b99e79" />
        <path
          d="M-17 1Q-4-3 0 4Q10-4 20 0V13Q10 10 0 15Q-8 10-17 14Z"
          fill="#fffaf0"
          stroke="#a39177"
          strokeWidth="1.5"
        />
        <path d="M0 4V15" stroke="#cec3ac" />
      </g>
    </svg>
  );
}

export function CheckpointLandmark({ complete = false }: { complete?: boolean }) {
  return (
    <svg viewBox="0 0 140 140" aria-hidden="true">
      <ellipse cx="70" cy="127" rx="58" ry="9" fill="#768768" opacity=".2" />
      <path d="M23 69Q70 13 117 69V120H23Z" fill="#ba9fd1" stroke="#87619f" strokeWidth="3" />
      <path d="M44 119V83Q70 46 96 83V119" fill="#f5eddd" />
      <path d="M15 64Q70-3 125 64L115 73Q70 17 25 73Z" fill={complete ? "#849d85" : "#77529e"} />
      <path d="M69 26V4L100 14L70 22" fill="#e3b76c" />
      <path
        d="M39 53Q54 45 70 54Q86 44 103 53L97 74Q84 65 70 74Q52 65 43 75Z"
        fill="#fff8e8"
        stroke="#ac9072"
        strokeWidth="2"
      />
      <path d="M70 54V74" stroke="#c8af91" />
      <path d="M24 108H116M29 115H111" stroke="#c7b493" strokeWidth="3" />
      <circle cx="70" cy="91" r="5" fill="#dcc07d" />
      <path d="M17 120H123" stroke="#a28f72" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}
export function MilestoneLandmark({ complete = false }: { complete?: boolean }) {
  return (
    <svg viewBox="0 0 110 100" aria-hidden="true">
      <ellipse cx="55" cy="89" rx="43" ry="7" fill="#8b8566" opacity=".16" />
      <path
        d="M23 43Q24 19 55 19Q86 19 87 43V82H23Z"
        fill={complete ? "#e7be68" : "#b9aa8e"}
        stroke="#8f7d61"
        strokeWidth="3"
      />
      <path
        d={complete ? "M23 43L16 18Q55-1 88 18L87 43Z" : "M23 43H87"}
        fill="#f4d88b"
        stroke="#8f7d61"
        strokeWidth="3"
      />
      <path d="M34 26V79M77 26V79" stroke="#f5df9b" strokeWidth="7" />
      <rect x="47" y="43" width="16" height="18" rx="4" fill="#fff2bf" />
      <circle cx="55" cy="50" r="3" fill="#a18751" />
    </svg>
  );
}
