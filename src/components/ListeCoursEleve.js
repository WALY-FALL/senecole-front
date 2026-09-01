import React, { useEffect, useState } from "react";
import axios from "axios";
import ListeCours from "./ListeCours";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8989/api";

const ListeCoursEleve = ({ classeId }) => {
  const [coursListe, setCoursListe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const profId = localStorage.getItem("profId");

  useEffect(() => {
    const fetchCours = async () => {
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
        console.log("📚 Recherche des cours...");

        const res = await axios.get(
          `${API_URL}/cours/classe/${classeId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("📚 Cours reçus :", res.data);

        setCoursListe(res.data);
      } catch (err) {
        console.error(
          "❌ Erreur récupération cours élève :",
          err.response?.data || err.message
        );

        setError("Impossible de récupérer les cours.");
      } finally {
        setLoading(false);
      }
    };

    fetchCours();
  }, [profId, classeId]);

  if (loading) {
    return <p>Chargement des cours...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (coursListe.length === 0) {
    return <p>Aucun cours pour cette classe.</p>;
  }

  return (
    <div>
      <ListeCours
        coursClasse={coursListe}
        handleDeleteCours={() => {}}
        API_URL={API_URL}
      />
    </div>
  );
};

export default ListeCoursEleve;
/*import React, { useEffect, useState } from "react";
import axios from "axios";
import ListeCours from "./ListeCours";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8989/api";

const ListeCoursEleve = () => {
  const [coursListe, setCoursListe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  
 

  // Récupération du classeId depuis le localStorage
  //const classeId = localStorage.getItem("classeId");
  const profId = localStorage.getItem("profId");
  //const classeId = profId ? localStorage.getItem(`classe_${profId}`) : null;

  useEffect(() => {
    const fetchCours = async () => {
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
        const res = await axios.get(`${API_URL}/cours/classe/${storedClasse}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        setCoursListe(res.data);
      } catch (err) {
        console.error("Erreur récupération cours élève :", err);
        setError("Impossible de récupérer les cours.");
      } finally {
        setLoading(false);
      }
    };

    const storedClasse = localStorage.getItem(`classe_${profId}`);

console.log("👨‍🏫 profId :", profId);
console.log("🏫 classe stockée :", storedClasse);
console.log(
  "🔑 clé recherchée :",
  `classe_${profId}`
);
  
    fetchCours();
  }, [profId]);
  

  if (loading) return <p>Chargement des cours...</p>;
  if (error) return <p>{error}</p>;
  if (coursListe.length === 0) return <p>Aucun cours pour cette classe.</p>;


  return (
    <div>
      <ListeCours 
        coursClasse={coursListe} 
        handleDeleteCours={() => {}} // pas de suppression côté élève
        API_URL={API_URL}
      />
    </div>
  );
};

export default ListeCoursEleve;*/
