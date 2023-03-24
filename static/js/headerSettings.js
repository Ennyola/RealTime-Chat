import { notificationSocket } from "/static/js/webSocket.js";

const notificationDot = document.querySelector(".notification-dot");
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
            if (notificationDot.classList.contains('d-none')) {
                notificationDot.classList.remove('d-none');
            }
            // Remove the notification dot after 3 seconds if the user is on the add friend page.
            if (window.location.pathname === "/add-friend/") {
                setTimeout(() => {
                    notificationDot.classList.add('d-none');
                }, 3000)
            }
            break;
        default:
            break;
    }
})