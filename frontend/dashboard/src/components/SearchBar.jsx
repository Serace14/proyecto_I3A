export default function SearchBar({ value, onChange }) {
  return (
    <div style={styles.container}>
      <input
        type="text"
        placeholder="Buscar por nombre..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={styles.input}
      />
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    maxWidth: "420px",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "8px",
    border: "1px solid #cbd5f5",
    fontSize: "16px",
    outline: "none",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
};
