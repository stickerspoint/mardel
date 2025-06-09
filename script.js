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
document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("contenedorCatalogo");
  if (!contenedor) return;

  try {
    const res = await fetch("productos.json");
    const productos = await res.json();

    productos.forEach((producto) => {
      const div = document.createElement("div");
      div.classList.add("producto");
      div.setAttribute("data-material", (producto.material || "").toLowerCase().trim());

      const img = document.createElement("img");
      img.src = producto.imagen;
      img.alt = producto.nombre;

      const nombre = document.createElement("h3");
      nombre.textContent = producto.nombre;

      const precio = document.createElement("p");
      precio.textContent = `$${producto.precio}`;

      div.appendChild(img);
      div.appendChild(nombre);
      div.appendChild(precio);

      contenedor.appendChild(div);
    });
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }

  // Buscador
  const buscador = document.getElementById("buscador");
  if (buscador) {
    buscador.addEventListener("input", function () {
      const filtro = this.value.toLowerCase();
      document.querySelectorAll(".producto").forEach(prod => {
        const nombre = prod.querySelector("h3").textContent.toLowerCase();
        prod.style.display = nombre.includes(filtro) ? "" : "none";
      });
    });
  }

  // Filtro por material
  const filtroMaterial = document.getElementById("filtroMaterial");
  if (filtroMaterial) {
    filtroMaterial.addEventListener("change", function () {
      const valor = this.value.toLowerCase().trim();
      document.querySelectorAll(".producto").forEach(prod => {
        const mat = (prod.getAttribute("data-material") || "").toLowerCase().trim();
        prod.style.display = (!valor || mat === valor) ? "" : "none";
      });
    });
  }

  // Scroll suave en atajos de categorías
  document.querySelectorAll('#categoriasNav a').forEach(enlace => {
    enlace.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const seccion = document.getElementById(targetId);
      if (seccion) {
        window.scrollTo({
          top: seccion.offsetTop - 40,
          behavior: 'smooth'
        });
      }
    });
  });
});
