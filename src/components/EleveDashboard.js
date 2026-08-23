import React, { useState, useEffect } from "react";
import axios from "axios";
import ListeProfs from "./ListeProfs";
import ListeClasses from "./ListeClasses";
import ListeCoursEleve from "./ListeCoursEleve";
import ListeExercicesEleve from "./ListeExercicesEleve";
import ListeDevoirsEleve from "./ListeDevoirsEleve";
import {useNavigate} from "react-router-dom";
import socket from "../socket";



const API_URL = process.env.REACT_APP_API_URL;

const EleveDashboard = () => {
  const [profs, setProfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profSelectionne, setProfSelectionne] = useState(null);
  //const [eleveId, setEleveId] = useState(null);
  //const [profId, setProfId] = useState(null);
  const [classeId, setClasseId] = useState(null); // ✅ manquant
  const [hasChosen, setHasChosen] = useState(false); // ✅ manquant
  const [liveActif,setLiveActif] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfs = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/profs`);
        setProfs(response.data);
        console.log("📥 Réponse live :", response.data);
      } catch (err) {
       // console.error("Erreur lors du chargement des profs :", err);
       console.error(
        "❌ Erreur recherche live :",
        err.response?.status,
        err.response?.data
      );
      setLiveActif(null);
        setError("Impossible de charger les profs");
      } finally {
        setLoading(false);
      }
    };
    fetchProfs();
  }, []);

 
  

useEffect(() => {
  const id = localStorage.getItem("eleveId");
  if (!id) {
    console.warn("⚠️ eleveId introuvable dans le localStorage");
    // tu peux rediriger vers le login ici si tu veux
  } else {
    //setEleveId(id);
    console.log("🔍 eleveId récupéré :", id);
  }
}, []);

useEffect(() => {
  const storedEleveId = localStorage.getItem("eleveId");
  const storedProfId = localStorage.getItem("profId");
  const storedClasseId = localStorage.getItem("classeId");

  if (storedEleveId) {
    setClasseId(storedClasseId);
    if (storedProfId && storedClasseId) {
      setHasChosen(true);
    }
  } else {
    console.warn("⚠️ Aucun eleveId trouvé dans le localStorage");
  }
}, []);

useEffect(() => {
  console.log("🚨 USEEFFECT LIVE EXÉCUTÉ");
  console.log("🚨 classeId =", classeId);

  const verifierLive = async () => {

    if (!classeId) {
      console.log("Pas de classe sélectionnée");
      setLiveActif(null);
      return;
    }

    try {

      const token = localStorage.getItem("token");

      console.log(
        "🔎 Recherche live pour classe :",
        classeId
      );

      console.log(
        "🔑 TOKEN :",
        token
      );

      const res = await axios.get(
        `${API_URL}/live-cours/classe/${classeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log(
        "📥 Réponse serveur live :",
        res.data
      );

      if (
        res.data &&
        res.data.statut === "en_cours"
      ) {

        console.log(
          "✅ LIVE ACTIF TROUVÉ :",
          res.data
        );

        setLiveActif(res.data);

      } else {

        console.log(
          "⚠️ Réponse reçue mais aucun live en cours"
        );

        setLiveActif(null);
      }

    } catch (err) {

      console.error(
        "❌ ERREUR RECHERCHE LIVE :",
        err.response?.status,
        err.response?.data || err.message
      );

      setLiveActif(null);
    }

  };

  verifierLive();

}, [classeId]);

