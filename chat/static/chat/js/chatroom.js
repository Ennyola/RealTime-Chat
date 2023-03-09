import { getChatSocket } from '/static/js/webSocket.js'

const friendName = JSON.parse(document.getElementById('room-name').textContent);
const currentUser = JSON.parse(document.querySelector("#username").textContent);
let chatSocket = getChatSocket(friendName)
let chatHolder = document.querySelector(".messages");
let inputBox = document.querySelector("#input-message")
let sendButton = document.querySelector("#send-button")

// Go to the last message on page load
window.onload = () => {
    chatHolder.scrollTop = chatHolder.scrollHeight;
}

// Converts the Javascript datetime object in a time string format
const formatAMPM = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'p.m.' : 'a.m.';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    let strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

inputBox.focus()
inputBox.addEventListener('keyup', (e => {
    if (e.keyCode === 13) { // enter, return
        if (inputBox.value === "") return
        sendButton.click();
    }
}))

sendButton.addEventListener('click', (e) => {
    console.log("hi")
    if (inputBox.value === "") return
    chatSocket.send(JSON.stringify({
        type: "message",
        messageContent: inputBox.value,
        sender: currentUser
    }));
    inputBox.value = ""
})

chatSocket.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data)
    switch (msg.type) {
        case "message":
            //If the current user is the sender, then the message is sent to the right side, else, the left
            const messageType = currentUser === msg.sender ? "outgoing-message" : "incoming-message";
            let text = `<div class=${messageType}>
                <div class="chat-bubble">
                    <div class="msg">${msg.message_content}</div>
                        <span class ="msg-metadata">
                            <span class = "time">${formatAMPM(new Date)}</span> 
                            <span class="chat-status">
                            ${currentUser === msg.sender?'<i class="fas fa-check"></i>':""}
                        </span>
                    </span>
                </div>
            </div>`
            chatHolder.innerHTML += text
            chatHolder.scrollTop = chatHolder.scrollHeight;
        default:
            break;
    }
})