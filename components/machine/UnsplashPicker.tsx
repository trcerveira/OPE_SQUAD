"use client";

import { useState, useRef } from "react";

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
  const fileRefs = useRef<HTMLInputElement[]>([]);

  const pesquisar = async () => {
    if (!query.trim()) return;
    setCarregando(true);
    setErro("");
    try {
      const res = await fetch(`/api/unsplash?query=${encodeURIComponent(query)}&count=12`);
      const data = await res.json();
      if (data.error) {
        setErro(data.error);
        setFotos([]);
      } else {
        setFotos(data.photos);
      }
    } catch {
      setErro("Erro ao pesquisar. Verifica a chave do Unsplash.");
    }
    setCarregando(false);
  };

  // Seleccionar/deseleccionar foto do Unsplash
  const toggleFoto = (url: string) => {
    setSelecionadas(prev =>
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    );
  };

  // Aplicar as fotos seleccionadas aos slides (por ordem)
  const aplicarFotos = () => {
    const novasImagens = { ...imagens };
    selecionadas.forEach((url, i) => {
      novasImagens[i + 1] = url;
    });
    onChange(novasImagens);
  };

  // Upload manual de ficheiro para um slide específico
  const handleUpload = (slideNum: number, file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      onChange({ ...imagens, [slideNum]: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const totalAplicadas = Object.keys(imagens).length;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>
          Adicionar imagens
        </h2>
        <p style={{ fontSize: 13, color: "#8892a4", margin: 0 }}>
          Pesquisa no Unsplash ou faz upload manual. Selecciona até 9 fotos.
        </p>
      </div>

      {/* Pesquisa Unsplash */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && pesquisar()}
          placeholder="Ex: artificial intelligence, business, technology..."
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
            cursor: carregando ? "not-allowed" : "pointer",
            backgroundColor: "var(--accent)",
            color: "var(--bg)",
          }}
        >
          {carregando ? "…" : "Pesquisar"}
        </button>
      </div>

      {erro && (
        <div style={{
          padding: "10px 14px",
          borderRadius: 10,
          backgroundColor: "rgba(239,68,68,.1)",
          color: "#fca5a5",
          fontSize: 13,
          marginBottom: 16,
        }}>
          ⚠️ {erro}
        </div>
      )}

      {/* Grid de fotos Unsplash */}
      {fotos.length > 0 && (
        <div>
          <p style={{ fontSize: 12, color: "#8892a4", marginBottom: 10 }}>
            Clica para seleccionar ({selecionadas.length}/9 seleccionadas)
          </p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
            marginBottom: 16,
          }}>
            {fotos.map(foto => {
              const sel = selecionadas.includes(foto.regular);
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
                      {selecionadas.indexOf(foto.regular) + 1}
                    </div>
                  )}
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
                marginBottom: 24,
              }}
            >
              Aplicar {selecionadas.length} foto(s) aos slides
            </button>
          )}
        </div>
      )}

      {/* Upload manual por slide */}
      <div style={{ marginTop: 8 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>
          Upload manual por slide
        </p>
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
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.onchange = e => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) handleUpload(i + 1, file);
                };
                input.click();
              }}
            >
              {imagens[i + 1] ? (
                <>
                  <img
                    src={imagens[i + 1]}
                    alt={`Slide ${i + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0,
                    padding: "6px 8px",
                    background: "rgba(0,0,0,.5)",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#fff",
                  }}>
                    Slide {String(i + 1).padStart(2, "0")}
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

      {/* Botão avançar */}
      <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 12 }}>
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
