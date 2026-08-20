import React, { useEffect, useRef, useState } from "react";
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

  useEffect(() => {

    /*
    ========================
    JOIN ROOM
    ========================
    */

    const rejoindre = () => {

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



    /*
    ========================
    👥 USERS
    ========================
    */

    socket.on(
      "users-in-room",
      (liste)=>{

        console.log(
          "📥 USERS :",
          liste
        );

        setUsers(liste);

      }
    );



    /*
    ========================
    📥 RECEVOIR OFFER PROF
    ========================
    */


    socket.on(
      "webrtc-offer",
      async({offer, from})=>{


        console.log(
          "📥 OFFER reçue du prof :",
          from
        );



        /*
        Création PeerConnection
        */

        const pc = new RTCPeerConnection({

          iceServers:[
            {
              urls:
              "stun:stun.l.google.com:19302"
            }
          ]

        });



        peers.current[from] = pc;



        /*
        =====================
        🎥 RECEVOIR VIDEO PROF
        =====================
        */


        pc.ontrack = (event)=>{


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


        pc.onicecandidate =
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


        await pc.setRemoteDescription(
          new RTCSessionDescription(offer)
        );



        /*
        =====================
        CREER ANSWER
        =====================
        */


        const answer =
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
    );




    /*
    ========================
    📡 ICE PROF REÇU
    ========================
    */

    socket.on(
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
    const currentPeers = peers.current;
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


      Object.values(currentPeers).forEach(pc => {
        pc.close();
      });
     /* Object.values(
        peers.current
      ).forEach(pc=>{

        pc.close();

      });*/


    };


  },[classeId]);




  /*
  ============================
  UI
  ============================
  */

  return (

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