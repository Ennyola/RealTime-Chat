import {
    handleVideoOfferMsg,
    handleVideoAnswerMsg,
    handleNewICECandidateMsg,
    handleHangUpMsg,
    hangUpCall,
    setCallingState,
    invite,
} from "/static/chat/js/videoCall.js";

import { callWebSocket } from "/static/js/webSocket.js";

let hangupButton = document.querySelector('#hangup-button');
let callControlContainer = document.querySelector('.call-control')
let callCenter = document.querySelector(".call-center");

// Start the call if the user clicks the "call" button.
// This is only possible if the user is in the chatroom page hence the conditional statement

if (callCenter) {
    callCenter.addEventListener("click", (e) => {
        if (e.target.id === "voice-call-icon") {
            console.log("I am here");
        }
        if (e.target.id === "video-call-icon") {
            console.log("here");
        }
    });
}

//End the call
hangupButton.addEventListener("click", (e) => {
    hangUpCall()
})



callWebSocket.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data)
    switch (msg.type) {
        case "offer":
            callControlContainer.classList.remove('d-none')
            hangupButton.classList.add("d-none")
            handleVideoOfferMsg(msg)
            break;
        case "answer":
            handleVideoAnswerMsg(msg)
            break;
        case "new-ice-candidate":
            handleNewICECandidateMsg(msg)
            break;
        case "ringing":
            setCallingState()
            break;
        case "hang-up":
            handleHangUpMsg(msg)
            break;
        default:
            break;
    }
})