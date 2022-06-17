const friendName = JSON.parse(document.getElementById('room-name').textContent);
const url = `ws://${window.location.host}/ws/chat/${friendName}/`
export const chatSocket = new ReconnectingWebSocket(url)

chatSocket.addEventListener('open', (e) => {
    console.log("Connection Established")
})

chatSocket.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data)
    switch (msg.type) {
        case "message":
            let messageStatus = document.querySelectorAll('.chat-status')
            let spinnerIcon = document.querySelectorAll('.chat-status i:nth-child(1)')
            spinnerIcon[spinnerIcon.length - 1].classList.add("d-none")
            messageStatus[messageStatus.length - 1].innerHTML += '<i class="fas fa-check"></i>'
            break;
        default:
            break;
    }

})