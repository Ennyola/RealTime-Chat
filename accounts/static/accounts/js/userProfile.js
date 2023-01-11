let takePhotoBtn = document.querySelector("#take-photo");
let changeDpVideo = document.querySelector("#video");
let capture = document.querySelector("#click-photo");
let canvas = document.querySelector("#canvas");
let myDefaultAllowList = bootstrap.Tooltip.Default.allowList

console.log(takePhotoBtn)
console.log(changeDpVideo)
console.log(";how")

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

// To allow the use of form, inputs and button elements in the popover
myDefaultAllowList.form = ['action', 'method', 'enctype']
myDefaultAllowList.input = ['type', 'name', 'value', 'placeholder', 'autocomplete', 'required', 'id']
myDefaultAllowList.button = ['type', 'name', 'value', 'id']

takePhotoBtn.addEventListener("click", () => {
    console.log("here")
    let stream = navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    changeDpVideo.srcObject = stream;
})

capture.addEventListener("click", () => {
    canvas.getContext('2d').drawImage(changeDpVideo, 0, 0, canvas.width, canvas.height);
    let image_data_url = canvas.toDataURL('image/jpeg');

    // data url of the image
    console.log(image_data_url);
})