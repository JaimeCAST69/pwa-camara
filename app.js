// Referencias a elementos del DOM
const openCameraBtn = document.getElementById('openCamera');
const cameraContainer = document.getElementById('cameraContainer');
const video = document.getElementById('video');
const takePhotoBtn = document.getElementById('takePhoto');
const switchCameraBtn = document.getElementById('switchCamera');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let stream = null;
let currentFacingMode = 'environment'; // 'environment' para trasera, 'user' para frontal

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
            width: { ideal: 320 },
            height: { ideal: 240 }
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

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataURL = canvas.toDataURL('image/png');
    console.log('Foto capturada en base64:', imageDataURL);
    console.log('Longitud del string:', imageDataURL.length, 'caracteres');
    
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

window.addEventListener('beforeunload', () => {
    closeCamera();
});