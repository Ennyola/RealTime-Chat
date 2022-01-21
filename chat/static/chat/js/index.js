let inputBox = document.querySelector("#input-message")
let sendButton = document.querySelector("#send-button")
let chatHolder = document.querySelectorAll(".messages")[0]







inputBox.focus()
inputBox.addEventListener('keyup', (e => {
    if (e.keyCode === 13) { // enter, return
        sendButton.click();
    }
}))



const url = `ws://${window.location.host}/ws/chat/${"Ennheny"}/`
const chatSocket = new WebSocket(url)


chatSocket.addEventListener('open', (e) => {
    console.log("Connection Established")
})
chatSocket.addEventListener('message', (e) => {
    const divOutgoing = document.createElement("div")
    const divchatBubble = document.createElement("div")
    const divMsg = document.createElement("div")
    const message = JSON.parse(e.data)
    divOutgoing.className = "outgoing-message"
    divchatBubble.className = "chat-bubble"
    divMsg.className = "msg"
    divMsg.innerHTML = message.message
    divchatBubble.appendChild(divMsg)
    divOutgoing.append(divchatBubble)
    chatHolder.append(divOutgoing)
})
chatSocket.addEventListener('close', (e) => {
    console.error('Chat socket closed unexpectedly');
})

sendButton.addEventListener('click', (e) => {
    chatSocket.send(JSON.stringify({
        'message': inputBox.value
    }));
    inputBox.value = ""
})