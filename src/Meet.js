import MainScreen from "./components/MainScreen/MainScreen.component";
import firepadRef, { db, userName } from "./server/firebase";
import "./App.css";
// import bg1 from "bg1.jpeg";
import { useEffect, useRef, useState } from "react";
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import {
  setCanvasStream,
  setMainStream,
  addParticipant,
  setUser,
  removeParticipant,
  updateParticipant,
} from "./store/actioncreator";
import { connect } from "react-redux";

function Meet(props) {
  const inputVideoRef = useRef();
  const canvasRef = useRef();
  const contextRef = useRef();

  //usestate to store iamge name
  // const [imageName, setImageName] = useState();
  //function to set image name
  // const onBg1Click = () => {
  //   setImageName("bg1.jpeg");
  //   alert(imageName)
  //   redraw()
  // };
  function redraw(){
    contextRef.current.clearRect(0,0,canvasRef.current.width,canvasRef.current.width);
    contextRef.current.beginPath();
  }
  // const onBg2Click = () => {
  //   setImageName("bg2.jpeg");
  //   alert(imageName)
  //   redraw()
  // };
  const getUserStream = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { width: { min: 480 }, height: { min: 360 } },
    });

    return localStream;
  };
  useEffect(async () => {
    contextRef.current = canvasRef.current.getContext("2d");

    const canvasStream = canvasRef.current.captureStream(15);
    canvasStream.getVideoTracks()[0].enabled = false;
    props.setCanvasStream(canvasStream);
    console.log(canvasStream.getAudioTracks())

    const videoStream = await getUserStream();
    videoStream.getVideoTracks()[0].enabled = false;
    props.setMainStream(videoStream);

    getUserStream().then((stream) => {
      console.log(stream.getAudioTracks())
      // stream.getAudioTracks()[0].enabled = false;
      inputVideoRef.current.srcObject = stream;
      sendToMediaPipe();
    });

    connectedRef.on("value", (snap) => {
      if (snap.val()) {
        const defaultPreference = {
          audio: true,
          video: false,
          screen: false,
        };
        const userStatusRef = participantRef.push({
          userName,
          preferences: defaultPreference,
        });
        props.setUser({
          [userStatusRef.key]: { name: userName, ...defaultPreference },
        });
        userStatusRef.onDisconnect().remove();
      }
    });

    const selfieSegmentation = new SelfieSegmentation({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
    });

    selfieSegmentation.setOptions({
      modelSelection: 1,
      selfieMode: false,
    });

    selfieSegmentation.onResults(onResults);

    const sendToMediaPipe = async () => {
      if (!inputVideoRef.current.videoWidth) {
        console.log(inputVideoRef.current.videoWidth);
        requestAnimationFrame(sendToMediaPipe);
      } else {
        await selfieSegmentation.send({ image: inputVideoRef.current });
        requestAnimationFrame(sendToMediaPipe);
      }
    };
  }, []);

  const connectedRef = db.database().ref(".info/connected");
  const participantRef = firepadRef.child("participants");

  const isUserSet = !!props.user;
  const isStreamSet = !!props.stream;

  useEffect(() => {
    if (isStreamSet && isUserSet) {
      participantRef.on("child_added", (snap) => {
        const preferenceUpdateEvent = participantRef
          .child(snap.key)
          .child("preferences");
        preferenceUpdateEvent.on("child_changed", (preferenceSnap) => {
          props.updateParticipant({
            [snap.key]: {
              [preferenceSnap.key]: preferenceSnap.val(),
            },
          });
        });
        const { userName: name, preferences = {} } = snap.val();
        props.addParticipant({
          [snap.key]: {
            name,
            ...preferences,
          },
        });
      });
      participantRef.on("child_removed", (snap) => {
        props.removeParticipant(snap.key);
      });
    }
  }, [isStreamSet, isUserSet]);

  const onResults = (results) => {
    contextRef.current.save();
    contextRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    contextRef.current.drawImage(
      results.segmentationMask,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    // Only overwrite existing pixels.
    contextRef.current.globalCompositeOperation = "source-out";
    // contextRef.current.fillStyle = "#00FF00";
    var img = new Image();
    img.src = './bg1.jpeg';
    contextRef.current.drawImage(
      img,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    // Only overwrite missing pixels.
    contextRef.current.globalCompositeOperation = "destination-atop";
    contextRef.current.drawImage(
      results.image,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    contextRef.current.restore();
  };


  return (
    <div className="Meet">
      <MainScreen />
      {/* <button onClick={onBg1Click}>bg1</button>
      <button onClick={onBg2Click}>bg2</button> */}
      {props.mainStream}
      <div style={{ display: "none" }}>
        <video autoPlay ref={inputVideoRef} audio={false} />
        <canvas ref={canvasRef} width={480} height={360} />
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    stream: state.mainStream,
    user: state.currentUser,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setMainStream: (stream) => dispatch(setMainStream(stream)),
    setCanvasStream: (stream) => dispatch(setCanvasStream(stream)),
    addParticipant: (user) => dispatch(addParticipant(user)),
    setUser: (user) => dispatch(setUser(user)),
    removeParticipant: (userId) => dispatch(removeParticipant(userId)),
    updateParticipant: (user) => dispatch(updateParticipant(user)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Meet);