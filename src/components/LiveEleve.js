import React, { useEffect, useRef, useState } from "react";
import socket from "../socket";
import { useParams, useNavigate } from "react-router-dom";

const LiveEleve = () => {

  const { classeId } = useParams();
  const [users, setUsers] = useState([]);
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  const peers = useRef({});
  const localStream = useRef(null);
  const navigate = useNavigate();

  /*
  ==================================================
  🎤🎥 ACTIVER MICRO + CAMÉRA DE L'ÉLÈVE
  ==================================================
  */

  useEffect(() => {

    const activerMicroCamera = async () => {

      try {

        console.log("🎤 Demande accès micro + caméra...");

        const stream =
          await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
          });

        console.log("✅ Micro + caméra élève activés");
        console.log("🎤 Audio tracks :", stream.getAudioTracks());

        console.log("🎥 Video tracks :",stream.getVideoTracks());

        localStream.current = stream;

        /*
        ==============================
        🎥 Afficher vidéo locale
        ==============================
        */

        if (localVideoRef.current) {

          localVideoRef.current.srcObject = stream;

        }

      } catch (error) {
        console.error("❌ Impossible d'activer micro/caméra :",error);
      }
    };
    activerMicroCamera();


    /*
    ==============================
    🧹 CLEANUP
    ==============================
    */

    return () => {

      if (localStream.current) {

        localStream.current
          .getTracks()
          .forEach((track) => {

            track.stop();

            console.log("🛑 Track élève arrêtée :",track.kind);
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
    ==============================
    🛑 LIVE ARRÊTÉ
    ==============================
    */

    const handleLiveStopped = (data) => {

      console.log(
        "🛑 Le professeur a terminé le live"
      );

      if (data.classeId !== classeId) {
        return;
      }

      Object.values(peers.current).forEach((pc) => {
        pc.close();
      });

      peers.current = {};

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }

    };


    /*
    ==============================
    🚀 JOIN ROOM
    ==============================
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
    ==============================
    👥 USERS
    ==============================
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
    📥 OFFER DU PROFESSEUR
    ==================================================
    */

    const handleOffer = async ({ offer, from }) => {

      console.log(
        "📥 OFFER reçue du prof :",
        from
      );


      /*
      ==============================
      🔗 CREER PEER CONNECTION
      ==============================
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


      /*
      ==================================================
      🎤🎥 AJOUTER LE MICRO + CAMÉRA ÉLÈVE
      ==================================================
      */

      if (localStream.current) {

        console.log(
          "📡 Ajout du flux élève au PeerConnection"
        );

        localStream.current
          .getTracks()
          .forEach((track) => {

            pc.addTrack(
              track,
              localStream.current
            );

            console.log(
              "📡 Track élève ajoutée :",
              track.kind,
              "enabled =",
              track.enabled
            );

          });

      } else {

        console.error(
          "❌ Aucun localStream disponible"
        );

      }


      /*
      ==================================================
      🎥 RECEVOIR LA VIDÉO DU PROF
      ==================================================
      */

      pc.ontrack = (event) => {

        console.log(
          "🎥 Flux du prof reçu"
        );

        const stream =
          event.streams[0];

        if (
          remoteVideoRef.current &&
          stream
        ) {

          remoteVideoRef.current.srcObject =
            stream;

          console.log(
            "✅ Flux du prof attaché"
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
      📥 SET REMOTE DESCRIPTION
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
        ==============================
        📤 CREER ANSWER
        ==============================
        */

        const answer =
          await pc.createAnswer();

        await pc.setLocalDescription(
          answer
        );

        console.log(
          "📤 ANSWER créée"
        );


        /*
        ==============================
        📤 ENVOYER ANSWER
        ==============================
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
          "❌ Erreur WebRTC offer/answer :",
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
      async ({ candidate, from }) => {

        const pc =
          peers.current[from];

        if (!pc) {

          console.log(
            "❌ PC inconnu :",
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
            "📡 ICE prof ajouté"
          );

        } catch (error) {

          console.error(
            "❌ Erreur ICE :",
            error
          );

        }

      };


    socket.on(
      "webrtc-ice-candidate",
      handleIceCandidate
    );


    socket.on(
      "live-stopped",
      handleLiveStopped
    );


    /*
    ==================================================
    🧹 CLEANUP
    ==================================================
    */

    return () => {

      socket.off(
        "connect",
        rejoindre
      );

      socket.off(
        "users-in-room",
        handleUsers
      );

      socket.off(
        "webrtc-offer",
        handleOffer
      );

      socket.off(
        "webrtc-ice-candidate",
        handleIceCandidate
      );

      socket.off(
        "live-stopped",
        handleLiveStopped
      );


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
          gap: "20px",
          flexWrap: "wrap",
          alignItems: "flex-start"
        }}
      >

        {/* VIDÉO PROF */}

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


        {/* VIDÉO ÉLÈVE */}

        <div>

          <h3>
            🎓 Moi
          </h3>

          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            controls
            muted
            width="250"
          />

          <p>
            🎤 Micro élève activé
          </p>

        </div>

      </div>


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
          marginTop: "20px"
        }}
      >
        Quitter le cours
      </button>


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


/*import React, { useEffect, useRef, useState } from "react";
import socket from "../socket";
import { useParams, useNavigate } from "react-router-dom";


const LiveEleve = () => {

  //const classeId = "6a661bd61f96979e3f91c84b";
  const { classeId } = useParams();

  const [users, setUsers] = useState([]);

  const remoteVideoRef = useRef(null);

  // Plusieurs profs possibles dans le futur
  const peers = useRef({});

  const navigate = useNavigate();


  /*
  ============================
  🔌 SOCKET + WEBRTC
  ============================
  */

  /*useEffect(() => {


  const handleLiveStopped = (data) => {

    console.log("🛑 Le professeur a terminé le live");
  
    if (data.classeId !== classeId) return;
  
    // Fermer toutes les connexions WebRTC
    Object.values(peers.current).forEach((pc) => {
      pc.close();
    });
  
    peers.current = {};
  
    // Arrêter la vidéo distante
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  
    // Retour au dashboard élève
    //navigate("/espace-eleve");
  };


    /*
    ========================
    JOIN ROOM
    ========================
    */

   /* const rejoindre = () => {

      console.log("🚀 Élève join envoyé");

      socket.emit("join-room",classeId);
    };


    if(socket.connected){

      rejoindre();

    }else{

      socket.once("connect",rejoindre);

    }

    /*
    ========================
    👥 USERS
    ========================
    */

    /*socket.on("users-in-room", (liste)=>{
        console.log("📥 USERS :",liste);
        setUsers(liste);
      });

    socket.on("live-stopped", handleLiveStopped);

    /*
    ========================
    📥 RECEVOIR OFFER PROF
    ========================
    */

    /*socket.on(
      "webrtc-offer",
      async ({ offer, from }) => {
    
        console.log(
          "📥 OFFER reçue du prof :",
          from
        );
    
        /*
        =========================
        🔗 CREATION PEER
        =========================
        */
    
        /*const pc = new RTCPeerConnection({
          iceServers: [
            {
              urls: "stun:stun.l.google.com:19302"
            }
          ]
        });
    
        peers.current[from] = pc;
    
    
        /*
        =========================
        🎤🎥 MICRO + CAMÉRA ÉLÈVE
        =========================
        */
    
        /*try {
    
          const stream =
            await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true
            });
    
          console.log("🎤🎥 Micro + caméra élève OK");
    
          stream.getTracks().forEach((track) => {
    
            pc.addTrack(track, stream);
    
            console.log(
              "📡 Track élève ajoutée :",
              track.kind
            );
    
          });
    
        } catch (err) {
    
          console.error(
            "❌ Erreur micro/caméra élève :",
            err
          );
    
        }
    
    
        /*
        =========================
        🎥 RECEVOIR PROF
        =========================
        */
    
        /*pc.ontrack = (event) => {
    
          console.log(
            "🎥 Flux du prof reçu"
          );
    
          const stream =
            event.streams[0];
    
          if (remoteVideoRef.current) {
    
            remoteVideoRef.current.srcObject =
              stream;
    
            console.log(
              "✅ Flux du prof attaché"
            );
    
          }
    
        };
    
    
        /*
        =========================
        📡 ICE ÉLÈVE
        =========================
        */
    
       /* pc.onicecandidate = (event) => {
    
          if (event.candidate) {
    
            socket.emit(
              "webrtc-ice-candidate",
              {
                candidate: event.candidate,
                to: from
              }
            );
    
            console.log(
              "📡 ICE élève envoyé"
            );
    
          }
    
        };
    
    
        /*
        =========================
        📥 OFFER PROF
        =========================
        */
    
        /*await pc.setRemoteDescription(
          new RTCSessionDescription(offer)
        );
    
    
        /*
        =========================
        📤 ANSWER ÉLÈVE
        =========================
        */
    
        /*const answer =
          await pc.createAnswer();
    
        await pc.setLocalDescription(answer);
    
        console.log(
          "📤 ANSWER envoyée"
        );
    
        socket.emit(
          "webrtc-answer",
          {
            answer: pc.localDescription,
            to: from
          }
        );
    
      }
    );



   /* socket.on("webrtc-offer",async({offer, from})=>{
        console.log("📥 OFFER reçue du prof :",from);

        /*
        Création PeerConnection
        */

       /* const pc = new RTCPeerConnection({

          iceServers:[
            {
              urls:
              "stun:stun.l.google.com:19302"
            }
          ]

        });

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });
        
        console.log("🎤🎥 Flux élève ajouté au WebRTC");



        peers.current[from] = pc;



        /*
        =====================
        🎥 RECEVOIR VIDEO PROF
        =====================
        */


       /* pc.ontrack = (event)=>{


          console.log(
            "🎥 Flux du prof reçu"
          );


          const stream =
            event.streams[0];



          if(remoteVideoRef.current){

            remoteVideoRef.current.srcObject =
              stream;


            console.log(
              "✅ Vidéo attachée"
            );

          }


        };



        /*
        =====================
        📡 ICE ELEVE
        =====================
        */


        /*pc.onicecandidate =
        (event)=>{


          if(event.candidate){


            socket.emit(
              "webrtc-ice-candidate",
              {

                candidate:event.candidate,

                to:from

              }
            );


            console.log(
              "📡 ICE élève envoyé"
            );

          }

        };




        /*
        =====================
        SET OFFER
        =====================
        */


        /*await pc.setRemoteDescription(
          new RTCSessionDescription(offer)
        );



        /*
        =====================
        CREER ANSWER
        =====================
        */


       /* const answer =
          await pc.createAnswer();



        await pc.setLocalDescription(
          answer
        );



        console.log(
          "📤 ANSWER envoyée"
        );



        socket.emit(
          "webrtc-answer",
          {

            answer:pc.localDescription,

            to:from

          }
        );



      }
    );*/




    /*
    ========================
    📡 ICE PROF REÇU
    ========================
    */

    /*socket.on(
      "webrtc-ice-candidate",
      async({candidate,from})=>{


        const pc =
          peers.current[from];


        if(!pc){

          console.log(
            "❌ PC inconnu",
            from
          );

          return;

        }



        try{


          await pc.addIceCandidate(
            new RTCIceCandidate(candidate)
          );


          console.log(
            "📡 ICE prof ajouté"
          );


        }catch(err){

          console.error(
            "Erreur ICE :",
            err
          );

        }


      }
    );




    /*
    ========================
    CLEANUP
    ========================
    */
    /*const currentPeers = peers.current;
    return()=>{
      socket.off("connect", rejoindre);

      socket.off(
        "users-in-room"
      );


      socket.off(
        "webrtc-offer"
      );


      socket.off(
        "webrtc-ice-candidate"
      );

      socket.off("live-stopped", handleLiveStopped);


      Object.values(currentPeers).forEach(pc => {
        pc.close();
      });
  
   
    };


  },[classeId, navigate]);




  /*
  ============================
  UI
  ============================
  */

  /*return (

    <div>


      <h2>
        🎓 Live Élève
      </h2>

<div
style={{display: "flex", flexDirection: "column", alignItems: "center", gap:" 10px"}}
>

<video

ref={remoteVideoRef}

autoPlay

playsInline

controls

width="500"

/>

<button
onClick={() => navigate("/espace-eleve")}
//onClick={() => navigate(-1)}
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
Quiter le cours
</button>

</div>

      <h3>
        👥 Participants
      </h3>

      <ul>

      {
        users.map(user=>(

          <li key={user}>
            {user}
          </li>

        ))
      }

      </ul>


    </div>

  );


};


export default LiveEleve;

/*import React, {useEffect, useRef, useState} from "react";
import socket from "../socket";


const LiveEleve = () => {


const classeId = "6a661bd61f96979e3f91c84b";

const [users,setUsers] = useState([]);

const remoteVideoRef = useRef(null);

const peerConnection = useRef(null);
//const hasReceivedOffer = useRef(false);
const offerReceived = useRef(false);



/*
========================
 SOCKET + ROOM
========================
*/

/*useEffect(()=>{


const rejoindre = ()=>{

console.log("🚀 Élève join envoyé");

socket.emit(
 "join-room",
 classeId
);

};


if(socket.connected){

 rejoindre();

}else{

socket.once(
 "connect",
 rejoindre
);

}



socket.on(
"users-in-room",
(liste)=>{

console.log(
"📥 USERS :",
liste
);

setUsers(liste);

});



return()=>{

socket.off(
"connect",
rejoindre
);

socket.off(
"users-in-room"
);

};


},[]);




/*
========================
 WEBRTC ELEVE
========================
*/


/*useEffect(()=>{


const pc = new RTCPeerConnection({

iceServers:[
 {
  urls:"stun:stun.l.google.com:19302"
 }
]

});


peerConnection.current = pc;


console.log(
"🔗 RTCPeerConnection Élève créé",
pc
);




/*
------------------------
Réception du flux Prof
------------------------
*/

/*pc.ontrack = (event) => {

    console.log("🎥 Flux du Prof reçu");
  
    const stream = event.streams[0];
  
    console.log("📡 Stream reçu :", stream);
    console.log(
        "Tracks reçues :",
        stream.getTracks()
       );
  
    if (!remoteVideoRef.current) {
      console.log("❌ Video ref absente");
      return;
    }
  
  
    remoteVideoRef.current.srcObject = stream;
  
  
    remoteVideoRef.current.onloadedmetadata = () => {
  
      console.log("📺 Metadata vidéo chargée");
  
      remoteVideoRef.current
        .play()
        .then(()=>{
          console.log("▶️ Vidéo Prof lancée");
        })
        .catch(err=>{
          console.error(
            "❌ Erreur play :",
            err
          );
        });
  
    };
  
  };
/*pc.ontrack = (event) => {

    console.log("🎥 Flux du Prof reçu");
  
    const stream = event.streams[0];
  
    console.log("📡 Stream :", stream);
  
  
    if (!remoteVideoRef.current) {
      console.log("❌ remoteVideoRef absent");
      return;
    }
  
  
    // éviter de réassigner plusieurs fois le même flux
    if (remoteVideoRef.current.srcObject !== stream) {
  
      remoteVideoRef.current.srcObject = stream;
  
      console.log(
        "✅ Stream attaché"
      );
  
    }
  
  
    remoteVideoRef.current.onloadedmetadata = async () => {
  
      try {
  
        await remoteVideoRef.current.play();
  
        console.log(
          "▶️ Lecture vidéo OK"
        );
  
      } catch(error){
  
        console.error(
          "❌ play bloqué :",
          error
        );
  
      }
  
    };
  
  };*/

/*pc.ontrack = (event) => {

    console.log("🎥 Flux du Prof reçu");
  
  
    const stream = event.streams[0];
  
  
    console.log(
      "📡 Stream reçu :",
      stream
    );
  
  
    if (remoteVideoRef.current) {
  
  
      remoteVideoRef.current.srcObject = stream;
  
  
      console.log(
        "✅ Stream attaché à la vidéo"
      );
  
  
      remoteVideoRef.current.play()
        .then(()=>{
          console.log("▶️ Lecture OK");
        })
        .catch((e)=>{
          console.error(
            "❌ Erreur lecture :",
            e
          );
        });
  
  
    } else {
  
      console.log(
        "❌ remoteVideoRef.current absent"
      );
  
    }
  
  };*/

/*pc.ontrack = (event) => {

    console.log("🎥 Flux du Prof reçu");
  
    const stream = event.streams[0];
  
    if (remoteVideoRef.current) {
  
      remoteVideoRef.current.srcObject = stream;
  
      remoteVideoRef.current.onloadedmetadata = () => {
  
        remoteVideoRef.current.play()
          .then(()=>console.log("▶️ lecture OK"))
          .catch(e=>console.error("❌ autoplay bloqué", e));
  
      };
  
    }
  
  };*/
/*pc.ontrack = (event)=>{


console.log("🎥 Flux du Prof reçu");

if(remoteVideoRef.current){

remoteVideoRef.current.srcObject =
event.streams[0];

}};*/





/*
------------------------
ICE candidate
------------------------
*/


/*pc.onicecandidate=(event)=>{


if(event.candidate){

console.log(
"📡 ICE Élève envoyé"
);


socket.emit(
"webrtc-ice-candidate",
{
 candidate:event.candidate,
 classeId
}
);


}

};






/*
------------------------
Réception OFFER
------------------------
*/
/*socket.on("webrtc-offer", async ({offer})=>{

    console.log(
        "📥 OFFER reçue à l'instant",
        new Date().toISOString()
      );


    if(offerReceived.current){
  
      console.log("⚠️ OFFER déjà traitée");
      return;
  
    }
  
  
    offerReceived.current = true;
  
  
    console.log("📥 OFFER reçue");
  
  
    const pc = peerConnection.current;
  
  
    await pc.setRemoteDescription(
      new RTCSessionDescription(offer)
    );
  
  
    const answer = await pc.createAnswer();
  
  
    await pc.setLocalDescription(answer);
  
  
    console.log(
      "📤 ANSWER créée"
    );
  
  
    socket.emit(
      "webrtc-answer",
      {
        answer,
        classeId
      }
    );
  
  
  });
  return ()=>{

    offerReceived.current = false;
  
    socket.off(
      "webrtc-offer"
    );
  
    pc.close();
  
  };
/*socket.on("webrtc-offer", async (data)=>{

    if (hasReceivedOffer.current) {
      console.log("⚠️ OFFER déjà traitée → ignorée");
      return;
    }
  
    hasReceivedOffer.current = true;
  
    console.log("📥 OFFER reçue");
  
    await pc.setRemoteDescription(
      new RTCSessionDescription(data.offer)
    );
  
    const answer = await pc.createAnswer();
  
    await pc.setLocalDescription(answer);
  
    console.log("📤 ANSWER créée");
  
    socket.emit("webrtc-answer", {
      answer,
      classeId
    });
  
  });

return()=>{


console.log(
"🧹 Nettoyage WebRTC Élève"
);


pc.close();


socket.off(
"webrtc-offer"
);
};*/


/*
},[]);





return (

<div>


<h2>
🎓 Live Élève
</h2>

<video
  ref={remoteVideoRef}
  autoPlay
  playsInline
 // muted   // 🔥 OBLIGATOIRE
  controls
  width="400"
/>
{/*<video

ref={remoteVideoRef}

autoPlay

playsInline

width="400"
/*
/>*/


/*
<h3>
Participants :
</h3>


<ul>

{
users.map(user=>(

<li key={user}>
{user}
</li>

))
}

</ul>


</div>

);


};


export default LiveEleve;*/
/*import React, {useEffect,useState, useRef} from "react";
import socket from "../socket";

console.log(
    "Composant live chargé, socket =",
    socket.id
  );
const LiveEleve =()=>{


const classeId = "6a661bd61f96979e3f91c84b";
const [users,setUsers] = useState([]);
const videoRef = useRef(null);
const peerConnection = useRef(null);
const localStream = useRef(null);

useEffect(() => {

    const rejoindre = () => {
  
      console.log("🚀 join envoyé");
  
      socket.emit("join-room", classeId);
  
    };
  
    if (socket.connected) {
      rejoindre();
    } else {
      socket.once("connect", rejoindre);
    }
  
    socket.on("users-in-room", (liste) => {
      console.log("📥 USERS :", liste);
      setUsers(liste);
    });

    socket.on(
        "user-joined",
        (user)=>{
       
        console.log(
         "Nouvel utilisateur :",
         user.socketId
        );
       
       });
  
    return () => {
      socket.off("connect", rejoindre);
      socket.off("users-in-room");
    };
  
  }, []);

 
  useEffect(() => {

    navigator.mediaDevices
    .getUserMedia({
      video:true,
      audio:true
    })
    .then((stream)=>{

        console.log("🎥 Caméra élève activée");
       
       
        localStream.current = stream;
       
       
        if(videoRef.current){
       
          videoRef.current.srcObject = stream;
       
        }
       
       
        stream.getTracks().forEach(track=>{
       
          peerConnection.current.addTrack(
            track,
            stream
          );
       
        });
       
       
        console.log(
          "📡 Flux élève ajouté à WebRTC"
        );
       
       
       })
    .catch((err)=>{
   
      console.error(
        "Erreur caméra :",
        err
      );
   
    });
   },[]);

   useEffect(() => {

    const pc = new RTCPeerConnection();
  
    peerConnection.current = pc;
  
  
    console.log(
      "🔗 RTCPeerConnection Élève créé",
      pc
    );
  
  
    return () => {
  
      pc.close();
  
      peerConnection.current = null;
  
    };
  }, []);

return (

    <div>
    
    <h2>🎥 Live Prof</h2>
    
    
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      width="400"
    />
    
    
    <h3>Participants :</h3>
    
    <ul>
    {
      users.map(user => (
        <li key={user}>
          {user}
        </li>
      ))
    }
    
    </ul>
    
    </div>
    
    );
};


export default LiveEleve;*/