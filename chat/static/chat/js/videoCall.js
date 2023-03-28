import { callWebSocket } from "/static/js/webSocket.js";

const user = JSON.parse(document.querySelector("#username").textContent);
const userDisplayPicture = JSON.parse(document.querySelector("#user-display-picture").textContent);
const turnUsername = JSON.parse(document.querySelector("#turn-username").textContent);
const turnPassword = JSON.parse(document.querySelector("#turn-password").textContent);
const videoContainer = document.querySelector('.video-container');
const acceptCall = document.querySelector("#accept_call");
const rejectCall = document.querySelector("#reject_call");
const callControlContainer = document.querySelector('.call-control');
const hangupButton = document.querySelector('#hangup-button');
let friendDisplayPicture = document.querySelector("#friend-display-picture");
let userCallInfo = document.querySelector(".call-info .user-calling");
let callingState = document.querySelector(".call-info .calling-state");
let userVideo = document.querySelector("#local_video");
let incomingVideo = document.querySelector("#received_video");
let friendName = document.querySelector('#room-name');
let myPeerConnection = null;
let myStream = null;

let mediaConstraints = {
    audio: true,
    video: false
};
if (friendName) {
    friendName = JSON.parse(friendName.textContent)
}
if (friendDisplayPicture) {
    friendDisplayPicture = friendDisplayPicture.src
}
let targetUsername = friendName;

export const closeVideoCall = () => {
    if (myPeerConnection) {
        myPeerConnection.ontrack = null;
        myPeerConnection.onicecandidate = null;
        myPeerConnection.oniceconnectionstatechange = null;
        myPeerConnection.onsignalingstatechange = null;
        myPeerConnection.onicegatheringstatechange = null;
        myPeerConnection.onnegotiationneeded = null;
        myPeerConnection.onremovetrack = null;

        if (userVideo.srcObject) {
            userVideo.srcObject.getTracks().forEach(track => track.stop());
        }
        if (incomingVideo.srcObject) {
            incomingVideo.srcObject.getTracks().forEach(track => track.stop());
        }
        myPeerConnection.close();
        myPeerConnection = null;
        myStream = null;
    }

    incomingVideo.removeAttribute("src");
    incomingVideo.removeAttribute("srcObject");
    userVideo.removeAttribute("src");
    incomingVideo.removeAttribute("srcObject");
    incomingVideo.style.background = `none`;
    // document.querySelector("#hangup-button").disabled = true;
    callingState.innerHTML = ""
    userCallInfo.innerHTML = ""
    incomingVideo.muted = true
    userVideo.muted = false
    mediaConstraints["video"] = false;
    videoContainer.classList.add("d-none")
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
export var invite = async(type) => {
    if (myPeerConnection) {
        return;
    } else {
        createPeerConnection();
        try {
            if (type === "video-call") {
                mediaConstraints["video"] = true;
            }
            myStream = await navigator.mediaDevices.getUserMedia(mediaConstraints)

            // Make the user video element visible.
            videoContainer.classList.remove("d-none")
                // Set the name of the user you are calling in the html
            userCallInfo.innerHTML = targetUsername
            callingState.innerHTML = "calling..."
            incomingVideo.srcObject = myStream;
            // Make the user video element hidden to prevent blank video from showing since no stream is attached to it yet.
            userVideo.style.visibility = "hidden";
            if (type === "voice-call") {
                incomingVideo.style.background = `url(${friendDisplayPicture}) no-repeat center center`;
                incomingVideo.style.backgroundSize = "cover";
            }

            // Add the local stream to the peer connection.


            myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream));
        } catch (error) {
            handleGetUserMediaError(error)
        }
    }
}

export const handleNegotiationNeededEvent = async() => {
    try {
        // If the connection hasn't yet achieved the "stable" state,
        // return to the caller. Another negotiationneeded event
        // will be fired when the state stabilizes.
        if (myPeerConnection.signalingState != "stable") {
            return;
        }


        await myPeerConnection.setLocalDescription(await myPeerConnection.createOffer());
        if (myStream.getTracks().length === 1 && myStream.getTracks()[0].kind === "audio") {
            callWebSocket.send(JSON.stringify({
                caller: user,
                target: targetUsername,
                type: "offer",
                callerPicture: userDisplayPicture,
                sdp: myPeerConnection.localDescription,
            }));
        } else {
            callWebSocket.send(JSON.stringify({
                caller: user,
                target: targetUsername,
                type: "offer",
                sdp: myPeerConnection.localDescription
            }));
        }
    } catch (e) {
        console.log(e)
    }

}

export const hangUpCall = () => {
    closeVideoCall();
    callWebSocket.send(JSON.stringify({
        name: user,
        target: targetUsername,
        type: "hang-up"
    }));
}


