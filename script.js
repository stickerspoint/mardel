
document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("contenedorCatalogo");
  const filtroMaterial = document.getElementById("filtroMaterial");
  const buscador = document.getElementById("buscador");

  fetch("productos.json")
    .then(res => res.json())
    .then(productos => {
      const categorias = [...new Set(productos.map(p => p.categoria))];

      // Crear secciones por categoría
      categorias.forEach(cat => {
        const idCat = cat.replace(/[^a-zA-Z0-9]/g, "");
        const section = document.createElement("section");
        section.id = idCat;
        section.innerHTML = `<h2>${cat}</h2><div class="destacados-grid"></div>`;
        contenedor.appendChild(section);
      });

      function renderProductos(filtro = "", texto = "") {
        categorias.forEach(cat => {
          const idCat = cat.replace(/[^a-zA-Z0-9]/g, "");
          const grid = document.querySelector(`#${idCat} .destacados-grid`);
          grid.innerHTML = "";

          productos
            .filter(p => p.categoria === cat)
            .filter(p => !filtro || p.material === filtro)
            .filter(p => !texto || p.nombre.toLowerCase().includes(texto.toLowerCase()))
            .forEach(prod => {
              const div = document.createElement("div");
              div.className = "producto";
              if (prod.stock <= 0) div.classList.add("fuera-stock");
              div.innerHTML = `
                <img src="${prod.imagen}" alt="${prod.nombre}">
                <h3>${prod.nombre}</h3>
                <p>$${prod.precio}</p>
                <button class="btn-agregar">Agregar al carrito</button>
              `;
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
});
