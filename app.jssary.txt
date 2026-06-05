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
    () => {

        let filename =
            filenameInput.value.trim();

        if (!filename) {
            filename =
                'cropped-image';
        }

        const targetW =
            parseInt(
                widthInput.value
            ) || 200;

        const targetH =
            parseInt(
                heightInput.value
            ) || 200;

        const tempCanvas =
            document.createElement(
                'canvas'
            );

        tempCanvas.width =
            targetW;

        tempCanvas.height =
            targetH;

        const tempCtx =
            tempCanvas.getContext(
                '2d'
            );

        tempCtx.imageSmoothingEnabled =
            true;

        tempCtx.imageSmoothingQuality =
            'high';

        const sx =
            Math.round(cropX);

        const sy =
            Math.round(cropY);

        const sw =
            Math.round(cropW);

        const sh =
            Math.round(cropH);

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

        tempCanvas.toBlob(
            (blob) => {

                const url =
                    URL.createObjectURL(
                        blob
                    );

                const link =
                    document.createElement(
                        'a'
                    );

                link.href =
                    url;

                link.download =
                    `${filename}.jpg`;

                link.click();

                URL.revokeObjectURL(
                    url
                );

            },
            'image/jpeg',
            0.95
        );

        saveModal.classList.remove(
            'active'
        );

    }
);





const compressUpload =
    document.getElementById(
        'compressUpload'
    );

const compressPreview =
    document.getElementById(
        'compressPreview'
    );

const compressPlaceholder =
    document.getElementById(
        'compressPlaceholder'
    );

const compressInfo =
    document.getElementById(
        'compressInfo'
    );

const compressExportBtn =
    document.getElementById(
        'compressExportBtn'
    );

const compressTargetKB =
    document.getElementById(
        'compressTargetKB'
    );

let compressFile = null;

compressUpload.addEventListener(
    'change',
    (e) => {

        compressFile =
            e.target.files[0];

        if (!compressFile) return;

              
           const bytes =
    compressFile.size;

let sizeText;

if (bytes >= 1000000) {

    sizeText =
        `${(bytes / 1000000).toFixed(2)} MB`;

} else {

    sizeText =
        `${(bytes / 1000).toFixed(2)} KB`;

}

compressInfo.textContent =
    `Original Size : ${sizeText}`;

        compressPreview.src =
            URL.createObjectURL(
                compressFile
            );

        compressPreview.style.display =
            'block';

        compressPlaceholder.style.display =
            'none';

    }
);

compressExportBtn.addEventListener(
    'click',
    async () => {

        if (!compressFile) {

            alert(
                'Import image first'
            );

            return;
        }

        const targetKB =
            parseInt(
                compressTargetKB.value
            ) || 300;

        const img =
            new Image();

        img.src =
            URL.createObjectURL(
                compressFile
            );

        await new Promise(
            resolve =>
                img.onload =
                resolve
        );

        const canvas =
            document.createElement(
                'canvas'
            );

        canvas.width =
            img.width;

        canvas.height =
            img.height;

        const ctx =
            canvas.getContext(
                '2d'
            );

        ctx.drawImage(
            img,
            0,
            0
        );

        let quality = 0.95;

        let blob =
            await new Promise(
                resolve =>
                    canvas.toBlob(
                        resolve,
                        'image/jpeg',
                        quality
                    )
            );

        while (
            blob.size >
            targetKB * 1024 &&
            quality > 0.05
        ) {

            quality -= 0.05;

            blob =
                await new Promise(
                    resolve =>
                        canvas.toBlob(
                            resolve,
                            'image/jpeg',
                            quality
                        )
                );
        }

        const url =
            URL.createObjectURL(
                blob
            );

        const a =
            document.createElement(
                'a'
            );

        a.href = url;

        a.download =
            'compressed-image.jpg';

        a.click();

        URL.revokeObjectURL(
            url
        );

    }
);





// =====================================
// ASPECT RATIO FORMATTER
// =====================================

const ratioUpload =
    document.getElementById(
        'ratioUpload'
    );

const ratioCanvas =
    document.getElementById(
        'ratioCanvas'
    );

const ratioCtx =
    ratioCanvas.getContext(
        '2d'
    );

const ratioSelect =
    document.getElementById(
        'ratioSelect'
    );

const ratioInfo =
    document.getElementById(
        'ratioInfo'
    );

const ratioPlaceholder =
    document.getElementById(
        'ratioPlaceholder'
    );

const ratioExportBtn =
    document.getElementById(
        'ratioExportBtn'
    );

let ratioImage =
    new Image();
    
    let ratioCropX = 0;
let ratioCropY = 0;

let ratioCropW = 0;
let ratioCropH = 0;

let ratioDragging = false;

let ratioStartX = 0;
let ratioStartY = 0;

ratioUpload.addEventListener(
    'change',
    e => {

        const file =
            e.target.files[0];

        if (!file) return;

        ratioImage.src =
            URL.createObjectURL(
                file
            );

        const sizeMB =
            (
                file.size /
                1000000
            ).toFixed(2);

        ratioInfo.textContent =
            `Original Size : ${sizeMB} MB`;

    }
);

ratioImage.onload = () => {

    ratioPlaceholder.style.display =
        'none';

    const detectedRatio =
        detectRatio(
            ratioImage.width,
            ratioImage.height
        );

    ratioInfo.textContent =
        `Original Ratio : ${detectedRatio} | ${ratioImage.width} × ${ratioImage.height}px`;

    drawRatioCanvas();

};
ratioSelect.addEventListener(
    'change',
    drawRatioCanvas
);

