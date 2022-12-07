let friendList = document.querySelectorAll(".friends-list .single-friend")
let latestMessage = document.querySelectorAll("#latest-message")
    // Go to a particular room when you click on a friend's name
console.log(friendList)
export const goToPage = (friends = friendList) => {
    friends.forEach((item) => {
        item.addEventListener('click', (e) => {
            window.location.href = `${window.location.origin}/chat/${item.id}/`
        })
    })
}

const notificationSocket = new ReconnectingWebSocket(`ws://${window.location.host}/ws/chat/`)

notificationSocket.addEventListener('open', (e => {
    console.log("Connection Established")
}))

notificationSocket.addEventListener('message', (e => {
    const msg = JSON.parse(e.data)
    switch (msg.type) {
        case "new_message":
            friendList.forEach((item) => {
                if (parseInt(item.id) === msg.room_id) {
                    latestMessage[friendList.indexOf(item)].innerHTML = msg.message_content
                }
            })
            break;
        default:
            console.log("Unknown message type")
    }
}))


goToPage()