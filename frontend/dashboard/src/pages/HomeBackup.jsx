import { useState, useRef, useEffect } from "react";

function YearDropdown({ label, value, onChange, years }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={styles.dropdownWrapper} ref={ref}>
      <label style={styles.label}>{label}</label>

      <div style={styles.dropdown} onClick={() => setOpen(!open)}>
        {value || "Seleccionar"}
        <span style={styles.arrow}>▾</span>
      </div>

      {open && (
        <div style={styles.dropdownMenu}>
          <div
            style={styles.option}
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
          >
            Seleccionar
          </div>
          {years.map((year) => (
            <div
              key={year}
              style={styles.option}
              onClick={() => {
                onChange(year);
                setOpen(false);
              }}
            >
              {year}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  // 🔵 Clasificación superior (solo visual)
  const classificationTabs = [
    "General",
    "Grupo",
    "División",
    "Laboratorio",
    "Investigador",
  ];

  const [activeClassification, setActiveClassification] = useState(null);
  const [classificationSearch, setClassificationSearch] = useState("");

  // 🔵 Tabs originales (NO modificados)
  const tabs = [
    { label: "Tesis", tipo: "tesis" },
    { label: "Libros", tipo: "libros" },
    { label: "Proyectos", tipo: "proyectos" },
    { label: "Capítulos", tipo: "capitulos" },
    { label: "Artículos", tipo: "articulos" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 40 }, (_, i) => currentYear - 39 + i);

  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [yearStart, setYearStart] = useState("");
  const [yearEnd, setYearEnd] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Paginación ORIGINAL
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = data.slice(startIndex, startIndex + itemsPerPage);

  const fetchData = async () => {
    setLoading(true);
    setCurrentPage(1);

    const params = new URLSearchParams();
    params.append("tipo", activeTab.tipo);

    if (yearStart) params.append("anio_inicio", yearStart);
    if (yearEnd) params.append("anio_fin", yearEnd);

    // 🔵 CASO GRUPO
    if (activeClassification === "Grupo") {
      if (!classificationSearch) {
        alert("Introduce un grupo");
        setLoading(false);
        return;
      }

      params.append("grupo", classificationSearch);

      try {
        const res = await fetch(
          `http://localhost:8000/api/n8n/produccion-grupo?${params.toString()}`
        );
        const json = await res.json();
        setData(Array.isArray(json) ? json : []);
      } catch (error) {
        console.error(error);
        setData([]);
      }
    }

    // 🔵 CASO DIVISION
    if (activeClassification === "División") {
      if (!classificationSearch) {
        alert("Introduce una división");
        setLoading(false);
        return;
      }

      params.append("division", classificationSearch);

      try {
        const res = await fetch(
          `http://localhost:8000/api/n8n/produccion-division?${params.toString()}`
        );
        const json = await res.json();
        setData(Array.isArray(json) ? json : []);
      } catch (error) {
        console.error(error);
        setData([]);
      }
    }

    // 🔵 CASO INVESTIGADOR
    if (activeClassification === "Investigador") {
      if (!classificationSearch) {
        alert("Introduce un NIP o Nombre completo");
        setLoading(false);
        return;
      }

      params.append("investigador", classificationSearch);

      try {
        const res = await fetch(
          `http://localhost:8000/api/n8n/produccion-investigador?${params.toString()}`
        );
        const json = await res.json();
        setData(Array.isArray(json) ? json : []);
      } catch (error) {
        console.error(error);
        setData([]);
      }
    }

    // 🔵 CASO GENERAL (NO TOCAMOS SU LÓGICA)
    else {
      try {
        const res = await fetch(
          `http://localhost:8000/api/n8n/produccion?${params.toString()}`
        );
        const json = await res.json();
        setData(Array.isArray(json) ? json : []);
      } catch (error) {
        console.error(error);
        setData([]);
      }
    }

    setLoading(false);
  };


  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>I3A Data Visor</h1>

        {/* BLOQUE 1 */}
        <div style={styles.primaryBlock}>
          <h2 style={styles.blockTitle}>1. Clasificación</h2>

          <div style={styles.classificationTabs}>
            {classificationTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveClassification(tab);
                  setData([]);
                }}
                style={{
                  ...styles.tab,
                  ...(activeClassification === tab
                    ? styles.activePrimaryTab
                    : {}),
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeClassification &&
            activeClassification !== "General" && (
              <div style={{ marginTop: 15 }}>
                <label style={styles.label}>
                  Buscar {activeClassification}
                </label>
                <input
                  type="text"
                  value={classificationSearch}
                  onChange={(e) =>
                    setClassificationSearch(e.target.value)
                  }
                  style={styles.searchInput}
                />
              </div>
            )}
        </div>

        {/* BLOQUE 2 */}
        {activeClassification && (
          <>
            <div style={styles.secondaryBlock}>
              <h2 style={styles.blockTitle}>2. Tipo de producción</h2>

              <div style={styles.tabs}>
                {tabs.map((tab) => (
                  <button
                    key={tab.label}
                    onClick={() => {
                      setActiveTab(tab);
                      setData([]);
                      setCurrentPage(1);
                    }}
                    style={{
                      ...styles.tab,
                      ...(activeTab.label === tab.label
                        ? styles.activeTab
                        : {}),
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div style={styles.filters}>
                <YearDropdown
                  label="De"
                  value={yearStart}
                  onChange={setYearStart}
                  years={years}
                />
                <YearDropdown
                  label="Hasta"
                  value={yearEnd}
                  onChange={setYearEnd}
                  years={years}
                />

                <button
                  style={styles.searchButton}
                  onClick={fetchData}
                >
                  Buscar
                </button>
              </div>
            </div>

            {/* RESULTADOS */}
            <div style={styles.resultsBox}>
              <h2 style={styles.sectionTitle}>{activeTab.label}</h2>

              {loading ? (
                <p>Cargando...</p>
              ) : data.length === 0 ? (
                <p style={styles.placeholder}>
                  No hay resultados. Pulsa "Buscar".
                </p>
              ) : (
                <>
                  <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          {Object.keys(data[0]).map((key) => (
                            <th key={key} style={styles.th}>
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.map((row, index) => (
                          <tr key={index}>
                            {Object.values(row).map((value, i) => (
                              <td key={i} style={styles.td}>
                                {typeof value === "string" &&
                                value.includes("T") &&
                                value.includes("Z")
                                  ? new Date(value).toLocaleDateString()
                                  : value}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={styles.pagination}>
                    <button
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage(currentPage - 1)
                      }
                      style={styles.pageButton}
                    >
                      ← Anterior
                    </button>

                    <span style={styles.pageInfo}>
                      Página {currentPage} de {totalPages}
                    </span>

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setCurrentPage(currentPage + 1)
                      }
                      style={styles.pageButton}
                    >
                      Siguiente →
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------ STYLES ------------------ */

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f1f5f9",
    padding: "40px 20px 120px 20px",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
  },
  title: {
    fontSize: "32px",
    fontWeight: 700,
    color: "#1e5f8a",
    marginBottom: 30,
  },
  primaryBlock: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#eef6fb",
    marginBottom: 30,
  },
  secondaryBlock: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    marginBottom: 30,
  },
  blockTitle: {
    marginBottom: 15,
  },
  classificationTabs: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  tabs: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 20,
  },
  tab: {
    padding: "10px 18px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    backgroundColor: "white",
    cursor: "pointer",
  },
  activeTab: {
    backgroundColor: "#1e5f8a",
    color: "white",
  },
  activePrimaryTab: {
    backgroundColor: "#0f3c5c",
    color: "white",
  },
  filters: {
    display: "flex",
    gap: 16,
    alignItems: "flex-end",
    flexWrap: "wrap",
  },
  searchButton: {
    padding: "10px 20px",
    borderRadius: 6,
    border: "none",
    backgroundColor: "#1e5f8a",
    color: "white",
    cursor: "pointer",
    fontWeight: 600,
  },
  searchInput: {
    padding: 10,
    borderRadius: 6,
    border: "1px solid #e2e8f0",
    width: 250,
  },
  dropdownWrapper: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    minWidth: 150,
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
  },
  dropdown: {
    padding: "10px 12px",
    borderRadius: 6,
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
  },
  arrow: { fontSize: 12 },
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    width: "100%",
    maxHeight: 220,
    overflowY: "auto",
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 6,
    zIndex: 1000,
  },
  option: {
    padding: "8px 12px",
    cursor: "pointer",
  },
  resultsBox: {
    padding: 20,
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
  },
  sectionTitle: { marginBottom: 10 },
  placeholder: { color: "#475569" },
  tableWrapper: { width: "100%", overflowX: "auto" },
  table: {
    width: "100%",
    minWidth: 1000,
    borderCollapse: "collapse",
    marginTop: 15,
  },
  th: {
    borderBottom: "2px solid #1e5f8a",
    padding: 8,
    textAlign: "left",
  },
  td: {
    borderBottom: "1px solid #e2e8f0",
    padding: 8,
  },
  pagination: {
    marginTop: 20,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  pageButton: {
    padding: "8px 14px",
    borderRadius: 6,
    border: "1px solid #1e5f8a",
    backgroundColor: "white",
    cursor: "pointer",
  },
  pageInfo: { fontWeight: 500 },
};
