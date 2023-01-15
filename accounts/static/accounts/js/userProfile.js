let changeDpVideo = document.querySelector("#change-dp-video");
let capture = document.querySelector("#click-photo");
let canvas = document.querySelector("#canvas");
let cameraIcon = document.querySelector("#camera-icon");
let myDefaultAllowList = bootstrap.Tooltip.Default.allowList

// To allow the use of form, inputs and button elements in the popover
myDefaultAllowList.form = ['action', 'method', 'enctype']
myDefaultAllowList.input = ['type', 'name', 'value', 'placeholder', 'autocomplete', 'required', 'id']
myDefaultAllowList.button = ['type', 'name', 'value', 'id']

// Enabling our popover to be used with bootstrap
let popover = new bootstrap.Popover(cameraIcon, {
    html: true,
    content: () => {
        return document.querySelector('.popover-list').innerHTML
    },
    container: 'body',
    // trigger: 'focus',
    placement: 'right',
    delay: { "show": 500, "hide": 100 }
})

// Triggering the take-photo button event within the popover when the popover is appears in the DOM
cameraIcon.addEventListener('shown.bs.popover', () => {
    let takePhotoBtn = document.querySelector(".popover-body #take-photo");
    let submitForm = document.querySelector(".popover-body #submit-form");
    let imageInput = document.querySelector(".popover-body #image-input");
    takePhotoBtn.addEventListener("click", async() => {
        let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        changeDpVideo.srcObject = stream;

    })
    capture.addEventListener("click", () => {
        canvas.getContext('2d').drawImage(changeDpVideo, 0, 0, canvas.width, canvas.height);
        let image_base64 = document.querySelector("#canvas").toDataURL('image/jpeg').replace(/^data:image\/jpeg;base64,/, "");
        console.log(image_base64);
        imageInput.value = image_base64;
        console.log(imageInput.value);
        // document.forms['take-photo-form'].submit();

    })

})