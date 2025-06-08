
// ================= CARRUSEL ===================
let posicionActual = 0;
let intervalo;

function moverGaleria(direccion) {
  const slider = document.getElementById('galeriaSlider');
  const imagenes = slider.querySelectorAll('img');
  const total = imagenes.length;

  posicionActual += direccion;
  if (posicionActual < 0) posicionActual = total - 1;
  if (posicionActual >= total) posicionActual = 0;

  slider.style.transform = 'translateX(-' + (posicionActual * (imagenes[0].clientWidth + 10)) + 'px)';
  actualizarClases(imagenes);
}

function actualizarClases(imagenes) {
  imagenes.forEach((img, idx) => {
    img.classList.remove('central');
    if (idx === posicionActual) {
      img.classList.add('central');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('galeriaSlider');
  if (slider) {
    // Duplicar imágenes si hay menos de 5
    const imgs = Array.from(slider.children);
    while (slider.children.length < 5) {
      imgs.forEach(img => slider.appendChild(img.cloneNode(true)));
    }
    actualizarClases(slider.querySelectorAll('img'));
    intervalo = setInterval(() => moverGaleria(1), 4000);
  }

  if (document.getElementById("contenedorDestacados")) {
    renderizarDestacados();
  }
  if (document.getElementById("contenedorCatalogo")) {
    inicializarCatalogo();
  }
});

// ================== CATÁLOGO ==================
function inicializarCatalogo() {
  const contenedor = document.getElementById("contenedorCatalogo");
  const filtroMaterial = document.getElementById("filtroMaterial");
  const buscador = document.getElementById("buscador");

  fetch("productos.json")
    .then(res => res.json())
    .then(productos => {
      const categorias = [...new Set(productos.map(p => p.categoria))];

      categorias.forEach(cat => {
        const idCat = cat.replace(/[^a-zA-Z0-9]/g, "");
        const section = document.createElement("section");
        section.id = idCat;
        section.innerHTML = \`<h2>\${cat}</h2><div class="destacados-grid"></div>\`;
        contenedor.appendChild(section);
      });

      function renderProductos(filtro = "", texto = "") {
        categorias.forEach(cat => {
          const idCat = cat.replace(/[^a-zA-Z0-9]/g, "");
          const grid = document.querySelector(\`#\${idCat} .destacados-grid\`);
          grid.innerHTML = "";

          productos
            .filter(p => p.categoria === cat)
            .filter(p => !filtro || p.material === filtro)
            .filter(p => !texto || p.nombre.toLowerCase().includes(texto.toLowerCase()))
            .forEach(prod => {
              const div = document.createElement("div");
              div.className = "producto";
              if (prod.stock <= 0) div.classList.add("fuera-stock");
              div.innerHTML = \`
                <img src="\${prod.imagen}" alt="\${prod.nombre}">
                <h3>\${prod.nombre}</h3>
                <p>$\${prod.precio}</p>
                <button class="btn-agregar">Agregar al carrito</button>
              \`;
              grid.appendChild(div);
            });
        });
      }

      renderProductos();

      filtroMaterial.addEventListener("change", () => {
        renderProductos(filtroMaterial.value, buscador.value);
      });

      buscador.addEventListener("input", () => {
        renderProductos(filtroMaterial.value, buscador.value);
      });
    });
}
