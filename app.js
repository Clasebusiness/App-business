function navigate(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  document.getElementById(view).classList.remove('hidden');
}

function applyAIStyle() {
  const uploaded = document.getElementById('uploadImage').files.length;
  if (!uploaded) return alert('Sube una foto primero!');
  const result = document.getElementById('styleResult');
  result.innerText = 'Generando estilo con IA...';
  result.classList.remove('hidden');

  setTimeout(() => {
    result.innerText = '¡Listo! Estilo aplicado con IA 😎';
  }, 2000);
}

function addToCart(product) {
  alert(`Agregado al carrito: ${product}`);
}
