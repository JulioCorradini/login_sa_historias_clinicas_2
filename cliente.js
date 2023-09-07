document.addEventListener('DOMContentLoaded', () => {
    // Manejar la respuesta del servidor en caso de error al registrar una clave incorrecta
    if (response.status === 400) {
      response.json().then(data => {
        const errorMessage = data.error;
        const errorElement = document.getElementById('mensajeDeError');
        const etiqueta = document.createElement('p');
        etiqueta.textContent = errorMessage;
        errorElement.appendChild(etiqueta);
      });
    } else {
    }
  });
  