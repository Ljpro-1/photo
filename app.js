// =====================================
// CropFlex Professional Engine
// Part 1/2
// =====================================

// UI Nodes
const upload = document.getElementById('upload');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');


const targetSizeInput =
    document.getElementById('targetSize');

const openSaveModalBtn = document.getElementById('openSaveModalBtn');
const imageInfo = document.getElementById('imageInfo');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Modal
const saveModal = document.getElementById('saveModal');
const filenameInput = document.getElementById('filenameInput');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const confirmDownloadBtn = document.getElementById('confirmDownloadBtn');

// Placeholder
const placeholderText = document.getElementById('placeholderText');

// State
let img = new Image();

let imgWidth = 0;
let imgHeight = 0;

let cropX = 0;
let cropY = 0;
let cropW = 0;
let cropH = 0;

let isDragging = false;
let startX = 0;
let startY = 0;

// =====================================
// LOAD IMAGE
// =====================================

upload.addEventListener('change', (e) => {
    
    const file = e.target.files[0];
    
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
        img.src = event.target.result;
    };
    
    reader.readAsDataURL(file);
    
});

img.onload = () => {
    
    imgWidth = img.width;
    imgHeight = img.height;
    
    imageInfo.textContent =
        `Loaded : ${imgWidth} × ${imgHeight}px`;
    
    canvas.width = imgWidth;
    canvas.height = imgHeight;
    
    placeholderText.style.display = 'none';
    
    openSaveModalBtn.disabled = false;
    
    calculateProfessionalCrop(true);
    
};

// =====================================
// INPUT EVENTS
// =====================================

widthInput.addEventListener('input', () => {
    calculateProfessionalCrop(false);
});

heightInput.addEventListener('input', () => {
    calculateProfessionalCrop(false);
});

// =====================================
// CROP CALCULATOR
// =====================================

function calculateProfessionalCrop(center) {
    
    if (!img.src) return;
    
    const targetW =
        parseInt(widthInput.value) || 200;
    
    const targetH =
        parseInt(heightInput.value) || 200;
    
    const targetRatio =
        targetW / targetH;
    
    const imageRatio =
        imgWidth / imgHeight;
    
    const oldCenterX =
        cropX + cropW / 2;
    
    const oldCenterY =
        cropY + cropH / 2;
    
    if (imageRatio > targetRatio) {
        
        cropH = imgHeight;
        cropW = imgHeight * targetRatio;
        
    } else {
        
        cropW = imgWidth;
        cropH = imgWidth / targetRatio;
        
    }
    
    if (center) {
        
        cropX =
            (imgWidth - cropW) / 2;
        
        cropY =
            (imgHeight - cropH) / 2;
        
    } else {
        
        cropX =
            oldCenterX - cropW / 2;
        
        cropY =
            oldCenterY - cropH / 2;
        
    }
    
    keepCropInsideImage();
    
    renderFrame();
    
}

// =====================================
// BOUNDARIES
// =====================================

function keepCropInsideImage() {
    
    if (cropX < 0)
        cropX = 0;
    
    if (cropY < 0)
        cropY = 0;
    
    if (cropX + cropW > imgWidth)
        cropX = imgWidth - cropW;
    
    if (cropY + cropH > imgHeight)
        cropY = imgHeight - cropH;
    
}

// =====================================
// HIGH QUALITY RENDER
// =====================================

function renderFrame() {
    
    if (!img.src) return;
    
    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    ctx.drawImage(
        img,
        0,
        0,
        imgWidth,
        imgHeight
    );
    
    ctx.fillStyle =
        "rgba(0,0,0,0.60)";
    
    ctx.fillRect(
        0,
        0,
        imgWidth,
        cropY
    );
    
    ctx.fillRect(
        0,
        cropY + cropH,
        imgWidth,
        imgHeight - (cropY + cropH)
    );
    
    ctx.fillRect(
        0,
        cropY,
        cropX,
        cropH
    );
    
    ctx.fillRect(
        cropX + cropW,
        cropY,
        imgWidth - (cropX + cropW),
        cropH
    );
    
    ctx.strokeStyle = "#3A7CA5";
    
    ctx.lineWidth =
        Math.max(
            3,
            imgWidth * 0.004
        );
    
    ctx.strokeRect(
        cropX,
        cropY,
        cropW,
        cropH
    );
    
    drawCorners();
    
}


