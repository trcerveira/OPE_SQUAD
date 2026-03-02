"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt">
      <body style={{ backgroundColor: "#0A0E1A", margin: 0 }}>
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                fontSize: "48px",
                fontWeight: 900,
                color: "#BFD64B",
                marginBottom: "16px",
              }}
            >
              Algo correu mal
            </h1>
            <p style={{ color: "#F0ECE4", fontSize: "16px", marginBottom: "32px" }}>
              Ocorreu um erro inesperado. Tenta novamente.
            </p>
            <button
              onClick={() => reset()}
              style={{
                backgroundColor: "#BFD64B",
                color: "#0A0E1A",
                fontWeight: 700,
                padding: "12px 24px",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Tentar novamente
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
