import { getChatSocket } from '/static/js/webSocket.js'

const friendName = JSON.parse(document.getElementById('room-name').textContent);
const currentUser = JSON.parse(document.querySelector("#username").textContent);
const headerNav = document.querySelector(".room_name_status");
const goBack = document.querySelector(".go-back");
let chatSocket = getChatSocket(friendName);
let chatHolder = document.querySelector(".messages");
let inputBox = document.querySelector("#input-message");
let sendButton = document.querySelector("#send-button");

// Go to the last message on page load
window.onload = () => {
    chatHolder.scrollTop = chatHolder.scrollHeight;
}

// Go back to the friend list page
goBack.addEventListener('click', (e) => {
    window.location.href = `${window.location.origin}/`
})

// Go to a friends profile page
headerNav.addEventListener('click', () => {
    window.location.href = `${window.location.origin}/${friendName}/`
})

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

const formatToDateString = (timestamp) => {
    const date = new Date(timestamp);
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

inputBox.addEventListener('keyup', (e => {
    if (e.keyCode === 13) { // enter, return
        if (inputBox.value === "") return
        sendButton.click();
    }
    // if (inputBox.value === "") console.log("hir")
    // chatSocket.send(JSON.stringify({
    //     type: "typing",
    //     sender: currentUser,
    //     receiver: friendName,
    // }))

}))

sendButton.addEventListener('click', (e) => {
    let timeStamp = new Date().getTime();
    let userStatus = document.querySelector(".user-status");
    chatSocket.send(JSON.stringify({
        type: "message",
        messageContent: inputBox.value,
        time: timeStamp,
        sender: currentUser,
        receiver: friendName
    }));
    inputBox.value = ""
})

chatSocket.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data)
    switch (msg.type) {
        case "message":
            const MsgDates = chatHolder.querySelectorAll(".message-date span");
            const messageType = currentUser === msg.sender ? "outgoing-message" : "incoming-message";

            // Gets the date of the last message sent to the room
            // If the room is empty, then the last message date becomes 0
            let lastMsgDate = MsgDates.length && MsgDates[MsgDates.length - 1].textContent;
            let HtmlMessageString;
            // If the last message date is the same as the current message date, insert the message otherwise, insert the date and the message
            if (formatToDateString(msg.time) === (lastMsgDate)) {
                //If the current user is the sender, then the message is sent to the right side, else, the left
                HtmlMessageString = `<div class=${messageType}>
                            <div class="chat-bubble">
                                <div class="msg">${msg.content}</div>
                                    <span class ="msg-metadata">
                                        <span class = "time">${formatAMPM(new Date(msg.time))}</span> 
                                        <span class="chat-status">
                                        ${currentUser === msg.sender?'<i class="fas fa-check"></i>':""}
                                    </span>
                                </span>
                            </div>
                        </div>`
            } else {
                HtmlMessageString = `
                    <div class="message-date">
                        <span>${formatToDateString(msg.time)}</span>
                    </div>
                    <div class=${messageType}>
                            <div class="chat-bubble">
                                <div class="msg">${msg.content}</div>
                                    <span class ="msg-metadata">
                                        <span class = "time">${formatAMPM(new Date(msg.time))}</span> 
                                        <span class="chat-status">
                                        ${currentUser === msg.sender?'<i class="fas fa-check"></i>':""}
                                    </span>
                                </span>
                            </div>
                        </div>
                     `
            }
            chatHolder.insertAdjacentHTML('beforeend', HtmlMessageString);
            chatHolder.scrollTop = chatHolder.scrollHeight;
            if (currentUser !== msg.sender) {
                chatSocket.send(JSON.stringify({
                    type: "seen",
                    id: msg.id,
                }))
            }
            break;
        case "seen":
            // Change the status of the newly sent message to seen
            const chatStatus = document.querySelectorAll(".chat-status");
            chatStatus[chatStatus.length - 1].innerHTML = '<i class="fas fa-check-double"></i>';
            break;
        case "change_messages_status":
            // Change the status of all unread messages to seen
            const chatStatuses = document.querySelectorAll(".outgoing-message .chat-status .fa-check");
            chatStatuses.forEach(status => {
                status.classList.remove("fa-check");
                status.classList.add("fa-check-double");
            })
            break;
        case "typing":
            let userStatus = document.querySelector(".user-status");
            userStatus.classList.add("typing-status");
            userStatus.textContent = "Typing...";
            break;
        default:
            break;
    }
})