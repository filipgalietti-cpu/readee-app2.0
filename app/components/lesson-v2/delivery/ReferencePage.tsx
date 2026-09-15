"use client";
import { useId, useState } from "react";
import { Volume2 } from "lucide-react";
import type { ReferencePageDef } from "@/lib/lesson-engine/types";
import { lessonAssetUrl } from "@/lib/lesson-engine/asset-url";
import { spokenSentences } from "@/lib/lesson-engine/delivery/sentences";
import Karaoke from "./Karaoke";
import "./reference-page.css";

/** Source material only. Answer choices and scoring stay in the existing interaction. */
export default function ReferencePage({
  page,
  caption,
  activeWord,
  onRead,
  onSelect,
  disabled = false,
}: {
  page: ReferencePageDef;
  caption: string;
  activeWord: number;
  onRead: (sectionIndex?: number) => void;
  onSelect?: (sectionIndex: number) => void;
  disabled?: boolean;
}) {
  const [selected, setSelected] = useState(0);
  const uid = useId();
  const tabbed = page.presentation === "tabs" && page.sections.length === 2;
  const choose = (index: number) => {
    setSelected(index);
    onSelect?.(index);
  };
  const words = (text: string) => <Karaoke text={text} caption={caption} activeWord={activeWord} />;
  return (
    <article
      className={`le-reference${tabbed ? " is-tabbed" : ""}`}
      aria-label={page.title ?? "Source page"}
    >
      <div className="le-reference-top">
        {page.title ? <p>{words(page.title)}</p> : <span />}
        <button
          type="button"
          aria-label="Read the source page"
          onClick={() => onRead(tabbed ? selected : undefined)}
          disabled={disabled}
        >
          <Volume2 size={20} />
        </button>
      </div>
      {tabbed && (
        <div className="le-reference-tabs" role="tablist" aria-label="Choose a source text">
          {page.sections.map((section, index) => (
            <button
              type="button"
              role="tab"
              key={index}
              id={`${uid}-tab-${index}`}
              aria-controls={`${uid}-panel-${index}`}
              aria-selected={selected === index}
              tabIndex={selected === index ? 0 : -1}
              disabled={disabled}
              onClick={() => choose(index)}
              onKeyDown={(event) => {
                if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
                event.preventDefault();
                const next = event.key === "Home" ? 0 : event.key === "End" ? 1 : 1 - index;
                choose(next);
                document.getElementById(`${uid}-tab-${next}`)?.focus();
              }}
            >
              {words(section.heading)}
            </button>
          ))}
        </div>
      )}
      <div
        className={`le-reference-sections${page.sections.length === 2 && !tabbed ? " has-two" : ""}`}
      >
        {page.sections.map((section, index) => (
          <section
            hidden={tabbed && index !== selected}
            className="le-reference-section"
            key={index}
            aria-label={section.heading}
            role={tabbed ? "tabpanel" : undefined}
            id={`${uid}-panel-${index}`}
            aria-labelledby={tabbed ? `${uid}-tab-${index}` : undefined}
          >
            {!tabbed && <h2>{words(section.heading)}</h2>}
            {section.image && (
              <img
                className="le-reference-image"
                src={lessonAssetUrl(section.image.src)}
                alt={section.image.alt}
                decoding="async"
              />
            )}
            {section.text && (
              <p className="le-reference-text">
                {section.text.includes("\n") ? section.text.split("\n").map((line, lineIndex) => <span key={lineIndex}>{lineIndex > 0 && <br aria-hidden="true"/>}{spokenSentences(line).map((sentence, sentenceIndex) => <span key={sentenceIndex}>{words(sentence)} </span>)}</span>) : spokenSentences(section.text).map((sentence, n) => (
                  <span key={n}>{words(sentence)} </span>
                ))}
              </p>
            )}
            {section.entries && (
              <dl className="le-reference-entries">
                {section.entries.map((entry, n) => (
                  <div key={n}>
                    <dt>{words(entry.term)}</dt>
                    <dd>{words(entry.detail)}</dd>
                  </div>
                ))}
              </dl>
            )}
            {section.caption && <p className="le-reference-caption">{words(section.caption)}</p>}
            {section.page !== undefined && (
              <p className="le-reference-number">{words(`Page ${section.page}.`)}</p>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}
