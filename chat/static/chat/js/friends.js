import { notificationSocket } from "/static/js/webSocket.js"

const roomListParent = document.querySelector('.friends-list');
let roomList = Array.from(roomListParent.children);
let unreadMessage;

// Handle click events on room elements using event delegation
roomListParent.addEventListener('click', (event) => {
    // Find the nearest ancestor single-friend element
    const singleFriend = event.target.closest('.single-friend');
    // Check if a single-friend element was clicked
    if (singleFriend) {
        // Get the room ID from the clicked element
        const roomId = singleFriend.id;
        // Redirect to the chat room page
        window.location.href = `${window.location.origin}/chat/${roomId}/`;
    }
});
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
    let roomIndex = checkForIdInRoomList(msg.room_id, roomList)
    switch (msg.type) {
        case "new_message":
            roomList[roomIndex].querySelector("#latest_message").innerHTML = msg.message
            roomList[roomIndex].querySelector(".time").innerHTML = msg.message_time
            unreadMessage = roomList[roomIndex].querySelector(".unread_message")

            // If the message is not from the current user, then the unread message count should be there
            if (msg.sender) {
                // If there is already an unread message count, increment it by 1 else, create a new unread message count element
                if (unreadMessage) {
                    unreadMessage.querySelector("span").textContent = parseInt(unreadMessage.querySelector("span").textContent) + 1
                } else {
                    unreadMessage = document.createElement("span")
                    unreadMessage.classList.add("unread_message")
                    unreadMessage.insertAdjacentHTML("afterbegin", `<span>1</span>`)
                    roomList[roomIndex].querySelector(".time_unread_message").appendChild(unreadMessage)
                }
                // If the user is in the chat room, remove the unread message count after 3 seconds
                if (window.location.pathname === `/chat/${msg.room_id}/`) {
                    setTimeout(() => {
                        unreadMessage.remove()
                    }, 3000)
                }
            }
            // Move the new message to the top of the list
            roomListParent.insertBefore(roomList[roomIndex], roomListParent.firstChild)
            break;
        case "new_room":
            let room = `<div class="single-friend" id=${msg.room_id}>
                            <img src="${msg.room_image}" class="display-picture" alt="friend-picture"/>
                                <div class="message-text">
                                    <h6>${msg.room_name}</h6>
                                    <p id="latest_message">New Message</p>
                                </div>
                            <span class="time"></span>
                        </div>
                        `;
            let newRoomElement = document.createRange().createContextualFragment(room).firstChild
                // If a room already exists in the sidebar, insert the new room at the top of the list else, append the new room to the parent element.
            if (roomList.length > 0) {
                roomListParent.insertBefore(newRoomElement, roomListParent.firstChild)
            } else {
                roomListParent.appendChild(newRoomElement)
            }
            // Update the roomList variable
            roomList = Array.from(roomListParent.children)
            break;
        default:
            break;
    }
}))

// gotoPage()