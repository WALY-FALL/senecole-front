import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../style/espaceprofs.css";
import FormulaireClasse from "./FormulaireClasse";
import PosterCours from "../components/PosterCours";
import PosterExercices from "../components/PosterExercices";
import PosterDevoirs from "../components/PosterDevoirs";
import DemandesAccesProf from "../components/DemandesAccesProf";
import ListeExercices from "../components/ListeExercices";
import ListeDevoirs from "../components/ListeDevoirs";
import socket from "../socket";



const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const Espaceprofs = () => {
  const [showForm, setShowForm] = useState(false);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  //const [email, setEmail] = useState("");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  //const [profId, setProfId] = useState(null);
  const [selectedClasse, setSelectedClasse] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showUploadFormExercices, setShowUploadFormExercices] = useState(false);
  const [showUploadFormDevoirs, setShowUploadFormDevoirs] = useState(false);
  const [coursClasse, setCoursClasse] = useState([]);
  const [exercicesClasse, setExercicesClasse] = useState([]);
  const [devoirsClasse, setDevoirsClasse] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // 🔹 Charger les classes du prof
  const fetchClasses = useCallback(async () => {

    try {
   
      const res = await axios.get(`${API_URL}/classes/my-classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(res.data.classes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
 }, [token]);

  /*const fetchClasses = async () => {
    try {
   
      const res = await axios.get(`${API_URL}/classes/my-classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(res.data.classes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };*/

  // 🔹 Charger les cours d'une classe
  const fetchCoursClasse = async (classeId) => {
    try {
      const res = await axios.get(`${API_URL}/cours/classe/${classeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoursClasse(res.data || []);
    } catch (err) {
      console.error("Erreur chargement cours:", err);
    }
  };

  // 🔹 Sélection d'une classe
  const handleSelectClasse = async (classe) => {
    setSelectedClasse(classe);
    fetchCoursClasse(classe._id);
    fetchExercicesClasse(classe._id);
    fetchDevoirsClasse(classe._id);
  };

  // 🔹 Supprimer une classe
  const handleDeleteClasse = async (id) => {
    try {
      await axios.delete(`${API_URL}/classes/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(classes.filter((c) => c._id !== id));
      if (selectedClasse && selectedClasse._id === id) setSelectedClasse(null);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression de la classe");
    }
  };

  const handleBackToList = () => {
    setSelectedClasse(null);
    setCoursClasse([]);
    setExercicesClasse([]);
    setDevoirsClasse([]);
  };

//Supprimer un cours
  const handleDeleteCours = async (coursId) => {
    const confirmSuppression = window.confirm(
      "Voulez-vous vraiment supprimer ce cours ?"
    );
    if (!confirmSuppression) return;
  
    try {
      await axios.delete(`${API_URL}/cours/${coursId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    


      // ✅ Mise à jour correcte du state
      setCoursClasse((prev) => prev.filter((c) => c._id !== coursId));
  
      alert("✅ Cours supprimé avec succès !");
    } catch (err) {
      console.error("Erreur lors de la suppression du cours :", err);
  
      if (err.response?.status === 404) {
        alert("❌ Cours introuvable.");
      } else {
        alert("❌ Erreur serveur lors de la suppression du cours.");
      }
    }
  };
  
//Partie exercices

// 🔹 Charger les exercices d'une classe
const fetchExercicesClasse = async (classeId) => {
  try {
    const res = await axios.get(`${API_URL}/exercices/classe/${classeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setExercicesClasse(res.data || []);
  } catch (err) {
    console.error("Erreur chargement cours:", err);
  }
};

//Supprimer un exercice
const handleDeleteExercices = async (exercicesId) => {
  const confirmSuppression = window.confirm(
    "Voulez-vous vraiment supprimer ces exercices ?"
  );
  if (!confirmSuppression) return;

  try {
    await axios.delete(`${API_URL}/exercices/${exercicesId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  


    // ✅ Mise à jour correcte du state
    setExercicesClasse((prev) => prev.filter((c) => c._id !== exercicesId));

    alert("✅ Exercice supprimé avec succès !");
  } catch (err) {
    console.error("Erreur lors de la suppression de l'exercices :", err);

    if (err.response?.status === 404) {
      alert("❌ Exercice introuvable.");
    } else {
      alert("❌ Erreur serveur lors de la suppression de l'exercice.");
    }
  }
};


//Partie devoirs

//Charger les devoirs d'une classe
const fetchDevoirsClasse = async (classeId) => {
  try {
    const res = await axios.get(`${API_URL}/devoirs/classe/${classeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setDevoirsClasse(res.data || []);
  } catch (err) {
    console.error("Erreur chargement devoirs:", err);
  }
};

//Supprimer un devoir
const handleDeleteDevoirs = async (devoirsId) => {
  const confirmSuppression = window.confirm(
    "Voulez-vous vraiment supprimer ce devoirs ?"
  );
  if (!confirmSuppression) return;

  try {
    await axios.delete(`${API_URL}/devoirs/${devoirsId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  


    // ✅ Mise à jour correcte du state
    setDevoirsClasse((prev) => prev.filter((c) => c._id !== devoirsId));

    alert("✅ devoirs supprimé avec succès !");
  } catch (err) {
    console.error("Erreur lors de la suppression du devoir :", err);

    if (err.response?.status === 404) {
      alert("❌ Devoir introuvable.");
    } else {
      alert("❌ Erreur serveur lors de la suppression du devoir.");
    }
  }
};

const demarrerLive = async () => {

  try {

    const res = await axios.post(
      `${API_URL}/live-cours/start`,
      {
        classeId: selectedClasse._id,
        titre: "Cours en direct",
        description: "Cours en ligne"
      },
      {
        headers: {
          Authorization:
          `Bearer ${localStorage.getItem("token")}`
        }
      }
    );


    console.log(
      "🎥 Live créé :",
      res.data
    );


    // aller vers la page WebRTC du prof

    navigate(
      `/live-prof/${selectedClasse._id}`,
      {
        state: {
          liveId: res.data._id
        }
      }
    );
  /*  navigate(
      `/live-prof/${selectedClasse._id}`
    );*/


  } catch(error) {

    console.error(
      "Erreur démarrage live :",
      error.response?.data || error.message
    );

  }

};



useEffect(() => {

  const classeId = selectedClasse?._id;

  const joinRoom = () => {

    console.log(
      "Socket connecté :",
      socket.id
    );


    console.log(
      "Envoi join-room :",
      classeId
    );


    socket.emit(
      "join-room",
      classeId
    );

  };


  if (socket.connected) {

    joinRoom();

  } else {

    socket.on(
      "connect",
      joinRoom
    );

  }


  return () => {

    socket.off(
      "connect",
      joinRoom
    );

  };


}, [selectedClasse]);

  // 🔹 Charger infos du prof et classes au montage
  useEffect(() => {
    fetchClasses();
   // const storedEmail = localStorage.getItem("email");
    const storedPrenom = localStorage.getItem("prenom");
    const storedNom = localStorage.getItem("nom");
    //const storedProfId = localStorage.getItem("profId");

   // if (storedEmail) setEmail(storedEmail);
    if (storedPrenom) setPrenom(storedPrenom);
    if (storedNom) setNom(storedNom);
   // if (storedProfId) setProfId(storedProfId);
  }, [fetchClasses]);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Menu latéral */}
      <div
        className="menu-vertical-espaceprofs"
        style={{
          width: "220px",
          background: "#f5f5f5",
          padding: "20px",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <h3>📋 Menu</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li>🏠 Tableau de bord</li>
          <li>📚 Mes Classes</li>
          <li>👩‍🏫 Profil</li>
          <li>⚙️ Paramètres</li>
        </ul>
      </div>

      {/* Zone principale */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px" }}>
        {/* En-tête */}
        <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Bienvenue, {prenom} {nom}</h2>
          {/*<h2>Bienvenue, {prenom} </h2>*/}
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              padding: "10px 16px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            {showForm ? "Fermer le formulaire" : "Créer une classe"}
          </button>
        </div>

        {/* Formulaire création classe */}
        {showForm && (
          <div className="mt-4 p-4 border rounded shadow" style={{ marginBottom: "20px" }}>
            <FormulaireClasse
              onClassCreated={() => {
                setShowForm(false);
                fetchClasses();
              }}
            />
          </div>
        )}

        {/* Sélection classe et menu */}
        {selectedClasse && (
          <div>
            <nav className="nav-boutons">
  <button onClick={handleBackToList}>Retour à mes classes</button>
  <button>Liste des élèves</button>
  <button onClick={() => setShowUploadForm(!showUploadForm)}>
    {showUploadForm ? "Fermer le formulaire" : "Poster un cours"}
  </button>
  <button onClick={() => setShowUploadFormExercices(!showUploadFormExercices)}>
    {showUploadFormExercices ? "Fermer le formulaire" : "Poster un exercice"}
  </button>
  <button onClick={() => setShowUploadFormDevoirs(!showUploadFormDevoirs)}>
    {showUploadFormDevoirs ? "Fermer le formulaire" : "Poster un devoir"}
  </button>
  <button onClick={demarrerLive}>
  🎥 Cours en ligne
</button>

</nav>
            {/*<nav style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
              <button onClick={handleBackToList}>Retour à mes classes</button>
              <button>Liste des élèves</button>
              <button onClick={() => setShowUploadForm(!showUploadForm)}>
                {showUploadForm ? "Fermer le formulaire" : "Poster un cours"}
              </button>
              <button onClick={() => setShowUploadFormExercices(!showUploadFormExercices)}>
                {showUploadFormExercices ? "Fermer le formulaire" : "Poster un exercice"}
              </button>
           
              <button>Poster un devoir</button>
              <button>Poster un Quiz</button>
            </nav>*/}

            {/* Détail classe */}
            <div className="conteneur-classe-cours">
              <div className="titre-classe">
                <h2>📘 Classe</h2>
                <div className="titre">
                  <h2><strong>{selectedClasse.niveau}</strong></h2>
                  <h2><strong>{selectedClasse.serie}</strong></h2>
                  <h2>
                    <strong>Créée le :</strong>{" "}
                    {new Date(selectedClasse.createdAt).toLocaleString()}
                  </h2>
                </div>
            </div>
      
    
              {/* Demandes accès */}
              <DemandesAccesProf />

              {/* Liste des cours */}
             {/*} <ListeCours
               coursClasse={coursClasse}
               handleDeleteCours={handleDeleteCours}
               API_URL={API_URL}
              
              />*/}
             <div>
                    <h3>📚 Cours de la classe</h3>
                      {coursClasse.length === 0 ? (
                      <p>Aucun cours pour le moment.</p>
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
      {coursClasse.map((c) => (
        <li
          key={c._id}
          style={{
            backgroundColor: "#fff",
            border: "1px solid #ddd",
            borderRadius: "10px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            padding: "12px",
            flex: "1 1 180px", // largeur réduite pour plusieurs cartes sur la ligne
            maxWidth: "180px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <div>
            <strong style={{ fontSize: "14px", color: "#333" }}>{c.titre}</strong>
            <p style={{ margin: "6px 0", color: "#333", fontSize: "13px" }}>{c.contenu}</p>
          </div>

          {c.fichiers && c.fichiers.length > 0 && (
            <div>
              {c.fichiers.map((f, i) => (
                <a
                  key={i}
                  //href={f.url}
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
  title={f.nom} // 👈 nom complet au survol
  style={{
    display: "inline-block",
    maxWidth: "180px",      // 🔑 ajuste selon ta carte
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    verticalAlign: "middle",
  }}
>
  📎 {f.nom || "Ouvrir le fichier"}
</span>
                </a>
              ))}
            </div>
          )}

          <button
            onClick={() => handleDeleteCours(c._id)}
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
        </li>
      ))}
    </ul>
  )}
</div>
            <ListeExercices
               exercicesClasse={exercicesClasse}
               handleDeleteExercices={handleDeleteExercices}
               API_URL={API_URL}
              
              />

              <ListeDevoirs
               devoirsClasse={devoirsClasse}
               handleDeleteDevoirs={handleDeleteDevoirs}
               API_URL={API_URL}
              
              />


              {/* Formulaire poster un cours */}
              {showUploadForm && selectedClasse && (
                <div style={{ marginBottom: "20px" }}>
                  <PosterCours
                    onClose={() => setShowUploadForm(false)}
                    selectedClasseId={selectedClasse._id}
                    onCoursAjoute={(nouveauCours) =>
                      setCoursClasse(prev => [nouveauCours, ...prev])
                    }
                  />
                </div>
              )}


              {/* Formulaire poster un exercice */}
              {showUploadFormExercices && selectedClasse && (
                <div style={{ marginBottom: "20px" }}>
                  <PosterExercices
                    onClose={() => setShowUploadFormExercices(false)}
                    selectedClasseId={selectedClasse._id}
                    onExercicesAjoute={(nouveauExercices) =>
                      setExercicesClasse(prev => [nouveauExercices, ...prev])
                    }
                  />
                </div>
              )}


                 {/* Formulaire poster un devoir */}
                 {showUploadFormDevoirs && selectedClasse && (
                <div style={{ marginBottom: "20px" }}>
                  <PosterDevoirs
                    onClose={() => setShowUploadFormDevoirs(false)}
                    selectedClasseId={selectedClasse._id}
                    onDevoirsAjoute={(nouveauDevoirs) =>
                      setDevoirsClasse(prev => [nouveauDevoirs, ...prev])
                    }
                  />
                </div>
              )}


            </div>
          </div>
        )}




        {/* Liste des classes */}
        {!selectedClasse && (
          <>
            <h3>📚 Mes Classes</h3>
            {loading ? (
              <p>Chargement...</p>
            ) : classes.length === 0 ? (
              <p>Aucune classe pour le moment.</p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                {classes.map((classe) => (
                  
                  <div
  key={classe._id}
  onClick={() => handleSelectClasse(classe)}
  style={{
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "12px",
    width: "200px",
    height: "150px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    overflow: "hidden",
  }}
>
  <h4
    style={{
      display: "flex",
      gap: "6px",
      margin: 0,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    }}
  >
    <span>{classe.niveau}</span>
    <span>{classe.serie}</span>
  </h4>

  <p
    style={{
      margin: "6px 0",
      fontSize: "13px",
      lineHeight: "1.3",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
    }}
  >
    {classe.description}
  </p>

  <button
    onClick={(e) => {
      e.stopPropagation();
      handleDeleteClasse(classe._id);
    }}
    style={{
      alignSelf: "flex-end",
      padding: "6px 10px",
      fontSize: "12px",
      borderRadius: "4px",
      border: "none",
      //backgroundColor: "#dc3545",
      //color: "#fff",
      cursor: "pointer",
    }}
  >
    Supprimer
  </button>
</div>


                  
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Espaceprofs;