// =====================================
// CropFlex Professional Engine
// Part 2/2
// =====================================

// =====================================
// CROP CORNERS
// =====================================

function drawCorners() {

    ctx.fillStyle = "#3A7CA5";

    const cornerW = cropW * 0.04;
    const cornerH = cropH * 0.04;

    const thickness =
        Math.max(
            5,
            imgWidth * 0.006
        );

    // Top Left
    ctx.fillRect(
        cropX,
        cropY,
        cornerW,
        thickness
    );

    ctx.fillRect(
        cropX,
        cropY,
        thickness,
        cornerH
    );

    // Top Right
    ctx.fillRect(
        cropX + cropW - cornerW,
        cropY,
        cornerW,
        thickness
    );

    ctx.fillRect(
        cropX + cropW - thickness,
        cropY,
        thickness,
        cornerH
    );

    // Bottom Left
    ctx.fillRect(
        cropX,
        cropY + cropH - thickness,
        cornerW,
        thickness
    );

    ctx.fillRect(
        cropX,
        cropY + cropH - cornerH,
        thickness,
        cornerH
    );

    // Bottom Right
    ctx.fillRect(
        cropX + cropW - cornerW,
        cropY + cropH - thickness,
        cornerW,
        thickness
    );

    ctx.fillRect(
        cropX + cropW - thickness,
        cropY + cropH - cornerH,
        thickness,
        cornerH
    );

}

// =====================================
// DRAG START
// =====================================

function handleStart(clientX, clientY) {

    if (!img.src) return;

    const rect =
        canvas.getBoundingClientRect();

    const canvasX =
        (clientX - rect.left) *
        (canvas.width / rect.width);

    const canvasY =
        (clientY - rect.top) *
        (canvas.height / rect.height);

    const insideCrop =
        canvasX >= cropX &&
        canvasX <= cropX + cropW &&
        canvasY >= cropY &&
        canvasY <= cropY + cropH;

    if (!insideCrop) return;

    isDragging = true;

    startX =
        canvasX - cropX;

    startY =
        canvasY - cropY;

}

// =====================================
// DRAG MOVE
// =====================================

function handleMove(clientX, clientY) {

    if (!isDragging) return;

    const rect =
        canvas.getBoundingClientRect();

    const canvasX =
        (clientX - rect.left) *
        (canvas.width / rect.width);

    const canvasY =
        (clientY - rect.top) *
        (canvas.height / rect.height);

    cropX =
        canvasX - startX;

    cropY =
        canvasY - startY;

    keepCropInsideImage();

    renderFrame();

}

// =====================================
// MOUSE EVENTS
// =====================================

canvas.addEventListener(
    'mousedown',
    (e) => {
        handleStart(
            e.clientX,
            e.clientY
        );
    }
);

window.addEventListener(
    'mouseup',
    () => {
        isDragging = false;
    }
);

canvas.addEventListener(
    'mousemove',
    (e) => {
        handleMove(
            e.clientX,
            e.clientY
        );
    }
);

// =====================================
// TOUCH EVENTS
// =====================================

canvas.addEventListener(
    'touchstart',
    (e) => {

        if (
            e.touches.length !== 1
        ) return;

        handleStart(
            e.touches[0].clientX,
            e.touches[0].clientY
        );

    },
    { passive: true }
);

window.addEventListener(
    'touchend',
    () => {
        isDragging = false;
    }
);

canvas.addEventListener(
    'touchmove',
    (e) => {

        if (
            e.touches.length !== 1
        ) return;

        e.preventDefault();

        handleMove(
            e.touches[0].clientX,
            e.touches[0].clientY
        );

    },
    { passive: false }
);

