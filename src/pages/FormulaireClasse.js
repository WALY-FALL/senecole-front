import React, { useState } from "react";
import axios from "axios";
import "../style/formulaireClasse.css";



const API_URL_CLASSE = process.env.REACT_APP_API_URL_CLASSE || "http://localhost:5000/api";

const FormulaireClasse=({ onClassCreated })=>{

     //definition initialisation des etats
  const [serie, setSerie] = useState("");
  const [niveau, setNiveau] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const token = localStorage.getItem("token"); // ⚡ récupère le JWT du prof connecté
     
      await axios.post(
        `${API_URL_CLASSE}/create`,
        { serie, niveau, description },
        {
          headers: { Authorization: `Bearer ${token}` } // ⚡ envoie du token
        }
      );
  
      // Fermer le formulaire
      if (onClassCreated) onClassCreated();
    } catch (err) {
      console.error("Erreur:", err.response ? err.response.data : err.message);
      setMessage("Erreur lors de la création de la classe");
    }
  };
  
  return (

    <div className="formulaire-container">
    <form className="formulaire-form" onSubmit={handleSubmit}>
      <h2 className="formulaire-title">Classe</h2>

      <input 
      className="formulaire-input"
       type="text"
       placeholder="Niveau"
       value={niveau}
       onChange={(e) => setNiveau(e.target.value)}
       required
      />

      <input 
      className="formulaire-input"
        type="text"
        placeholder="Série/autre"
        value={serie}
        onChange={(e) => setSerie(e.target.value)}
        //required
      />
      <textarea
          placeholder="Etablissement"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
      />

      <button className="formulaire-btn" type="submit">
        <strong> Créer la classe</strong>
      </button>
    </form>

    {message && <p className="formulaire-message">{message}</p>}
  </div>
  );
}

export default FormulaireClasse;

