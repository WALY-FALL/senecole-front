import React from "react";

const ListeDevoirs = ({devoirsClasse, handleDeleteDevoirs, API_URL }) => {
  return (
    <div>
      <h3>📚 Devoirs de la classe</h3>

      {devoirsClasse.length === 0 ? (
        <p>Aucun devoir pour le moment.</p>
      ) : (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            display: "flex",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          {devoirsClasse.map((c) => (
            <li
              key={c._id}
              style={{
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                borderRadius: "10px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                padding: "12px",
                flex: "1 1 180px",
                maxWidth: "180px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <strong style={{ fontSize: "14px", color: "#333" }}>
                  {c.titre}
                </strong>
                <p style={{ margin: "6px 0", color: "#333", fontSize: "13px" }}>
                  {c.contenu}
                </p>
              </div>

              {c.fichiers && c.fichiers.length > 0 && (
                <div>
                  {c.fichiers.map((f, i) => (
                    <a
                      key={i}
                      href={`${API_URL.replace("/api", "")}/${f.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        color: "#007bff",
                        fontSize: "12px",
                        textDecoration: "none",
                      }}
                    >
                      <span
                        title={f.nom}
                        style={{
                          display: "inline-block",
                          maxWidth: "180px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        📎 {f.nom || "Ouvrir le fichier"}
                      </span>
                    </a>
                  ))}
                </div>
              )}

{handleDeleteDevoirs && (
  <button
    onClick={() => handleDeleteDevoirs(c._id)}
    style={{
      marginTop: "8px",
      border: "none",
      padding: "5px 8px",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "12px",
    }}
  >
    🗑 Supprimer
  </button>
)}

              {/*<button
                onClick={() => handleDeleteDevoirs(c._id)}
                style={{
                  marginTop: "8px",
                  border: "none",
                  padding: "5px 8px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                🗑 Supprimer
              </button>*/}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ListeDevoirs;