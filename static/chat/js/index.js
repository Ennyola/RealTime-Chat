import {
    invite,
    handleVideoOfferMsg,
    handleVideoAnswerMsg,
    handleNewICECandidateMsg,
    handleHangUpMsg,
    hangUpCall
} from "./videoCall.js";
import { formatAMPM } from "./chatroom.js";




const videoCallIcon = document.querySelector("#video-call-icon");
const friendName = JSON.parse(document.getElementById('room-name').textContent);
const url = `ws://${window.location.host}/ws/chat/${friendName}/`
export const chatSocket = new ReconnectingWebSocket(url);
const currentuUser = document.querySelector("#username").textContent;
const hangupButton = document.querySelector('#hangup-button');
const callControlContainer = document.querySelector('.call-control')

let chatHolder = document.querySelectorAll(".messages")[0];



//start the call
videoCallIcon.addEventListener("click", invite)

//End the call
hangupButton.addEventListener("click", (e) => {
    hangUpCall()
})


//Open websocket connection
chatSocket.addEventListener('open', (e) => {
    console.log("Connection Established")
})

chatSocket.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data)
    switch (msg.type) {
        case "message":
            //If the current user is the sender, then the message is sent to the right side, else, the left
            const messageType = currentuUser === msg.sender ? "outgoing-message" : "incoming-message";
            let text = `<div class=${messageType}>
                <div class="chat-bubble">
                    <div class="msg">${msg.message_content}</div>
                        <span class ="msg-metadata">
                            <span class = "msg-time">${formatAMPM(new Date)}</span> 
                            <span class="chat-status">
                            ${currentuUser === msg.sender?'<i class="fas fa-check"></i>':""}
                        </span>
                    </span>
                </div>
            </div>`
            chatHolder.innerHTML += text
            chatHolder.scrollTop = chatHolder.scrollHeight;
            // let messageStatus = document.querySelectorAll('.chat-status')
            // let spinnerIcon = document.querySelectorAll('.chat-status i:nth-child(1)')
            // spinnerIcon[spinnerIcon.length - 1].classList.add("d-none")
            // messageStatus[messageStatus.length - 1].innerHTML += '<i class="fas fa-check"></i>'
            break;
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