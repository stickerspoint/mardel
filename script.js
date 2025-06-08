// Carrusel
let galeriaIndice = 1;

function moverGaleria(direccion) {
  const galeria = document.getElementById('galeriaSlider');
  const slides = galeria.querySelectorAll('img');
  galeriaIndice += direccion;

  if (galeriaIndice < 0) galeriaIndice = 0;
  if (galeriaIndice > slides.length - 1) galeriaIndice = slides.length - 1;

  actualizarGaleria(slides);
}

function actualizarGaleria(slides) {
  slides.forEach(slide => {
    slide.classList.remove('central');
    slide.style.opacity = '0.5';
  });

  if (slides[galeriaIndice]) {
    slides[galeriaIndice].classList.add('central');
    slides[galeriaIndice].style.opacity = '1';
  }

  const anchoImagen = 310;
  const desplazamiento = (galeriaIndice - 1) * anchoImagen;
  document.getElementById('galeriaSlider').style.transform = `translateX(-${desplazamiento}px)`;
}

// Cargar productos desde productos.json
async function renderizarDestacados() {
  try {
    const res = await fetch("productos.json");
    const productos = await res.json();

    const contenedor = document.getElementById("contenedorDestacados");
    productos.forEach(producto => {      const div = document.createElement("div");
      div.classList.add("producto");
    if (producto.stock <= 0) div.classList.add("fuera-stock");
      div.innerHTML = `
        ${producto.imagen 
          ? `<img src="${producto.imagen}" alt="${producto.nombre}">` 
          : `<div class="sin-imagen">Imagen no disponible</div>`}
        <h3>${producto.nombre}</h3>
        <p>$${producto.precio}</p>
        <button class="btn-agregar">Agregar al carrito</button>
      `;
      div.querySelector("button").onclick = () => agregarAlCarrito(producto);
      contenedor.appendChild(div);
    });
  } catch (error) {
    console.error("Error cargando productos:", error);
  }
}

// Carrito
function agregarAlCarrito(producto) {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  carrito.push(producto);
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

document.querySelector(".fa-shopping-cart").addEventListener("click", () => {
  const lista = document.getElementById("listaCarrito");
  const total = document.getElementById("totalCarrito");
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  lista.innerHTML = "";
  let suma = 0;
  carrito.forEach((item, index) => {
    const li = document.createElement("li");
    li.innerHTML = `${item.nombre} - $${item.precio} <button data-index="${index}" class="eliminar-item">X</button>`;
    lista.appendChild(li);
    suma += item.precio;
  });
  total.textContent = suma;
  document.getElementById("carritoModal").style.display = "flex";
});

document.getElementById("cerrarCarrito").addEventListener("click", () => {
  document.getElementById("carritoModal").style.display = "none";
});

document.getElementById("vaciarCarrito").addEventListener("click", () => {
  localStorage.removeItem("carrito");
  document.getElementById("listaCarrito").innerHTML = "";
  document.getElementById("totalCarrito").textContent = "0";
});

document.getElementById("listaCarrito").addEventListener("click", e => {
  if (e.target.classList.contains("eliminar-item")) {
    const index = e.target.dataset.index;
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    document.querySelector(".fa-shopping-cart").click();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  actualizarGaleria(document.querySelectorAll('#galeriaSlider img'));
  renderizarDestacados();
});
if (document.getElementById('contenedorDestacados')) renderizarDestacados();