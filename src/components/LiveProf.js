import React, { useEffect, useRef, useState } from "react";
import socket from "../socket";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";


const API_URL = process.env.REACT_APP_API_URL;
const LiveProf = () => {

  const location = useLocation();
  const navigate = useNavigate();

  const liveId = location.state?.liveId;
  const { classeId } = useParams();

  const [users, setUsers] = useState([]);
  const [remoteStreams, setRemoteStreams] = useState({});

  const localVideoRef = useRef(null);
  const localStream = useRef(null);
  //const videoRef = useRef(null);
  //const [liveId, setLiveId] = useState(null);

  // 🔥 Multi connexions
  const peers = useRef({});
  


  /*
  ============================
  🎥 INIT CAMERA
  ============================
  */
  useEffect(() => {

    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    })
    .then((stream) => {

      console.log("🎥 Caméra OK");

      localStream.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

    })
    .catch(err => {
      console.error("Erreur caméra :", err);
    });

  }, []);


  /*
  ============================
  🔌 SOCKET + WEBRTC
  ============================
  */
  useEffect(() => {

    /*
    🔌 JOIN ROOM
    */
    const rejoindre = () => {
      socket.emit("join-room", classeId);
    };

    console.log("🚀 DÉMARRAGE LIVE");
console.log("profId envoyé :", profId);
console.log("classeId envoyé :", classeId);
console.log("localStorage profId :", localStorage.getItem("profId"));

    if (socket.connected) {
      rejoindre();
    } else {
      socket.once("connect", rejoindre);
    }

    socket.on("users-in-room", setUsers);


    /*
    ============================
    👨‍🎓 NOUVEL ELEVE
    ============================
    */
    socket.on("user-joined", async ({ socketId }) => {

      console.log("👨‍🎓 Élève :", socketId);

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" }
        ]
      });

      peers.current[socketId] = pc;

      /*
      🎥 envoyer stream du prof
      */
      localStream.current.getTracks().forEach(track => {
        pc.addTrack(track, localStream.current);
      });

      /*
      📺 RECEVOIR (si élève renvoie audio ou cam)
      */
      pc.ontrack = (event) => {

        console.log("📺 Flux reçu de", socketId);

        setRemoteStreams(prev => ({
          ...prev,
          [socketId]: event.streams[0]
        }));

      };

      /*
      📡 ICE
      */
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("webrtc-ice-candidate", {
            candidate: event.candidate,
            to: socketId
          });
        }
      };

      /*
      📤 OFFER
      */
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("webrtc-offer", {
        offer,
        to: socketId
      });

      console.log("📤 OFFER envoyée à", socketId);

    });


    /*
    ============================
    📥 ANSWER
    ============================
    */
    socket.on("webrtc-answer", async ({ answer, from }) => {

      const pc = peers.current[from];

      if (!pc) {
        console.log("❌ PC introuvable pour", from);
        return;
      }

      await pc.setRemoteDescription(answer);

      console.log("✅ ANSWER OK pour", from);

    });


    /*
    ============================
    📡 ICE (RECEPTION)
    ============================
    */
    socket.on("webrtc-ice-candidate", ({ candidate, from }) => {

      const pc = peers.current[from];

      if (!pc) return;

      pc.addIceCandidate(candidate);

    });


    /*
    ============================
    🔴 USER LEFT
    ============================
    */
    socket.on("user-left", (socketId) => {

      console.log("❌ Élève parti :", socketId);

      if (peers.current[socketId]) {
        peers.current[socketId].close();
        delete peers.current[socketId];
      }

      setRemoteStreams(prev => {
        const copy = { ...prev };
        delete copy[socketId];
        return copy;
      });

    });


    /*
    ============================
    🧹 CLEANUP
    ============================
    */
    const currentPeers = peers.current;
    return () => {

      socket.off("connect", rejoindre);
      socket.off("users-in-room");
      socket.off("user-joined");
      socket.off("webrtc-answer");
      socket.off("webrtc-ice-candidate");
      socket.off("user-left");

      //Object.values(peers.current).forEach(pc => pc.close());
      Object.values(currentPeers).forEach(pc => pc.close());

      localStream.current?.getTracks().forEach(track => track.stop());

    };

  }, [classeId]);


  const terminerLive = async () => {

    try {
  
      const token = localStorage.getItem("token");
      console.log("🔑 TOKEN :", token);
console.log("👨‍🏫 PROF ID :", localStorage.getItem("profId"));
console.log("🎥 LIVE ID :", liveId);
  
      console.log("🛑 Arrêt du live :", liveId);
  
      const res = await axios.put(
        `${API_URL}/live-cours/stop/${liveId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
  
      console.log("✅ Live terminé :", res.data);
  
      // Retour à l'espace professeur
      navigate("/espace-prof");
  
    } catch (error) {
  
      console.error(
        "❌ Erreur arrêt live :",
        error.response?.data || error.message
      );
  
    }
  };




  /*
  ============================
  🎨 UI
  ============================
  */

  
  
  return (
    <div>
  
      <h2>🎥 Live Prof</h2>
  <div
  style={{display: "flex", flexDirection: "column", alignItems: "center", gap:" 10px"}}
  
  >
     {/* 🎥 VIDEO DU PROF */}
     <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        width="500"
        controls
        style={{ border: "2px solid green" }}
      />

<button
  onClick={terminerLive}
  style={{
    backgroundColor: "#007bff",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginBottom: "15px"
  }}
>
  🛑 Terminer le cours
</button>

  </div>
     
  
  
      <h3>👥 Participants :</h3>
  
      <ul>
        {users.map(user => (
          <li key={user}>
            {user}
          </li>
        ))}
      </ul>
  
  
      <h3>📺 Flux élèves :</h3>
  
  
      <div
        style={{
          display:"flex",
          gap:"10px",
          flexWrap:"wrap"
        }}
      >
  
        {
          Object.entries(remoteStreams).map(
            ([id, stream]) => (
  
              <video
                key={id}
                autoPlay
                playsInline
                width="500"
                controls
                ref={(video)=>{
  
                  if(video && stream){
  
                    video.srcObject = stream;
  
                  }
  
                }}
                style={{
                  border:"2px solid blue"
                }}
              />
  
            )
          )
        }
  
  
      </div>
  
  
    </div>
  );
};

export default LiveProf;

/*import React, { useEffect, useRef, useState } from "react";
import socket from "../socket";

const LiveProf = () => {

  const classeId = "6a661bd61f96979e3f91c84b";

  const [users, setUsers] = useState([]);

  const videoRef = useRef(null);
  const localStream = useRef(null);

  // 🔥 Multi connexions
  const peers = useRef({});


  /*
  ============================
  🎥 INIT CAMERA
  ============================
  */
  /*useEffect(() => {

    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    })
    .then((stream) => {

      console.log("🎥 Caméra OK");

      localStream.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

    })
    .catch(err => {
      console.error("Erreur caméra :", err);
    });

  }, []);


  /*
  ============================
  🔌 SOCKET
  ============================
  */
  /*useEffect(() => {

    const rejoindre = () => {
      socket.emit("join-room", classeId);
    };

    if (socket.connected) {
      rejoindre();
    } else {
      socket.once("connect", rejoindre);
    }

    socket.on("users-in-room", setUsers);


    /*
    ============================
    👨‍🎓 NOUVEL ELEVE
    ============================
    */

    /*socket.on("user-joined", async (userId) => {

      console.log("👨‍🎓 Élève :", userId);

      // 🔥 créer une connexion dédiée
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" }
        ]
      });

      peers.current[userId] = pc;


      /*
      🎥 ajouter le stream du prof
      */
      /*localStream.current.getTracks().forEach(track => {
        pc.addTrack(track, localStream.current);
      });


      /*
      📡 ICE
      */
      /*pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("webrtc-ice-candidate", {
            candidate: event.candidate,
            to: userId,
            classeId
          });
        }
      };


      /*
      📤 CREATE OFFER
      */
      /*const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("webrtc-offer", {
        offer,
        to: userId,
        classeId
      });

      console.log("📤 OFFER envoyée à", userId);

    });


    /*
    ============================
    📥 ANSWER
    ============================
    */
    /*socket.on("webrtc-answer", async ({ answer, from }) => {

      const pc = peers.current[from];

      if (!pc) {
        console.log("❌ PC introuvable pour", from);
        return;
      }

      await pc.setRemoteDescription(
        new RTCSessionDescription(answer)
      );

      console.log("✅ ANSWER OK pour", from);

    });


    /*
    ============================
    📡 ICE (RECEPTION)
    ============================
    */
    /*socket.on("webrtc-ice-candidate", ({ candidate, from }) => {

      const pc = peers.current[from];

      if (!pc) return;

      pc.addIceCandidate(new RTCIceCandidate(candidate));

    });


    /*
    ============================
    🧹 CLEANUP
    ============================
    */
    /*return () => {

      socket.off("users-in-room");
      socket.off("user-joined");
      socket.off("webrtc-answer");
      socket.off("webrtc-ice-candidate");

      Object.values(peers.current).forEach(pc => pc.close());

      localStream.current?.getTracks().forEach(track => track.stop());

    };

  }, [classeId]);


  /*
  ============================
  🎨 UI
  ============================
  */
  /*return (
    <div>

      <h2>🎥 Live Prof</h2>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted   // 🔥 obligatoire Chrome
        controls
        width="400"
      />

      <h3>👥 Participants :</h3>

      <ul>
        {users.map(user => (
          <li key={user}>{user}</li>
        ))}
      </ul>

    </div>
  );
};

export default LiveProf;*/