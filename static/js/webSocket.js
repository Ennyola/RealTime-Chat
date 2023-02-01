export const callWebSocket = new ReconnectingWebSocket(`ws://${window.location.host}/ws/call/`);

export const getChatSocket = (friendName) => {
    return new ReconnectingWebSocket(`ws://${window.location.host}/ws/chat/${friendName}/`);
}