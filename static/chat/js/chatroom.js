import { chatSocket } from './index.js'
let inputBox = document.querySelector("#input-message"),
    sendButton = document.querySelector("#send-button"),
    chatHolder = document.querySelectorAll(".messages")[0]

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

inputBox.focus()
inputBox.addEventListener('keyup', (e => {
    if (e.keyCode === 13) { // enter, return
        if (inputBox.value === "") return
        sendButton.click();
    }
}))




sendButton.addEventListener('click', (e) => {
    chatSocket.send(JSON.stringify({
        type: "message",
        messageContent: inputBox.value
    }));
    let str = `<div class="outgoing-message">
                    <div class="chat-bubble">
                        <div class="msg">${inputBox.value}</div>
                        <span class ="msg-metadata">
                            <span class = "msg-time">${formatAMPM(new Date)}</span> 
                            <span class="chat-status">
                                <i class="fas fa-spinner"></i>
                            </span>
                        </span>
                    </div>
                </div>`

    chatHolder.innerHTML += str
    chatHolder.scrollTop = chatHolder.scrollHeight;
    inputBox.value = ""

})