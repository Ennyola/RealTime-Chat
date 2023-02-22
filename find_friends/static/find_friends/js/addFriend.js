import { notificationSocket } from "/static/js/webSocket.js"

const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
const user = JSON.parse(document.querySelector("#username").textContent);
const friendRequestsContainer = document.querySelector(".friend-requests");
const users = document.querySelector(".friend-requests .users");
let singleUsers = users.querySelectorAll(".user"),
    userInfo,
    sendersName

notificationSocket.addEventListener('message', (e => {
    const msg = JSON.parse(e.data)
    console.log(msg.type)
    switch (msg.type) {
        case "friend_request":
            friendRequestsContainer.classList.remove("d-none");
            userInfo = `<div class="user">
                                <div class="user-info">
                                    <img src="${msg.sender_avatar}" class="display-picture" alt="display-picture">
                                    <span class="user-name">${msg.sender}</span>
                                </div>
                                <div class="add-remove">
                                    <form action="/add-friend/${msg.sender_id}/accept-or-reject/" method="post">
                                        <input type="hidden" name="csrfmiddlewaretoken" value="${csrftoken}">
                                        <button name="accept-request">
                                            <i class="fas fa-user-plus"></i>
                                            Accept
                                        </button>
                                    </form> 
                                    <form action="/add-friend/${msg.sender_id}/accept-or-reject/" method="post">
                                        <input type="hidden" name="csrfmiddlewaretoken" value="${csrftoken}">
                                        <button name="reject-request">
                                            <i class="fas fa-user-times"></i>
                                            Reject
                                        </button>
                                    </form>
                                </div> 
                            </div>`;
            users.insertAdjacentHTML("beforebegin", userInfo);
        case "cancel_friend_request":

            singleUsers.forEach((user) => {
                sendersName = user.querySelector(".user-name")
                console.log(sendersName.textContent, msg.from)
                if (sendersName.textContent === msg.from) {
                    user.remove()
                }
            })
        default:
            break;

    }
}))