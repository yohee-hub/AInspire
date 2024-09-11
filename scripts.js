// Obtener el contexto del lienzo
const mainCanvas = document.getElementById("lienzo");
const context = mainCanvas.getContext("2d");

// Configuración inicial del lienzo
mainCanvas.width = mainCanvas.clientWidth;
mainCanvas.height = mainCanvas.clientHeight;

// Variables para manejar el dibujo
let initialX;
let initialY;
let isDrawing = false;
let isPincelActive = false;
let isGomaActive = false;
let isEscribirActive = false;
let currentText = "";
let cursorVisible = true;
let cursorInterval;
let currentX = 0;
let currentY = 0;
let currentColor = "#000";

// Obtener los elementos del DOM
const pincelButton = document.getElementById('pincel-btn');
const gomaButton = document.getElementById('goma-btn');
const escribirButton = document.getElementById('escribir-btn');
const colorPicker = document.getElementById('colores');
const borrarTodoButton = document.getElementById('borrar-btn');
const aiElements = document.querySelectorAll('.ai');
const logo = document.getElementById('logo');

// Función para cambiar el estado del pincel
pincelButton.addEventListener('click', () => {
    resetModes();
    isPincelActive = true;
    pincelButton.style.backgroundColor = colorPicker.value;
});

// Función para cambiar el estado del borrador
gomaButton.addEventListener('click', () => {
    resetModes();
    isGomaActive = true;
    gomaButton.style.backgroundColor = '#ffffff';
});

// Función para activar el modo de escritura
escribirButton.addEventListener('click', () => {
    resetModes();
    isEscribirActive = true;
    escribirButton.style.backgroundColor = '#ddd';
});

// Función para cambiar el color de trazo y otros elementos
colorPicker.addEventListener('input', (event) => {
    currentColor = event.target.value;
    if (isPincelActive) {
        pincelButton.style.backgroundColor = currentColor;
    }
    aiElements.forEach((element) => {
        element.style.color = currentColor;
    });
    updateLogoColor(currentColor);
});

// Función para actualizar el color del logo
const updateLogoColor = (color) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = logo.src;
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        for (let i = 0; i < data.length; i += 4) {
            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
        }
        ctx.putImageData(imageData, 0, 0);
        logo.src = canvas.toDataURL();
    };
};

// Función para dibujar en el lienzo
const dibujar = (cursorX, cursorY) => {
    if (isPincelActive || isGomaActive) {
        context.beginPath();
        context.moveTo(initialX, initialY);
        context.lineWidth = 3;
        context.strokeStyle = isPincelActive ? currentColor : "#ffffff";
        context.lineCap = "round";
        context.lineJoin = "round";
        context.lineTo(cursorX, cursorY);
        context.stroke();
        initialX = cursorX;
        initialY = cursorY;
    }
};

// Función para manejar eventos del mouse
const mouseDown = (evt) => {
    if (isPincelActive || isGomaActive) {
        isDrawing = true;
        initialX = evt.offsetX;
        initialY = evt.offsetY;
        dibujar(initialX, initialY);
        mainCanvas.addEventListener('mousemove', mouseMoving);
    } else if (isEscribirActive) {
        currentX = evt.offsetX;
        currentY = evt.offsetY;
        currentText = "";
        cursorVisible = true;
        clearInterval(cursorInterval);
        cursorInterval = setInterval(() => {
            cursorVisible = !cursorVisible;
            renderText();
        }, 500);
    }
};

const mouseMoving = (evt) => {
    if (isDrawing) {
        dibujar(evt.offsetX, evt.offsetY);
    }
};

const mouseUp = () => {
    isDrawing = false;
    mainCanvas.removeEventListener('mousemove', mouseMoving);
};

mainCanvas.addEventListener('mousedown', mouseDown);
mainCanvas.addEventListener('mouseup', mouseUp);
mainCanvas.addEventListener('mouseleave', mouseUp);

// Captura de eventos del teclado para escribir
window.addEventListener('keydown', (event) => {
    if (isEscribirActive) {
        if (event.key === "Backspace") {
            currentText = currentText.slice(0, -1);
        } else if (event.key.length === 1) {
            currentText += event.key;
        }
        renderText();
    }
});

// Función para renderizar el texto y el cursor en el lienzo
const renderText = () => {
    borrarTextoTemporal();
    context.fillStyle = currentColor;
    context.font = "20px Arial";
    context.fillText(currentText, currentX, currentY);
    if (cursorVisible) {
        const textWidth = context.measureText(currentText).width;
        context.fillRect(currentX + textWidth + 2, currentY - 15, 2, 20);
    }
};

// Limpiar el texto temporal de la pantalla
const borrarTextoTemporal = () => {
    const textWidth = context.measureText(currentText).width;
    context.clearRect(currentX, currentY - 20, textWidth + 10, 25);
};

// Función para borrar todo el lienzo
const borrarTodo = () => {
    context.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
};

// Evento para el botón de borrar todo
borrarTodoButton.addEventListener('click', borrarTodo);

// Función para resetear todos los modos
const resetModes = () => {
    isPincelActive = false;
    isGomaActive = false;
    isEscribirActive = false;
    pincelButton.style.backgroundColor = '';
    gomaButton.style.backgroundColor = '';
    escribirButton.style.backgroundColor = '';
    clearInterval(cursorInterval);
};
