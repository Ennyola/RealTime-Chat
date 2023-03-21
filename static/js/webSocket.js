let endpoint = `ws://${window.location.host}/ws`;
if (window.location.protocol == "https:") {
    endpoint = `wss://${window.location.host}/ws`;
}

export const callWebSocket = new WebSocket(`${endpoint}/call/`);

export const getChatSocket = (friendName) => {
    return new WebSocket(`${endpoint}/chat/${friendName}/`);
}

// export const friendRequestWebSocket = new WebSocket(`${endpoint}/friend-request/`);

export const notificationSocket = new WebSocket(`${endpoint}/notification/`)