
// Activar categoría visible al hacer scroll
window.addEventListener("scroll", () => {
  const categorias = document.querySelectorAll("#contenedorCatalogo section");
  let fromTop = window.scrollY + 150;

  categorias.forEach(sec => {
    const link = document.querySelector(`#categoriasNav a[href="#${sec.id}"]`);
    if (
      sec.offsetTop <= fromTop &&
      sec.offsetTop + sec.offsetHeight > fromTop
    ) {
      document.querySelectorAll("#categoriasNav a").forEach(a => a.classList.remove("activa"));
      if (link) link.classList.add("activa");
    }
  });
});

// Aplicar filtros por material y tamaño
function aplicarFiltros(productos) {
  const material = document.getElementById("filtroMaterial").value;
  const tamano = document.getElementById("filtroTamano").value;

  return productos.filter(p =>
    (!material || p.material === material) &&
    (!tamano || p.tamano === tamano)
  );
}

// Sobrescribir renderizarCatalogo para usar filtros
const renderizarCatalogoOriginal = renderizarCatalogo;
renderizarCatalogo = async function () {
  try {
    const res = await fetch("productos.json");
    let productos = await res.json();

    const contenedor = document.getElementById("contenedorCatalogo");
    const categoriasNav = document.getElementById("categoriasNav");
    const filtroMaterial = document.getElementById("filtroMaterial");
    const filtroTamano = document.getElementById("filtroTamano");

    const materiales = [...new Set(productos.map(p => p.material).filter(Boolean))];
    const tamanos = [...new Set(productos.map(p => p.tamano).filter(Boolean))];
    filtroMaterial.innerHTML = '<option value="">Material</option>' + materiales.map(m => `<option value="${m}">${m}</option>`).join('');
    filtroTamano.innerHTML = '<option value="">Tamaño</option>' + tamanos.map(t => `<option value="${t}">${t}</option>`).join('');

    const render = () => {
      const filtrados = aplicarFiltros(productos);
      const categorias = [...new Set(filtrados.map(p => p.categoria))];

      categoriasNav.innerHTML = "";
      categorias.forEach(categoria => {
        const btn = document.createElement("a");
        btn.href = "#" + categoria.replace(/\W+/g, "");
        btn.textContent = categoria;
        categoriasNav.appendChild(btn);
      });

      contenedor.innerHTML = "";
      categorias.forEach(categoria => {
        const seccion = document.createElement("section");
        seccion.id = categoria.replace(/\W+/g, "");
        seccion.innerHTML = `<h2>${categoria}</h2>`;
        const grid = document.createElement("div");
        grid.classList.add("destacados-grid");

        filtrados.filter(p => p.categoria === categoria).forEach(producto => {
          const div = document.createElement("div");
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
          grid.appendChild(div);
        });

        seccion.appendChild(grid);
        contenedor.appendChild(seccion);
      });

      document.querySelectorAll("#categoriasNav a").forEach(enlace => {
        enlace.addEventListener("click", function(e) {
          e.preventDefault();
          const targetId = this.getAttribute("href").substring(1);
          const seccion = document.getElementById(targetId);
          if (seccion) {
            seccion.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
      });
    };

    filtroMaterial.addEventListener("change", render);
    filtroTamano.addEventListener("change", render);
    render();

    document.getElementById("buscador").addEventListener("input", (e) => {
      const filtro = e.target.value.toLowerCase();
      document.querySelectorAll("#contenedorCatalogo .producto").forEach(div => {
        const nombre = div.querySelector("h3").textContent.toLowerCase();
        div.style.display = nombre.includes(filtro) ? "" : "none";
      });
    });
  } catch (error) {
    console.error("Error cargando catálogo con filtros:", error);
  }
};
