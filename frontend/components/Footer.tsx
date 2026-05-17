export default function Footer() {
  return (
    <footer
      className="flex items-center justify-between px-6 text-[0.79rem] text-[var(--text3)]"
      style={{
        gridRow: "3",
        gridColumn: "2",
        height: "2.86rem",
        background: "var(--bg2)",
        borderTop: "0.5px solid var(--border)",
      }}
    >
      <span>ProjetIn v2.4 · Week 15</span>
      <span>Drag widgets to reorder · Click ✕ to remove</span>
      <span>acardoso · Pro Plan</span>
    </footer>
  );
}
