let inputBox = document.querySelector("#input-message")
let sendButton = document.querySelector("#send-button")
inputBox.focus()
inputBox.addEventListener('keyup', (e => {
    if (e.keyCode === 13) { // enter, return
        sendButton.click();
    }
}))

sendButton.addEventListener('click', (e) => {
    console.log(inputBox.value)
})
const url = "ws://kie"
const webSocket = new WebSocket(url)