// =====================================
// SAVE MODAL
// =====================================

openSaveModalBtn.addEventListener(
    'click',
    () => {

        saveModal.classList.add(
            'active'
        );

        filenameInput.focus();

        filenameInput.select();

    }
);

cancelModalBtn.addEventListener(
    'click',
    () => {

        saveModal.classList.remove(
            'active'
        );

    }
);

// =====================================
// EXPORT PNG
// =====================================

confirmDownloadBtn.addEventListener(
    'click',
    async () => {
        
        let filename =
            filenameInput.value.trim();
        
        if (!filename) {
            filename = 'cropped-asset';
        }
        
        const targetW =
            parseInt(widthInput.value) || 200;
        
        const targetH =
            parseInt(heightInput.value) || 200;
        
        const targetKB =
            parseInt(targetSizeInput.value) || 200;
        
        const tempCanvas =
            document.createElement('canvas');
        
        tempCanvas.width = targetW;
        tempCanvas.height = targetH;
        
        const tempCtx =
            tempCanvas.getContext('2d');
        
        tempCtx.imageSmoothingEnabled = true;
        tempCtx.imageSmoothingQuality = 'high';
        
        const sx = Math.round(cropX);
        const sy = Math.round(cropY);
        const sw = Math.round(cropW);
        const sh = Math.round(cropH);
        
        tempCtx.drawImage(
            img,
            sx,
            sy,
            sw,
            sh,
            0,
            0,
            targetW,
            targetH
        );
        
        let quality = 0.95;
        
        let blob =
            await new Promise(resolve =>
                tempCanvas.toBlob(
                    resolve,
                    'image/jpeg',
                    quality
                )
            );
        
        while (
            blob.size >
            targetKB * 1024 &&
            quality > 0.1
        ) {
            
            quality -= 0.05;
            
            blob =
                await new Promise(resolve =>
                    tempCanvas.toBlob(
                        resolve,
                        'image/jpeg',
                        quality
                    )
                );
        }
        
        const url =
            URL.createObjectURL(blob);
        
        const link =
            document.createElement('a');
        
        link.href = url;
        
        link.download =
            `${filename}.jpg`;
        
        link.click();
        
        URL.revokeObjectURL(url);
        
        saveModal.classList.remove('active');
        
    }
);confirmDownloadBtn.addEventListener(
    'click',
    async () => {

        let filename =
            filenameInput.value.trim();

        if (!filename) {
            filename = 'cropped-asset';
        }

        const targetW =
            parseInt(widthInput.value) || 200;

        const targetH =
            parseInt(heightInput.value) || 200;

        const targetKB =
            parseInt(targetSizeInput.value) || 200;

        const tempCanvas =
            document.createElement('canvas');

        tempCanvas.width = targetW;
        tempCanvas.height = targetH;

        const tempCtx =
            tempCanvas.getContext('2d');

        tempCtx.imageSmoothingEnabled = true;
        tempCtx.imageSmoothingQuality = 'high';

        const sx = Math.round(cropX);
        const sy = Math.round(cropY);
        const sw = Math.round(cropW);
        const sh = Math.round(cropH);

        tempCtx.drawImage(
            img,
            sx,
            sy,
            sw,
            sh,
            0,
            0,
            targetW,
            targetH
        );

        let quality = 0.95;

        let blob =
            await new Promise(resolve =>
                tempCanvas.toBlob(
                    resolve,
                    'image/jpeg',
                    quality
                )
            );

        while (
            blob.size >
            targetKB * 1024 &&
            quality > 0.1
        ) {

            quality -= 0.05;

            blob =
                await new Promise(resolve =>
                    tempCanvas.toBlob(
                        resolve,
                        'image/jpeg',
                        quality
                    )
                );
        }

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement('a');

        link.href = url;

        link.download =
            `${filename}.jpg`;

        link.click();

        URL.revokeObjectURL(url);

        saveModal.classList.remove('active');

    }
);
