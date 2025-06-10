// Variable global para almacenar todos los productos cargados
// Esto nos permitirá filtrar y buscar sin volver a cargar el JSON
let todosLosProductos = [];

// --- Carrusel (Para index.html) ---
let galeriaIndice = 0; // Inicia en 0 para ser el primer elemento del array

function moverGaleria(direccion) {
    const galeria = document.getElementById('galeriaSlider');
    if (!galeria) return; // Salir si no hay carrusel en la página

    const slides = galeria.querySelectorAll('img');
    const totalSlides = slides.length;

    if (totalSlides === 0) return;

    galeriaIndice += direccion;

    // Ajustar el índice para que siempre esté dentro de los límites
    if (galeriaIndice < 0) {
        galeriaIndice = totalSlides - 1; // Volver al final si se va al principio
    } else if (galeriaIndice >= totalSlides) {
        galeriaIndice = 0; // Volver al principio si se va al final
    }

    actualizarGaleria(slides);
}

function actualizarGaleria(slides) {
    if (!slides || slides.length === 0) return;

    slides.forEach(slide => {
        slide.classList.remove('central');
        slide.style.opacity = '0.5';
    });

    // Asegurarse de que el slide existe antes de intentar acceder a él
    if (slides[galeriaIndice]) {
        slides[galeriaIndice].classList.add('central');
        slides[galeriaIndice].style.opacity = '1';
    }

    // Calcula el desplazamiento. Ajuste para que la imagen central quede... bueno, central.
    // Asumiendo que `galeria-slider img` tiene 300px de ancho y 10px de margen derecho.
    const anchoImagenConMargen = 300 + 10;
    const desplazamiento = galeriaIndice * anchoImagenConMargen;
    document.getElementById('galeriaSlider').style.transform = `translateX(-${desplazamiento}px)`;
}

// --- Carrito de Compras ---
function agregarAlCarrito(producto) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito.push(producto);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    alert(`${producto.nombre} agregado al carrito!`); // Notificación simple para el usuario
    mostrarCarrito(); // Actualizar el modal si está abierto
}

function mostrarCarrito() {
    const lista = document.getElementById("listaCarrito");
    const total = document.getElementById("totalCarrito");
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    lista.innerHTML = ""; // Limpiar la lista antes de renderizar
    let sumaTotal = 0;

    if (carrito.length === 0) {
        lista.innerHTML = "<li>El carrito está vacío.</li>";
    } else {
        carrito.forEach((item, index) => {
            const li = document.createElement("li");
            li.innerHTML = `
                ${item.nombre} - $${item.precio}
                <button data-index="${index}" class="eliminar-item">X</button>
            `;
            lista.appendChild(li);
            sumaTotal += item.precio;
        });
    }

    total.textContent = sumaTotal.toFixed(2); // Formatear a 2 decimales
    document.getElementById("carritoModal").style.display = "flex";
}

function vaciarCarrito() {
    localStorage.removeItem("carrito");
    mostrarCarrito(); // Actualizar la vista del carrito
}

