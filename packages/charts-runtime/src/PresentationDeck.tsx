"use client";

import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { presentationEnterStyle } from "@axicharts/charts";

export type PresentationDeckSlide = {
  id: string;
  title?: string;
  subtitle?: string;
  callout?: string;
  content: ReactNode;
};

export type PresentationDeckProps = {
  slides: PresentationDeckSlide[];
  title?: string;
  initialIndex?: number;
  onExit?: () => void;
  className?: string;
};

const shellStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 50,
  background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
  color: "#e2e8f0",
  display: "flex",
  flexDirection: "column",
};

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 20px",
  borderBottom: "1px solid #334155",
};

const mainStyle: CSSProperties = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px 32px",
  overflow: "auto",
};

const slideFrameStyle: CSSProperties = {
  width: "min(960px, 100%)",
  background: "#ffffff",
  color: "#0f172a",
  borderRadius: 16,
  boxShadow: "0 24px 64px rgba(15, 23, 42, 0.35)",
  padding: 28,
  minHeight: 360,
};

const footerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 20px",
  borderTop: "1px solid #334155",
  fontSize: 12,
};

const buttonStyle: CSSProperties = {
  fontSize: 12,
  padding: "6px 14px",
  borderRadius: 8,
  border: "1px solid #475569",
  background: "#1e293b",
  color: "#e2e8f0",
  cursor: "pointer",
};

function clampIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return Math.max(0, Math.min(index, length - 1));
}

export function PresentationDeck({
  slides,
  title,
  initialIndex = 0,
  onExit,
  className,
}: PresentationDeckProps): ReactElement {
  const [activeIndex, setActiveIndex] = useState(() => clampIndex(initialIndex, slides.length));

  useEffect(() => {
    setActiveIndex(clampIndex(initialIndex, slides.length));
  }, [initialIndex, slides.length]);

  const goNext = useCallback(() => {
    setActiveIndex((current) => clampIndex(current + 1, slides.length));
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((current) => clampIndex(current - 1, slides.length));
  }, [slides.length]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault();
        goNext();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      } else if (event.key === "Escape") {
        event.preventDefault();
        onExit?.();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev, onExit]);

  const slide = slides[activeIndex];
  const hasSlides = slides.length > 0;

  return (
    <div className={className} style={shellStyle} data-testid="presentation-deck">
      <header style={headerStyle}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{title ?? slide?.title ?? "Presentation"}</div>
          {slide?.subtitle ? (
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{slide.subtitle}</div>
          ) : null}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>
            {hasSlides ? `${activeIndex + 1} / ${slides.length}` : "0 / 0"}
          </span>
          {onExit ? (
            <button type="button" onClick={onExit} style={buttonStyle}>
              Exit
            </button>
          ) : null}
        </div>
      </header>

      <main style={mainStyle}>
        {slide ? (
          <div
            key={`${slide.id}-${activeIndex}`}
            style={{ ...slideFrameStyle, ...presentationEnterStyle(true) }}
          >
            {slide.title ? (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 20, fontWeight: 600 }}>{slide.title}</div>
                {slide.subtitle ? (
                  <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{slide.subtitle}</div>
                ) : null}
              </div>
            ) : null}
            <div data-testid="presentation-deck-slide-content">{slide.content}</div>
            {slide.callout ? (
              <div
                style={{
                  marginTop: 20,
                  fontSize: 13,
                  color: "#475569",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  padding: "12px 14px",
                  lineHeight: 1.5,
                }}
              >
                {slide.callout}
              </div>
            ) : null}
          </div>
        ) : (
          <div style={slideFrameStyle}>No slides configured.</div>
        )}
      </main>

      <footer style={footerStyle}>
        <button type="button" onClick={goPrev} disabled={activeIndex <= 0} style={buttonStyle}>
          Previous
        </button>
        <div style={{ display: "flex", gap: 6 }}>
          {slides.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                border: "none",
                padding: 0,
                cursor: "pointer",
                background: index === activeIndex ? "#93c5fd" : "#475569",
              }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={goNext}
          disabled={activeIndex >= slides.length - 1}
          style={buttonStyle}
        >
          Next
        </button>
      </footer>
    </div>
  );
}
