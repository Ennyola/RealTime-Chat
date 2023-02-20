export const callWebSocket = new ReconnectingWebSocket(`ws://${window.location.host}/ws/call/`);

export const getChatSocket = (friendName) => {
    return new ReconnectingWebSocket(`ws://${window.location.host}/ws/chat/${friendName}/`);
}

export const friendRequestWebSocket = new ReconnectingWebSocket(`ws://${window.location.host}/ws/friend-request/`);

export const notificationSocket = new ReconnectingWebSocket(`ws://${window.location.host}/ws/chat/`)


// export const getGroupChatSocket = (groupName) => {
//     return new ReconnectingWebSocket(`ws://${window.location.host}/ws/group_chat/${groupName}/`);
// }