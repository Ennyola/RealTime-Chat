import { notificationSocket } from "/static/js/webSocket.js"
const notificationDot = document.querySelector(".notification-dot")
const settingsPopover = new bootstrap.Popover(document.querySelector('#settings-icon'), {
    html: true,
    container: 'body',
    content: () => {
        return document.querySelector('.settings-popover-list').innerHTML
    },
    placement: 'right',
    trigger: 'focus',
    delay: { "show": 500, "hide": 100 }
})

notificationSocket.addEventListener('message', (e) => {
    let msg = JSON.parse(e.data)
    switch (msg.type) {
        case 'friend_request':
            notificationDot.classList.remove('d-none');
            break;
        default:
            break;
    }
})