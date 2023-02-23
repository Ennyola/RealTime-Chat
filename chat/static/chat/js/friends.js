import { notificationSocket } from "/static/js/webSocket.js"
let friendList = document.querySelectorAll(".friends-list .single-friend")

// Go to a particular room when you click on a friend's name
export const goToPage = (friends = friendList) => {
    friends.forEach((item) => {
        item.addEventListener('click', (e) => {
            window.location.href = `${window.location.origin}/chat/${item.id}/`
        })
    })
}

notificationSocket.addEventListener('message', (e => {
    const msg = JSON.parse(e.data)
    console.log(msg)
    switch (msg.type) {
        case "new_message":
            let position = 0
            friendList.forEach((item, id) => {
                if (parseInt(item.id) === msg.room_id) {
                    item.querySelector("#latest_message").innerHTML = msg.message
                    console.log(msg.message_time)
                    item.querySelector(".time").innerHTML = msg.message_time
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