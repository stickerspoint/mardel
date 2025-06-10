document.addEventListener('DOMContentLoaded', () => {
    // Es importante que estos elementos solo se busquen si se está en la página donde existen
    // Por ejemplo, contenedorCatalogo, buscador, filtroMaterial y categoriasNav solo en catalogo.html
    // El resto (carritoModal, etc.) deberían estar en index.html y catalogo.html si se usa el modal en ambos
    const contenedorCatalogo = document.getElementById('contenedorCatalogo');
    const buscador = document.getElementById('buscador');
    const filtroMaterial = document.getElementById('filtroMaterial');
    const categoriasNav = document.getElementById('categoriasNav'); // Esto es para la navegación interna en catalogo.html

    const carritoModal = document.getElementById('carritoModal');
    const cerrarCarrito = document.getElementById('cerrarCarrito');
    const listaCarrito = document.getElementById('listaCarrito');
    const totalCarrito = document.getElementById('totalCarrito');
    const vaciarCarritoBtn = document.getElementById('vaciarCarrito');
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // Función para mostrar/ocultar el modal del carrito
    const toggleCarritoModal = () => {
        if (carritoModal) { // Asegura que el modal existe en la página actual
            carritoModal.style.display = carritoModal.style.display === 'flex' ? 'none' : 'flex';
            renderizarCarrito();
        }
    };

    // Abre el modal del carrito al hacer clic en el ícono del carrito
    const shoppingCartIcon = document.querySelector('.fa-shopping-cart');
    if (shoppingCartIcon) {
        shoppingCartIcon.addEventListener('click', toggleCarritoModal);
    } else {
        console.warn("Elemento con clase '.fa-shopping-cart' no encontrado. El ícono del carrito no funcionará en esta página.");
    }

    // Cierra el modal del carrito
    if (cerrarCarrito) {
        cerrarCarrito.addEventListener('click', toggleCarritoModal);
    }

    if (carritoModal) {
        carritoModal.addEventListener('click', (e) => {
            if (e.target === carritoModal) {
                toggleCarritoModal();
            }
        });
    }

    // Función para agregar un producto al carrito
    const agregarAlCarrito = (productoId) => {
        // Asegúrate de que 'productos' esté cargado antes de usarlo
        if (!productos || productos.length === 0) {
            console.error("Productos no cargados aún.");
            return;
        }

        const productoExistente = carrito.find(item => item.id === productoId);
        const productoEnCatalogo = productos.find(prod => prod.id === productoId);

        if (!productoEnCatalogo) {
            console.error(`Producto con ID ${productoId} no encontrado en el catálogo.`);
            return;
        }

        if (productoExistente) {
            if (productoExistente.cantidad < productoEnCatalogo.stock) {
                productoExistente.cantidad++;
                alert(`¡${productoEnCatalogo.nombre} agregado al carrito! Cantidad: ${productoExistente.cantidad}`);
            } else {
                alert(`¡No hay más stock de ${productoEnCatalogo.nombre}!`);
            }
        } else {
            if (productoEnCatalogo.stock > 0) {
                carrito.push({ ...productoEnCatalogo, cantidad: 1 });
                alert(`¡${productoEnCatalogo.nombre} agregado al carrito!`);
            } else {
                alert(`¡${productoEnCatalogo.nombre} está fuera de stock!`);
            }
        }
        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderizarCarrito();
    };

    // Función para renderizar el carrito
    const renderizarCarrito = () => {
        if (!listaCarrito || !totalCarrito) {
            // No mostrar error si el modal no está presente en la página actual
            return;
        }

        listaCarrito.innerHTML = '';
        let total = 0;
        if (carrito.length === 0) {
            listaCarrito.innerHTML = '<li>El carrito está vacío.</li>';
        } else {
            carrito.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `${item.nombre} x ${item.cantidad} - $${item.precio * item.cantidad}
                                 <button class="btn-eliminar" data-id="${item.id}"><i class="fas fa-trash"></i></button>`;
                listaCarrito.appendChild(li);
                total += item.precio * item.cantidad;
            });
        }
        totalCarrito.textContent = total;
        // Agrega event listeners a los botones de eliminar
        document.querySelectorAll('.btn-eliminar').forEach(button => {
            button.addEventListener('click', (e) => {
                const productoId = parseInt(e.currentTarget.dataset.id);
                eliminarDelCarrito(productoId);
            });
        });
    };

    // Función para eliminar un producto del carrito
    const eliminarDelCarrito = (productoId) => {
        carrito = carrito.filter(item => item.id !== productoId);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderizarCarrito();
    };

    // Vaciar carrito
    if (vaciarCarritoBtn) {
        vaciarCarritoBtn.addEventListener('click', () => {
            carrito = [];
            localStorage.setItem('carrito', JSON.stringify(carrito));
            renderizarCarrito();
            alert('Se ha vaciado el carrito.');
        });
    }


    // Lógica específica para la página 'catalogo.html'
    let productos = []; // Almacena todos los productos cargados
    if (contenedorCatalogo) { // Solo si estamos en la página del catálogo
        // Función para generar las cards de productos
        const generarCardsProductos = (productosParaMostrar) => {
            contenedorCatalogo.innerHTML = ''; // Limpia el contenedor principal
            const categoriasMap = new Map();

            // Agrupar productos por categoría
            productosParaMostrar.forEach(producto => {
                if (!categoriasMap.has(producto.categoria)) {
                    categoriasMap.set(producto.categoria, []);
                }
                categoriasMap.get(producto.categoria).push(producto);
            });

            // Generar secciones para cada categoría
            for (const [categoria, productosDeCategoria] of categoriasMap.entries()) {
                const sectionId = categoria.replace(/[^a-zA-Z0-9]/g, ''); // Limpiar el nombre para el ID
                const section = document.createElement('section');
                section.id = sectionId;
                section.innerHTML = `<h2>${categoria}</h2><div class="destacados-grid"></div>`;
                contenedorCatalogo.appendChild(section);

                const gridContainer = section.querySelector('.destacados-grid');

                productosDeCategoria.forEach(producto => {
                    const productoDiv = document.createElement('div');
                    productoDiv.classList.add('producto');
                    if (producto.stock === 0) {
                        productoDiv.classList.add('fuera-stock');
                    }
                    productoDiv.dataset.material = producto.material;

                    const imagenSrc = producto.imagen ? producto.imagen : 'sin-imagen.jpg';
                    const imagenAlt = producto.nombre;

                    productoDiv.innerHTML = `
                        <img src="${imagenSrc}" alt="${imagenAlt}">
                        <h3>${producto.nombre}</h3>
                        <p>$${producto.precio}</p>
                        ${producto.stock > 0 ? `<button class="btn-agregar" data-id="${producto.id}">Agregar al carrito</button>` : '<span class="sin-stock">FUERA DE STOCK</span>'}
                    `;
                    gridContainer.appendChild(productoDiv);
                });
            }

            // Agrega event listeners a los botones "Agregar al carrito"
            document.querySelectorAll('.btn-agregar').forEach(button => {
                button.addEventListener('click', (e) => {
                    const productoId = parseInt(e.currentTarget.dataset.id);
                    agregarAlCarrito(productoId);
                });
            });
        };

        // Carga los productos desde el JSON (solo en catalogo.html)
        fetch('productos.json')
            .then(response => response.json())
            .then(data => {
                productos = data; // Guarda los productos en la variable global
                generarCardsProductos(productos); // Genera las cards inicialmente
                renderizarCarrito(); // Renderiza el carrito al cargar la página (si el modal existe)
            })
            .catch(error => console.error('Error al cargar los productos:', error));

        // Funcionalidad del buscador (solo en catalogo.html)
        if (buscador) {
            buscador.addEventListener('input', () => {
                const textoBusqueda = buscador.value.toLowerCase();
                const materialSeleccionado = filtroMaterial ? filtroMaterial.value.toLowerCase() : ''; // Comprobación adicional

                const productosFiltrados = productos.filter(producto => {
                    const coincideNombre = producto.nombre.toLowerCase().includes(textoBusqueda);
                    const coincideMaterial = !materialSeleccionado || producto.material.toLowerCase() === materialSeleccionado;
                    return coincideNombre && coincideMaterial;
                });
                generarCardsProductos(productosFiltrados);
            });
        }

        // Funcionalidad del filtro por material (solo en catalogo.html)
        if (filtroMaterial) {
            filtroMaterial.addEventListener('change', () => {
                const textoBusqueda = buscador ? buscador.value.toLowerCase() : ''; // Comprobación adicional
                const materialSeleccionado = filtroMaterial.value.toLowerCase();

                const productosFiltrados = productos.filter(producto => {
                    const coincideNombre = producto.nombre.toLowerCase().includes(textoBusqueda);
                    const coincideMaterial = !materialSeleccionado || producto.material.toLowerCase() === materialSeleccionado;
                    return coincideNombre && coincideMaterial;
                });
                generarCardsProductos(productosFiltrados);
            });
        }

        // Funcionalidad para el scroll suave a las categorías (solo en catalogo.html)
        if (categoriasNav) {
            categoriasNav.addEventListener('click', (e) => {
                if (e.target.tagName === 'A') {
                    e.preventDefault();
                    const targetId = e.target.getAttribute('href').substring(1);
                    const seccion = document.getElementById(targetId);
                    if (seccion) {
                        window.scrollTo({
                            top: seccion.offsetTop - 80, // Ajusta el offset si tu header es fijo
                            behavior: 'smooth'
                        });
                    }
                }
            });
        }
    } else {
        // console.log("No estamos en catalogo.html, por lo tanto, no se cargan los productos ni se activan los filtros.");
    }


    // --- Lógica del Carrusel (Solo para index.html) ---
    const galeriaSlider = document.getElementById('galeriaSlider');
    const prevBtnGaleria = document.getElementById('prevBtnGaleria');
    const nextBtnGaleria = document.getElementById('nextBtnGaleria');
    let imagenesCarrusel = [];
    let indiceActualCarrusel = 0;

    if (galeriaSlider) { // Solo si el carrusel existe en la página actual (index.html)
        imagenesCarrusel = galeriaSlider.querySelectorAll('img');

        function actualizarCarrusel() {
            if (imagenesCarrusel.length === 0) return;

            // Asegurar que el índice actual esté dentro de los límites para un bucle infinito
            if (indiceActualCarrusel < 0) {
                indiceActualCarrusel = imagenesCarrusel.length - 1;
            } else if (indiceActualCarrusel >= imagenesCarrusel.length) {
                indiceActualCarrusel = 0;
            }

            // Remover la clase 'central' de todas las imágenes
            imagenesCarrusel.forEach(img => img.classList.remove('central'));

            // Añadir la clase 'central' a la imagen central
            // Queremos que la imagen central visual sea la que está en la posición 1 del array visible (no del array completo)
            // Si el slider muestra 3 imágenes, la central es la segunda
            const visualCentralIndex = 1; // La segunda imagen de las 3 visibles
            // Para centrar el carrusel, movemos el contenedor de manera que la imagen en `indiceActualCarrusel`
            // se vea en la posición central de la vista.

            // Aplicamos la clase 'central' a la imagen correspondiente al índice actual
            if (imagenesCarrusel.length > indiceActualCarrusel) {
                imagenesCarrusel.item(indiceActualCarrusel).classList.add('central');
            }

            // Calcular el desplazamiento para centrar la imagen central
            // Esto asume que todas las imágenes tienen el mismo ancho y margen
            const anchoImagenConMargen = imagenesCarrusel.length > 0 ? imagenesCarrusel.item(0).offsetWidth + 20 : 0; // +20 por 10px de margen a cada lado
            // El offset debe mover el carrusel de forma que la imagen con indiceActualCarrusel quede en el centro.
            // Si queremos que la primera imagen (indice 0) se muestre al inicio, el offset es 0.
            // Si queremos que la imagen del medio (indice 1) se muestre al inicio, necesitamos mover el carrusel hacia la izquierda por el ancho de la primera imagen.
            // Si queremos que la imagen con indiceActualCarrusel sea la central, necesitamos moverla a la posición (ancho total del contenedor / 2) - (ancho de la imagen / 2)

            // Para un carrusel de 3 imágenes visibles, y que la de en medio sea la "central"
            // El desplazamiento será tal que el índice actual quede en la posición central.
            // Por ejemplo, si el índice actual es 0, queremos que sea la primera.
            // Si el índice actual es 1, queremos que sea la del medio.
            // Si el índice actual es 2, queremos que sea la tercera.
            // Entonces, el desplazamiento es (posición deseada para el índice actual) - (índice actual)
            // Si queremos que la imagen en 'indiceActualCarrusel' se muestre en el centro de la vista, y tenemos 3 imágenes visibles:
            // La imagen central está en la posición '1' de la vista (la segunda imagen).
            // Entonces, necesitamos mover el carrusel por `(indiceActualCarrusel - 1)` * anchoImagenConMargen.
            const offset = -(indiceActualCarrusel - 1) * anchoImagenConMargen; 

            galeriaSlider.style.transform = `translateX(${offset}px)`;
        }

        // Exportar moverGaleria al objeto global window para que sea accesible desde HTML
        window.moverGaleria = (direccion) => {
            if (imagenesCarrusel.length === 0) return;

            indiceActualCarrusel += direccion;
            actualizarCarrusel();
        };

        // Asignar event listeners a los botones de navegación del carrusel
        if (prevBtnGaleria) {
            prevBtnGaleria.addEventListener('click', () => {
                window.moverGaleria(-1);
            });
        }

        if (nextBtnGaleria) {
            nextBtnGaleria.addEventListener('click', () => {
                window.moverGaleria(1);
            });
        }

        // Inicializar el carrusel en la carga
        actualizarCarrusel();
    } else {
        // console.log("No estamos en index.html, por lo tanto, el carrusel no se inicializa.");
    }

    // Asegurarse de renderizar el carrito si el modal está presente en cualquier página
    if (carritoModal) {
        renderizarCarrito();
    }
});