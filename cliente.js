// cliente.js
const mensajeDeError = document.getElementById("mensajeDeError");
const textoDeError = document.getElementById("textoDeError");
const container = document.getElementById("container");
const containerOculto = document.getElementById("containerOculto");

const tituloDelMensaje = document.getElementById("tituloDelMensaje");
const mensaje = document.getElementById("mensaje");
const textoDelMensaje = document.getElementById("textoDelMensaje");

function validarContraseña(password) {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=]).{8,}$/;
  //return password.match(passwordRegex) !== null;
  if(!password.match(passwordRegex)){
    textoDeError.innerText = "El campo no puede quedar en blanco. La contraseña debe tener al menos 8 caracteres, al menos una minúscula, al menos una mayúscula, al menos un dígito y al menos un caracter especial.";
    mensajeDeError.appendChild(textoDeError);
    container.style.display = "none";
    containerOculto.style.display = "block";

  }
}

function recargar(){
  setTimeout(function() {
    window.location.reload();
  }, 1000);
}

function reenviar(ruta){
  window.location.href = ruta;
  window.location.href = ruta;
}

function recargarToken() {
  window.location.href = '/indexConfirmacion.html';
}

function mostrarMensaje(paramTitulo, paramMensaje) {

  tituloDelMensaje.innerText = paramTitulo;
  textoDelMensaje.innerText = paramMensaje;
  mensaje.appendChild(textoDelMensaje);
  container.style.display = "none";
  containerOculto.style.display = "block";
}

//Función para mostrar la contraseña
const passwordField = document.getElementById('password');
const togglePassword = document.getElementById('toggle-password');

togglePassword.addEventListener('click', function () {
    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordField.setAttribute('type', type);

    // Cambia el icono de ojo según si se muestra u oculta la contraseña
    togglePassword.querySelector('i').classList.toggle('fa-eye-slash');
    togglePassword.querySelector('i').classList.toggle('fa-eye');
});
