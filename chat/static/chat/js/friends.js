import { notificationSocket } from "/static/js/webSocket.js"

const roomListParent = document.querySelector('.friends-list');
let roomList = Array.from(roomListParent.children)

// Go to a particular room when you click on a friend's name

roomList.forEach((item) => {
    item.addEventListener('click', (e) => {
        window.location.href = `${window.location.origin}/chat/${item.id}/`
    })
})


// returns the index of the room in the roomList
const checkForIdInRoomList = (id, roomList) => {
    for (let i = 0; i < roomList.length; i++) {
        if (parseInt(roomList[i].id) === id) {
            return i
        }
    }
    return -1
}

notificationSocket.addEventListener('message', (e => {
    const msg = JSON.parse(e.data)
    switch (msg.type) {
        case "new_message":
            let roomIndex = checkForIdInRoomList(msg.room_id, roomList)
                // If the room is listed in the sidebar room_list
            if (roomIndex > -1) {
                roomList[roomIndex].querySelector("#latest_message").innerHTML = msg.message
                roomList[roomIndex].querySelector(".time").innerHTML = msg.message_time
                    // Move the new message to the top of the list
                roomListParent.insertBefore(roomList[roomIndex], roomListParent.firstChild)
            } else {
                // If the room is not listed in the sidebar room_list
                // Add the room to the sidebar room_list
                let room = `<div class="single-friend" id=${msg.room_id}>
                                    <img src="${msg.sender_image}" class="display-picture" alt="friend-picture"/>
                                        <div class="text">
                                            <h6>${msg.sender}</h6>
                                            <p id="latest_message">${msg.message}</p>
                                        </div>
                                    <span class="time">${msg.message_time}</span>
                                </div>
                                `;

                let newRoomElement = document.createRange().createContextualFragment(room).firstChild
                roomList.unshift(newRoomElement);

                // If a room already exists in the sidebar, insert the new room at the top of the list else, append the new room to the parent element.
                if (roomList.length > 0) {
                    roomListParent.insertBefore(newRoomElement, roomListParent.firstChild)
                } else {
                    roomListParent.appendChild(newRoomElement)
                }
            }
            break;
        case "new_room":
            break;
        default:
            break;
    }
}))