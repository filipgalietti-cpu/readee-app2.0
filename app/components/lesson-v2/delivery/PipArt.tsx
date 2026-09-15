/** One editable character rig for the scene, game and story cards. */
export function Bird({ pose = "perch" }: { pose?: string }) {
  return (
    <g className={`pip-bird pip-bird-${pose}`}>
      <path d="M-20 7 Q-48 19-61 7 L-45-7Z" fill="#4c87ad" stroke="#334f60" strokeWidth="2.6" />
      <path
        d="M-31-15 C-33-40-15-52 5-48 C6-70 39-75 50-52 C61-29 43-12 30 0 C13 24-26 17-31-15Z"
        fill="#83bdd5"
        stroke="#334f60"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d={
          pose === "fly" ? "M-15-20 Q-48-72-69-80 Q-53-11 8 0Z" : "M-15-20 Q9-29 19-5 Q-4 12-17-7Z"
        }
        fill="#4f91b7"
        className="pip-wing"
      />
      <path d="M4 7Q19 10 27-2Q29 11 13 14Z" fill="#d6e8e9" />
      <path
        d={pose === "eat" ? "M47-50 L68-45 L49-40 L66-34 L47-31Z" : "M47-47 L65-40 L47-33"}
        fill="#ecb757"
        stroke="#6b5738"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      <ellipse cx="33" cy="-48" rx="4" ry="5" fill="#283e4b" className="pip-eye" />
      <circle cx="34" cy="-50" r="1.4" fill="#fff" />
      <path
        d="M21-70q6-10 13-7 M16-67q2-10 8-11"
        fill="none"
        stroke="#4c87ad"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d={
          pose === "fly"
            ? "M-6 15l-10 3m-5-2 5 2-5 3 M16 13l-5 6m-5-1 5 1-2 4"
            : pose === "run"
              ? "M-6 15l-15 9h-8 M16 13l18 12h8"
              : "M-6 15v12m-7 0H2 M16 13v14m-6 0h15"
        }
        stroke="#6b5738"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {pose === "sing" && (
        <g fill="#7964b7">
          <path d="M66-80v21a5 4 0 1 1-3-4v-24l16-4v21a5 4 0 1 1-3-4v-13Z" />
        </g>
      )}
    </g>
  );
}
export function Bug({ color = "#d26955" }: { color?: string }) {
  return (
    <g stroke="#51443f" strokeWidth="2.5" strokeLinecap="round">
      <path d="M-10-5l-10-8m9 16h-12m13 6l-10 8m31-22 10-8m-9 16h12m-13 6 10 8" />
      <ellipse rx="14" ry="17" fill={color} />
      <path d="M0-16V17" />
      <circle cy="-18" r="7" fill="#51443f" />
      <circle cx="-6" cy="-5" r="2.8" fill="#51443f" />
      <circle cx="7" cy="4" r="2.8" fill="#51443f" />
      <circle cx="-5" cy="10" r="2.8" fill="#51443f" />
    </g>
  );
}
export function Leaf() {
  return (
    <g>
      <path
        d="M-25 13Q-18-29 25-22Q30 22-25 13Z"
        fill="#8da87c"
        stroke="#5e7b55"
        strokeWidth="2.5"
      />
      <path d="M-28 22 15-13" stroke="#5e7b55" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}
export function PipPicture({ kind }: { kind: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" role="img" aria-label={kind}>
      {["tree", "fly", "find", "eat", "sing", "run", "pip"].includes(kind) && (
        <path d="M8 186Q146 151 292 182V200H8Z" fill="#e7edde" />
      )}
      {kind === "tree" ? (
        <>
          <path d="M139 179 146 77h18l8 103Z" fill="#bc9874" />
          <path
            d="M153 119l-46-28m54 19 45-33"
            stroke="#987451"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M73 87C30 59 79 7 121 24C157-18 208 15 204 40C261 19 284 94 240 111C204 145 108 138 73 87Z"
            fill="#97b58a"
          />
        </>
      ) : kind === "park" ? (
        <>
          <path d="M10 190Q135 132 290 187V200H10Z" fill="#dce9d2" />
          <path
            d="M53 173V62h129v111M108 64v54m40-54v54"
            stroke="#9a795a"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
          <path d="M94 119h28m12 0h28" stroke="#6e8195" strokeWidth="7" strokeLinecap="round" />
          <circle cx="235" cy="78" r="37" fill="#a3bc91" />
          <path d="M235 112v64" stroke="#a07e5c" strokeWidth="8" />
        </>
      ) : kind === "road" ? (
        <>
          <path d="M0 166Q150 92 300 154V200H0Z" fill="#e2ead7" />
          <path d="M107 200Q134 98 210 43L236 51Q160 110 188 200Z" fill="#a6ada9" />
          <path
            d="M148 195Q149 102 222 47"
            stroke="#fbf5dc"
            strokeWidth="4"
            strokeDasharray="15 13"
            fill="none"
          />
        </>
      ) : kind === "sun" ? (
        <g transform="translate(150 90)">
          <circle r="37" fill="#efcf86" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((n) => (
            <path
              key={n}
              d="M0-53v-12"
              transform={`rotate(${n})`}
              stroke="#efcf86"
              strokeWidth="5"
              strokeLinecap="round"
            />
          ))}
        </g>
      ) : ["bug", "red-bug", "blue-bug", "gold-bug"].includes(kind) ? (
        <g transform="translate(150 100) scale(2.5)">
          <Bug
            color={kind === "blue-bug" ? "#87b6c9" : kind === "gold-bug" ? "#dcbc6a" : undefined}
          />
        </g>
      ) : kind === "rock" ? (
        <path
          d="M70 152Q65 104 110 80Q135 60 172 78Q230 85 237 141Q190 180 70 152Z"
          fill="#afa99d"
          stroke="#79776f"
          strokeWidth="3"
        />
      ) : kind === "leaf" ? (
        <g transform="translate(150 100) scale(2.5)">
          <Leaf />
        </g>
      ) : (
        <>
          <g
            transform={`translate(${kind === "eat" ? 133 : 148} ${kind === "fly" ? 118 : 144}) scale(1.4)`}
          >
            <Bird pose={kind} />
          </g>
          {kind === "eat" && (
            <g transform="translate(222 88) rotate(80) scale(.55)">
              <Bug />
            </g>
          )}
          {kind === "find" && (
            <g transform="translate(229 147) scale(.65)">
              <Bug />
            </g>
          )}
        </>
      )}
    </svg>
  );
}
