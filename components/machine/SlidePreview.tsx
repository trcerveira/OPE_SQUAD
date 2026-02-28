"use client";

import { forwardRef } from "react";
import type { Palette } from "./DesignMachine";

interface Props {
  slideIndex: number;
  textos: Record<number, string>;
  imagens: Record<number, string>;
  paleta: Palette;
}

const SlidePreview = forwardRef<HTMLDivElement, Props>(
  ({ slideIndex, textos, imagens, paleta }, ref) => {
    const t = (n: number) => textos[n] || "";
    const img = (n: number) => imagens[n] || "";
    const [corFundo, corDestaque, corTexto] = paleta.cores;

    const slide = slideIndex + 1;

    // Estilos base partilhados
    const base: React.CSSProperties = {
      width: 1080,
      height: 1350,
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
    };

    const numTag: React.CSSProperties = {
      position: "absolute",
      top: 40,
      left: 48,
      fontSize: 22,
      fontWeight: 700,
      color: corTexto,
      opacity: 0.4,
      letterSpacing: 2,
    };

    const brandBar: React.CSSProperties = {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 52,
      backgroundColor: corDestaque,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 16,
      fontWeight: 800,
      letterSpacing: 3,
      color: corFundo,
    };

    // ── Slide 01 — Cover ──────────────────────────────────────────────────
    if (slide === 1) {
      return (
        <div ref={ref} style={{ ...base, backgroundColor: corTexto }}>
          {/* Imagem de fundo */}
          {img(1) && (
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `url(${img(1)})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.55,
            }} />
          )}
          {/* Overlay gradiente */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,.9) 40%, rgba(0,0,0,.2) 100%)",
          }} />
          {/* Número */}
          <div style={{ ...numTag, color: "#fff" }}>01</div>
          {/* Tag line */}
          {t(1) && (
            <div style={{
              position: "absolute",
              top: 80,
              left: 0, right: 0,
              textAlign: "center",
              fontSize: 20,
              fontWeight: 600,
              color: "rgba(255,255,255,.7)",
              letterSpacing: 1,
              padding: "0 60px",
            }}>
              {t(1).toUpperCase()}
            </div>
          )}
          {/* Título principal */}
          <div style={{
            position: "absolute",
            bottom: 100,
            left: 48,
            right: 48,
            fontSize: 88,
            fontWeight: 900,
            lineHeight: 1.0,
            color: "#fff",
            textTransform: "uppercase",
            letterSpacing: -1,
          }}>
            {t(2) || "TÍTULO DO CARROSSEL"}
          </div>
          {/* Barra de marca */}
          <div style={{ ...brandBar }}>OPE SQUAD · POWERED BY IA</div>
        </div>
      );
    }

    // ── Slide 02 — Headline laranja ───────────────────────────────────────
    if (slide === 2) {
      return (
        <div ref={ref} style={{ ...base, backgroundColor: corDestaque }}>
          <div style={{ ...numTag, color: corFundo, opacity: 0.5 }}>02</div>
          {img(2) && (
            <div style={{
              position: "absolute",
              right: 0, top: 0, bottom: 52,
              width: "45%",
              backgroundImage: `url(${img(2)})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }} />
          )}
          <div style={{
            position: "absolute",
            top: 100,
            left: 48,
            right: img(2) ? "50%" : 48,
            fontSize: 76,
            fontWeight: 900,
            lineHeight: 1.05,
            color: corFundo,
            textTransform: "uppercase",
            letterSpacing: -1,
          }}>
            {t(3) || "HEADLINE DO SLIDE"}
          </div>
          {t(4) && (
            <div style={{
              position: "absolute",
              bottom: 100,
              left: 48,
              right: img(2) ? "50%" : 48,
              fontSize: 26,
              lineHeight: 1.6,
              color: corFundo,
              opacity: 0.85,
            }}>
              {t(4)}
            </div>
          )}
          <div style={{ ...brandBar, backgroundColor: corTexto, color: corFundo }}>
            OPE SQUAD · POWERED BY IA
          </div>
        </div>
      );
    }

    // ── Slide 03 — Corpo + imagem ─────────────────────────────────────────
    if (slide === 3) {
      return (
        <div ref={ref} style={{ ...base, backgroundColor: corFundo }}>
          <div style={{ ...numTag, color: corTexto }}>03</div>
          {img(3) && (
            <div style={{
              position: "absolute",
              top: 0, left: 0, right: 0,
              height: "45%",
              backgroundImage: `url(${img(3)})`,
              backgroundSize: "cover",
              backgroundPosition: "center top",
            }} />
          )}
          {/* Ponto laranja */}
          <div style={{
            position: "absolute",
            top: img(3) ? "46%" : 120,
            left: 48,
            width: 16, height: 16,
            borderRadius: "50%",
            backgroundColor: corDestaque,
          }} />
          <div style={{
            position: "absolute",
            top: img(3) ? "48%" : 150,
            left: 48, right: 48,
            bottom: 80,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}>
            {t(5) && (
              <p style={{ margin: 0, fontSize: 28, lineHeight: 1.65, color: corTexto, fontWeight: 500 }}>
                {t(5)}
              </p>
            )}
            {t(6) && (
              <p style={{ margin: 0, fontSize: 28, lineHeight: 1.65, color: corTexto, opacity: 0.8 }}>
                {t(6)}
              </p>
            )}
          </div>
          <div style={{ ...brandBar, backgroundColor: corDestaque, color: corFundo }}>
            OPE SQUAD · POWERED BY IA
          </div>
        </div>
      );
    }

    // ── Slide 04 — Grande headline sobre imagem ───────────────────────────
    if (slide === 4) {
      return (
        <div ref={ref} style={{ ...base, backgroundColor: corTexto }}>
          {img(4) && (
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `url(${img(4)})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.45,
            }} />
          )}
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(to bottom, transparent 20%, ${corTexto} 75%)`,
          }} />
          <div style={{ ...numTag, color: "#fff" }}>04</div>
          <div style={{
            position: "absolute",
            bottom: 100,
            left: 48, right: 48,
            fontSize: 86,
            fontWeight: 900,
            lineHeight: 1.0,
            color: corDestaque,
            textTransform: "uppercase",
            letterSpacing: -1,
          }}>
            {t(7) || "HEADLINE IMPACTO"}
          </div>
          {t(8) && (
            <div style={{
              position: "absolute",
              bottom: 80,
              left: 48, right: 48,
              fontSize: 0, // escondido por baixo do título — no template original é separado
            }} />
          )}
          <div style={{ ...brandBar, backgroundColor: corDestaque, color: corFundo }}>
            OPE SQUAD · POWERED BY IA
          </div>
        </div>
      );
    }

    // ── Slide 05 — Corpo com imagem lateral ───────────────────────────────
    if (slide === 5) {
      return (
        <div ref={ref} style={{ ...base, backgroundColor: corFundo }}>
          <div style={{ ...numTag, color: corTexto }}>05</div>
          {img(5) && (
            <div style={{
              position: "absolute",
              top: 80, right: 0,
              width: "40%",
              bottom: 80,
              backgroundImage: `url(${img(5)})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: "24px 0 0 24px",
            }} />
          )}
          {/* Ponto laranja */}
          <div style={{
            position: "absolute",
            top: 140,
            left: 48,
            width: 16, height: 16,
            borderRadius: "50%",
            backgroundColor: corDestaque,
          }} />
          <div style={{
            position: "absolute",
            top: 170,
            left: 48,
            right: img(5) ? "44%" : 48,
            bottom: 80,
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}>
            {t(9) && (
              <p style={{ margin: 0, fontSize: 30, lineHeight: 1.6, color: corTexto, fontWeight: 500 }}>
                {t(9)}
              </p>
            )}
            {t(10) && (
              <p style={{ margin: 0, fontSize: 28, lineHeight: 1.6, color: corTexto, opacity: 0.8 }}>
                {t(10)}
              </p>
            )}
          </div>
          <div style={{ ...brandBar, backgroundColor: corDestaque, color: corFundo }}>
            OPE SQUAD · POWERED BY IA
          </div>
        </div>
      );
    }

    // ── Slide 06 — Dark + Bold ────────────────────────────────────────────
    if (slide === 6) {
      return (
        <div ref={ref} style={{ ...base, backgroundColor: corTexto }}>
          {img(6) && (
            <div style={{
              position: "absolute",
              right: 0, top: 0, bottom: 52,
              width: "42%",
              backgroundImage: `url(${img(6)})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.7,
            }} />
          )}
          <div style={{ ...numTag, color: "#fff" }}>06</div>
          <div style={{
            position: "absolute",
            top: 100,
            left: 48,
            right: img(6) ? "46%" : 48,
            fontSize: 78,
            fontWeight: 900,
            lineHeight: 1.05,
            color: corDestaque,
            textTransform: "uppercase",
            letterSpacing: -1,
          }}>
            {t(11) || "SCALE RULES EVERYTHING."}
          </div>
          {t(12) && (
            <div style={{
              position: "absolute",
              bottom: 100,
              left: 48,
              right: img(6) ? "46%" : 48,
              fontSize: 24,
              lineHeight: 1.7,
              color: "#fff",
              opacity: 0.75,
            }}>
              {t(12)}
            </div>
          )}
          <div style={{ ...brandBar }}>OPE SQUAD · POWERED BY IA</div>
        </div>
      );
    }

    // ── Slide 07 — Headline + imagem de fundo ─────────────────────────────
    if (slide === 7) {
      return (
        <div ref={ref} style={{ ...base, backgroundColor: corFundo }}>
          {img(7) && (
            <div style={{
              position: "absolute",
              top: 0, left: 0, right: 0,
              height: "55%",
              backgroundImage: `url(${img(7)})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }} />
          )}
          <div style={{ ...numTag, color: "#fff" }}>07</div>
          <div style={{
            position: "absolute",
            top: img(7) ? "52%" : 100,
            left: 48, right: 48,
            fontSize: 74,
            fontWeight: 900,
            lineHeight: 1.05,
            color: corDestaque,
            textTransform: "uppercase",
            letterSpacing: -1,
          }}>
            {t(13) || "GROWTH BECAME A DUTY."}
          </div>
          {t(14) && (
            <div style={{
              position: "absolute",
              bottom: 100,
              left: 48, right: 48,
              fontSize: 26,
              lineHeight: 1.65,
              color: corTexto,
              opacity: 0.85,
            }}>
              {t(14)}
            </div>
          )}
          <div style={{ ...brandBar, backgroundColor: corDestaque, color: corFundo }}>
            OPE SQUAD · POWERED BY IA
          </div>
        </div>
      );
    }

    // ── Slide 08 — Corpo longo ────────────────────────────────────────────
    if (slide === 8) {
      return (
        <div ref={ref} style={{ ...base, backgroundColor: corFundo }}>
          <div style={{ ...numTag, color: corTexto }}>08</div>
          {img(8) && (
            <div style={{
              position: "absolute",
              top: 80, right: 0,
              width: "38%", bottom: 80,
              backgroundImage: `url(${img(8)})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: "24px 0 0 24px",
            }} />
          )}
          <div style={{
            position: "absolute",
            top: 100,
            left: 48,
            right: img(8) ? "42%" : 48,
            bottom: 80,
            display: "flex",
            flexDirection: "column",
            gap: 22,
          }}>
            {[t(15), t(16), t(17)].filter(Boolean).map((texto, i) => (
              <p key={i} style={{
                margin: 0,
                fontSize: 26,
                lineHeight: 1.7,
                color: corTexto,
                opacity: i === 0 ? 1 : 0.8,
              }}>
                {texto}
              </p>
            ))}
          </div>
          <div style={{ ...brandBar, backgroundColor: corDestaque, color: corFundo }}>
            OPE SQUAD · POWERED BY IA
          </div>
        </div>
      );
    }

    // ── Slide 09 — CTA final ──────────────────────────────────────────────
    if (slide === 9) {
      return (
        <div ref={ref} style={{ ...base, backgroundColor: corTexto }}>
          {img(9) && (
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `url(${img(9)})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.4,
            }} />
          )}
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(to top, ${corTexto} 50%, transparent 100%)`,
          }} />
          <div style={{
            position: "absolute",
            bottom: 120,
            left: 48, right: 48,
            textAlign: "center",
          }}>
            <div style={{
              fontSize: 32,
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.5,
              marginBottom: 16,
            }}>
              {t(18) || "Produzido com ajuda de Inteligência Artificial."}
            </div>
            <div style={{
              display: "inline-block",
              padding: "10px 28px",
              borderRadius: 999,
              backgroundColor: corDestaque,
              color: corFundo,
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: 2,
            }}>
              OPE SQUAD
            </div>
          </div>
          <div style={{ ...brandBar }}>OPE SQUAD · POWERED BY IA</div>
        </div>
      );
    }

    return <div ref={ref} style={{ ...base, backgroundColor: "#111" }} />;
  }
);

SlidePreview.displayName = "SlidePreview";
export default SlidePreview;
