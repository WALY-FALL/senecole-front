import React, { useEffect, useState } from "react";
import axios from "axios";
import ListeDevoirs from "./ListeDevoirs";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8989/api";

const ListeDevoirsEleve = () => {
  const [devoirsListe, setDevoirsListe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  
 

  // Récupération du classeId depuis le localStorage
  //const classeId = localStorage.getItem("classeId");
  const profId = localStorage.getItem("profId");
  //const classeId = profId ? localStorage.getItem(`classe_${profId}`) : null;

  useEffect(() => {
    const fetchDevoirs = async () => {
      if (!profId) {
        setError("Aucun professeur sélectionné.");
        setLoading(false);
        return;
      }
  
      const storedClasse = localStorage.getItem(`classe_${profId}`);
  
      if (!storedClasse) {
        setError("⏳ En attente de validation du professeur pour cette classe.");
        setLoading(false);
        return;
      }
  
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/devoirs/classe/${storedClasse}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        setDevoirsListe(res.data);
      } catch (err) {
        console.error("Erreur récupération devoirs élève :", err);
        setError("Impossible de récupérer les cours.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchDevoirs();
  }, [profId]);
  

  if (loading) return <p>Chargement des devoirs...</p>;
  if (error) return <p>{error}</p>;
  if (devoirsListe.length === 0) return <p>Aucun devoir pour cette classe.</p>;
  //console.log("devoirsListe :", devoirsListe);
  return (
  <div>
  <ListeDevoirs 
    devoirsClasse={devoirsListe} 
    handleDeleteDevoirs={() => {}} // pas de suppression côté élève
    API_URL={API_URL}
  />
</div>
  );
  /*return (
    <div>
      <h3>📚 Devoirs de la classe </h3>
      {devoirsListe.map((c) => (
        <div
          key={c._id}
          style={{ marginBottom: "15px", padding: "10px", border: "1px solid #ddd", width:"160px" }}
        >
          <h4>{c.titre}</h4>
          <p>{c.contenu}</p>
          {c.fichiers && c.fichiers.length > 0 && (
            <a
            href={`${API_URL.replace("/api", "")}/${c.fichiers[0].url}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "block", marginBottom: "8px" }}
          >
            📎 {c.fichiers[0].nom || "Ouvrir le fichier"}
          </a>
        
          )}
          <p style={{ fontSize: "0.9em", color: "#555" }}>
            Professeur : {c.profId?.nom} {c.profId?.prenom}
          </p>
        </div>
      ))}
    </div>
  );*/
};

export default ListeDevoirsEleve;
