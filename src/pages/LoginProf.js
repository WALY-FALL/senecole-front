import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../style/signup.css"; // même CSS que SignupProf

/*import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginProf = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8989/api/profs/login", formData);
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("profId", res.data.prof.id);
        //console.log("✅ ProfId stocké dans localStorage :", localStorage.getItem("profId"));
        localStorage.setItem("email", res.data.prof.email);
        console.log("📝 Résultat login détaillé:", JSON.stringify(res.data, null, 2));
        setMessage("Connexion réussie !");
        navigate("/espace-prof"); // redirection vers espace prof
      } else {
        setMessage(res.data.message);
      }
    } catch (err) {
      console.error("Erreur loginProf:", err.response ? err.response.data : err.message);
      setMessage("Erreur lors de la connexion");
    }
    
  };
  return (
    <div className="signup">
      <form className="formulaire" onSubmit={handleSubmit}>
      <h2>Connexion Professeur</h2>
        <input
          className="input"
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          className="input"
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button className="button" type="submit" id="button">Se connecter</button>
        <br/>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default LoginProf;*/

const API_URL = process.env.REACT_APP_API_URL;

const LoginProf = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      //const res = await axios.post("http://localhost:8989/api/profs/login", formData);
      const res = await axios.post(`${API_URL}/profs/login`, formData);
    

      if (res.data.token) {

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("profId", res.data.prof._id ||res.data.prof.id ); // ⚠️ _id et pas id
        localStorage.setItem("email", res.data.prof.email);
        localStorage.setItem("prenom", res.data.prof.prenom);
        localStorage.setItem("nom", res.data.prof.nom);
      
        console.log("✅ TOKEN STOCKÉ :", res.data.token);
        console.log("🌐 API utilisée :", API_URL);
      
        setMessage("Connexion réussie !");
        navigate("/espace-prof");
      
      } else {
        setMessage(res.data.message || "Erreur login");
      }

     /* if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("profId", res.data.prof.id);
        localStorage.setItem("email", res.data.prof.email);
        localStorage.setItem("prenom", res.data.prof.prenom);

        setMessage("Connexion réussie !");
        navigate("/espace-prof");
        console.log("Réponse login :", res.data);
      } else {
        setMessage(res.data.message);
      }*/
    } catch (err) {
      console.error("Erreur loginProf:", err.response ? err.response.data : err.message);
      setMessage("Erreur lors de la connexion");
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2 className="signup-title">Connexion Professeur</h2>

        <input
          className="signup-input"
          type="email"
          name="email"
          placeholder="Email professionnel"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          className="signup-input"
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleChange}
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

export default LoginProf;

