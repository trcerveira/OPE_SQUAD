"use client";

import { forwardRef } from "react";
import type { Palette } from "./DesignMachine";

interface Props {
  slideIndex: number;
  textos: Record<number, string>;
  imagens: Record<number, string>;
  paleta: Palette;
  brandName?: string;
}

const SlidePreview = forwardRef<HTMLDivElement, Props>(
  ({ slideIndex, textos, imagens, paleta, brandName = "COACH TEO · POWERED BY OPB CREW" }, ref) => {
    const t = (n: number) => textos[n] || "";
    const img = (n: number) => imagens[n] || "";
    const [corFundo, corDestaque, corTexto] = paleta.cores;

    const brandShort = brandName.includes(" · ") ? brandName.split(" · ")[0] : brandName;
    const slide = slideIndex + 1;

    // Alternating: odd=dark, even=light
    const isDark = slide % 2 === 1;
    const bgColor = isDark ? corTexto : corFundo;
    const txtColor = isDark ? corFundo : corTexto;
    const mutedTxt = isDark ? "rgba(255,255,255,.55)" : "rgba(0,0,0,.45)";

    // Date for header
    const now = new Date();
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const dateLabel = `${months[now.getMonth()]} ${now.getFullYear()}`;

    // ── Design tokens (research-based) ─────────────────────────────────────
    const P = 60; // safe zone padding
    const serif = "Georgia, 'Times New Roman', serif";
    const sans = "'Inter', 'Helvetica Neue', Arial, sans-serif";

    const base: React.CSSProperties = {
      width: 1080,
      height: 1350,
      position: "relative",
      overflow: "hidden",
      fontFamily: sans,
      backgroundColor: bgColor,
    };

    // ── Header bar (top of every slide) ────────────────────────────────────
    const headerBar = (color?: string) => {
      const c = color || (isDark ? "rgba(255,255,255,.35)" : "rgba(0,0,0,.3)");
      return (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 52,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: `0 ${P}px`, fontSize: 14, fontWeight: 600,
          letterSpacing: 1.2, color: c, zIndex: 10,
        }}>
          <span>Powered by OPB Crew</span>
          <span style={{ fontWeight: 700 }}>{brandShort}</span>
          <span>{dateLabel}</span>
        </div>
      );
    };

    // ── Swipe indicator ">>" ───────────────────────────────────────────────
    const swipe = () => slide === 9 ? null : (
      <div style={{
        position: "absolute", bottom: 28, right: P,
        fontSize: 26, fontWeight: 800, color: corDestaque,
        letterSpacing: -2, zIndex: 10, opacity: 0.8,
      }}>
        {">>"}
      </div>
    );

    // ── Accent line separator ─────────────────────────────────────────────
    const accentLine = (top: number, width = 70) => (
      <div style={{
        position: "absolute", top, left: P,
        width, height: 4, borderRadius: 2,
        backgroundColor: corDestaque,
      }} />
    );

    // ── Rounded image ─────────────────────────────────────────────────────
    const rImg = (src: string, style: React.CSSProperties) => {
      if (!src) return null;
      return (
        <div style={{
          backgroundImage: `url(${src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: 16,
          ...style,
        }} />
      );
    };

    // ════════════════════════════════════════════════════════════════════════
    // SLIDE 01 — COVER (DARK)
    // ════════════════════════════════════════════════════════════════════════
    if (slide === 1) {
      return (
        <div ref={ref} style={{ ...base, backgroundColor: corTexto }}>
          {img(1) && (
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `url(${img(1)})`,
              backgroundSize: "cover", backgroundPosition: "center",
              opacity: 0.45,
            }} />
          )}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,.92) 30%, rgba(0,0,0,.25) 65%, rgba(0,0,0,.55) 100%)",
          }} />
          {headerBar("rgba(255,255,255,.35)")}

          {/* Tag pill */}
          {t(1) && (
            <div style={{
              position: "absolute", bottom: 360, left: P,
              display: "inline-block",
              padding: "10px 22px", borderRadius: 6,
              backgroundColor: corDestaque,
              fontSize: 17, fontWeight: 800, letterSpacing: 2.5,
              color: corTexto, textTransform: "uppercase",
            }}>
              {t(1)}
            </div>
          )}

          {/* Main cover title */}
          <div style={{
            position: "absolute", bottom: 80, left: P, right: P,
            fontFamily: serif, fontSize: 80, fontWeight: 700,
            lineHeight: 1.08, color: "#fff", letterSpacing: -0.5,
          }}>
            {t(2) || "TITULO DO CARROSSEL"}
          </div>

          {swipe()}
        </div>
      );
    }

    // ════════════════════════════════════════════════════════════════════════
    // SLIDE 02 — INTRO / PROBLEM (LIGHT)
    // ════════════════════════════════════════════════════════════════════════
    if (slide === 2) {
      const hasImg = !!img(2);
      return (
        <div ref={ref} style={base}>
          {headerBar()}

          {/* Headline */}
          <div style={{
            position: "absolute", top: 76, left: P, right: hasImg ? 480 : P,
            fontFamily: serif, fontSize: 52, fontWeight: 700,
            lineHeight: 1.22, color: txtColor, letterSpacing: -0.5,
          }}>
            {t(3) || "HEADLINE DO SLIDE"}
          </div>

          {accentLine(hasImg ? 460 : 400)}

          {/* Body */}
          {t(4) && (
            <div style={{
              position: "absolute",
              top: hasImg ? 490 : 430, left: P, right: hasImg ? 480 : P,
              fontFamily: sans, fontSize: 30, lineHeight: 1.55,
              color: mutedTxt,
            }}>
              {t(4)}
            </div>
          )}

          {/* Image */}
          {hasImg && rImg(img(2), {
            position: "absolute", top: 76, right: P,
            width: 390, bottom: 76,
          })}

          {swipe()}
        </div>
      );
    }

    // ════════════════════════════════════════════════════════════════════════
    // SLIDE 03 — CONTENT A (DARK)
    // ════════════════════════════════════════════════════════════════════════
    if (slide === 3) {
      const hasImg = !!img(3);
      return (
        <div ref={ref} style={base}>
          {headerBar()}

          {/* Main text */}
          <div style={{
            position: "absolute", top: 76, left: P, right: P,
            fontFamily: serif, fontSize: 46, fontWeight: 700,
            lineHeight: 1.3, color: txtColor, letterSpacing: -0.3,
          }}>
            {t(5) || "Primeiro insight concreto e accionavel."}
          </div>

          {/* Secondary text */}
          {t(6) && (
            <div style={{
              position: "absolute",
              top: hasImg ? 400 : 440,
              left: P, right: P,
              fontSize: 28, lineHeight: 1.6, color: mutedTxt,
            }}>
              {t(6)}
            </div>
          )}

          {/* Image — bottom */}
          {hasImg && rImg(img(3), {
            position: "absolute",
            bottom: P, left: P, right: P, height: 460,
          })}

          {!hasImg && accentLine(420)}

          {swipe()}
        </div>
      );
    }

    // ════════════════════════════════════════════════════════════════════════
    // SLIDE 04 — IMPACT (LIGHT)
    // ════════════════════════════════════════════════════════════════════════
    if (slide === 4) {
      const hasImg = !!img(4);
      return (
        <div ref={ref} style={base}>
          {headerBar()}

          {/* Image — top */}
          {hasImg && rImg(img(4), {
            position: "absolute",
            top: 68, left: P, right: P, height: 500,
          })}

          {accentLine(hasImg ? 590 : 76)}

          {/* Impact headline */}
          <div style={{
            position: "absolute",
            top: hasImg ? 610 : 100,
            left: P, right: P,
            fontFamily: serif, fontSize: 58, fontWeight: 700,
            lineHeight: 1.18, color: txtColor, letterSpacing: -0.5,
          }}>
            {t(7) || "HEADLINE DE IMPACTO"}
          </div>

          {/* Body */}
          {t(8) && (
            <div style={{
              position: "absolute", bottom: 76, left: P, right: P,
              fontSize: 28, lineHeight: 1.55, color: mutedTxt,
            }}>
              {t(8)}
            </div>
          )}

          {swipe()}
        </div>
      );
    }

    // ════════════════════════════════════════════════════════════════════════
    // SLIDE 05 — CONTENT B (DARK)
    // ════════════════════════════════════════════════════════════════════════
    if (slide === 5) {
      const hasImg = !!img(5);
      return (
        <div ref={ref} style={base}>
          {headerBar()}

          {/* Headline */}
          <div style={{
            position: "absolute", top: 76, left: P,
            right: hasImg ? 480 : P,
            fontFamily: serif, fontSize: 44, fontWeight: 700,
            lineHeight: 1.3, color: txtColor, letterSpacing: -0.3,
          }}>
            {t(9) || "Segundo insight, mais profundo."}
          </div>

          {!hasImg && accentLine(420)}

          {/* Body */}
          {t(10) && (
            <div style={{
              position: "absolute",
              bottom: 76, left: P, right: hasImg ? 480 : P,
              fontSize: 28, lineHeight: 1.55, color: mutedTxt,
            }}>
              {t(10)}
            </div>
          )}

          {/* Image — right side */}
          {hasImg && rImg(img(5), {
            position: "absolute", top: 76, right: P,
            width: 390, bottom: 76,
          })}

          {swipe()}
        </div>
      );
    }

    // ════════════════════════════════════════════════════════════════════════
    // SLIDE 06 — GOLDEN NUGGET (LIGHT)
    // ════════════════════════════════════════════════════════════════════════
    if (slide === 6) {
      const hasImg = !!img(6);
      return (
        <div ref={ref} style={base}>
          {headerBar()}

          {/* THE golden nugget headline */}
          <div style={{
            position: "absolute", top: 76, left: P,
            right: hasImg ? 480 : P,
            fontFamily: serif, fontSize: 56, fontWeight: 700,
            lineHeight: 1.2, color: txtColor, letterSpacing: -0.5,
          }}>
            {t(11) || "O INSIGHT MAIS VALIOSO."}
          </div>

          {accentLine(hasImg ? 460 : 440)}

          {/* Body */}
          {t(12) && (
            <div style={{
              position: "absolute",
              top: hasImg ? 490 : 470,
              left: P, right: hasImg ? 480 : P,
              fontFamily: serif, fontSize: 28,
              lineHeight: 1.65, color: mutedTxt,
            }}>
              {t(12)}
            </div>
          )}

          {/* Image — right */}
          {hasImg && rImg(img(6), {
            position: "absolute", top: 76, right: P,
            width: 390, bottom: 76,
          })}

          {swipe()}
        </div>
      );
    }

    // ════════════════════════════════════════════════════════════════════════
    // SLIDE 07 — TRANSFORMATION (DARK)
    // ════════════════════════════════════════════════════════════════════════
    if (slide === 7) {
      const hasImg = !!img(7);
      return (
        <div ref={ref} style={base}>
          {headerBar()}

          {/* Image — top */}
          {hasImg && rImg(img(7), {
            position: "absolute",
            top: 68, left: P, right: P, height: 500,
          })}

          {/* Transformation headline in accent color */}
          <div style={{
            position: "absolute",
            top: hasImg ? 600 : 100,
            left: P, right: P,
            fontFamily: serif, fontSize: 54, fontWeight: 700,
            lineHeight: 1.2, color: corDestaque, letterSpacing: -0.5,
          }}>
            {t(13) || "O QUE MUDA QUANDO APLICAS ISTO."}
          </div>

          {/* Body */}
          {t(14) && (
            <div style={{
              position: "absolute", bottom: 76, left: P, right: P,
              fontSize: 28, lineHeight: 1.55, color: mutedTxt,
            }}>
              {t(14)}
            </div>
          )}

          {swipe()}
        </div>
      );
    }

    // ════════════════════════════════════════════════════════════════════════
    // SLIDE 08 — SUMMARY (LIGHT)
    // ════════════════════════════════════════════════════════════════════════
    if (slide === 8) {
      const hasImg = !!img(8);
      return (
        <div ref={ref} style={base}>
          {headerBar()}

          <div style={{
            position: "absolute",
            top: 76, left: P,
            right: hasImg ? 440 : P,
            bottom: 76,
            display: "flex", flexDirection: "column", gap: 28,
          }}>
            {/* P1 — serif, large */}
            {t(15) && (
              <p style={{
                margin: 0, fontFamily: serif,
                fontSize: 38, fontWeight: 700, lineHeight: 1.3,
                color: txtColor,
              }}>
                {t(15)}
              </p>
            )}

            {/* Accent separator */}
            <div style={{
              width: 60, height: 4, borderRadius: 2,
              backgroundColor: corDestaque, flexShrink: 0,
            }} />

            {/* P2 — sans, muted */}
            {t(16) && (
              <p style={{
                margin: 0, fontSize: 27, lineHeight: 1.55,
                color: mutedTxt,
              }}>
                {t(16)}
              </p>
            )}

            {/* P3 — serif, bold closing */}
            {t(17) && (
              <p style={{
                margin: 0, fontFamily: serif,
                fontSize: 30, fontWeight: 700, lineHeight: 1.4,
                color: txtColor,
              }}>
                {t(17)}
              </p>
            )}
          </div>

          {/* Image — right */}
          {hasImg && rImg(img(8), {
            position: "absolute", top: 76, right: P,
            width: 360, bottom: 76,
          })}

          {swipe()}
        </div>
      );
    }

    // ════════════════════════════════════════════════════════════════════════
    // SLIDE 09 — CTA FINAL (DARK)
    // ════════════════════════════════════════════════════════════════════════
    if (slide === 9) {
      return (
        <div ref={ref} style={{ ...base, backgroundColor: corTexto }}>
          {img(9) && (
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `url(${img(9)})`,
              backgroundSize: "cover", backgroundPosition: "center",
              opacity: 0.3,
            }} />
          )}
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(to top, ${corTexto} 50%, rgba(0,0,0,.35) 100%)`,
          }} />
          {headerBar("rgba(255,255,255,.3)")}

          {/* CTA centered */}
          <div style={{
            position: "absolute", top: "50%", left: P, right: P,
            transform: "translateY(-50%)", textAlign: "center",
          }}>
            <div style={{
              fontFamily: serif, fontSize: 42, fontWeight: 700,
              color: "#fff", lineHeight: 1.4, marginBottom: 40,
            }}>
              {t(18) || "Guarda este carrossel para mais tarde."}
            </div>

            {/* Glassmorphism card */}
            <div style={{
              display: "inline-block",
              padding: "22px 48px", borderRadius: 14,
              backgroundColor: "rgba(255,255,255,.1)",
              border: "1px solid rgba(255,255,255,.15)",
            }}>
              <div style={{
                fontSize: 20, fontWeight: 800,
                color: corDestaque, letterSpacing: 3,
                textTransform: "uppercase",
              }}>
                {brandShort}
              </div>
            </div>

            <div style={{
              marginTop: 28, fontSize: 15,
              color: "rgba(255,255,255,.3)", letterSpacing: 0.5,
            }}>
              Produzido com ajuda de Inteligencia Artificial
            </div>
          </div>

          {/* Bottom brand bar */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 52,
            backgroundColor: corDestaque,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 800, letterSpacing: 3, color: corTexto,
          }}>
            {brandName}
          </div>
        </div>
      );
    }

    return <div ref={ref} style={{ ...base, backgroundColor: "#111" }} />;
  }
);

SlidePreview.displayName = "SlidePreview";
export default SlidePreview;
