import {
    invite,
    handleVideoOfferMsg,
    handleVideoAnswerMsg,
    handleNewICECandidateMsg,
    handleHangUpMsg,
    hangUpCall
} from "/static/chat/js/videoCall.js";
// import { formatAMPM } from "/static/chat/js/chatroom.js";

const formatAMPM = (date) => {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}


const videoCallIcon = document.querySelector("#video-call-icon");
const friendName = JSON.parse(document.getElementById('room-name').textContent);
export const chatSocket = new ReconnectingWebSocket(`ws://${window.location.host}/ws/chat/${friendName}/`);
const currentuUser = document.querySelector("#username").textContent;
export var hangupButton = document.querySelector('#hangup-button');
export var callControlContainer = document.querySelector('.call-control')

let chatHolder = document.querySelectorAll(".messages")[0];

//start the call
videoCallIcon.addEventListener("click", invite)

//End the call
hangupButton.addEventListener("click", (e) => {
    hangUpCall()
})


//Open Chatwebsocket connection
chatSocket.addEventListener('open', (e) => {})


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
            break;
            // case "video-offer":
            //     callControlContainer.classList.remove('d-none')
            //     hangupButton.classList.add("d-none")
            //     handleVideoOfferMsg(msg)
            //     break;
            // case "video-answer":
            //     handleVideoAnswerMsg(msg)
            //     break;
            // case "new-ice-candidate":
            //     handleNewICECandidateMsg(msg)
            //     break;
            // case "hang-up":
            //     handleHangUpMsg(msg)
            //     break;
        default:
            break;
    }
})