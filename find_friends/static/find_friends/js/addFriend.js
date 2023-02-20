import { notificationSocket } from "/static/js/webSocket.js"

const user = JSON.parse(document.querySelector("#username").textContent);

notificationSocket.addEventListener('message', (e => {
    const msg = JSON.parse(e.data)
    switch (msg.type) {
        case "friend_request":
            if (msg.receiver === user) {
                console.log("friend request received")
            }

    }
}))