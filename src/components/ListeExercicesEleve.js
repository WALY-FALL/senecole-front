import React, { useEffect, useState } from "react";
import axios from "axios";
import ListeExercices from "./ListeExercices";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8989/api";

const ListeExercicesEleve = ({ classeId }) => {
  const [exercicesListe, setExercicesListe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const profId = localStorage.getItem("profId");

  useEffect(() => {
    const fetchExercices = async () => {
      if (!profId) {
        setError("Aucun professeur sélectionné.");
        setLoading(false);
        return;
      }

      if (!classeId) {
        setError("⏳ Aucune classe sélectionnée.");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");

        console.log("👨‍🏫 Prof ID :", profId);
        console.log("🏫 Classe ID :", classeId);
        console.log("📝 Recherche des exercices...");

        const res = await axios.get(
          `${API_URL}/exercices/classe/${classeId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("📝 Exercices reçus :", res.data);

        setExercicesListe(res.data);
      } catch (err) {
        console.error(
          "❌ Erreur récupération exercices élève :",
          err.response?.data || err.message
        );

        setError("Impossible de récupérer les exercices.");
      } finally {
        setLoading(false);
      }
    };

    fetchExercices();
  }, [profId, classeId]);

  if (loading) {
    return <p>Chargement des exercices...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (exercicesListe.length === 0) {
    return <p>Aucun exercice pour cette classe.</p>;
  }

  return (
    <div>
      <ListeExercices
        exercicesClasse={exercicesListe}
        API_URL={API_URL}
      />
    </div>
  );
};

export default ListeExercicesEleve;
/*import React, { useEffect, useState } from "react";
import axios from "axios";
import ListeExercices from "./ListeExercices";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8989/api";

const ListeExercicesEleve = () => {
  const [exercicesListe, setExercicesListe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  
 

  // Récupération du classeId depuis le localStorage
  //const classeId = localStorage.getItem("classeId");
  const profId = localStorage.getItem("profId");
  //const classeId = profId ? localStorage.getItem(`classe_${profId}`) : null;

  useEffect(() => {
    const fetchExercices = async () => {
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
        const res = await axios.get(`${API_URL}/exercices/classe/${storedClasse}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        setExercicesListe(res.data);
      } catch (err) {
        console.error("Erreur récupération exercice élève :", err);
        setError("Impossible de récupérer les cours.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchExercices();
  }, [profId]);
  

  if (loading) return <p>Chargement des exercices...</p>;
  if (error) return <p>{error}</p>;
  if (exercicesListe.length === 0) return <p>Aucun exercice pour cette classe.</p>;
 
  return (
  <div>
  <ListeExercices 
    exercicesClasse={exercicesListe} 
    handleDeleteExercices={() => {}} // pas de suppression côté élève
    API_URL={API_URL}
  />
</div>
  );
  /*return (
    <div>
      <h3>📚 Exercices de la classe </h3>
      {exercicesListe.map((c) => (
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
  );
};

export default ListeExercicesEleve;*/
