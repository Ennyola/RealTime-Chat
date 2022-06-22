import { chatSocket, createPeerConnection, myPeerConnection } from "./index.js";
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
let targetUsername = null;

export const closeVideoCall = () => {
    let remoteVideo = document.querySelector("#received_video");
    let localVideo = document.querySelector("#local_video");
    if (myPeerConnection) {
        myPeerConnection.ontrack = null;
        myPeerConnection.onremovetrack = null;
        myPeerConnection.onremovestream = null;
        myPeerConnection.onicecandidate = null;
        myPeerConnection.oniceconnectionstatechange = null;
        myPeerConnection.onsignalingstatechange = null;
        myPeerConnection.onicegatheringstatechange = null;
        myPeerConnection.onnegotiationneeded = null;

        if (remoteVideo.srcObject) {
            remoteVideo.srcObject.getTracks().forEach(track => track.stop());
        }

        if (localVideo.srcObject) {
            localVideo.srcObject.getTracks().forEach(track => track.stop());
        }

        myPeerConnection.close();
        myPeerConnection = null;
    }

    remoteVideo.removeAttribute("src");
    remoteVideo.removeAttribute("srcObject");
    localVideo.removeAttribute("src");
    remoteVideo.removeAttribute("srcObject");

    document.querySelector("#hangup-button").disabled = true;
    targetUsername = null;
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

export const handleNegotiationNeededEvent = () => {
    myPeerConnection.createOffer().then((offer) => {
            return myPeerConnection.setLocalDescription(offer);
        })
        .then(() => {
            chatSocket.send(JSON.stringify({
                name: "me",
                target: friendName,
                type: "video-offer",
                sdp: myPeerConnection.localDescription
            }));
        })
        .catch(reportError);
}
export const handleVideoOfferMsg = (msg) => {
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


export const handleICECandidateEvent = (event) => {
    if (event.candidate) {
        chatSocket.send(JSON.stringify({
            type: "new-ice-candidate",
            target: targetUsername,
            candidate: event.candidate
        }));
    };
}

export const handleNewICECandidateMsg = (msg) => {
    let candidate = new RTCIceCandidate(msg.candidate);

    myPeerConnection.addIceCandidate(candidate)
        .catch(reportError);
}

export const handleTrackEvent = (event) => {
    console.log(event)
    document.querySelector("#received_video").srcObject = event.streams[0];
    document.querySelector("#hangup-button").disabled = false;
}

export const handleRemoveTrackEvent = (event) => {
    let stream = document.querySelector("#received_video").srcObject;
    let trackList = stream.getTracks();

    if (trackList.length == 0) {
        closeVideoCall();
    }
}

export const handleICEConnectionStateChangeEvent = (event) => {
    switch (myPeerConnection.iceConnectionState) {
        case "closed":
        case "failed":
            closeVideoCall();
            break;
        default:
            break;
    }
}

export const handleSignalingStateChangeEvent = (event) => {
    switch (myPeerConnection.signalingState) {
        case "closed":
            closeVideoCall();
            break;
    }
};

export const handleICEGatheringStateChangeEvent = (event) => {
    // Our sample just logs information to console here,
    // but you can do whatever you need.
    // console.log(event)
}