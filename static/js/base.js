import {
    handleVideoOfferMsg,
    handleVideoAnswerMsg,
    handleNewICECandidateMsg,
    handleHangUpMsg,
    hangUpCall
} from "/static/chat/js/videoCall.js";

import { hangupButton, callControlContainer } from "/static/chat/js/index.js";

// console.log(invite)
console.log("hhi")

export var callWebSocket = new ReconnectingWebSocket(`ws://${window.location.host}/ws/call/`);

callWebSocket.addEventListener('open', (e) => {
    console.log("call connected")
})

callWebSocket.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data)
    switch (msg.type) {
        case "video-offer":
            callControlContainer.classList.remove('d-none')
            hangupButton.classList.add("d-none")
            handleVideoOfferMsg(msg)
            break;
        case "video-answer":
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