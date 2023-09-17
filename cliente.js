// cliente.js
const mensajeDeError = document.getElementById("mensajeDeError");
const textoDeError = document.getElementById("textoDeError");
const container = document.getElementById("container");
const containerOculto = document.getElementById("containerOculto");

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

function reenviar(){
  window.location.href = '/indexLogin.html';
}

function recargarToken() {
  window.location.href = '/indexConfirmacion.html';
}