// --- Carga y Renderizado de Productos del Catálogo (para catalogo.html) ---
async function cargarYRenderizarProductos() {
    const contenedor = document.getElementById("contenedorCatalogo");
    // Si no estamos en catalogo.html, esta función no hace nada
    if (!contenedor) return;

    contenedor.innerHTML = ''; // Limpiar el contenido actual del catálogo

    try {
        const res = await fetch("productos.json");
        todosLosProductos = await res.json(); // Guardar productos en la variable global

        // Opcional: Crear secciones para cada categoría (si tu HTML no las tiene fijas)
        // Por ahora, simplemente agregamos todos los productos directamente al contenedorCatalogo
        // Si más adelante quieres agrupar por categorías, lo hacemos aquí.
        // Dado tu catalogo.html actual, los productos se agregan directo.

        todosLosProductos.forEach(producto => {
            const div = document.createElement("div");
            div.classList.add("producto");
            div.setAttribute("data-material", (producto.material || "").toLowerCase().trim());
            div.setAttribute("data-nombre", (producto.nombre || "").toLowerCase().trim()); // Añadir data-nombre para el buscador

            // Comprobar si el producto está fuera de stock
            const estaFueraDeStock = producto.stock <= 0;
            if (estaFueraDeStock) {
                div.classList.add("fuera-stock");
            }

            div.innerHTML = `
                ${producto.imagen
                    ? `<img src="${producto.imagen}" alt="${producto.nombre}">`
                    : `<div class="sin-imagen">Imagen no disponible</div>`}
                <h3>${producto.nombre}</h3>
                <p>$${producto.precio}</p>
                <button class="btn-agregar" ${estaFueraDeStock ? 'disabled' : ''}>
                    ${estaFueraDeStock ? 'Sin Stock' : 'Agregar al carrito'}
                </button>
            `;
            // Asignar el evento al botón "Agregar al carrito"
            div.querySelector(".btn-agregar").addEventListener("click", () => agregarAlCarrito(producto));
            contenedor.appendChild(div);
        });

        // Una vez que los productos están cargados y renderizados, inicializamos los filtros y buscador
        inicializarFiltrosYBusqueda();

    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

// --- Función de Filtrado y Busqueda Unificada ---
function filtrarProductos() {
    const buscador = document.getElementById("buscador");
    const filtroMaterial = document.getElementById("filtroMaterial");

    const textoBusqueda = buscador ? buscador.value.toLowerCase().trim() : '';
    const materialSeleccionado = filtroMaterial ? filtroMaterial.value.toLowerCase().trim() : '';

    document.querySelectorAll(".producto").forEach(prod => {
        const nombreProducto = (prod.getAttribute("data-nombre") || "").toLowerCase();
        const materialProducto = (prod.getAttribute("data-material") || "").toLowerCase();

        const coincideBusqueda = nombreProducto.includes(textoBusqueda);
        const coincideMaterial = (!materialSeleccionado || materialProducto === materialSeleccionado);

        prod.style.display = (coincideBusqueda && coincideMaterial) ? "" : "none"; // Muestra o oculta
    });

    // Opcional: Ocultar secciones de categorías si están vacías después del filtro
    // Esto es relevante si en el futuro generas secciones dinámicamente como habíamos hablado.
    // Por ahora, con un solo contenedor, no es estrictamente necesario, pero es buena práctica.
    const contenedorCatalogo = document.getElementById("contenedorCatalogo");
    if (contenedorCatalogo) {
        const productosVisibles = contenedorCatalogo.querySelectorAll('.producto[style="display: block;"], .producto:not([style*="display: none"])').length;
        // Podrías mostrar un mensaje si no hay productos visibles
        // if (productosVisibles === 0) { console.log("No hay productos que coincidan con la búsqueda/filtro"); }
    }
}


// --- Inicialización de Event Listeners para Filtros y Buscador (para catalogo.html) ---
function inicializarFiltrosYBusqueda() {
    const buscador = document.getElementById("buscador");
    if (buscador) {
        buscador.addEventListener("input", filtrarProductos);
    }

    const filtroMaterial = document.getElementById("filtroMaterial");
    if (filtroMaterial) {
        filtroMaterial.addEventListener("change", filtrarProductos);
    }

    // Scroll suave en atajos de categorías (si aplicable en catalogo.html)
    document.querySelectorAll('#categoriasNav a').forEach(enlace => {
        enlace.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const seccion = document.getElementById(targetId);
            if (seccion) {
                window.scrollTo({
                    top: seccion.offsetTop - 40, // Ajuste para el header fijo
                    behavior: 'smooth'
                });
            }
        });
    });
}


// --- Event Listener Principal al Cargar el DOM ---
document.addEventListener("DOMContentLoaded", () => {
    // 1. Inicializar Carrusel (solo si estamos en index.html)
    const galeriaSlider = document.getElementById('galeriaSlider');
    if (galeriaSlider) {
        const slides = galeriaSlider.querySelectorAll('img');
        if (slides.length > 0) {
            actualizarGaleria(slides);
            // Si tienes botones para el carrusel en index.html, agrega los listeners aquí
            document.querySelector('.galeria-controles button:first-child').addEventListener('click', () => moverGaleria(-1));
            document.querySelector('.galeria-controles button:last-child').addEventListener('click', () => moverGaleria(1));
        }
    }

    // 2. Cargar y Renderizar Productos (solo si estamos en catalogo.html)
    // Esta función también inicializa los filtros y buscador después de cargar los productos
    cargarYRenderizarProductos();

    // 3. Eventos del Carrito (aplica a ambas páginas si el modal está en ambas)
    document.querySelector(".fa-shopping-cart").addEventListener("click", mostrarCarrito);
    document.getElementById("cerrarCarrito").addEventListener("click", () => {
        document.getElementById("carritoModal").style.display = "none";
    });
    document.getElementById("vaciarCarrito").addEventListener("click", vaciarCarrito);

    // Delegación de eventos para eliminar ítems del carrito (solo una vez)
    document.getElementById("listaCarrito").addEventListener("click", e => {
        if (e.target.classList.contains("eliminar-item")) {
            const index = e.target.dataset.index;
            let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
            carrito.splice(index, 1); // Elimina 1 elemento en la posición 'index'
            localStorage.setItem("carrito", JSON.stringify(carrito));
            mostrarCarrito(); // Actualizar la vista del carrito
        }
    });
});