import { useState } from "react";
import SearchBar from "../components/SearchBar";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // NUEVO

  const fetchResults = async (searchTerm) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/n8n/search-personas?search=${encodeURIComponent(searchTerm || "")}`
      );
      let data = await res.json();
      data = Array.isArray(data) ? data : [];

      const dataWithGroups = await Promise.all(
        data.map(async (item) => {
          try {
            const resGrupo = await fetch(
              `/api/n8n/search-grupos?nip=${encodeURIComponent(item.nip)}`
            );
            const grupoData = await resGrupo.json();

            return {
              ...item,
              grupo: (Array.isArray(grupoData) && grupoData.length > 0)
            ? grupoData[0].grupo
            : null,
            };
          } catch (err) {
            return { ...item, grupo: "Error" };
          }
        })
      );

      setResults(dataWithGroups);
      setHasSearched(true);
    } catch (err) {
      console.error("Error fetching n8n data:", err);
      setResults([]);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>I3A Data Visor</h1>
        <p style={styles.subtitle}>
          Visualización y monitorización de datos en tiempo real
        </p>

        {/* SearchBar con botón */}
        <div style={styles.searchContainer}>
          <SearchBar value={query} onChange={setQuery} />
          <button
            style={styles.searchButton}
            onClick={() => fetchResults(query)}
          >
            Buscar
          </button>
        </div>

        <div style={styles.results}>
          {loading && <p>Cargando resultados...</p>}

          {!loading && hasSearched && results.length === 0 && (
            <p>No se encontraron resultados para <strong>{query}</strong></p>
          )}
          {!loading && results.length > 0 && Array.isArray(results) && (
            <ul style={styles.list}>
              {results.map((item, index) => (
                <li key={index} style={styles.listItem}>
                  {item.nip} - {item.nombre} {item.apellido1} {item.apellido2}
                  {item.grupo ? ` (${item.grupo})` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(180deg, #ffffff, #f1f5f9)",
  },
  card: {
    width: "100%",
    maxWidth: "600px",
    backgroundColor: "white",
    padding: "48px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    textAlign: "center",
  },
  title: {
    fontSize: "36px",
    fontWeight: 700,
    color: "#1e40af",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#475569",
    marginBottom: "32px",
  },
  searchContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    justifyContent: "center",
  },
  searchButton: {
    padding: "14px 24px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#1e40af",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
  },
  results: {
    marginTop: "32px",
    textAlign: "left",
  },
  list: {
    listStyle: "none",
    padding: 0,
  },
  listItem: {
    padding: "8px 12px",
    borderBottom: "1px solid #e2e8f0",
  },
};
