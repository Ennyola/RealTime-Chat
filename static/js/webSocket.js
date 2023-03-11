const endpoint = `ws://${window.location.host}/ws`;
if (window.location.protocol == "https:") {
    endpoint = `wss://${window.location.host}/ws`;
}

export const callWebSocket = new ReconnectingWebSocket(`${endpoint}/call/`);

export const getChatSocket = (friendName) => {
    return new ReconnectingWebSocket(`${endpoint}/chat/${friendName}/`);
}

export const friendRequestWebSocket = new ReconnectingWebSocket(`${endpoint}/friend-request/`);

export const notificationSocket = new ReconnectingWebSocket(`${endpoint}/notification/`)