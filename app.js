// Referencias a elementos del DOM
const openCameraBtn = document.getElementById('openCamera');
const cameraContainer = document.getElementById('cameraContainer');
const video = document.getElementById('video');
const takePhotoBtn = document.getElementById('takePhoto');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let stream = null;

async function openCamera() {
    try {
        const constraints = {
            video: {
                facingMode: { ideal: 'environment' },
                width: { ideal: 320 },
                height: { ideal: 240 }
            }
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        
        cameraContainer.style.display = 'block';
        openCameraBtn.textContent = 'Cámara Abierta';
        openCameraBtn.disabled = true;
        
        console.log('Cámara abierta exitosamente');
    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        alert('No se pudo acceder a la cámara. Asegúrate de dar permisos.');
    }
}

function takePhoto() {
    if (!stream) {
        alert('Primero debes abrir la cámara');
        return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataURL = canvas.toDataURL('image/png');
    console.log('Foto capturada en base64:', imageDataURL.length, 'caracteres');
    
    closeCamera();
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

window.addEventListener('beforeunload', () => {
    closeCamera();
});