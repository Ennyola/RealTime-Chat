import { chatSocket } from "./index.js";
const user = document.querySelector("#username").textContent;
const videoContainer = document.querySelector('.video-container')
const friendName = JSON.parse(document.getElementById('room-name').textContent);
const acceptCall = document.querySelector("#accept_call");
const rejectCall = document.querySelector("#reject_call");
const callControlContainer = document.querySelector('.call-control')
const hangupButton = document.querySelector('#hangup-button');
const mediaConstraints = {
    audio: true,
    video: true
};
let targetUsername = friendName;
let myPeerConnection = null;
let myStream = null;


export const closeVideoCall = () => {
    let remoteVideo = document.querySelector("#received_video");
    let localVideo = document.querySelector("#local_video");
    if (myPeerConnection) {
        myPeerConnection.ontrack = null;
        myPeerConnection.onicecandidate = null;
        myPeerConnection.oniceconnectionstatechange = null;
        myPeerConnection.onsignalingstatechange = null;
        myPeerConnection.onicegatheringstatechange = null;
        myPeerConnection.onnegotiationneeded = null;

        // if (remoteVideo.srcObject) {
        //     remoteVideo.srcObject.getTracks().forEach(track => track.stop());
        // }

        if (localVideo.srcObject) {
            localVideo.srcObject.getTracks().forEach(track => track.stop());
        }

        myPeerConnection.close();
        myPeerConnection = null;
        myStream = null;
    }

    // remoteVideo.removeAttribute("src");
    // remoteVideo.removeAttribute("srcObject");
    // localVideo.removeAttribute("src");
    // remoteVideo.removeAttribute("srcObject");
    // document.querySelector("#hangup-button").disabled = true;
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
export const invite = async(e) => {
    if (myPeerConnection) {
        alert("You can't start a call because you already have one open!");
    } else {
        createPeerConnection();
        try {
            myStream = await navigator.mediaDevices.getUserMedia(mediaConstraints)
            videoContainer.classList.remove("d-none")
            document.querySelector("#local_video").srcObject = myStream;
            myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream));
        } catch (error) {
            handleGetUserMediaError(error)
        }
    }
}

export const handleNegotiationNeededEvent = async() => {
    try {
        let offer = await myPeerConnection.createOffer();

        // If the connection hasn't yet achieved the "stable" state,
        // return to the caller. Another negotiationneeded event
        // will be fired when the state stabilizes.
        if (myPeerConnection.signalingState != "stable") {
            console.log("     -- The connection isn't stable yet; postponing...")
            return;
        }

        await myPeerConnection.setLocalDescription(offer);
        chatSocket.send(JSON.stringify({
            caller: user,
            target: targetUsername,
            type: "video-offer",
            sdp: myPeerConnection.localDescription
        }));

    } catch (e) {
        reportError(e)
    }

}

export const hangUpCall = () => {
    closeVideoCall();
    chatSocket.send(JSON.stringify({
        name: user,
        target: targetUsername,
        type: "hang-up"
    }));
}


export const handleVideoOfferMsg = async(msg) => {
    targetUsername = msg.caller;

    if (!myStream) {
        try {
            myStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
            videoContainer.classList.remove("d-none")

        } catch (e) {
            handleGetUserMediaError(e)
        }
    }

    if (!myPeerConnection) {
        createPeerConnection();
    }

    let desc = new RTCSessionDescription(msg.sdp);

    if (myPeerConnection.signalingState != "stable") {
        // Set the local and remove descriptions for rollback; don't proceed
        // until both return.
        await Promise.all([
            myPeerConnection.setLocalDescription({ type: "rollback" }),
            myPeerConnection.setRemoteDescription(desc)
        ]);
        return;
    } else {
        await myPeerConnection.setRemoteDescription(desc);
    }


    document.querySelector("#local_video").srcObject = myStream;


    try {
        await myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream));
    } catch (error) {
        handleGetUserMediaError(error)
    }

    //function triggers when user accepts call
    acceptCall.addEventListener('click', async(e) => {
        try {
            if (myPeerConnection.signalingState == "stable") {
                return
            } else {
                let answer = await myPeerConnection.createAnswer();
                await myPeerConnection.setLocalDescription(answer);
            }

        } catch (error) {
            handleGetUserMediaError(error)

        }
        chatSocket.send(JSON.stringify({
            caller: user,
            target: targetUsername,
            type: "video-answer",
            sdp: myPeerConnection.localDescription
        }));
        //makes the accept and reject button disappear
        callControlContainer.classList.add('d-none')
        hangupButton.classList.remove("d-none")
    })

    rejectCall.addEventListener('click', (e) => {
        hangUpCall()
    })

}

export const handleVideoAnswerMsg = (msg) => {
    // Configure the remote description, which is the SDP payload
    // in our "video-answer" message.
    let desc = new RTCSessionDescription(msg.sdp);
    myPeerConnection.setRemoteDescription(desc).catch(reportError);
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
    console.log(event.streams)
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

export const handleHangUpMsg = (msg) => {
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