import React, { useEffect, useState } from "react";
import axios from "axios";
import ListeDevoirs from "./ListeDevoirs";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8989/api";

const ListeDevoirsEleve = ({ classeId }) => {
  const [devoirsListe, setDevoirsListe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const profId = localStorage.getItem("profId");

  useEffect(() => {
    const fetchDevoirs = async () => {
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
          `${API_URL}/devoirs/classe/${classeId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("📚 Devoirs reçus :", res.data);

        setDevoirsListe(res.data);
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

    fetchDevoirs();
  }, [profId, classeId]);

  if (loading) {
    return <p>Chargement des cours...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (devoirsListe.length === 0) {
    return <p>Aucun cours pour cette classe.</p>;
  }

  return (
    <div>
      <ListeDevoirs
        devoirsClasse={devoirsListe}
        handleDeleteDevoirs={() => {}}
        API_URL={API_URL}
      />
    </div>
  );
};

export default ListeDevoirsEleve;