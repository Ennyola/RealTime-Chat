const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
const savePhoto = document.querySelector("#save-photo");
const cancelPhoto = document.querySelector("#cancel-photo");
const closeCamera = document.querySelector("#close-camera");
const editBio = document.querySelector("#edit-bio");
const cameraIcon = document.querySelector("#camera-icon");
let changeDpVideo = document.querySelector("#change-dp-video");
let capture = document.querySelector("#capture");
let canvas = document.querySelector("#canvas");
let cameraPreview = document.querySelector(".camera-preview");
let picturePreview = document.querySelector(".picture-preview");
let capturePhotoSection = document.querySelector(".take-photo-section")
let bioInput = document.querySelector("#id_bio");
let confirmationWrapper = document.querySelector(".confirmation-wrapper");
let cancelDelete = document.querySelector("#delete-confirmation__no");
let confirmDelete = document.querySelector("#delete-confirmation__yes");
let stream;
let canvasContext


// Defining the default allow list for bootstrap popover
let myDefaultAllowList = bootstrap.Tooltip.Default.allowList

// To allow the use of form, inputs and button elements in the popover
myDefaultAllowList.form = ['action', 'method', 'enctype']
myDefaultAllowList.input = ['type', 'name', 'value', 'placeholder', 'autocomplete', 'required', 'id']
myDefaultAllowList.button = ['type', 'name', 'value', 'id']
myDefaultAllowList.label = ['for']

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

const closeVideoStream = () => {
    stream.getTracks().forEach(track => track.stop());
    changeDpVideo.srcObject = null;
}

// Triggering the take-photo button event within the popover when the popover is appears in the const
cameraIcon.addEventListener('shown.bs.popover', () => {
    const takePhotoBtn = document.querySelector(".popover-body #take-photo");
    const displayPictureInput = document.querySelector(".popover-body form #id_display_picture");
    const uploadImageForm = document.querySelector(".popover-body #upload-image-form");
    const deleteOption = document.querySelector(".popover-body .delete-option");
    const DeleteImageForm = document.querySelector(".popover-body #delete-image-form");
    const uploadInputLabel = document.querySelector(".popover-body #upload-image-form label");

    takePhotoBtn.addEventListener("click", async() => {
        capturePhotoSection.classList.remove("d-none")
        popover.hide()
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        } catch (error) {
            alert("error")
        }

        changeDpVideo.srcObject = stream;
    })

    capture.addEventListener("click", () => {
        // Setting the canvas width and height to the image captured from the video stream
        canvasContext = canvas.getContext('2d')
        canvasContext.drawImage(changeDpVideo, 0, 0, canvas.width, canvas.height);
        // Stopping the video stream
        closeVideoStream()
            //camera preview should disappear and then the picture should be displayed
        cameraPreview.classList.toggle("d-none")
        picturePreview.classList.toggle("d-none")
    })

    //submit form on image input change
    displayPictureInput.addEventListener("change", () => {
        uploadImageForm.submit()
    })

    //Open up the delete cnfirmation modal
    deleteOption.addEventListener("click", () => {
        popover.hide()
        confirmationWrapper.classList.remove("d-none")
    })

    //Close the delete confirmation modal
    cancelDelete.addEventListener("click", () => {
        confirmationWrapper.classList.add("d-none")
    })

    //Delete the user's display picture
    confirmDelete.addEventListener("click", () => {
        DeleteImageForm.submit()
    })


})


// Closing the camera preview sectconst
closeCamera.addEventListener("click", () => {
    closeVideoStream()
    capturePhotoSection.classList.toggle("d-none")
})

// Saving the photo to the database
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
            alert(error)
        });
    // picture preview should disappear 
    // and camera preview should appear in the dom tree based on the
    // default html page
    picturePreview.classList.toggle("d-none")
    cameraPreview.classList.toggle("d-none")
        //Closes the capture Photo section 
    capturePhotoSection.classList.toggle("d-none")

});

// Cancelling the photo. This will clear the canvas and the picture preview
cancelPhoto.addEventListener("click", () => {
    // Clearing the entire canvas
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    // picture preview should disappear 
    // and camera preview should appear in the dom tree based on the
    // default html page
    picturePreview.classList.toggle("d-none")
    cameraPreview.classList.toggle("d-none")
        //Closes the capture Photo section 
    capturePhotoSection.classList.toggle("d-none")
});

// The makes the bio input editable
editBio.addEventListener("click", () => {
    bioInput.disabled = false
    bioInput.style.borderBottomWidth = "2px";
    bioInput.focus()
})