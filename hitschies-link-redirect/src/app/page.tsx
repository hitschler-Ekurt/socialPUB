export default function Home() {
  return (
    <main
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>
          hitschies Link Service
        </h1>
        <p style={{ color: "#666", marginTop: "0.5rem" }}>
          Short link redirect service
        </p>
      </div>
    </main>
  );
}
