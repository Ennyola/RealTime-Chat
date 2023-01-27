let settingsPopover = new bootstrap.Popover(document.querySelector('#settings-icon'), {
    html: true,
    container: 'body',
    content: () => {
        return document.querySelector('.settings-popover-list').innerHTML
    },
    placement: 'right',
    delay: { "show": 500, "hide": 100 }
})