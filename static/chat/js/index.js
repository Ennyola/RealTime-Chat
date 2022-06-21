import { invite, handleNegotiationNeededEvent, handleICECandidateEvent, handleTrackEvent, handleRemoveTrackEvent, handleICEConnectionStateChangeEvent, closeVideoCall, handleSignalingStateChangeEvent, handleICEGatheringStateChangeEvent } from "./videoCall.js";
const videoCallIcon = document.querySelector("#video-call-icon")
const friendName = JSON.parse(document.getElementById('room-name').textContent);
const url = `ws://${window.location.host}/ws/chat/${friendName}/`
export const chatSocket = new ReconnectingWebSocket(url)

export let myPeerConnection = null;

//start the call
videoCallIcon.addEventListener("click", invite)

export const createPeerConnection = () => {
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

//Open websocket connection
chatSocket.addEventListener('open', (e) => {
    console.log("Connection Established")
})

chatSocket.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data)
    switch (msg.type) {
        case "message":
            let messageStatus = document.querySelectorAll('.chat-status')
            let spinnerIcon = document.querySelectorAll('.chat-status i:nth-child(1)')
            spinnerIcon[spinnerIcon.length - 1].classList.add("d-none")
            messageStatus[messageStatus.length - 1].innerHTML += '<i class="fas fa-check"></i>'
            break;
        default:
            break;
    }

})

const hangUpCall = () => {
    closeVideoCall();
    chatSocket.send({
        name: myUsername,
        target: targetUsername,
        type: "hang-up"
    });
}