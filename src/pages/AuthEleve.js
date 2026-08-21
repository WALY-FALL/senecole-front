
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../style/signup.css"; // ⚠️ Import du même CSS que SignupProf


const API_URL = process.env.REACT_APP_API_URL;

// ===============================
// 🔹 SERVICES (backend)
// ===============================

export const signupEleve = async (eleveData) => {
  const res = await axios.post(`${API_URL}/eleves/signup`, eleveData);

  if (res.data.success) {
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("email", res.data.eleve.email);
    localStorage.setItem("profId", res.data.eleve.profId || "");
    localStorage.setItem("classeId", res.data.eleve.classeId || "");
    localStorage.setItem("eleveId", res.data.eleve._id);
  }

  return res;
};

export const loginEleve = async (credentials) => {
  const res = await axios.post(`${API_URL}/eleves/login`, credentials);

  if (res.data.success) {
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("email", res.data.eleve.email);
    localStorage.setItem("profId", res.data.eleve.profId || "");
    localStorage.setItem("classeId", res.data.eleve.classeId || "");
    localStorage.setItem("eleveId", res.data.eleve._id);
  }

  return res;
};

// ===============================
// 🔹 2️⃣ INSCRIPTION ÉLÈVE
// ===============================
export const SignupEleve = () => {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const profId = localStorage.getItem("profId") || "";
    const eleveData = { nom, prenom, email, password, profId };

    try {
      const res = await signupEleve(eleveData);

      if (res.data.success) {
        setMessage("Compte créé avec succès !");
        navigate("/login-eleve");
      } else {
        setMessage(res.data.message || "Erreur lors de l'inscription");
      }
    } catch (err) {
      console.error("Erreur signup élève:", err);
      setMessage("Erreur lors de l'inscription");
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2 className="signup-title">Inscription Élève</h2>

        <input
          className="signup-input"
          type="text"
          placeholder="Nom de l'élève"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
        />

        <input
          className="signup-input"
          type="text"
          placeholder="Prénom de l'élève"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          required
        />

        <input
          className="signup-input"
          type="email"
          placeholder="Email de l'élève"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="signup-input"
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="signup-btn" type="submit">
          <strong>S'inscrire à SEV</strong>
        </button>
      </form>

      {message && <p className="signup-message">{message}</p>}
    </div>
  );
};

// ===============================
// 🔹 3️⃣ CONNEXION ÉLÈVE
// ===============================
export const LoginEleve = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await loginEleve({ email, password });

      if (res.data.success) {
        setMessage("Connexion réussie !");
        navigate("/espace-eleve");
      } else {
        setMessage(res.data.message || "Identifiants invalides");
      }
    } catch (err) {
      console.error("Erreur login élève:", err);
      setMessage("Erreur lors de la connexion");
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleLogin}>
        <h2 className="signup-title">Connexion Élève</h2>

        <input
          className="signup-input"
          type="email"
          placeholder="Entrer votre Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="signup-input"
          type="password"
          placeholder="Entrer votre mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="signup-btn" type="submit">
          Se connecter
        </button>
      </form>

      {message && <p className="signup-message">{message}</p>}
    </div>
  );
};