useEffect(() => {

  if (!classeId) return;

  console.log("🚪 Élève rejoint la salle :", classeId);

  socket.emit("join-room", classeId);

  const handleLiveStarted = (data) => {

    console.log("🔥 Nouveau live reçu :", data);

    if (data.classeId === classeId) {

      setLiveActif({
        _id: data.liveId,
        classeId: data.classeId,
        titre: data.titre,
        statut: "en_cours"
      });

    }

  };

  const handleLiveStopped = (data) => {

    console.log("🛑 Live terminé reçu :", data);

    if (data.classeId === classeId) {

      setLiveActif(null);

    }

  };

  socket.on("live-started", handleLiveStarted);
  socket.on("live-stopped", handleLiveStopped);

  return () => {

    socket.off("live-started", handleLiveStarted);
    socket.off("live-stopped", handleLiveStopped);

  };

}, [classeId]);

  /*useEffect(()=>{

    socket.on("live-started",
    (data)=>{
    console.log("🔥 Nouveau live reçu", data);
    if(data.classeId===classeId){
     //setLiveActif(live);

    setLiveActif({
      _id: data.liveId,
      classeId: data.classeId,
      titre: data.titre,
      statut: "en_cours"
    });
    }
    
    });
    
    
    return()=>{
    
    socket.off("live-started");
    
    };
    
    
    },[classeId])*/

    /*useEffect(() => {

      if(!classeId) return;
    
    
      socket.emit("join-room", classeId);
    
    
      socket.on("live-started", (data)=>{
    
        console.log("🔥 Nouveau live reçu :", data);
    
    
        setLiveActif({
          _id:data.liveId,
          classeId:data.classeId,
          titre:data.titre,
          statut:"en_cours"
        });
    
    
      });
    
    
      return ()=>{
    
        socket.off("live-started");
    
      };
    
    
    },[classeId]);*/

    useEffect(()=>{

      console.log(
        "LIVE ACTUEL :",
        liveActif
      );
     
     },[liveActif]);



  // ✅ Quand on clique sur un prof
  const handleSelectProf = (prof) => {
    setProfSelectionne(prof); // sélectionne le prof
      // 🆕 On mémorise le prof sélectionné
  localStorage.setItem("profId", prof._id);
  };

  // ✅ Retour à la liste des profs
  const handleBackToProfs = () => {
    setProfSelectionne(null); // désélectionne le prof
    localStorage.removeItem("profId"); // facultatif mais propre
  };


  // ✅ Quand l'élève choisit une classe
  const handleChoisirClasse = async (classeIdChoisie) => {
    try {
      const eleveId = localStorage.getItem("eleveId");
  
      const profId =
        profSelectionne?._id ||
        localStorage.getItem("profId");
  
      if (!eleveId || !profId || !classeIdChoisie) {
        console.warn("❌ Données manquantes :", {
          eleveId,
          profId,
          classeIdChoisie
        });
  
        alert("Erreur : informations manquantes. Reconnecte-toi.");
        return;
      }
  
      console.log("🔥 VERSION ACTUELLE handleChoisirClasse");
      console.log("👨‍🏫 Prof sélectionné :", profId);
      console.log("🏫 Classe choisie :", classeIdChoisie);
  
      // ==========================================
      // 1️⃣ Vérifier la demande existante
      // ==========================================
  
      const verif = await axios.get(
        `${API_URL}/demandes/all/${eleveId}`
      );
  
      console.log(
        "📋 Réponse demandes :",
        verif.data
      );
  
      // ==========================================
      // 2️⃣ Le backend renvoie directement le statut
      // ==========================================
  
      const demande = verif.data;
  
      console.log(
        "🔎 Demande actuelle :",
        demande
      );
  
      // ==========================================
      // 3️⃣ Demande acceptée
      // ==========================================
  
      if (demande?.statut === "accepte") {
  
        const classeExistante = demande.classeId;
  
        console.log(
          "✅ Accès déjà accepté :",
          classeExistante
        );
  
        // Sauvegarder la classe pour CE professeur
        localStorage.setItem(
          `classe_${profId}`,
          classeExistante
        );
  
        // Pour le fonctionnement actuel du Dashboard
        localStorage.setItem(
          "classeId",
          classeExistante
        );
  
        setClasseId(classeExistante);
        setHasChosen(true);
  
        return;
      }
  
      // ==========================================
      // 4️⃣ Demande en attente
      // ==========================================
  
      if (demande?.statut === "en_attente") {
  
        alert(
          "⏳ Votre demande pour ce professeur est encore en attente."
        );
  
        return;
      }
  
      // ==========================================
      // 5️⃣ Demande refusée
      // ==========================================
  
      if (demande?.statut === "refuse") {
  
        alert(
          "❌ Votre demande pour ce professeur a été refusée."
        );
  
        return;
      }
  
      // ==========================================
      // 6️⃣ Aucune demande
      // ==========================================
  
      if (demande?.statut === "aucune_demande") {
  
        console.log(
          "📤 Aucune demande trouvée → création..."
        );
  
        const res = await axios.post(
          `${API_URL}/demandes/demande`,
          {
            eleveId,
            profId,
            classeId: classeIdChoisie
          }
        );
  
        console.log(
          "📤 Nouvelle demande créée :",
          res.data
        );
  
        localStorage.setItem(
          `classe_${profId}`,
          classeIdChoisie
        );
  
        setClasseId(classeIdChoisie);
  
        // En attente de l'acceptation du professeur
        setHasChosen(false);
  
        alert(
          "✅ Demande envoyée. En attente de validation du professeur."
        );
  
        return;
      }
  
      // ==========================================
      // 7️⃣ Réponse inattendue
      // ==========================================
  
      console.warn(
        "⚠️ Réponse inattendue du serveur :",
        demande
      );
  
      alert(
        "Impossible de déterminer l'état de votre demande."
      );
  
    } catch (err) {
  
      console.error(
        "❌ Erreur lors de la demande d'accès :",
        err.response?.data || err
      );
  
      alert(
        err.response?.data?.message ||
        "Erreur lors de la demande."
      );
    }
  };
