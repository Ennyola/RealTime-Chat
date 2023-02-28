import { notificationSocket } from "/static/js/webSocket.js"

let friendList = Array.from(document.querySelectorAll(".friends-list .single-friend"));
const parent = document.querySelector('.friends-list');
console.log(parent)
    // Go to a particular room when you click on a friend's name
export const goToPage = (friends = friendList) => {
    friends.forEach((item) => {
        item.addEventListener('click', (e) => {
            window.location.href = `${window.location.origin}/chat/${item.id}/`
        })
    })
}

// returns the index of the room in the friendList
const checkForIdInFriendList = (id, friendList) => {
    for (let i = 0; i < friendList.length; i++) {
        if (parseInt(friendList[i].id) === id) {
            return i
        }
    }
    return -1
}

notificationSocket.addEventListener('message', (e => {
    const msg = JSON.parse(e.data)
    switch (msg.type) {
        case "new_message":
            let position = 0
            let roomIndex = checkForIdInFriendList(msg.room_id, friendList)
            console.log(roomIndex)
            if (roomIndex > -1) {
                friendList[roomIndex].querySelector("#latest_message").innerHTML = msg.message
                friendList[roomIndex].querySelector(".time").innerHTML = msg.message_time
                position = roomIndex;

                // Move the new message to the top of the list
                friendList[position].parentNode.insertBefore(friendList[position], friendList[0])
            } else {

                // If the room is not listed in the sidebar room_list
                // Add the room to the sidebar room_list
                let room = `<div class="single-friend" id=${msg.room_id}>
                                    <img src="" class="display-picture" alt="friend-picture"/>
                                        <div class="text">
                                            <h6>${msg.sender}</h6>
                                            <p id="latest_message">${msg.message}</p>
                                        </div>
                                    <span class="time">${msg.message_time}</span>
                                </div>
                                `;
                let newRoomElement = document.createRange().createContextualFragment(room).firstChild
                friendList.unshift(newRoomElement);
                friendList[1].parentNode.insertBefore(friendList[0], friendList[1])
            }
            break;
        default:
            console.log("Unknown message type")
    }
}))

goToPage()