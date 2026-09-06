import React, { useEffect, useState } from "react";
import axios from "axios";

const ListeEleves = ({ classeId }) => {
  const [eleves, setEleves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchEleves = async () => {
      if (!classeId) {
        setError("Aucune classe sélectionnée.");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `${API_URL}/classes/${classeId}/eleves`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("👨‍🎓 Réponse élèves :", response.data);

        const liste = Array.isArray(response.data?.eleves)
          ? response.data.eleves
          : [];

        setEleves(liste);
      } catch (error) {
        console.error("❌ Erreur récupération élèves :", error);
        setError("Impossible de récupérer la liste des élèves.");
        setEleves([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEleves();
  }, [classeId, API_URL]);

  if (loading) {
    return <p>Chargement des élèves...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="liste-eleves">
      <h2>👨‍🎓 Liste des élèves</h2>

      {eleves.length === 0 ? (
        <p>Aucun élève accepté dans cette classe.</p>
      ) : (
        <div>
          {eleves.map((eleve) => (
            <div key={eleve._id} className="eleve-item">
              <p>
                <strong>
                  {eleve.prenom} {eleve.nom}
                </strong>
              </p>

              <p>{eleve.email}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListeEleves;
/*import React, { useEffect, useState } from "react";
import axios from "axios";

const ListeEleves = ({ classeId }) => {
  const [eleves, setEleves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const recupererEleves = async () => {
      if (!classeId) {
        setError("Aucune classe sélectionnée.");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `${API_URL}/classes/${classeId}/eleves`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setEleves(response.data);
      } catch (error) {
        console.error(
          "Erreur récupération des élèves :",
          error
        );

        setError("Impossible de récupérer les élèves.");
      } finally {
        setLoading(false);
      }
    };

    recupererEleves();
  }, [classeId, API_URL]);

  if (loading) {
    return <p>Chargement des élèves...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="liste-eleves">
      <h2>Liste des élèves</h2>

      {eleves.length === 0 ? (
        <p>Aucun élève dans cette classe.</p>
      ) : (
        <div>
          {eleves.map((eleve) => (
            <div key={eleve._id} className="eleve-item">
              <p>
                <strong>
                  {eleve.prenom} {eleve.nom}
                </strong>
              </p>

              <p>{eleve.email}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListeEleves;*/