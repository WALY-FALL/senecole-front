import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../style/signup.css"; // <-- important pour le responsive
//import api from "../axiosConfig";



const API_URL = process.env.REACT_APP_API_URL;


const SignupProf = () => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    matiere: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
     const res = await axios.post(`${API_URL}/profs/signup`, formData);
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("profId", res.data.prof.id);
        localStorage.setItem("email", res.data.prof.email);
        localStorage.setItem("prenom", res.data.prof.prenom);
        localStorage.setItem("nom", res.data.prof.nom);
        setMessage("Compte créé avec succès !");
        navigate("/login-prof");
      } else {
        setMessage(res.data.message);
      }
    } catch (err) {
      console.error("Erreur signupProf:", err.response ? err.response.data : err.message);
      setMessage("Erreur lors de l'inscription");
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2 className="signup-title">Inscription Professeur</h2>

        <input className="signup-input" type="text" name="nom" placeholder="Nom"
          value={formData.nom} onChange={handleChange} required />

        <input className="signup-input" type="text" name="prenom" placeholder="Prénom"
          value={formData.prenom} onChange={handleChange} required />

        <input className="signup-input" type="email" name="email" placeholder="Email"
          value={formData.email} onChange={handleChange} required />

        <input className="signup-input" type="password" name="password" placeholder="Mot de passe"
          value={formData.password} onChange={handleChange} required />

        <input className="signup-input" type="text" name="matiere" placeholder="Matière"
          value={formData.matiere} onChange={handleChange} required />

        <button className="signup-btn" type="submit">
          <strong>Créer votre espace SEV</strong>
        </button>
      </form>

      {message && <p className="signup-message">{message}</p>}
    </div>
  );
};

export default SignupProf;


