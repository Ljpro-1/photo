// UI Node Selectors
const upload = document.getElementById('upload');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const openSaveModalBtn = document.getElementById('openSaveModalBtn');
const imageInfo = document.getElementById('imageInfo');
const canvasContainer = document.getElementById('canvasContainer');
const placeholderText = document.getElementById('placeholderText');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Save Filename Modal Nodes
const saveModal = document.getElementById('saveModal');
const filenameInput = document.getElementById('filenameInput');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const confirmDownloadBtn = document.getElementById('confirmDownloadBtn');

// Engine State variables
let img = new Image();
let imgWidth = 0;
let imgHeight = 0;

// Dimensions de la cage de sélection calculée
let cropX = 0;
let cropY = 0;
let cropW = 0;
let cropH = 0;

// État du drag-and-drop
let isDragging = false;
let startX = 0;
let startY = 0;

// Gestion de l'importation de l'image
upload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

// Initialisation dès que l'image est chargée en mémoire interne
img.onload = () => {
    imgWidth = img.width;
    imgHeight = img.height;
    
    imageInfo.textContent = `Asset Loaded: ${imgWidth}×${imgHeight}px`;
    
    // Le canvas principal s'adapte à la taille brute de l'image originale
    canvas.width = imgWidth;
    canvas.height = imgHeight;
    
    placeholderText.style.display = 'none';
    openSaveModalBtn.disabled = false;
    
    calculateProfessionalCrop(true); // true = recentrer au premier chargement
};

// Écouter les changements de tailles
widthInput.addEventListener('input', () => calculateProfessionalCrop(false));
heightInput.addEventListener('input', () => calculateProfessionalCrop(false));

// Algorithme de calcul de la zone de découpe (Similaire à CSS background-size: cover)
function calculateProfessionalCrop(shouldCenter) {
    if (!img.src) return;

    const targetW = parseInt(widthInput.value) || 200;
    const targetH = parseInt(heightInput.value) || 200;

    const targetRatio = targetW / targetH;
    const imgRatio = imgWidth / imgHeight;

    // Sauvegarder l'ancien centre pour éviter que le cadre saute lors du changement de taille
    const oldCenterX = cropX + cropW / 2;
    const oldCenterY = cropY + cropH / 2;

    if (imgRatio > targetRatio) {
        cropH = imgHeight;
        cropW = imgHeight * targetRatio;
    } else {
        cropW = imgWidth;
        cropH = imgWidth / targetRatio;
    }

    if (shouldCenter) {
        cropX = (imgWidth - cropW) / 2;
        cropY = (imgHeight - cropH) / 2;
    } else {
        // Ajuster la position en se basant sur l'ancien centre
        cropX = oldCenterX - cropW / 2;
        cropY = oldCenterY - cropH / 2;
    }

    keepCageInBounds();
    renderFrame();
}

// Bloquer la cage pour qu'elle ne sorte jamais des limites physiques de la photo
function keepCageInBounds() {
    if (cropX < 0) cropX = 0;
    if (cropY < 0) cropY = 0;
    if (cropX + cropW > imgWidth) cropX = imgWidth - cropW;
    if (cropY + cropH > imgHeight) cropY = imgHeight - cropH;
}

