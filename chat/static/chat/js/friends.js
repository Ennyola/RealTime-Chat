let friendList = document.querySelectorAll(".friends-list .single-friend")
    // Go to a particular room when you click on a friend's name

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
            let position = 0
            friendList.forEach((item, id) => {
                    console.log(item)
                    if (parseInt(item.id) === msg.room_id) {
                        item.querySelector("#latest_message").innerHTML = msg.message
                        position = id;
                    }
                })
                // Move the new message to the top of the list
            friendList[position].parentNode.insertBefore(friendList[position], friendList[0])
            break;
        default:
            console.log("Unknown message type")
    }
}))


goToPage()