export var handleVideoOfferMsg = async(msg) => {
    targetUsername = msg.caller;
    videoContainer.classList.remove("d-none")

    // Set the name and calling state of the caller
    userCallInfo.innerHTML = targetUsername
    callingState.innerHTML = "calling..."

    // This conditions checks if the incoming call is a video call or a voice call.
    // If the incoming call is a voice call, the background of the incoming video 
    // element is set to the caller's display picture.
    if (msg.caller_picture) {
        incomingVideo.style.background = `url(${msg.caller_picture}) no-repeat center center`;
        incomingVideo.style.backgroundSize = "cover";
    } else {
        mediaConstraints["video"] = true;
    }

    // Opens the camera and microphone of the calle
    myStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    // Add the stream to the video element
    incomingVideo.srcObject = myStream;
    // Make the user video element hidden to prevent blank video from showing since no stream is attached to it yet.
    userVideo.style.visibility = "hidden";

    // Notify the other user that the phone is ringing
    callWebSocket.send(JSON.stringify({
        caller: user,
        target: targetUsername,
        type: "ringing",
    }));

    //User accepts the call
    acceptCall.addEventListener('click', async(e) => {
        if (!myPeerConnection) {
            createPeerConnection();
        } else {
            return;
        }

        try {
            if (myPeerConnection.signalingState != "stable") {
                // Set the local and remove descriptions for rollback; don't proceed
                // until both return.
                await Promise.all([
                    myPeerConnection.setLocalDescription({ type: "rollback" }),
                    myPeerConnection.setRemoteDescription(msg.sdp)
                ]);
                return;
            } else {
                await myPeerConnection.setRemoteDescription(msg.sdp);
            }

            myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream));
            // Add the local stream to the peer connection.


            await myPeerConnection.setLocalDescription(await myPeerConnection.createAnswer());
            callWebSocket.send(JSON.stringify({
                caller: user,
                target: targetUsername,
                type: "answer",
                sdp: myPeerConnection.localDescription
            }))

        } catch (error) {
            console.log(error)
        }

        callingState.innerHTML = ""
            //makes the accept and reject button disappear
        callControlContainer.classList.add('d-none')
        hangupButton.classList.remove("d-none")
    })

    //User Rejects the call
    rejectCall.addEventListener('click', (e) => {
        hangUpCall()
    })

}

export var handleVideoAnswerMsg = async(msg) => {
    // Remove the ringing calling state
    callingState.innerHTML = "";
    // Configure the remote description, which is the SDP payload
    // in our "video-answer" message.
    try {
        await myPeerConnection.setRemoteDescription(msg.sdp);
        console.log(myPeerConnection.remoteDescription)
    } catch (error) {
        console.log(error)
    }

}

export const handleICECandidateEvent = (event) => {
    console.log(event)
    if (event.candidate) {
        callWebSocket.send(JSON.stringify({
            type: "new-ice-candidate",
            target: targetUsername,
            candidate: event.candidate
        }));
    };
}

export var handleNewICECandidateMsg = async(msg) => {
    let candidate = new RTCIceCandidate(msg.candidate);
    try {
        await myPeerConnection.addIceCandidate(candidate)
    } catch (error) {
        console.log(error)
    }


}

export const handleTrackEvent = (event) => {
    // Switching the uservideo to the small video and the incoming video to the big video.
    if (incomingVideo.srcObject.id) {
        if (incomingVideo.srcObject.id !== event.streams[0].id) {
            userVideo.style.visibility = "visible";
            userVideo.srcObject = myStream;
            incomingVideo.srcObject = event.streams[0];
            // Mutting the user video and unmuting the incoming video so the user does not echo
            incomingVideo.muted = false;
            userVideo.muted = true;
        }
    }

    // document.querySelector("#received_video").srcObject = event.streams[0];
    document.querySelector("#hangup-button").disabled = false;
}

export const handleRemoveTrackEvent = (event) => {
    let stream = incomingVideo.srcObject;
    // let stream = document.querySelector("#received_video").srcObject;
    let trackList = stream.getTracks();

    if (trackList.length == 0) {
        closeVideoCall();
    }
}

export const handleICEConnectionStateChangeEvent = (event) => {
    console.log(myPeerConnection.iceConnectionState)
    switch (myPeerConnection.iceConnectionState) {
        case "closed":
        case "failed":
            closeVideoCall();
            break;
        case "disconnected":
            // The user reloads page thereby closing the peer connection
            callingState.innerHTML = "Reconnecting..."
            break;
        default:
            break;
    }
}

export const handleSignalingStateChangeEvent = (event) => {
    console.log(myPeerConnection.signalingState)
    switch (myPeerConnection.signalingState) {
        case "closed":
            closeVideoCall();
            break;
    }
};

export const handleICEGatheringStateChangeEvent = (event) => {
    console.log(myPeerConnection.iceGatheringState)
    switch (myPeerConnection.iceGatheringState) {
        case "complete":
            break;
    }
}

export var handleHangUpMsg = (msg) => {
    closeVideoCall();
}

const createPeerConnection = () => {
    myPeerConnection = new RTCPeerConnection({
        iceServers: [{
            urls: "turn:relay.metered.ca:443?transport=tcp",
            username: "cfd27fbba40892b7ebba31dd",
            credential: "dik5kVdYl8mtN/nd",
        }],
    });

    myPeerConnection.onicecandidate = handleICECandidateEvent;
    myPeerConnection.ontrack = handleTrackEvent;
    myPeerConnection.onnegotiationneeded = handleNegotiationNeededEvent;
    myPeerConnection.onremovetrack = handleRemoveTrackEvent;
    myPeerConnection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
    myPeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
    myPeerConnection.onsignalingstatechange = handleSignalingStateChangeEvent;
}

export var setCallingState = () => {
    callingState.innerHTML = "ringing..."
}