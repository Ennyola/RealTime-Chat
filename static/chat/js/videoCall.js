import { chatSocket, createPeerConnection } from "./index.js";
const videoContainer = document.querySelector('.video-container')
const friendName = JSON.parse(document.getElementById('room-name').textContent);
const mediaConstraints = {
    audio: true, // We want an audio track
    video: {
        aspectRatio: {
            ideal: 1.333333 // 3:2 aspect is preferred
        }
    }
};
let myPeerConnection = null;

const handleVideoOfferMsg = (msg) => {
    let localStream = null;

    targetUsername = msg.name;
    createPeerConnection();

    let desc = new RTCSessionDescription(msg.sdp);

    myPeerConnection.setRemoteDescription(desc).then(() => {
            return navigator.mediaDevices.getUserMedia(mediaConstraints);
        })
        .then((stream) => {
            localStream = stream;
            document.querySelector("#local_video").srcObject = localStream;

            localStream.getTracks().forEach(track => myPeerConnection.addTrack(track, localStream));
        })
        .then(() => {
            return myPeerConnection.createAnswer();
        })
        .then((answer) => {
            return myPeerConnection.setLocalDescription(answer);
        })
        .then(() => {
            let msg = {
                name: myUsername,
                target: targetUsername,
                type: "video-answer",
                sdp: myPeerConnection.localDescription
            };

            chatSocket.send(JSON.stringify(msg));
        })
        .catch(handleGetUserMediaError);
}


const handleGetUserMediaError = (e) => {
    switch (e.name) {
        case "NotFoundError":
            alert("Unable to open your call because no camera and/or microphone" +
                "were found.");
            break;
        case "SecurityError":
        case "PermissionDeniedError":
            // Do nothing; this is the same as the user canceling the call.
            break;
        default:
            alert("Error opening your camera and/or microphone: " + e.message);
            break;
    }

    closeVideoCall();
}

const handleNegotiationNeededEvent = () => {
    myPeerConnection.createOffer().then((offer) => {
            return myPeerConnection.setLocalDescription(offer);
        })
        .then(() => {
            sendToServer({
                name: "me",
                target: friendName,
                type: "video-offer",
                sdp: myPeerConnection.localDescription
            });
        })
        .catch(reportError);
}



// The caller initiating the call
export const invite = (e) => {
    // Makes the video visible
    videoContainer.classList.remove("d-none")
    if (myPeerConnection) {
        alert("You can't start a call because you already have one open!");
    } else {
        createPeerConnection();
        navigator.mediaDevices.getUserMedia(mediaConstraints)
            .then((localStream) => {
                document.querySelector("#local_video").srcObject = localStream;
                localStream.getTracks().forEach(track => myPeerConnection.addTrack(track, localStream));
            })
            .catch(handleGetUserMediaError);
    }
}