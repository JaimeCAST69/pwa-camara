// Referencias a elementos del DOM
const openCameraBtn = document.getElementById('openCamera');
const cameraContainer = document.getElementById('cameraContainer');
const video = document.getElementById('video');
const takePhotoBtn = document.getElementById('takePhoto');
const switchCameraBtn = document.getElementById('switchCamera');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Referencias para la galería
const gallery = document.getElementById('gallery');
const photoCount = document.getElementById('photoCount');
const clearGalleryBtn = document.getElementById('clearGallery');

let stream = null;
let currentFacingMode = 'environment'; // 'environment' para trasera, 'user' para frontal
let photoStorage = []; // Array para almacenar las fotos

async function openCamera() {
    try {
        await startCamera(currentFacingMode);
        
        cameraContainer.style.display = 'block';
        openCameraBtn.textContent = 'Cámara Abierta';
        openCameraBtn.disabled = true;
        
        console.log('Cámara abierta exitosamente');
    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        alert('No se pudo acceder a la cámara. Asegúrate de dar permisos.');
    }
}

async function startCamera(facingMode) {
    // Cerrar stream anterior si existe
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }

    const constraints = {
        video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 }
        }
    };

    stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
}

function takePhoto() {
    if (!stream) {
        alert('Primero debes abrir la cámara');
        return;
    }

    // Configurar canvas con alta resolución
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    
    // Mejorar calidad de renderizado
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Capturar con mejor calidad (JPEG con alta calidad)
    const imageDataURL = canvas.toDataURL('image/jpeg', 0.95);
    console.log('Foto capturada en base64:', imageDataURL);
    console.log('Resolución:', canvas.width, 'x', canvas.height);
    console.log('Longitud del string:', imageDataURL.length, 'caracteres');
    
    // Agregar la foto a la galería
    addPhotoToGallery(imageDataURL);
    
    closeCamera();
}

async function switchCamera() {
    if (!stream) {
        alert('Primero debes abrir la cámara');
        return;
    }

    try {
        // Cambiar entre cámara frontal y trasera
        currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
        
        // Reiniciar la cámara con la nueva configuración
        await startCamera(currentFacingMode);
        
        // Actualizar el texto del botón para indicar qué cámara está activa
        const cameraType = currentFacingMode === 'environment' ? 'trasera' : 'frontal';
        console.log(`Cambiado a cámara ${cameraType}`);
        
    } catch (error) {
        console.error('Error al cambiar de cámara:', error);
        // Si falla, volver a la cámara anterior
        currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
        alert('No se pudo cambiar a la otra cámara. Es posible que no esté disponible.');
    }
}

function closeCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;

        video.srcObject = null;
        cameraContainer.style.display = 'none';
        
        openCameraBtn.textContent = 'Abrir Cámara';
        openCameraBtn.disabled = false;
        
        console.log('Cámara cerrada');
    }
}

openCameraBtn.addEventListener('click', openCamera);
takePhotoBtn.addEventListener('click', takePhoto);
switchCameraBtn.addEventListener('click', switchCamera);
clearGalleryBtn.addEventListener('click', clearGallery);

// Funciones de la galería
function addPhotoToGallery(imageDataURL) {
    const photoId = Date.now(); // ID único basado en timestamp
    const photoData = {
        id: photoId,
        dataURL: imageDataURL,
        date: new Date().toLocaleString()
    };
    
    photoStorage.push(photoData);
    saveToLocalStorage();
    renderGallery();
    updatePhotoCount();
    
    console.log(`Foto agregada a la galería. Total: ${photoStorage.length} fotos`);
}

function renderGallery() {
    gallery.innerHTML = '';
    
    photoStorage.forEach(photo => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.innerHTML = `
            <img src="${photo.dataURL}" alt="Foto ${photo.id}" onclick="viewFullPhoto('${photo.dataURL}')">
            <button class="delete-btn" onclick="deletePhoto(${photo.id})" title="Eliminar foto">×</button>
        `;
        gallery.appendChild(galleryItem);
    });
}

function deletePhoto(photoId) {
    if (confirm('¿Estás seguro de que quieres eliminar esta foto?')) {
        photoStorage = photoStorage.filter(photo => photo.id !== photoId);
        saveToLocalStorage();
        renderGallery();
        updatePhotoCount();
        console.log(`Foto ${photoId} eliminada`);
    }
}

function clearGallery() {
    if (photoStorage.length === 0) {
        alert('La galería ya está vacía');
        return;
    }
    
    if (confirm(`¿Estás seguro de que quieres eliminar todas las ${photoStorage.length} fotos?`)) {
        photoStorage = [];
        saveToLocalStorage();
        renderGallery();
        updatePhotoCount();
        console.log('Galería limpiada');
    }
}

function viewFullPhoto(dataURL) {
    const newWindow = window.open();
    newWindow.document.write(`
        <html>
            <head><title>Foto - Cámara PWA</title></head>
            <body style="margin:0; background:#000; display:flex; justify-content:center; align-items:center; min-height:100vh;">
                <img src="${dataURL}" style="max-width:100%; max-height:100%; object-fit:contain;">
            </body>
        </html>
    `);
}

function updatePhotoCount() {
    photoCount.textContent = `${photoStorage.length} foto${photoStorage.length !== 1 ? 's' : ''} guardada${photoStorage.length !== 1 ? 's' : ''}`;
}

function saveToLocalStorage() {
    try {
        localStorage.setItem('cameraGallery', JSON.stringify(photoStorage));
    } catch (error) {
        console.error('Error al guardar en localStorage:', error);
    }
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('cameraGallery');
        if (saved) {
            photoStorage = JSON.parse(saved);
            renderGallery();
            updatePhotoCount();
            console.log(`Cargadas ${photoStorage.length} fotos desde localStorage`);
        }
    } catch (error) {
        console.error('Error al cargar desde localStorage:', error);
        photoStorage = [];
    }
}

// Cargar fotos guardadas al iniciar
window.addEventListener('load', () => {
    loadFromLocalStorage();
});

window.addEventListener('beforeunload', () => {
    closeCamera();
});