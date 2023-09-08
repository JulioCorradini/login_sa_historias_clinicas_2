document.getElementById("miFormulario").addEventListener("submit", function(event) {
  // Obtener el valor de la contraseña
  var password = document.getElementById("password").value;

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=]).{8,}$/

  // Validar la contraseña (agrega tus propios criterios aquí)
  if (password.match(passwordRegex)) {
    // Mostrar un mensaje de error si la contraseña no cumple con los requisitos
    document.getElementById("mensajeError").textContent = "La contraseña debe tener al menos 8 caracteres.";
    
    // Detener el envío del formulario
    event.preventDefault();
  } else {
    // Limpiar el mensaje de error si la contraseña es válida
    document.getElementById("mensajeError").textContent = "";
  }
});
