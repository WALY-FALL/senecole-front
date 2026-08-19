import React, { useState } from "react";
import axios from "axios";

const PosterDevoirs = ({ onClose, selectedClasseId, onDevoirsAjoute }) => {
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  //const [selectedClasseId, setSelectedClasseId] = useState(null);
  const token = localStorage.getItem("token");
  const profId = localStorage.getItem("profId");
  const API_URL = process.env.REACT_APP_API_URL;

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!titre || !contenu) {
      setMessage("Veuillez remplir le titre et le contenu du devoir.");
      return;
    }

    if (!selectedFile) {
      setMessage("Veuillez sélectionner un fichier.");
      return;
    }

    if (!profId || !selectedClasseId) {
      setMessage("Impossible de récupérer le professeur ou la classe.");
      return;
    }

    const formData = new FormData();
    formData.append("titre", titre);
    formData.append("contenu", contenu);
    formData.append("profId", profId);
    formData.append("classeId", selectedClasseId);
    formData.append("fichiers", selectedFile);

    try {
      setUploading(true);
      const res = await axios.post(`${API_URL}/devoirs`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Réponse backend :", res.data);

      const nouveauDevoirs = res.data;
      
      // 🔹 Mise à jour immédiate dans la liste des cours
      if (onDevoirsAjoute) onDevoirsAjoute(nouveauDevoirs);

      setMessage("✅ Devoirs uploadé avec succès !");
      setTitre("");
      setContenu("");
      setSelectedFile(null);

    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur lors de l'upload du devoirs.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#f5f5f5",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        maxWidth: "400px",
        marginTop: "20px",
        position: "relative",
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "transparent",
          border: "none",
          fontSize: "18px",
          cursor: "pointer",
        }}
      >
        ❌
      </button>

      <h3>📤 Poster un devoir</h3>
      <form onSubmit={handleUpload}>
        <input
          type="text"
          placeholder="Titre du cours"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          style={{ marginBottom: "10px", width: "100%" }}
          required
        />
        <textarea
          placeholder="Contenu du cours"
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          style={{ marginBottom: "10px", width: "100%", height: "100px" }}
          required
        />
        <input
          type="file"
          onChange={handleFileChange}
          style={{ marginBottom: "10px" }}
          required
        />
        <button
          type="submit"
          disabled={uploading}
          style={{
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {uploading ? "Envoi en devoirs..." : "Envoyer"}
        </button>
      </form>

      {message && (
        <p
          style={{
            marginTop: "10px",
            color: message.startsWith("✅") ? "green" : "red",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default PosterDevoirs;

