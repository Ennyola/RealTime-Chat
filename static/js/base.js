import {
    handleVideoOfferMsg,
    handleVideoAnswerMsg,
    handleNewICECandidateMsg,
    handleHangUpMsg,
    hangUpCall
} from "/static/chat/js/videoCall.js";

import { callWebSocket } from "/static/js/webSocket.js";

let hangupButton = document.querySelector('#hangup-button');
let callControlContainer = document.querySelector('.call-control')

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
        case "hang-up":
            handleHangUpMsg(msg)
            break;
        default:
            break;
    }
})