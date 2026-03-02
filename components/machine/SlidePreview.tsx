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

    // ── Dark palette detection ──────────────────────────────────────────────
    const isDarkPalette = (() => {
      const r = parseInt(corFundo.slice(1, 3), 16);
      const g = parseInt(corFundo.slice(3, 5), 16);
      const b = parseInt(corFundo.slice(5, 7), 16);
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.35;
    })();

    // Dark palettes: ALL slides dark. Light palettes: alternating.
    const isDark = isDarkPalette ? true : slide % 2 === 1;
    const bgColor = isDarkPalette ? corFundo : (slide % 2 === 1 ? corTexto : corFundo);
    const txtColor = isDarkPalette ? corTexto : (slide % 2 === 1 ? corFundo : corTexto);
    const mutedTxt = isDark ? "rgba(255,255,255,.5)" : "rgba(0,0,0,.45)";
    const glowColor = `${corDestaque}40`;

    // Date for header
    const now = new Date();
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const dateLabel = `${months[now.getMonth()]} ${now.getFullYear()}`;

    // ── Design tokens (premium) ────────────────────────────────────────────
    const P = 60; // safe zone padding
    const heading = "'Space Grotesk', 'Inter', system-ui";
    const sans = "'Inter', 'Helvetica Neue', Arial, sans-serif";

    const base: React.CSSProperties = {
      width: 1080,
      height: 1350,
      position: "relative",
      overflow: "hidden",
      fontFamily: sans,
      backgroundColor: bgColor,
    };

    // ── Header bar (top of every slide) — premium glassmorphism ────────────
    const headerBar = (color?: string) => {
      const c = color || (isDark ? "rgba(255,255,255,.3)" : "rgba(0,0,0,.25)");
      return (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 52,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: `0 ${P}px`, fontSize: 13, fontWeight: 600,
          letterSpacing: 1.5, color: c, zIndex: 10,
          fontFamily: sans, textTransform: "uppercase",
          background: isDark
            ? "linear-gradient(to bottom, rgba(0,0,0,.5) 0%, transparent 100%)"
            : "linear-gradient(to bottom, rgba(255,255,255,.5) 0%, transparent 100%)",
          borderBottom: `1px solid ${isDark ? `${corDestaque}0A` : "rgba(0,0,0,.05)"}`,
        }}>
          <span style={{ fontSize: 11, letterSpacing: 2 }}>Powered by OPB Crew</span>
          <span style={{ fontWeight: 800, color: corDestaque, textShadow: `0 0 12px ${glowColor}` }}>{brandShort}</span>
          <span style={{ fontSize: 11, letterSpacing: 2 }}>{dateLabel}</span>
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

    // ── Accent line separator — glow premium ──────────────────────────────
    const accentLine = (top: number, width = 70) => (
      <div style={{
        position: "absolute", top, left: P,
        width, height: 3, borderRadius: 2,
        backgroundColor: corDestaque,
        boxShadow: `0 0 24px ${glowColor}, 0 0 8px ${corDestaque}55`,
      }} />
    );

    // ── Rounded image — premium shadow + border ──────────────────────────
    const rImg = (src: string, style: React.CSSProperties) => {
      if (!src) return null;
      return (
        <div style={{
          backgroundImage: `url(${src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: 18,
          boxShadow: isDark
            ? `0 12px 40px rgba(0,0,0,.4), 0 0 20px ${corDestaque}08`
            : "0 8px 32px rgba(0,0,0,.2), 0 2px 8px rgba(0,0,0,.1)",
          border: isDark ? `1px solid ${corDestaque}10` : "none",
          ...style,
        }} />
      );
    };

    // ════════════════════════════════════════════════════════════════════════
    // SLIDE 01 — COVER (DARK)
    // ════════════════════════════════════════════════════════════════════════
    if (slide === 1) {
      const coverBg = isDarkPalette ? corFundo : corTexto;
      return (
        <div ref={ref} style={{ ...base, backgroundColor: coverBg }}>
          {img(1) && (
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `url(${img(1)})`,
              backgroundSize: "cover", backgroundPosition: "center",
              opacity: isDarkPalette ? 0.35 : 0.45,
            }} />
          )}
          {/* Gradient overlay — cinematic */}
          <div style={{
            position: "absolute", inset: 0,
            background: isDarkPalette
              ? `linear-gradient(to top, ${coverBg} 15%, rgba(0,0,0,.85) 40%, rgba(0,0,0,.5) 65%, rgba(0,0,0,.7) 100%)`
              : "linear-gradient(to top, rgba(0,0,0,.95) 20%, rgba(0,0,0,.7) 45%, rgba(0,0,0,.3) 70%, rgba(0,0,0,.6) 100%)",
          }} />
          {/* Radial accent glow — premium */}
          {isDarkPalette && (
            <div style={{
              position: "absolute", inset: 0,
              background: `radial-gradient(ellipse at 50% 30%, ${corDestaque}0C 0%, transparent 65%)`,
            }} />
          )}
          {headerBar("rgba(255,255,255,.3)")}

          {/* Tag pill with glow */}
          {t(1) && (
            <div style={{
              position: "absolute", bottom: 370, left: P,
              display: "inline-block",
              padding: "10px 24px", borderRadius: 6,
              backgroundColor: corDestaque,
              fontSize: 15, fontWeight: 800, letterSpacing: 3,
              fontFamily: sans, textTransform: "uppercase",
              color: isDarkPalette ? coverBg : corTexto,
              boxShadow: `0 0 30px ${glowColor}, 0 4px 16px rgba(0,0,0,.4)`,
            }}>
              {t(1)}
            </div>
          )}

          {/* Accent line decorative */}
          <div style={{
            position: "absolute", bottom: 340, left: P,
            width: 60, height: 3, borderRadius: 2,
            backgroundColor: corDestaque,
            boxShadow: `0 0 20px ${glowColor}`,
          }} />

          {/* Main cover title — premium typography */}
          <div style={{
            position: "absolute", bottom: 80, left: P, right: P,
            fontFamily: heading, fontSize: 78, fontWeight: 700,
            lineHeight: 1.05, color: "#fff", letterSpacing: "-0.045em",
            textShadow: isDarkPalette
              ? `0 2px 30px rgba(0,0,0,.6), 0 0 60px ${corDestaque}10`
              : "0 2px 20px rgba(0,0,0,.5)",
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
          {/* Subtle radial glow for dark palettes */}
          {isDarkPalette && (
            <div style={{
              position: "absolute", inset: 0,
              background: `radial-gradient(ellipse at 20% 30%, ${corDestaque}06 0%, transparent 55%)`,
            }} />
          )}
          {headerBar()}

          {/* Headline */}
          <div style={{
            position: "absolute", top: 76, left: P, right: hasImg ? 480 : P,
            fontFamily: heading, fontSize: 52, fontWeight: 700,
            lineHeight: 1.22, color: txtColor, letterSpacing: "-0.035em",
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
          {/* Subtle radial glow for dark palettes */}
          {isDarkPalette && (
            <div style={{
              position: "absolute", inset: 0,
              background: `radial-gradient(ellipse at 80% 20%, ${corDestaque}06 0%, transparent 50%)`,
            }} />
          )}
          {headerBar()}

          {/* Main text */}
          <div style={{
            position: "absolute", top: 76, left: P, right: P,
            fontFamily: heading, fontSize: 46, fontWeight: 700,
            lineHeight: 1.3, color: txtColor, letterSpacing: "-0.03em",
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
          {/* Subtle radial glow for dark palettes */}
          {isDarkPalette && (
            <div style={{
              position: "absolute", inset: 0,
              background: `radial-gradient(ellipse at 50% 70%, ${corDestaque}06 0%, transparent 55%)`,
            }} />
          )}
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
            fontFamily: heading, fontSize: 58, fontWeight: 700,
            lineHeight: 1.18, color: txtColor, letterSpacing: "-0.04em",
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
          {/* Subtle radial glow for dark palettes */}
          {isDarkPalette && (
            <div style={{
              position: "absolute", inset: 0,
              background: `radial-gradient(ellipse at 15% 60%, ${corDestaque}06 0%, transparent 50%)`,
            }} />
          )}
          {headerBar()}

          {/* Headline */}
          <div style={{
            position: "absolute", top: 76, left: P,
            right: hasImg ? 480 : P,
            fontFamily: heading, fontSize: 44, fontWeight: 700,
            lineHeight: 1.3, color: txtColor, letterSpacing: "-0.03em",
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
          {/* Subtle radial glow for dark palettes */}
          {isDarkPalette && (
            <div style={{
              position: "absolute", inset: 0,
              background: `radial-gradient(ellipse at 70% 40%, ${corDestaque}08 0%, transparent 55%)`,
            }} />
          )}
          {headerBar()}

          {/* THE golden nugget headline */}
          <div style={{
            position: "absolute", top: 76, left: P,
            right: hasImg ? 480 : P,
            fontFamily: heading, fontSize: 56, fontWeight: 700,
            lineHeight: 1.2, color: txtColor, letterSpacing: "-0.04em",
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
              fontFamily: heading, fontSize: 28,
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
          {/* Subtle radial glow for dark palettes */}
          {isDarkPalette && (
            <div style={{
              position: "absolute", inset: 0,
              background: `radial-gradient(ellipse at 50% 80%, ${corDestaque}08 0%, transparent 55%)`,
            }} />
          )}
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
            fontFamily: heading, fontSize: 54, fontWeight: 700,
            lineHeight: 1.2, color: corDestaque, letterSpacing: "-0.04em",
            textShadow: isDarkPalette ? `0 0 30px ${glowColor}` : "none",
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
          {/* Subtle radial glow for dark palettes */}
          {isDarkPalette && (
            <div style={{
              position: "absolute", inset: 0,
              background: `radial-gradient(ellipse at 30% 50%, ${corDestaque}06 0%, transparent 50%)`,
            }} />
          )}
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
                margin: 0, fontFamily: heading,
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
                margin: 0, fontFamily: heading,
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
      const ctaBg = isDarkPalette ? corFundo : corTexto;
      return (
        <div ref={ref} style={{ ...base, backgroundColor: ctaBg }}>
          {img(9) && (
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `url(${img(9)})`,
              backgroundSize: "cover", backgroundPosition: "center",
              opacity: isDarkPalette ? 0.25 : 0.3,
            }} />
          )}
          {/* Cinematic gradient overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: isDarkPalette
              ? `linear-gradient(to top, ${ctaBg} 40%, rgba(0,0,0,.85) 70%, rgba(0,0,0,.6) 100%)`
              : `linear-gradient(to top, ${ctaBg} 45%, rgba(0,0,0,.5) 75%, rgba(0,0,0,.35) 100%)`,
          }} />
          {/* Radial accent glow — premium */}
          {isDarkPalette && (
            <div style={{
              position: "absolute", inset: 0,
              background: `radial-gradient(ellipse at 50% 45%, ${corDestaque}0A 0%, transparent 60%)`,
            }} />
          )}
          {headerBar("rgba(255,255,255,.3)")}

          {/* CTA centered */}
          <div style={{
            position: "absolute", top: "50%", left: P, right: P,
            transform: "translateY(-50%)", textAlign: "center",
          }}>
            <div style={{
              fontFamily: heading, fontSize: 46, fontWeight: 700,
              color: "#fff", lineHeight: 1.4, marginBottom: 40,
              letterSpacing: "-0.02em",
              textShadow: isDarkPalette
                ? `0 2px 24px rgba(0,0,0,.6), 0 0 40px ${corDestaque}08`
                : "0 2px 16px rgba(0,0,0,.4)",
            }}>
              {t(18) || "Guarda este carrossel para mais tarde."}
            </div>

            {/* Glassmorphism card — premium */}
            <div style={{
              display: "inline-block",
              padding: "26px 56px", borderRadius: 16,
              backgroundColor: isDarkPalette ? `${corDestaque}08` : "rgba(255,255,255,.08)",
              border: `1px solid ${isDarkPalette ? `${corDestaque}18` : "rgba(255,255,255,.18)"}`,
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow: isDarkPalette
                ? `inset 0 1px 0 ${corDestaque}0A, 0 8px 32px rgba(0,0,0,.4), 0 0 40px ${corDestaque}06`
                : "inset 0 1px 0 rgba(255,255,255,.1), 0 8px 32px rgba(0,0,0,.3)",
            }}>
              <div style={{
                fontSize: 22, fontWeight: 800,
                color: corDestaque, letterSpacing: 3,
                textTransform: "uppercase",
                textShadow: `0 0 20px ${glowColor}`,
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

          {/* Bottom brand bar — gradient + glow */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 52,
            background: `linear-gradient(135deg, ${corDestaque} 0%, ${corDestaque}dd 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 800, letterSpacing: 3,
            color: isDarkPalette ? corFundo : corTexto,
            boxShadow: `0 -4px 24px ${corDestaque}33`,
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