function drawRatioCanvas(){

    if (!ratioImage.src) return;
    
    
    ratioCtx.clearRect(
    0,
    0,
    ratioCanvas.width,
    ratioCanvas.height
);

    const ratio =
        ratioSelect.value;

    const parts =
        ratio.split(':');

    const rw =
        parseInt(parts[0]);

    const rh =
        parseInt(parts[1]);

    const targetRatio =
        rw / rh;

    let cropW;
    let cropH;

    if (
        ratioImage.width /
        ratioImage.height >
        targetRatio
    ){

        cropH =
            ratioImage.height;

        cropW =
            cropH *
            targetRatio;

    } else {

        cropW =
            ratioImage.width;

        cropH =
            cropW /
            targetRatio;

    }

    ratioCropW = cropW;
ratioCropH = cropH;

if (
    ratioCropX === 0 &&
    ratioCropY === 0
) {

    ratioCropX =
        (
            ratioImage.width -
            cropW
        ) / 2;

    ratioCropY =
        (
            ratioImage.height -
            cropH
        ) / 2;

}

const sx = ratioCropX;
const sy = ratioCropY;

    ratioCanvas.width =
        cropW;

    ratioCanvas.height =
        cropH;

    ratioCtx.drawImage(
        ratioImage,
        sx,
        sy,
        cropW,
        cropH,
        0,
        0,
        cropW,
        cropH
    );
}



function detectRatio(width, height){

    const ratios = [
        [1,1],
        [2,3],
        [3,2],
        [4,3],
        [16,9],
        [9,16]
    ];

    const current =
        width / height;

    let closest =
        "Custom";

    let minDiff =
        Infinity;

    ratios.forEach(r => {

        const value =
            r[0] / r[1];

        const diff =
            Math.abs(
                current - value
            );

        if(diff < minDiff){

            minDiff = diff;

            closest =
                `${r[0]}:${r[1]}`;
        }

    });

    return closest;
}

ratioCanvas.addEventListener(
    'mousedown',
    e => {

        ratioDragging = true;

        ratioStartX = e.offsetX;
        ratioStartY = e.offsetY;

    }
);

window.addEventListener(
    'mouseup',
    () => {

        ratioDragging = false;

    }
);

ratioCanvas.addEventListener(
    'mousemove',
    e => {

        if (!ratioDragging) return;

        const dx =
            e.offsetX - ratioStartX;

        const dy =
            e.offsetY - ratioStartY;

        ratioCropX -= dx;
        ratioCropY -= dy;

        if (ratioCropX < 0)
            ratioCropX = 0;

        if (ratioCropY < 0)
            ratioCropY = 0;

        if (
            ratioCropX + ratioCropW >
            ratioImage.width
        ) {

            ratioCropX =
                ratioImage.width -
                ratioCropW;

        }

        if (
            ratioCropY + ratioCropH >
            ratioImage.height
        ) {

            ratioCropY =
                ratioImage.height -
                ratioCropH;

        }

        ratioStartX = e.offsetX;
        ratioStartY = e.offsetY;

        drawRatioCanvas();

    }
);


ratioCanvas.addEventListener(
    'touchstart',
    e => {

        if (
            e.touches.length !== 1
        ) return;

        ratioDragging = true;

        ratioStartX =
            e.touches[0].clientX;

        ratioStartY =
            e.touches[0].clientY;

    },
    { passive:true }
);

window.addEventListener(
    'touchend',
    () => {

        ratioDragging = false;

    }
);

ratioCanvas.addEventListener(
    'touchmove',
    e => {

        if (!ratioDragging)
            return;

        e.preventDefault();

        const currentX =
            e.touches[0].clientX;

        const currentY =
            e.touches[0].clientY;

        const dx =
            currentX -
            ratioStartX;

        const dy =
            currentY -
            ratioStartY;

        ratioCropX -= dx;
        ratioCropY -= dy;

        if (ratioCropX < 0)
            ratioCropX = 0;

        if (ratioCropY < 0)
            ratioCropY = 0;

        if (
            ratioCropX +
            ratioCropW >
            ratioImage.width
        ) {

            ratioCropX =
                ratioImage.width -
                ratioCropW;

        }

        if (
            ratioCropY +
            ratioCropH >
            ratioImage.height
        ) {

            ratioCropY =
                ratioImage.height -
                ratioCropH;

        }

        ratioStartX =
            currentX;

        ratioStartY =
            currentY;

        drawRatioCanvas();

    },
    { passive:false }
);




ratioExportBtn.addEventListener(
    'click',
    () => {

        if (
            !ratioImage.src
        ) return;

        ratioCanvas.toBlob(
            blob => {

                const url =
                    URL.createObjectURL(
                        blob
                    );

                const a =
                    document.createElement(
                        'a'
                    );

                a.href =
                    url;

                a.download =
                    'ratio-image.jpg';

                a.click();

                URL.revokeObjectURL(
                    url
                );

            },
            'image/jpeg',
            0.95
        );

    }
);


// ============================
// PWA INSTALL
// ============================

const installBtn =
    document.getElementById(
        'installBtn'
    );

let deferredPrompt =
    null;

window.addEventListener(
    'beforeinstallprompt',
    (e) => {

        e.preventDefault();

        deferredPrompt = e;

        installBtn.hidden =
            false;

    }
);

installBtn.addEventListener(
    'click',
    async () => {

        if (
            !deferredPrompt
        ) {
            return;
        }

        deferredPrompt.prompt();

        await deferredPrompt.userChoice;

        deferredPrompt =
            null;

        installBtn.hidden =
            true;

    }
);

window.addEventListener(
    'appinstalled',
    () => {

        installBtn.hidden =
            true;

        deferredPrompt =
            null;

    }
);

if (
    'serviceWorker' in navigator
) {

    navigator
        .serviceWorker
        .register(
            './sw.js'
        );

}
