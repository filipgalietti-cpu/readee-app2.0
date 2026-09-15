import { Bird } from "./PipArt";
/** Lesson-specific staging. Meaning/state arrives from the authored scene;
 * the delivery engine contains no bird, tree or story identifiers. */
export default function PipsTree({ moment = "rest" }: { moment?: string }) {
  const eating = moment === "eat",
    where = moment === "where";
  return (
    <svg
      className={`pip-tree pip-${moment}`}
      viewBox="0 0 800 340"
      role="img"
      aria-label={
        where
          ? "The big tree where Pip’s story happens"
          : eating
            ? "Pip the blue bird on a tree branch after eating the bug"
            : "Pip the blue bird by a big tree"
      }
    >
      <path d="M0 300 Q160 252 300 280 Q510 250 800 292 L800 330 H0Z" fill="#e0ead8" />
      <g className="pip-tree-trunk" stroke="#624e3c" strokeWidth="3" strokeLinejoin="round">
        <path d="M565 315 Q579 243 562 124 L603 120 Q594 240 622 315Z" fill="#b88a65" />
        <path d="M580 204 Q521 177 420 194 L415 178 Q512 159 578 176" fill="#b88a65" />
        <path d="M594 175 Q638 162 665 124 L674 132 Q649 186 599 194" fill="#b88a65" />
      </g>
      <g fill="#a5be90">
        <ellipse cx="513" cy="99" rx="119" ry="62" />
        <ellipse cx="628" cy="76" rx="100" ry="62" />
        <ellipse cx="691" cy="119" rx="80" ry="55" />
      </g>
      <g fill="#86a778">
        <ellipse cx="495" cy="114" rx="82" ry="40" />
        <ellipse cx="601" cy="107" rx="105" ry="50" />
        <ellipse cx="697" cy="140" rx="67" ry="37" />
      </g>
      <path
        d="M588 153 Q580 236 596 293"
        stroke="#8b6549"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      <g className="pip-stage-bird" key={moment}>
        <Bird pose={moment} />
      </g>
      {!eating && (
        <g className="pip-stage-bug" transform="translate(473 171)">
          <ellipse rx="10" ry="8" fill="#c25c52" stroke="#543e38" strokeWidth="2" />
          <path d="M0 -7V8" stroke="#543e38" strokeWidth="2" />
          <circle cx="9" r="4" fill="#543e38" />
          <circle cx="-4" cy="-3" r="2" fill="#543e38" />
          <circle cx="3" cy="4" r="2" fill="#543e38" />
        </g>
      )}
      <path
        d="M91 310q-11-24 1-39q10 20 3 39 M111 311q-5-17 6-28q6 21-6 28 M710 310q-10-22 1-36q9 20 2 36"
        fill="#8ba97c"
      />
      {where && (
        <ellipse
          className="pip-place-ring"
          pathLength={500}
          cx="580"
          cy="168"
          rx="215"
          ry="162"
          fill="none"
          stroke="#6e5bff"
          strokeWidth="5"
        />
      )}
    </svg>
  );
}
