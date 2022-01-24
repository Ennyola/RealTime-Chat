let inputBox = document.querySelector("#input-message")
let sendButton = document.querySelector("#send-button")
let chatHolder = document.querySelectorAll(".messages")[0]
let icon = document.querySelector('.chat-status i:nth-child(1)')


inputBox.focus()
inputBox.addEventListener('keyup', (e => {
    if (e.keyCode === 13) { // enter, return
        sendButton.click();
    }
}))


const url = `ws://${window.location.host}/ws/chat/${"eny"}/`
const chatSocket = new ReconnectingWebSocket(url)


chatSocket.addEventListener('open', (e) => {
    console.log("Connection Established")
})
chatSocket.addEventListener('message', (e) => {
    const message = JSON.parse(e.data)
    let str = `<div class="outgoing-message">
                    <div class="chat-bubble">
                        <div class="msg">${message.message}</div>
                        <span class ="msg-metadata">
                            <span class = "msg-time"></span> 
                            <span class="chat-status">
                                <i class="fas fa-check"></i>
                            </span>
                        </span>
                    </div>
                </div>`
    console.log(icon.classList)



})
chatSocket.addEventListener('close', (e) => {
    console.error('Chat socket closed unexpectedly');
})

sendButton.addEventListener('click', (e) => {
    chatSocket.send(JSON.stringify({
        'message': inputBox.value
    }));
    let str = `<div class="outgoing-message">
                    <div class="chat-bubble">
                        <div class="msg">${inputBox.value}</div>
                        <span class ="msg-metadata">
                            <span class = "msg-time"></span> 
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

// const divOutgoing = document.createElement("div")
//     const divchatBubble = document.createElement("div")
//     const divMsg = document.createElement("div")

//     divOutgoing.className = "outgoing-message"
//     divchatBubble.className = "chat-bubble"
//     divMsg.className = "msg"
//     divMsg.innerHTML = inputBox.value
//     divchatBubble.appendChild(divMsg)
//     divOutgoing.append(divchatBubble)