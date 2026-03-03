function showPopup(type, title, message) {
  Swal.fire({
    icon: type,        // success | error | warning | info
    title: title,
    text: message,
    confirmButtonColor: "#2563eb",
  });
}
