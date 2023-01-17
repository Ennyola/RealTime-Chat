let changeDpVideo = document.querySelector("#change-dp-video");
let capture = document.querySelector("#click-photo");
let canvas = document.querySelector("#canvas");
let cameraIcon = document.querySelector("#camera-icon");
let myDefaultAllowList = bootstrap.Tooltip.Default.allowList
const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
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

function dataURLToBlob(dataURL) {
    var parts = dataURL.split(',');
    var contentType = parts[0].split(':')[1].split(';')[0];
    var raw = atob(parts[1]);
    var rawLength = raw.length;
    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
}

// Triggering the take-photo button event within the popover when the popover is appears in the DOM
cameraIcon.addEventListener('shown.bs.popover', () => {
    let takePhotoBtn = document.querySelector(".popover-body #take-photo");
    let submitForm = document.querySelector(".popover-body #take-photo-form");
    let imageInput = document.querySelector(".popover-body #image-input");
    takePhotoBtn.addEventListener("click", async() => {
        let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        changeDpVideo.srcObject = stream;

    })
    capture.addEventListener("click", () => {
        canvas.getContext('2d').drawImage(changeDpVideo, 0, 0, canvas.width, canvas.height);
        let imageDataUrl = canvas.toDataURL('image/jpeg')
        const formData = new FormData();
        // Create a blob object from the data URL
        let blob = dataURLToBlob(imageDataUrl);

        // Create a file object from the blob
        let file = new File([blob], "myImage.jpg", { type: "image/jpeg" });
        console.log(file)
        formData.append("display_picture", file);
        fetch("", {
            method: "POST",
            body: formData,
            credentials: 'same-origin',
            headers: {
                'X-CSRFToken': csrftoken,
            }
        })

        // imageInput.value = image_data_url;
        // const img = new Image();
        // img.src = image_data_url;
        // imageInput.appendChild(img);
        // submitForm.submit()

    })

})