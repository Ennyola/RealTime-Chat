import { callWebSocket } from "/static/js/webSocket.js";

const user = JSON.parse(document.querySelector("#username").textContent);
const userDisplayPicture = JSON.parse(document.querySelector("#user-display-picture").textContent);
const videoContainer = document.querySelector('.video-container');
const acceptCall = document.querySelector("#accept_call");
const rejectCall = document.querySelector("#reject_call");
const callControlContainer = document.querySelector('.call-control')
const hangupButton = document.querySelector('#hangup-button');
const videoCallIcon = document.querySelector("#video-call-icon");
const voiceCallIcon = document.querySelector("#voice-call-icon");
let friendDisplayPicture = document.querySelector("#friend-display-picture");
let userCallInfo = document.querySelector(".call-info .user-calling")
let callingState = document.querySelector(".call-info .calling-state")
let userVideo = document.querySelector("#local_video")
let incomingVideo = document.querySelector("#received_video");
let friendName = document.querySelector('#room-name');
let myPeerConnection = null;
let myStream = null;
let count = 0;

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
export const invite = async(type) => {
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
    if (myPeerConnection._negotiating == true) return;
    myPeerConnection._negotiating = true;
    try {
        let offer = await myPeerConnection.createOffer();

        // If the connection hasn't yet achieved the "stable" state,
        // return to the caller. Another negotiationneeded event
        // will be fired when the state stabilizes.

        await myPeerConnection.setLocalDescription(offer);
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
    } finally {
        myPeerConnection._negotiating = false;
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
    count += 1;
    console.log("offer", count)
    targetUsername = msg.caller;
    createPeerConnection();
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
    if (myPeerConnection) {
        callWebSocket.send(JSON.stringify({
            caller: user,
            target: targetUsername,
            type: "ringing",
        }))
    }

    console.log(msg.sdp)
        //User accepts the call
    acceptCall.addEventListener('click', async(e) => {
        try {
            await myPeerConnection.setRemoteDescription(msg.sdp);
            // Add the local stream to the peer connection.
            for (const track of myStream.getTracks()) {
                let sender = myPeerConnection.getSenders().find(s => s.track === track);
                if (sender) {
                    myPeerConnection.removeTrack(sender);
                }
                sender = myPeerConnection.addTrack(track);
            }
            console.log(myPeerConnection.signalingState)
            let answer = await myPeerConnection.createAnswer();
            await myPeerConnection.setLocalDescription(answer);
            console.log(answer)
            console.log(myPeerConnection.localDescription)
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
    console.log(myPeerConnection.signalingState);

    // Configure the remote description, which is the SDP payload
    // in our "video-answer" message.
    try {
        await myPeerConnection.setRemoteDescription(msg.sdp);
    } catch (error) {
        console.log(error)
    }

}

export const handleICECandidateEvent = (event) => {
    if (event.candidate) {
        callWebSocket.send(JSON.stringify({
            type: "new-ice-candidate",
            target: targetUsername,
            candidate: event.candidate
        }));
    };
}

export var handleNewICECandidateMsg = async(msg) => {
    console.log(msg)
    let candidate = new RTCIceCandidate(msg.candidate);
    try {
        await myPeerConnection.addIceCandidate(candidate)
    } catch (error) {
        console.log(error)
    }


}

export const handleTrackEvent = (event) => {
    // Switching the uservideo to the small video and the incoming video to the big video.
    if (incomingVideo.srcObject.id !== event.streams[0].id) {
        userVideo.style.visibility = "visible";
        userVideo.srcObject = myStream;
        incomingVideo.srcObject = event.streams[0];
        // Mutting the user video and unmuting the incoming video so the user does not echo
        incomingVideo.muted = false;
        userVideo.muted = true;
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
    switch (myPeerConnection.signalingState) {
        case "closed":
            closeVideoCall();
            break;
    }
};

export const handleICEGatheringStateChangeEvent = (event) => {
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
        iceServers: [ // Information about ICE servers - Use your own!
            {
                urls: "stun:stun.stunprotocol.org"
            }
        ]
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

// Start the call if the user clicks the "call" button.
// This is only possible if the user is in the chatroom page hence the conditional statement
if (videoCallIcon) videoCallIcon.addEventListener("click", () => {
    invite("video-call")
})
if (voiceCallIcon) voiceCallIcon.addEventListener("click", () => {
    invite("voice-call")
})