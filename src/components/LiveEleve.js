import React, { useEffect, useRef, useState } from "react";
import socket from "../socket";
import { useParams, useNavigate } from "react-router-dom";

const LiveEleve = () => {

  const { classeId } = useParams();

  const navigate = useNavigate();

  /*
  ==================================================
  ÉTATS
  ==================================================
  */

  const [users, setUsers] = useState([]);


  /*
  ==================================================
  REFERENCES
  ==================================================
  */

  // Vidéo reçue du professeur
  const remoteVideoRef = useRef(null);

  // Petite vidéo locale de l'élève
  const localVideoRef = useRef(null);

  // Toutes les connexions WebRTC
  const peers = useRef({});

  // Flux caméra + micro de l'élève
  const localStream = useRef(null);

  /*
  IMPORTANT :
  Cette Promise permet d'attendre que
  getUserMedia() soit terminé avant de
  traiter l'offer du professeur.
  */
  const localStreamPromise = useRef(null);


  /*
  ==================================================
  🎤🎥 INITIALISATION MICRO + CAMÉRA
  ==================================================
  */

  useEffect(() => {

    console.log(
      "🎤 Demande accès micro + caméra..."
    );

    localStreamPromise.current =
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: true
        })
        .then((stream) => {

          console.log(
            "✅ Micro + caméra élève activés"
          );

          console.log(
            "🎤 Audio tracks :",
            stream.getAudioTracks()
          );

          console.log(
            "🎥 Video tracks :",
            stream.getVideoTracks()
          );


          /*
          ==========================================
          Vérification micro
          ==========================================
          */

          const audioTracks =
            stream.getAudioTracks();

          audioTracks.forEach((track) => {

            console.log(
              "🎤 Micro :",
              track.label
            );

            console.log(
              "🎤 Micro enabled :",
              track.enabled
            );

            console.log(
              "🎤 Micro muted :",
              track.muted
            );

          });


          /*
          ==========================================
          Sauvegarder le flux
          ==========================================
          */

          localStream.current = stream;


          /*
          ==========================================
          Afficher caméra locale
          ==========================================
          */

          if (localVideoRef.current) {

            localVideoRef.current.srcObject =
              stream;

          }


          return stream;

        })
        .catch((error) => {

          console.error(
            "❌ Erreur micro/caméra élève :",
            error
          );

          throw error;

        });


    /*
    ================================================
    CLEANUP MICRO + CAMÉRA
    ================================================
    */

    return () => {

      console.log(
        "🧹 Nettoyage micro + caméra élève"
      );

      if (localStream.current) {

        localStream.current
          .getTracks()
          .forEach((track) => {

            console.log(
              "🛑 Arrêt track :",
              track.kind
            );

            track.stop();

          });

        localStream.current = null;

      }

    };

  }, []);


  /*
  ==================================================
  🔌 SOCKET + WEBRTC
  ==================================================
  */

  useEffect(() => {

    /*
    ==================================================
    🚀 REJOINDRE LA ROOM
    ==================================================
    */

    const rejoindre = () => {

      console.log(
        "🚀 Élève join envoyé"
      );

      socket.emit(
        "join-room",
        classeId
      );

    };


    if (socket.connected) {

      rejoindre();

    } else {

      socket.once(
        "connect",
        rejoindre
      );

    }


    /*
    ==================================================
    👥 USERS DANS LA ROOM
    ==================================================
    */

    const handleUsers = (liste) => {

      console.log(
        "📥 USERS :",
        liste
      );

      setUsers(liste);

    };

    socket.on(
      "users-in-room",
      handleUsers
    );


    /*
    ==================================================
    🛑 LIVE ARRÊTÉ
    ==================================================
    */

    const handleLiveStopped = (data) => {

      console.log(
        "🛑 Le professeur a terminé le live"
      );


      /*
      Vérifier la classe
      */

      if (
        data &&
        data.classeId &&
        data.classeId !== classeId
      ) {

        return;

      }


      /*
      Fermer toutes les connexions WebRTC
      */

      Object.values(
        peers.current
      ).forEach((pc) => {

        pc.close();

      });


      peers.current = {};


      /*
      Arrêter le flux distant
      */

      if (remoteVideoRef.current) {

        remoteVideoRef.current.srcObject =
          null;

      }

    };


    socket.on(
      "live-stopped",
      handleLiveStopped
    );


    /*
    ==================================================
    📥 OFFER DU PROFESSEUR
    ==================================================
    */

    const handleOffer = async ({
      offer,
      from
    }) => {

      console.log(
        "📥 OFFER reçue du prof :",
        from
      );


      /*
      ==================================================
      🎤 ATTENDRE MICRO + CAMÉRA
      ==================================================
      */

      let stream;

      try {

        /*
        Attendre que getUserMedia() soit terminé
        */

        stream =
          await localStreamPromise.current;

        console.log(
          "✅ Flux élève prêt avant WebRTC"
        );

      } catch (error) {

        console.error(
          "❌ Impossible de récupérer le flux élève :",
          error
        );

        return;

      }


      /*
      ==================================================
      🔗 CRÉER PEER CONNECTION
      ==================================================
      */

      const pc =
        new RTCPeerConnection({

          iceServers: [
            {
              urls:
                "stun:stun.l.google.com:19302"
            }
          ]

        });


      peers.current[from] = pc;


      console.log(
        "🔗 PeerConnection élève créée pour :",
        from
      );


      /*
      ==================================================
      🎤🎥 AJOUTER MICRO + CAMÉRA ÉLÈVE
      ==================================================
      */

      stream
        .getTracks()
        .forEach((track) => {

          pc.addTrack(
            track,
            stream
          );

          console.log(
            "📡 Track élève ajoutée :",
            track.kind,
            "enabled =",
            track.enabled
          );

        });


      /*
      ==================================================
      📥 RÉCEPTION FLUX PROF
      ==================================================
      */

      pc.ontrack = (event) => {

        console.log(
          "🎥 Flux du prof reçu"
        );

        console.log(
          "📥 Track reçue :",
          event.track.kind
        );


        const remoteStream =
          event.streams[0];


        if (
          remoteVideoRef.current &&
          remoteStream
        ) {

          /*
          Éviter de réassigner inutilement
          */

          if (
            remoteVideoRef.current.srcObject !==
            remoteStream
          ) {

            remoteVideoRef.current.srcObject =
              remoteStream;

          }


          console.log(
            "✅ Flux du prof attaché"
          );


          /*
          Afficher les tracks reçues
          */

          console.log(
            "📥 Tracks du prof :",
            remoteStream.getTracks()
          );

        }

      };


      /*
      ==================================================
      📡 ICE ÉLÈVE
      ==================================================
      */

      pc.onicecandidate = (event) => {

        if (event.candidate) {

          socket.emit(
            "webrtc-ice-candidate",
            {
              candidate:
                event.candidate,

              to: from
            }
          );

          console.log(
            "📡 ICE élève envoyé"
          );

        }

      };


      /*
      ==================================================
      ÉTAT CONNEXION WEBRTC
      ==================================================
      */

      pc.onconnectionstatechange = () => {

        console.log(
          "🔗 État connexion WebRTC élève :",
          pc.connectionState
        );


        if (
          pc.connectionState ===
          "failed"
        ) {

          console.error(
            "❌ Connexion WebRTC échouée"
          );

        }


        if (
          pc.connectionState ===
          "connected"
        ) {

          console.log(
            "🟢 Élève connecté au professeur"
          );

        }

      };


      /*
      ==================================================
      📥 INSTALLER OFFER PROF
      ==================================================
      */

      try {

        await pc.setRemoteDescription(
          new RTCSessionDescription(
            offer
          )
        );

        console.log(
          "✅ Offer du prof installée"
        );


        /*
        ==================================================
        📤 CRÉER ANSWER
        ==================================================
        */

        const answer =
          await pc.createAnswer();

        console.log(
          "📤 ANSWER créée"
        );


        /*
        ==================================================
        📤 INSTALLER LOCAL DESCRIPTION
        ==================================================
        */

        await pc.setLocalDescription(
          answer
        );

        console.log(
          "✅ LocalDescription installée"
        );


        /*
        ==================================================
        📤 ENVOYER ANSWER AU PROF
        ==================================================
        */

        socket.emit(
          "webrtc-answer",
          {
            answer:
              pc.localDescription,

            to: from
          }
        );

        console.log(
          "📤 ANSWER envoyée au prof"
        );

      } catch (error) {

        console.error(
          "❌ Erreur création ANSWER :",
          error
        );

      }

    };


    socket.on(
      "webrtc-offer",
      handleOffer
    );


    /*
    ==================================================
    📡 ICE PROF REÇU
    ==================================================
    */

    const handleIceCandidate =
      async ({
        candidate,
        from
      }) => {

        console.log(
          "📡 ICE reçu du prof :",
          from
        );


        const pc =
          peers.current[from];


        if (!pc) {

          console.log(
            "❌ PeerConnection inconnue pour :",
            from
          );

          return;

        }


        try {

          await pc.addIceCandidate(
            new RTCIceCandidate(
              candidate
            )
          );

          console.log(
            "✅ ICE prof ajouté"
          );

        } catch (error) {

          console.error(
            "❌ Erreur ajout ICE prof :",
            error
          );

        }

      };


    socket.on(
      "webrtc-ice-candidate",
      handleIceCandidate
    );


    /*
    ==================================================
    🧹 CLEANUP SOCKET + WEBRTC
    ==================================================
    */

    return () => {

      console.log(
        "🧹 Nettoyage LiveEleve"
      );


      socket.off(
        "connect",
        rejoindre
      );


      socket.off(
        "users-in-room",
        handleUsers
      );


      socket.off(
        "live-stopped",
        handleLiveStopped
      );


      socket.off(
        "webrtc-offer",
        handleOffer
      );


      socket.off(
        "webrtc-ice-candidate",
        handleIceCandidate
      );


      /*
      Fermer PeerConnections
      */

      Object.values(
        peers.current
      ).forEach((pc) => {

        pc.close();

      });


      peers.current = {};

    };

  }, [classeId]);


  /*
  ==================================================
  🎨 INTERFACE
  ==================================================
  */

  return (

    <div>

      <h2>
        🎓 Live Élève
      </h2>


      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px"
        }}
      >


        {/* =========================================
            VIDÉO PROFESSEUR
        ========================================= */}

        <div>

          <h3>
            👨‍🏫 Professeur
          </h3>

          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            controls
            width="500"
          />

        </div>


        {/* =========================================
            VIDÉO ÉLÈVE
        ========================================= */}

        <div>

          <h3>
            🎓 Vous
          </h3>

          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            width="250"
          />

          <p>
            🎤 Micro élève activé
          </p>

        </div>


        {/* =========================================
            BOUTON QUITTER
        ========================================= */}

        <button
          onClick={() =>
            navigate("/espace-eleve")
          }
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
          Quitter le cours
        </button>


      </div>


      {/* =========================================
          PARTICIPANTS
      ========================================= */}

      <h3>
        👥 Participants
      </h3>


      <ul>

        {users.map((user) => (

          <li key={user}>
            {user}
          </li>

        ))}

      </ul>


    </div>

  );

};


export default LiveEleve;

