// Custom error page — prevents Clerk useContext crash during static generation
function ErrorPage({ statusCode }: { statusCode?: number }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#0A0E1A",
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
          {statusCode || "Erro"}
        </h1>
        <p style={{ color: "#F0ECE4", fontSize: "16px", marginBottom: "32px" }}>
          {statusCode === 404
            ? "Página não encontrada."
            : "Ocorreu um erro no servidor."}
        </p>
        <a
          href="/dashboard"
          style={{
            backgroundColor: "#BFD64B",
            color: "#0A0E1A",
            fontWeight: 700,
            padding: "12px 24px",
            borderRadius: "12px",
            textDecoration: "none",
            fontSize: "14px",
          }}
        >
          Voltar ao Dashboard
        </a>
      </div>
    </main>
  );
}

ErrorPage.getInitialProps = ({ res, err }: { res?: { statusCode?: number }; err?: { statusCode?: number } }) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 500;
  return { statusCode };
};

export default ErrorPage;
