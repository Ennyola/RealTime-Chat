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

let room = `<div class="single-friend" id={{room.room_id}}>
                <img src="{{room.friend_display_picture}}" class="display-picture" alt="friend-picture"/>
                    <div class="text">
                        <h6>{{room.room_name}}</h6>
                        {% if room.last_message %}
                            <p id="latest_message">{{room.last_message}}</p>
                    </div>
                <span class="time">{{room.last_message_time}}</span>
            </div>
            `

notificationSocket.addEventListener('message', (e => {
    const msg = JSON.parse(e.data)
    switch (msg.type) {
        case "new_message":
            let position = 0
            let roomInList = false
            friendList.forEach((item, id) => {
                if (parseInt(item.id) === msg.room_id) {
                    item.querySelector("#latest_message").innerHTML = msg.message
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