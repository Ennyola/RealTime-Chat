let a = document.querySelector('.popover-option')
let popover = new bootstrap.Popover(a, {
    html: true,
    content: () => {
        return document.querySelector('.popover-list').innerHTML
    },
    trigger: 'focus',
    placement: 'right'

})