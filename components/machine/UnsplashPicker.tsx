"use client";

import { useState } from "react";

interface UnsplashPhoto {
  id: string;
  thumb: string;
  regular: string;
  alt: string;
  author: string;
}

interface Props {
  imagens: Record<number, string>;
  onChange: (imagens: Record<number, string>) => void;
  onNext: () => void;
}

export default function UnsplashPicker({ imagens, onChange, onNext }: Props) {
  const [query, setQuery] = useState("");
  const [fotos, setFotos] = useState<UnsplashPhoto[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [multiUploadSlide, setMultiUploadSlide] = useState(1); // a partir de que slide começa

  const pesquisar = async () => {
    if (!query.trim()) return;
    setCarregando(true);
    setErro("");
    setFotos([]);
    try {
      const res = await fetch(`/api/unsplash?query=${encodeURIComponent(query.trim())}&count=12`);
      if (!res.ok) {
        const text = await res.text();
        setErro(`Erro ${res.status}: ${text}`);
        setCarregando(false);
        return;
      }
      const data = await res.json();
      if (data.error) {
        setErro(data.error);
      } else if (!data.photos || data.photos.length === 0) {
        setErro("Nenhuma foto encontrada. Tenta outro termo.");
      } else {
        setFotos(data.photos);
      }
    } catch {
      setErro("Falha na ligação. Verifica se o servidor está em execução e a chave Unsplash está no .env.local");
    }
    setCarregando(false);
  };

  // Seleccionar/deseleccionar foto do Unsplash (máx 9)
  const toggleFoto = (url: string) => {
    setSelecionadas(prev => {
      if (prev.includes(url)) return prev.filter(u => u !== url);
      if (prev.length >= 9) return prev;
      return [...prev, url];
    });
  };

  // Aplicar as fotos seleccionadas aos slides (a partir do slide escolhido)
  const aplicarFotos = () => {
    const novasImagens = { ...imagens };
    selecionadas.forEach((url, i) => {
      const slideNum = multiUploadSlide + i;
      if (slideNum <= 9) novasImagens[slideNum] = url;
    });
    onChange(novasImagens);
    setSelecionadas([]);
  };

  // Multi-upload: seleccionar vários ficheiros de uma vez
  const handleMultiUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files).slice(0, 9);
    arr.forEach((file, i) => {
      const slideNum = multiUploadSlide + i;
      if (slideNum > 9) return;
      const reader = new FileReader();
      reader.onload = e => {
        onChange({ ...imagens, [slideNum]: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    });
  };

  // Upload individual por slide
  const handleUploadSlide = (slideNum: number) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        onChange({ ...imagens, [slideNum]: ev.target?.result as string });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  // Remover imagem de um slide
  const removerImagem = (slideNum: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const novas = { ...imagens };
    delete novas[slideNum];
    onChange(novas);
  };

  const totalAplicadas = Object.keys(imagens).length;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>
          Adicionar imagens
        </h2>
        <p style={{ fontSize: 13, color: "#8892a4", margin: 0 }}>
          Pesquisa no Unsplash ou faz upload de várias imagens de uma vez.
        </p>
      </div>

      {/* ─── Secção 1: Pesquisa Unsplash ────────────────────────────────── */}
      <div style={{
        padding: 16,
        borderRadius: 12,
        border: "1px solid var(--surface)",
        marginBottom: 20,
      }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: "0 0 12px" }}>
          1. Pesquisar no Unsplash
        </p>
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && pesquisar()}
            placeholder="Ex: fitness, workout, gym, motivation..."
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid var(--surface)",
              background: "var(--surface)",
              color: "var(--text)",
              fontSize: 14,
              outline: "none",
            }}
          />
          <button
            onClick={pesquisar}
            disabled={carregando || !query.trim()}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14,
              border: "none",
              cursor: carregando || !query.trim() ? "not-allowed" : "pointer",
              backgroundColor: carregando || !query.trim() ? "var(--surface)" : "var(--accent)",
              color: carregando || !query.trim() ? "#8892a4" : "var(--bg)",
              minWidth: 110,
            }}
          >
            {carregando ? "A pesquisar…" : "Pesquisar"}
          </button>
        </div>

        {erro && (
          <div style={{
            padding: "10px 14px",
            borderRadius: 10,
            backgroundColor: "rgba(239,68,68,.1)",
            color: "#fca5a5",
            fontSize: 13,
            marginBottom: 12,
          }}>
            ⚠️ {erro}
          </div>
        )}

        {fotos.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <p style={{ fontSize: 12, color: "#8892a4", margin: 0 }}>
                {selecionadas.length === 0
                  ? "Clica para seleccionar (máx 9)"
                  : `${selecionadas.length}/9 seleccionadas`}
              </p>
              {/* A partir de que slide aplicar */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#8892a4" }}>
                <span>Aplicar a partir do slide</span>
                <select
                  value={multiUploadSlide}
                  onChange={e => setMultiUploadSlide(Number(e.target.value))}
                  style={{
                    padding: "2px 6px",
                    borderRadius: 6,
                    border: "1px solid var(--surface)",
                    background: "var(--surface)",
                    color: "var(--text)",
                    fontSize: 12,
                  }}
                >
                  {Array.from({ length: 9 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 10,
              marginBottom: 12,
            }}>
              {fotos.map(foto => {
                const sel = selecionadas.includes(foto.regular);
                const ordem = selecionadas.indexOf(foto.regular) + 1;
                return (
                  <button
                    key={foto.id}
                    onClick={() => toggleFoto(foto.regular)}
                    style={{
                      position: "relative",
                      aspectRatio: "3/4",
                      borderRadius: 10,
                      overflow: "hidden",
                      border: `3px solid ${sel ? "var(--accent)" : "transparent"}`,
                      cursor: "pointer",
                      padding: 0,
                      background: "none",
                    }}
                  >
                    <img
                      src={foto.thumb}
                      alt={foto.alt}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    {sel && (
                      <div style={{
                        position: "absolute",
                        top: 6, right: 6,
                        width: 24, height: 24,
                        borderRadius: "50%",
                        backgroundColor: "var(--accent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 800,
                        color: "var(--bg)",
                      }}>
                        {ordem}
                      </div>
                    )}
                    {/* Nome do autor */}
                    <div style={{
                      position: "absolute",
                      bottom: 0, left: 0, right: 0,
                      padding: "4px 6px",
                      background: "rgba(0,0,0,.5)",
                      fontSize: 9,
                      color: "#fff",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}>
                      {foto.author}
                    </div>
                  </button>
                );
              })}
            </div>

            {selecionadas.length > 0 && (
              <button
                onClick={aplicarFotos}
                style={{
                  padding: "8px 20px",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 13,
                  border: "1px solid var(--accent)",
                  cursor: "pointer",
                  backgroundColor: "transparent",
                  color: "var(--accent)",
                }}
              >
                ✓ Aplicar {selecionadas.length} foto(s) a partir do slide {multiUploadSlide}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ─── Secção 2: Multi-upload ─────────────────────────────────────── */}
      <div style={{
        padding: 16,
        borderRadius: 12,
        border: "1px solid var(--surface)",
        marginBottom: 20,
      }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: "0 0 4px" }}>
          2. Upload de várias imagens de uma vez
        </p>
        <p style={{ fontSize: 12, color: "#8892a4", margin: "0 0 12px" }}>
          Selecciona até 9 imagens ao mesmo tempo — serão mapeadas por ordem aos slides.
        </p>

        {/* Selector de slide inicial + botão de upload múltiplo */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#8892a4" }}>
            <span>A partir do slide</span>
            <select
              value={multiUploadSlide}
              onChange={e => setMultiUploadSlide(Number(e.target.value))}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid var(--surface)",
                background: "var(--surface)",
                color: "var(--text)",
                fontSize: 13,
              }}
            >
              {Array.from({ length: 9 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.multiple = true;
              input.onchange = e => handleMultiUpload((e.target as HTMLInputElement).files);
              input.click();
            }}
            style={{
              padding: "8px 20px",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13,
              border: "none",
              cursor: "pointer",
              backgroundColor: "var(--accent)",
              color: "var(--bg)",
            }}
          >
            + Seleccionar imagens
          </button>
          {totalAplicadas > 0 && (
            <span style={{ fontSize: 12, color: "#4ade80" }}>
              ✓ {totalAplicadas} imagem(ns) carregada(s)
            </span>
          )}
        </div>

        {/* Grid dos 9 slides com preview + opção de substituir individualmente */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
        }}>
          {Array.from({ length: 9 }, (_, i) => (
            <div
              key={i}
              style={{
                borderRadius: 10,
                border: `1px dashed ${imagens[i + 1] ? "var(--accent)" : "var(--surface)"}`,
                overflow: "hidden",
                cursor: "pointer",
                position: "relative",
                aspectRatio: "4/5",
              }}
              onClick={() => handleUploadSlide(i + 1)}
            >
              {imagens[i + 1] ? (
                <>
                  <img
                    src={imagens[i + 1]}
                    alt={`Slide ${i + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  {/* Label do slide */}
                  <div style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0,
                    padding: "5px 8px",
                    background: "rgba(0,0,0,.55)",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#fff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                    <span>Slide {String(i + 1).padStart(2, "0")}</span>
                    {/* Botão remover */}
                    <button
                      onClick={e => removerImagem(i + 1, e)}
                      style={{
                        background: "rgba(239,68,68,.8)",
                        border: "none",
                        borderRadius: 4,
                        color: "#fff",
                        fontSize: 10,
                        padding: "1px 5px",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      ×
                    </button>
                  </div>
                </>
              ) : (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  gap: 6,
                  color: "#8892a4",
                }}>
                  <span style={{ fontSize: 22 }}>+</span>
                  <span style={{ fontSize: 11, fontWeight: 600 }}>
                    Slide {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Botão avançar ───────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={onNext}
          style={{
            padding: "10px 24px",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 14,
            border: "none",
            cursor: "pointer",
            backgroundColor: "var(--accent)",
            color: "var(--bg)",
          }}
        >
          {totalAplicadas > 0 ? `Continuar com ${totalAplicadas} imagem(ns) →` : "Continuar sem imagens →"}
        </button>
      </div>
    </div>
  );
}
