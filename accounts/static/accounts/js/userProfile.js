const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
const savePhoto = document.querySelector("#save-photo");
const cancelPhoto = document.querySelector("#cancel-photo");
let changeDpVideo = document.querySelector("#change-dp-video");
let capture = document.querySelector("#capture");
let canvas = document.querySelector("#canvas");
let cameraIcon = document.querySelector("#camera-icon");
let username = document.querySelector("#username").textContent;
let cameraPreview = document.querySelector(".camera-preview");
let picturePreview = document.querySelector(".picture-preview");
let capturePhotoSection = document.querySelector(".take-photo-section")
let stream;
let canvasContext


// Defining the default allow list for bootstrap popover
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

// Function to convert canvas image to blob
const dataURLToBlob = (dataURL) => {
    let parts = dataURL.split(',');
    let contentType = parts[0].split(':')[1].split(';')[0];
    let raw = atob(parts[1]);
    let rawLength = raw.length;
    let uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
}

// Triggering the take-photo button event within the popover when the popover is appears in the DOM
cameraIcon.addEventListener('shown.bs.popover', () => {
    let takePhotoBtn = document.querySelector(".popover-body #take-photo");

    takePhotoBtn.addEventListener("click", async() => {
        capturePhotoSection.classList.toggle("d-none")
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        changeDpVideo.srcObject = stream;
    })
    capture.addEventListener("click", () => {
        // Setting the canvas width and height to the image captured from the video stream
        canvasContext = canvas.getContext('2d')
        canvasContext.drawImage(changeDpVideo, 0, 0, canvas.width, canvas.height);
        // Stopping the video stream
        stream.getTracks().forEach(track => track.stop());
        changeDpVideo.srcObject = null;
        cameraPreview.classList.toggle("d-none")
        picturePreview.classList.toggle("d-none")
    })

})
savePhoto.addEventListener("click", () => {
    let imageDataUrl = canvas.toDataURL('image/jpeg')
    const formData = new FormData();
    // Create a blob object from the data URL
    let blob = dataURLToBlob(imageDataUrl);

    // Create a file object from the blob
    let file = new File([blob], "myImage.jpg", { type: "image/jpeg" });
    formData.append("display_picture", file);
    fetch('', {
            method: "POST",
            body: formData,
            mode: 'same-origin',
            headers: {
                'X-CSRFToken': csrftoken,
            }
        })
        .then((response) => {
            window.location.reload();
        })
        .catch((error) => {
            console.log(error)
        });


});
cancelPhoto.addEventListener("click", () => {
    // Clearing the entire canvas
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    //Closes the picture preview div
    picturePreview.classList.toggle("d-none")
        //Closes the capture Photo section 
    capturePhotoSection.classList.toggle("d-none")
});