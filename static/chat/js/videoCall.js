const videoCallIcon = document.querySelector("#video-call-icon")
const videoContainer = document.querySelector('.video-container')
const mediaConstraints = {
    audio: true, // We want an audio track
    video: {
        aspectRatio: {
            ideal: 1.333333 // 3:2 aspect is preferred
        }
    }
};

let myPeerConnection = new RTCPeerConnection({
    iceServers: [ // Information about ICE servers - Use your own!
        {
            urls: "stun:stun.stunprotocol.org"
        }
    ]
});


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
                name: myUsername,
                target: targetUsername,
                type: "video-offer",
                sdp: myPeerConnection.localDescription
            });
        })
        .catch(reportError);
}

const createPeerConnection = () => {
    myPeerConnection.onicecandidate = handleICECandidateEvent;
    myPeerConnection.ontrack = handleTrackEvent;
    myPeerConnection.onnegotiationneeded = handleNegotiationNeededEvent;
    myPeerConnection.onremovetrack = handleRemoveTrackEvent;
    myPeerConnection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
    myPeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
    myPeerConnection.onsignalingstatechange = handleSignalingStateChangeEvent;
}

// The caller initiating the call
const invite = (e) => {
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

videoCallIcon.addEventListener("click", invite)