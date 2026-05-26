import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { Range, getTrackBackground } from "react-range";

function CustomDropdown({ label, value, onChange, options }) {
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

          {options.map((option) => (
            <div
              key={option}
              style={styles.option}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function YearDropdown({ label, value, onChange, years }) {
  return (
    <CustomDropdown
      label={label}
      value={value}
      onChange={onChange}
      options={years}
    />
  );
}

export default function Home() {

  const classificationTabs = [
    "General",
    "Grupo",
    "División",
    "Laboratorio",
    "Investigador",
  ];

  const tabs = [
    { label: "Proyectos", tipo: "proyectos" },
    { label: "Tesis", tipo: "tesis" },
    { label: "Libros", tipo: "libros" },
    { label: "Capítulos", tipo: "capitulos" },
    { label: "Artículos", tipo: "articulos" },
  ];

  const divisionOptions = [
    "Ingeniería Biomédica",
    "Procesos y Reciclado",
    "Tecnologías de la Información y la Comunicación",
    "Tecnologías Industriales",
  ];

  const grupoOptions = [
    "AFFECTIVE LAB","AMB","BSICoS","CeNIT","COSMOS","CREG","D4S",
    "DisCo","ECO2","GATHERS","GAZ","GBM","GDE","Generés","GEPM",
    "GIA","GIFMA","GITSE","GPT","Graphics & Imaging Lab","GTF",
    "GUIA","Howlab","IAAA","ID_ERGO","M2BE","MARTE","Ropert",
    "SID","TFD","TIIP","TME Lab","TOL","UIF","ViVoLab"
  ];

  const proyectoTipoOptions = [
    "Europeos",
    "OTRI",
    "SGI",
    "Cátedra",
    "Otros"
  ];

  // NUEVO
  const proyectoAmbitoOptions = [
    "Europeo",
    "Nacional",
    "Autonómico",
    "Local",
    "Propia"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 40 }, (_, i) => currentYear - 39 + i);

  const [activeClassification, setActiveClassification] = useState(null);
  const [classificationSearch, setClassificationSearch] = useState("");
  const [investigadores, setInvestigadores] = useState([
    {
      search: "",
      selected: null,
      suggestions: [],
      showSuggestions: false,
    },
  ]);
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [yearStart, setYearStart] = useState("");
  const [yearEnd, setYearEnd] = useState("");
  const [projectType, setProjectType] = useState("");

  const [projectScope, setProjectScope] = useState("");
  const [tableSearch, setTableSearch] = useState("");

  const [impactRange, setImpactRange] = useState([0, 10]);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = data.filter((row) =>
    Object.values(row)
      .join(" ")
      .toLowerCase()
      .includes(tableSearch.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const getProjectType = (codigo) => {

    if (!codigo) return "Otros";

    if (codigo.startsWith("I-")) return "Europeos";

    if (/^\d{4}\/\d+/.test(codigo)) return "OTRI";

    if (/^\d+$/.test(codigo)) return "SGI";

    if (/^C\d+/.test(codigo)) return "Cátedra";

    return "Otros";
  };

  const searchInvestigador = async (value, index) => {
    const updated = [...investigadores];

    updated[index].search = value;
    updated[index].selected = null;

    setInvestigadores(updated);

    if (value.trim().length < 2) {
      updated[index].suggestions = [];
      updated[index].showSuggestions = false;
      setInvestigadores([...updated]);
      return;
    }

    // guardar el texto exacto buscado ANTES del fetch
    const currentSearch = value;

    try {
      const res = await fetch(
        `/api/n8n/buscar-investigador?q=${encodeURIComponent(currentSearch)}`
      );

      const json = await res.json();

      // coger estado ACTUAL, no el viejo "updated"
      setInvestigadores((prev) => {
        const next = [...prev];

        // si el usuario ya escribió otra cosa, ignorar respuesta vieja
        if (next[index].search !== currentSearch) {
          return prev;
        }

        next[index].suggestions = Array.isArray(json) ? json : [];
        next[index].showSuggestions = true;

        return next;
      });
    } catch (err) {
      console.error(err);

      setInvestigadores((prev) => {
        const next = [...prev];

        if (next[index].search !== currentSearch) {
          return prev;
        }

        next[index].suggestions = [];
        next[index].showSuggestions = false;

        return next;
      });
    }
  };

  const fetchData = async () => {

    setLoading(true);
    setCurrentPage(1);

    const params = new URLSearchParams();
    params.append("tipo", activeTab.tipo);

    if (yearStart) params.append("anio_inicio", yearStart);
    if (yearEnd) params.append("anio_fin", yearEnd);

    try {

      let endpoint = "produccion";

      if (activeClassification === "Grupo") {
        if (!classificationSearch) {
          alert("Selecciona un grupo");
          setLoading(false);
          return;
        }

        params.append("grupo", classificationSearch);
        endpoint = "produccion-grupo";
      }

      if (activeClassification === "División") {
        if (!classificationSearch) {
          alert("Selecciona una división");
          setLoading(false);
          return;
        }

        params.append("division", classificationSearch);
        endpoint = "produccion-division";
      }

      if (activeClassification === "Investigador") {
        const invFiltrados = investigadores
          .filter((i) => i.selected)
          .map((i) => i.selected.nip);

        if (invFiltrados.length === 0) {
          alert("Selecciona al menos un investigador");
          setLoading(false);
          return;
        }

        params.append(
          "investigadores",
          invFiltrados.join("|")
        );
        endpoint = "produccion-investigador";
      }

      const res = await fetch(
        `/api/n8n/${endpoint}?${params.toString()}`
      );

      const json = await res.json();

      let result = Array.isArray(json) ? json : [];

      // FILTROS PROYECTOS
      if (activeTab.tipo === "proyectos") {
        if (projectType) {
          result = result.filter((p) =>
            getProjectType(p["Código"]) === projectType
          );
        }

        if (projectScope) {
          result = result.filter((p) =>
            (p["Ámbito"] || "").toLowerCase() === projectScope.toLowerCase()
          );
        }

      }

      // FILTRO ARTÍCULOS POR FACTOR DE IMPACTO
      if (activeTab.tipo === "articulos") {
        result = result.filter((art) => {
          const fi = parseFloat(art["Factor Impacto"] || 0);
          const [min, max] = impactRange;
          if (max === 10) {
            return fi >= min;
          }
          return fi >= min && fi <= max;
        });
      }

      setData(result);

    } catch (error) {

      console.error(error);
      setData([]);

    }

    setLoading(false);
  };

  const exportCSV = () => {

    if (data.length === 0) return;

    const headers = Object.keys(data[0]);

    const rows = data.map(row =>
      headers.map(field =>
        `"${(row[field] ?? "").toString().replace(/"/g,'""')}"`
      ).join(";")   // ← separador europeo
    );

    const csvContent =
      headers.join(";") + "\n" + rows.join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "resultados_i3a.csv";
    link.click();
  };

  const exportExcel = () => {

    if (data.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(data);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Resultados"
    );

    XLSX.writeFile(workbook, "resultados_i3a.xlsx");

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
                  setClassificationSearch("");
                  setInvestigadores([
                    {
                      search: "",
                      selected: null,
                      suggestions: [],
                      showSuggestions: false,
                    },
                  ]);
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

          {activeClassification === "Grupo" && (
            <div style={{ marginTop: 15 }}>
              <CustomDropdown
                label="Seleccionar Grupo"
                value={classificationSearch}
                onChange={setClassificationSearch}
                options={grupoOptions}
              />
            </div>
          )}

          {activeClassification === "División" && (
            <div style={{ marginTop: 15 }}>
              <CustomDropdown
                label="Seleccionar División"
                value={classificationSearch}
                onChange={setClassificationSearch}
                options={divisionOptions}
              />
            </div>
          )}

          {activeClassification === "Investigador" && (
            <div style={{ marginTop: 15 }}>
              <label style={styles.label}>Buscar Investigador(es)</label>

              {investigadores.map((inv, index) => (
                <div
                  key={index}
                  style={{
                    position: "relative",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <input
                      type="text"
                      value={inv.search}
                      placeholder={`Investigador ${index + 1}`}
                      onChange={(e) =>
                        searchInvestigador(e.target.value, index)
                      }
                      style={styles.searchInput}
                    />

                    {investigadores.length > 1 && (
                      <button
                        onClick={() =>
                          setInvestigadores(
                            investigadores.filter((_, i) => i !== index)
                          )
                        }
                        style={styles.removeButton}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {inv.showSuggestions &&
                    inv.suggestions.length > 0 && (
                      <div style={styles.dropdownMenu}>
                        {inv.suggestions.map((item) => (
                          <div
                            key={item.nip}
                            style={styles.option}
                            onClick={() => {
                              const updated = [...investigadores];

                              updated[index].selected = item;
                              updated[index].search =
                                `${item.nombre} (${item.nip})`;
                              updated[index].showSuggestions = false;

                              setInvestigadores(updated);
                            }}
                          >
                            {item.nombre} ({item.nip})
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              ))}

              <button
                onClick={() =>
                  setInvestigadores([
                    ...investigadores,
                    {
                      search: "",
                      selected: null,
                      suggestions: [],
                      showSuggestions: false,
                    },
                  ])
                }
                style={styles.addButton}
              >
                + Añadir investigador
              </button>
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
                      setProjectType("");
                      setProjectScope("");
                      setImpactRange([0, 10]);
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

                {activeTab.tipo === "proyectos" && (
                  <>
                    <CustomDropdown
                      label="Tipo de proyecto"
                      value={projectType}
                      onChange={setProjectType}
                      options={proyectoTipoOptions}
                    />

                    <CustomDropdown
                      label="Ámbito"
                      value={projectScope}
                      onChange={setProjectScope}
                      options={proyectoAmbitoOptions}
                    />
                  </>
                )}

                {activeTab.tipo === "articulos" && (
                  <div style={styles.impactFilter}>
                    <label style={styles.label}>
                      Factor de impacto: {impactRange[0]} — {impactRange[1] === 10 ? "10+" : impactRange[1]}
                    </label>
                    <div style={styles.sliderContainer}>
                      <Range
                        values={impactRange}
                        step={0.1}
                        min={0}
                        max={10}
                        onChange={(values) => setImpactRange(values)}

                        renderTrack={({ props, children }) => (
                          <div
                            {...props}
                            style={{
                              ...props.style,
                              height: "6px",
                              width: "100%",
                              borderRadius: "4px",
                              background: getTrackBackground({
                                values: impactRange,
                                colors: ["#ccc", "#1e5f8a", "#ccc"],
                                min: 0,
                                max: 10
                              })
                            }}
                          >
                            {children}
                          </div>
                        )}

                        renderThumb={({ props }) => (
                          <div
                            {...props}
                            style={{
                              ...props.style,
                              height: "16px",
                              width: "16px",
                              borderRadius: "50%",
                              backgroundColor: "#1e5f8a"
                            }}
                          />
                        )}
                      />
                    </div>
                  </div>
                )}

                <button
                  style={styles.searchButton}
                  onClick={fetchData}
                >
                  Buscar
                </button>

                {data.length > 0 && (
                  <>
                    <button
                      style={styles.exportButton}
                      onClick={exportCSV}
                    >
                      Exportar CSV
                    </button>

                    <button
                      style={styles.excelButton}
                      onClick={exportExcel}
                    >
                      Exportar Excel
                    </button>
                  </>
                )}

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
                  <input
                    type="text"
                    placeholder="Buscar dentro de resultados..."
                    value={tableSearch}
                    onChange={(e) => {
                      setTableSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={styles.tableSearch}
                  />
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
  blockTitle: { marginBottom: 15 },
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
  exportButton: {
    padding: "10px 20px",
    borderRadius: 6,
    border: "none",
    backgroundColor: "#16a34a",
    color: "white",
    cursor: "pointer",
    fontWeight: 600,
  },
  excelButton: {
    padding: "10px 20px",
    borderRadius: 6,
    border: "none",
    backgroundColor: "#2563eb",
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
    minWidth: 250,
  },
  label: { marginBottom: 6, fontSize: 14 },
  dropdown: {
    padding: "10px 12px",
    borderRadius: 6,
    backgroundColor: "white",
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
  option: { padding: "8px 12px", cursor: "pointer" },
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
  tableSearch: {
    padding: 10,
    borderRadius: 6,
    border: "1px solid #e2e8f0",
    marginBottom: 10,
    width: 300
  },
  impactFilter: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    minWidth: 260
  },
  sliderRow: {
    display: "flex",
    gap: 10
  },
  sliderContainer: {
    width: 260,
    paddingTop: 8
  },
  addButton: {
    padding: "8px 14px",
    borderRadius: 6,
    border: "1px dashed #1e5f8a",
    backgroundColor: "transparent",
    color: "#1e5f8a",
    cursor: "pointer",
    fontWeight: 600,
    marginTop: 4,
  },
  removeButton: {
    padding: "6px 10px",
    borderRadius: 6,
    border: "none",
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    cursor: "pointer",
    fontWeight: 700,
  },
};