console.log("LIVE ACTIF :", liveActif);
console.log("Statut :", liveActif?.statut);
console.log("Classe :", classeId);
  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>

      <h1>Tableau de bord de l'élève:</h1>

      {loading && <p>Chargement des profs...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Liste des profs */}
      {!loading && !error && !profSelectionne && (
        <ListeProfs
          profs={profs}
          onSelectProf={handleSelectProf} // ← ici le clic passe le prof sélectionné
        />
      )}

      {/* Classes du prof sélectionné */}
      {profSelectionne && (
        <div>
          <button
            onClick={handleBackToProfs}
            style={{
              marginBottom: "10px",
              padding: "5px 10px",
              cursor: "pointer",
            }}
          >
            ← Retour à la liste des profs
          </button>
         {/* {
            liveActif?.statut==="en_cours" && (

            <button
              onClick={()=>navigate(`/live-eleve/${classeId}`)}
            >
              🎥 Rejoindre le cours en direct
            </button>
            )
            } */}

          <h2>
            Classes de {profSelectionne.prenom}  {profSelectionne.nom}
          </h2>
          {/*<ListeClasses profId={profSelectionne._id} />*/}
          <ListeClasses 
            profId={profSelectionne._id}
            onChoisirClasse={handleChoisirClasse}  // ✅ ajout important
          />

          {/*{profSelectionne && (
  <div>
   <h2>Élèves de {profSelectionne.nom} {profSelectionne.prenom}</h2>
    <ListeEleves profId={profSelectionne._id} /> */}{/* 👈 ICI on envoie le profId */}
 {/*</div>
)} */} 

{hasChosen && classeId && (

<div>

  {liveActif?.statut === "en_cours" && (

    <button
      onClick={() =>
        navigate(`/live-eleve/${classeId}`)
      }
    >
      🎥 Rejoindre le cours en direct
    </button>

  )}

</div>

)}
          {/* ✅ Affichage des cours uniquement si une classe est choisie */}
    {hasChosen && classeId && (
      <div style={{ marginTop: "20px" }}>
        {/*<h3>📚 Cours de la classe sélectionnée</h3>*/}
        <ListeCoursEleve classeId={classeId} />
      </div>
    )}

         {/* ✅ Affichage des exercices uniquement si une classe est choisie */}
         {hasChosen && classeId && (
      <div style={{ marginTop: "20px" }}>
        {/*<h3>📚 Cours de la classe sélectionnée</h3>*/}
        <ListeExercicesEleve classeId={classeId} />
      </div>
    )}



         {/* ✅ Affichage des devoirs uniquement si une classe est choisie */}
         {hasChosen && classeId && (
      <div style={{ marginTop: "20px" }}>
        {/*<h3>📚 Cours de la classe sélectionnée</h3>*/}
        <ListeDevoirsEleve classeId={classeId} />
      </div>
    )}



        </div>
      )}
    </div>
  );
};

export default EleveDashboard;

