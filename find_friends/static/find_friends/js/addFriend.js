import { notificationSocket } from "/static/js/webSocket.js"

const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
const user = JSON.parse(document.querySelector("#username").textContent);
const friendRequestsContainer = document.querySelector(".friend-requests");
const users = document.querySelector(".friend-requests .users");
let userInfo

notificationSocket.addEventListener('message', (e => {
    const msg = JSON.parse(e.data);
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
            // Add the user to the beginning of the list.
            users.insertAdjacentHTML("afterbegin", userInfo);
            break;
        case "cancel_friend_request":
            let senders = users.querySelectorAll(".user")
            senders.forEach((user) => {
                let sendersName = user.querySelector(".user-name")
                    // Remove user from dom if he/she cancels the request
                if (sendersName.textContent === msg.from) {
                    user.remove()
                }
            })
            break;
        default:
            break;

    }
}))