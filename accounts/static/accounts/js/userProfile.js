let myDefaultAllowList = bootstrap.Tooltip.Default.allowList

// Enabling our popover to be used with bootstrap
let popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
let popoverList = popoverTriggerList.map(function(popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl, {
        html: true,
        content: () => {
            return document.querySelector('.popover-list').innerHTML
        },
        container: 'body',
        // trigger: 'focus',
        placement: 'right',
    })
})

// To allow the use of form and inputs in the popover
myDefaultAllowList.form = ['action', 'method', 'enctype']
myDefaultAllowList.input = ['type', 'name', 'value', 'placeholder', 'autocomplete', 'required', 'id']