// Moteur de rendu graphique de l'espace de travail
function renderFrame() {
    if (!img.src) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Dessiner l'image brute d'origine
    ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
    
    // 2. Appliquer l'effet de masque sombre sur les zones extérieures exclues
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, imgWidth, cropY); // Haut
    ctx.fillRect(0, cropY + cropH, imgWidth, imgHeight - (cropY + cropH)); // Bas
    ctx.fillRect(0, cropY, cropX, cropH); // Gauche
    ctx.fillRect(cropX + cropW, cropY, imgWidth - (cropX + cropW), cropH); // Droite
    
    // 3. Dessiner la cage de repère lumineuse (Bleu Ardoise) autour de la zone finale
    ctx.strokeStyle = "#3A7CA5";
    ctx.lineWidth = Math.max(3, imgWidth * 0.004);
    ctx.strokeRect(cropX, cropY, cropW, cropH);
    
    // Coins renforcés professionnels (Viseur)
    ctx.fillStyle = "#3A7CA5";
    const cornerW = cropW * 0.04;
    const cornerH = cropH * 0.04;
    const thick = Math.max(5, imgWidth * 0.006);
    
    ctx.fillRect(cropX, cropY, cornerW, thick);
    ctx.fillRect(cropX, cropY, thick, cornerH);
    ctx.fillRect(cropX + cropW - cornerW, cropY, cornerW, thick);
    ctx.fillRect(cropX + cropW - thick, cropY, thick, cornerH);
    ctx.fillRect(cropX, cropY + cropH - thick, cornerW, thick);
    ctx.fillRect(cropX, cropY + cropH - cornerH, thick, cornerH);
    ctx.fillRect(cropX + cropW - cornerW, cropY + cropH - thick, cornerW, thick);
    ctx.fillRect(cropX + cropW - thick, cropY + cropH - cornerH, thick, cornerH);
}

// --- LOGIQUE DE DÉPLACEMENT MANUEL DE LA CAGE ---
function handleStart(clientX, clientY) {
    if (!img.src) return;

    // Convertir les coordonnées écran en coordonnées réelles du canvas (gestion du zoom CSS)
    const rect = canvas.getBoundingClientRect();
    const canvasX = (clientX - rect.left) * (canvas.width / rect.width);
    const canvasY = (clientY - rect.top) * (canvas.height / rect.height);

    // Vérifier si le clic de l'utilisateur est bien à l'intérieur de la cage bleue
    if (canvasX >= cropX && canvasX <= cropX + cropW && canvasY >= cropY && canvasY <= cropY + cropH) {
        isDragging = true;
        startX = canvasX - cropX;
        startY = canvasY - cropY;
    }
}

function handleMove(clientX, clientY) {
    if (!isDragging) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = (clientX - rect.left) * (canvas.width / rect.width);
    const canvasY = (clientY - rect.top) * (canvas.height / rect.height);

    cropX = canvasX - startX;
    cropY = canvasY - startY;

    keepCageInBounds();
    renderFrame();
}

// Événements Souris (PC)
canvas.addEventListener('mousedown', (e) => handleStart(e.clientX, e.clientY));
window.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));

// Événements Tactiles (Téléphones / Tablettes)
canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) handleStart(e.touches[0].clientX, e.touches[0].clientY);
});
window.addEventListener('touchend', () => isDragging = false);
canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
        e.preventDefault(); // Empêche l'écran du téléphone de bouger pendant qu'on glisse la cage
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
});

// --- Modal Workflow ---
openSaveModalBtn.addEventListener('click', () => {
    saveModal.classList.add('active');
    filenameInput.focus();
    filenameInput.select();
});

cancelModalBtn.addEventListener('click', () => {
    saveModal.classList.remove('active');
});

// Traitement de l'exportation finale et téléchargement
confirmDownloadBtn.addEventListener('click', () => {
    let sanitizedName = filenameInput.value.trim();
    if (!sanitizedName) sanitizedName = 'studio-export';

    const targetW = parseInt(widthInput.value) || 200;
    const targetH = parseInt(heightInput.value) || 200;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = targetW;
    tempCanvas.height = targetH;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Découpe chirurgicale haut de gamme basée sur l'emplacement choisi par l'utilisateur
    tempCtx.drawImage(
        img, 
        cropX, cropY, cropW, cropH,  
        0, 0, targetW, targetH       
    );

    const downloadLink = document.createElement('a');
    downloadLink.download = `${sanitizedName}.png`;
    downloadLink.href = tempCanvas.toDataURL('image/png');
    downloadLink.click();

    saveModal.classList.remove('active');
});
