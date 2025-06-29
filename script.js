// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos comunes
    const shoppingCartBtn = document.getElementById('cartIconBtn');
    const cartCountSpan = document.querySelector('.cart-count');
    const carritoModal = document.getElementById('carritoModal');
    const cerrarCarrito = document.getElementById('cerrarCarrito');
    const listaCarrito = document.getElementById('listaCarrito');
    const totalCarrito = document.getElementById('totalCarrito');
    const vaciarCarritoBtn = document.getElementById('vaciarCarrito');

    // Referencias a elementos del mini-carrito de notificación
    const miniCarritoNotificacion = document.getElementById('miniCarritoNotificacion');
    const cerrarNotificacionBtn = document.getElementById('cerrarNotificacion');
    const notificacionImagen = document.getElementById('notificacionImagen');
    const notificacionNombre = document.getElementById('notificacionNombre');
    const notificacionPrecio = document.getElementById('notificacionPrecio');
    const notificacionMensaje = document.getElementById('notificacionMensaje');
    const notificacionCantidadTotal = document.getElementById('notificacionCantidadTotal');
    const notificacionTotal = document.getElementById('notificacionTotal');
    const verCarritoDesdeNotificacionBtn = document.getElementById('verCarritoDesdeNotificacion');

    // Referencias a elementos específicos del catálogo
    const contenedorCatalogo = document.getElementById('contenedorCatalogo');
    const buscador = document.getElementById('buscador');
    const filtroMaterial = document.getElementById('filtroMaterial');
    const categoriasNav = document.getElementById('categoriasNav');

    // Variables globales (declaradas al inicio del DOMContentLoaded)
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    window.productos = []; // Aquí se almacenarán todos los productos cargados desde JSON

    // --- Lógica específica para la página 'catalogo.html' (RE-UBICADA AQUÍ) ---
    // Esto asegura que 'aplicarFiltros' esté definida y sus listeners se configuren
    // antes de que se intente llamar en el fetch, si 'contenedorCatalogo' existe.
    if (contenedorCatalogo) {

        // Función central para aplicar todos los filtros (buscador, material, categoría)
        // y renderizar los productos.
        const aplicarFiltros = () => {
            let productosFiltrados = [...window.productos]; // Siempre empieza con todos los productos

            const textoBusqueda = buscador ? buscador.value.toLowerCase() : '';
            const materialSeleccionado = filtroMaterial ? filtroMaterial.value.toLowerCase() : '';
            const categoriaActiva = categoriasNav ? categoriasNav.querySelector('.filtro-categoria.active-category')?.dataset.categoria : 'Todos';

            // Filtrar por búsqueda
            if (textoBusqueda) {
                productosFiltrados = productosFiltrados.filter(producto =>
                    producto.nombre.toLowerCase().includes(textoBusqueda)
                );
            }

            // Filtrar por material
            if (materialSeleccionado && materialSeleccionado !== '') {
                productosFiltrados = productosFiltrados.filter(producto =>
                    producto.material.toLowerCase() === materialSeleccionado
                );
            }

            // Filtrar por categoría (solo si no es "Todos")
            if (categoriaActiva && categoriaActiva !== 'Todos') {
                productosFiltrados = productosFiltrados.filter(producto =>
                    producto.categoria.toLowerCase() === categoriaActiva.toLowerCase()
                );
            }

            generarCardsProductos(productosFiltrados, contenedorCatalogo, true); // true indica que es el catálogo completo
        };

        // Event Listeners para los filtros
        if (buscador) {
            buscador.addEventListener('input', aplicarFiltros);
        }
        if (filtroMaterial) {
            filtroMaterial.addEventListener('change', aplicarFiltros);
        }
        if (categoriasNav) {
            categoriasNav.addEventListener('click', (e) => {
                e.preventDefault(); // Evitar el comportamiento predeterminado del enlace
                if (e.target.tagName === 'A' && e.target.classList.contains('filtro-categoria')) {
                    // Remover la clase 'active-category' de todos y añadirla al clicado
                    categoriasNav.querySelectorAll('.filtro-categoria').forEach(link => {
                        link.classList.remove('active-category');
                    });
                    e.target.classList.add('active-category');

                    const categoriaSeleccionada = e.target.dataset.categoria;

                    aplicarFiltros(); // Vuelve a renderizar con la categoría activa

                    // Scroll suave a la categoría, si no es "Todos"
                    if (categoriaSeleccionada !== 'Todos') {
                        const sectionId = categoriaSeleccionada.replace(/[^a-zA-Z0-9]/g, '');
                        const seccion = document.getElementById(sectionId);
                        if (seccion) {
                            window.scrollTo({
                                top: seccion.offsetTop - 80, // Ajusta este valor si tu header tiene otra altura
                                behavior: 'smooth'
                            });
                        }
                    } else {
                        // Para "Todos", scroll al inicio del contenedor del catálogo
                        window.scrollTo({
                            top: contenedorCatalogo.offsetTop - 80, // Ajusta según tu diseño
                            behavior: 'smooth'
                        });
                    }
                }
            });
        }
    } // Fin if (contenedorCatalogo)

    // --- Funcionalidad del Carrito (Común a ambas páginas si el modal está presente) ---

    // Función para actualizar el contador de items en el ícono del carrito
    const updateCartCount = () => {
        if (cartCountSpan) {
            const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
            cartCountSpan.textContent = totalItems > 0 ? totalItems : '';
            cartCountSpan.style.display = totalItems > 0 ? 'inline-block' : 'none'; // Mostrar/ocultar el span
        }
    };

    // Función para mostrar/ocultar el modal del carrito
    const toggleCarritoModal = (e) => {
        if (e && typeof e.stopPropagation === 'function') {
            e.stopPropagation(); // Detiene la propagación del evento que activó el modal
        }
        if (carritoModal) {
            carritoModal.style.display = carritoModal.style.display === 'flex' ? 'none' : 'flex';
            renderizarCarrito(); // Asegura que el carrito se actualice cada vez que se abre
        }
        // Cerrar la notificación del mini-carrito si el modal principal se abre
        if (miniCarritoNotificacion && carritoModal.style.display === 'flex') {
            miniCarritoNotificacion.style.display = 'none';
        }
    };

    // Abre el carrito solo al hacer clic en el botón del carrito
    if (shoppingCartBtn) {
        shoppingCartBtn.addEventListener('click', toggleCarritoModal);
    }

    // Cierra el carrito al hacer clic en el botón de cerrar
    if (cerrarCarrito) {
        cerrarCarrito.addEventListener('click', toggleCarritoModal);
    }

    // Cierra el modal si se hace clic fuera del contenido del modal
    if (carritoModal) {
        carritoModal.addEventListener('click', (e) => {
            if (e.target === carritoModal) { // Solo si el clic es directamente en el fondo del modal
                toggleCarritoModal();
            }
        });
    }

    // Funcionalidad para la notificación del mini-carrito
    const mostrarNotificacionCarrito = (producto, cantidadAgregada) => {
        if (miniCarritoNotificacion) {
            notificacionImagen.src = producto.imagen;
            notificacionImagen.alt = producto.nombre;
            notificacionNombre.textContent = producto.nombre;
            notificacionPrecio.textContent = `${cantidadAgregada} x $${producto.precio}`;
            notificacionMensaje.textContent = `¡${producto.nombre} agregado al carrito!`;

            const totalItemsEnCarrito = carrito.reduce((sum, item) => sum + item.cantidad, 0);
            const totalMontoCarrito = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
            notificacionCantidadTotal.textContent = totalItemsEnCarrito;
            notificacionTotal.textContent = totalMontoCarrito.toFixed(2); // Formatear a 2 decimales

            miniCarritoNotificacion.style.display = 'block';

            // Ocultar la notificación después de 3 segundos
            setTimeout(() => {
                miniCarritoNotificacion.style.display = 'none';
            }, 3000);
        }
    };

    if (cerrarNotificacionBtn) {
        cerrarNotificacionBtn.addEventListener('click', () => {
            if (miniCarritoNotificacion) {
                miniCarritoNotificacion.style.display = 'none';
            }
        });
    }

    if (verCarritoDesdeNotificacionBtn) {
        verCarritoDesdeNotificacionBtn.addEventListener('click', () => {
            if (miniCarritoNotificacion) {
                miniCarritoNotificacion.style.display = 'none'; // Cierra la notificación
            }
            toggleCarritoModal(); // Abre el modal principal del carrito
        });
    }

    // Función para agregar un producto al carrito
    const agregarAlCarrito = (productoId) => {
        if (!window.productos || window.productos.length === 0) {
            console.warn("Intentando agregar al carrito sin productos cargados.");
            return;
        }

        const productoEnCatalogo = window.productos.find(prod => prod.id === productoId);

        if (!productoEnCatalogo) {
            console.error(`Producto con ID ${productoId} no encontrado en el catálogo.`);
            return;
        }

        // Si el producto está fuera de stock en el JSON, no permitir agregarlo
        if (productoEnCatalogo.stock <= 0) {
            alert(`¡${productoEnCatalogo.nombre} está fuera de stock!`);
            return;
        }

        const productoExistente = carrito.find(item => item.id === productoId);
        let cantidadAgregada = 1; // Cantidad por defecto a agregar

        if (productoExistente) {
            if (productoExistente.cantidad < productoEnCatalogo.stock) {
                productoExistente.cantidad++;
            } else {
                alert(`¡No hay más stock de ${productoEnCatalogo.nombre}!`);
                return; // Salir si no hay más stock
            }
        } else {
            carrito.push({ ...productoEnCatalogo, cantidad: 1 });
        }

        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderizarCarrito(); // Actualiza el modal del carrito
        updateCartCount(); // Actualiza el contador en el header
        mostrarNotificacionCarrito(productoEnCatalogo, cantidadAgregada); // Muestra la notificación
    };

    // Función para eliminar un producto del carrito
    const eliminarDelCarrito = (productoId) => {
        carrito = carrito.filter(item => item.id !== productoId);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderizarCarrito();
        updateCartCount();
    };

    // Función para renderizar el carrito (modal principal)
    const renderizarCarrito = () => {
        if (!listaCarrito || !totalCarrito) {
            return; // Salir si los elementos del carrito no están presentes en esta página
        }

        listaCarrito.innerHTML = '';
        let total = 0;
        if (carrito.length === 0) {
            listaCarrito.innerHTML = '<li>El carrito está vacío.</li>';
        } else {
            carrito.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `${item.nombre} x ${item.cantidad} - $${(item.precio * item.cantidad).toFixed(2)}
                                           <button class="btn-eliminar" data-id="${item.id}"><i class="fas fa-trash"></i></button>`;
                listaCarrito.appendChild(li);
                total += item.precio * item.cantidad;
            });
        }
        totalCarrito.textContent = total.toFixed(2); // Formatear a 2 decimales

        document.querySelectorAll('.btn-eliminar').forEach(button => {
            button.addEventListener('click', (e) => {
                const productoId = parseInt(e.currentTarget.dataset.id);
                eliminarDelCarrito(productoId);
            });
        });
    };

    // Vaciar carrito
    if (vaciarCarritoBtn) {
        vaciarCarritoBtn.addEventListener('click', () => {
            carrito = [];
            localStorage.setItem('carrito', JSON.stringify(carrito));
            renderizarCarrito();
            updateCartCount(); // Actualiza el contador al vaciar
            alert('Se ha vaciado el carrito.');
        });
    }

    // --- Funciones para generar y mostrar productos (comunes o específicas) ---

    // Función auxiliar para crear una sola card de producto
    const crearCardProducto = (producto) => {
        const productoDiv = document.createElement('div');
        productoDiv.classList.add('producto');
        if (producto.stock === 0) {
            productoDiv.classList.add('fuera-stock');
        }
        // Añadir data-material y data-categoria para filtros y búsqueda
        productoDiv.dataset.material = producto.material;
        productoDiv.dataset.categoria = producto.categoria; // Añadir data-categoria

        const imagenSrc = producto.imagen && producto.imagen !== "imagenescatalogo/sin-imagen.jpg" ? producto.imagen : 'imagenescatalogo/sin-imagen.jpg'; // Ruta por defecto
        const imagenAlt = producto.nombre;

        productoDiv.innerHTML = `
            <img src="${imagenSrc}" alt="${imagenAlt}">
            <h3>${producto.nombre}</h3>
            <p>$${producto.precio}</p>
            ${producto.stock > 0 ? `<button class="btn-agregar" data-id="${producto.id}">Agregar al carrito</button>` : '<span class="sin-stock">FUERA DE STOCK</span>'}
        `;
        return productoDiv;
    };

    // Función para generar las cards de productos en un contenedor dado
    const generarCardsProductos = (productosParaMostrar, contenedor, esCatalogoCompleto) => {
        if (!contenedor) return;

        contenedor.innerHTML = ''; // Limpiar el contenedor antes de añadir nuevos productos

        if (esCatalogoCompleto) {
            // Obtener todas las categorías únicas del JSON completo
            const todasLasCategorias = [...new Set(window.productos.map(p => p.categoria))].sort(); // Asegurarse de tener todas las categorías del JSON y ordenarlas

            // Re-generar los enlaces de categoría en el HTML para incluir "Todos" y el orden
            if (categoriasNav && todasLasCategorias.length > 0) {
                   // Mantener el "Todos" activo por defecto si no hay otra categoría seleccionada
                const currentActiveCategory = categoriasNav.querySelector('.filtro-categoria.active-category')?.dataset.categoria;
                categoriasNav.innerHTML = `<a href="#" data-categoria="Todos" class="filtro-categoria ${currentActiveCategory === 'Todos' || !currentActiveCategory ? 'active-category' : ''}">Todos</a>`;

                todasLasCategorias.forEach(cat => {
                    const link = document.createElement('a');
                    link.href = `#${cat.replace(/[^a-zA-Z0-9]/g, '')}`; // ID limpio para la sección
                    link.dataset.categoria = cat;
                    link.classList.add('filtro-categoria');
                    if (cat === currentActiveCategory) {
                        link.classList.add('active-category');
                    }
                    link.textContent = cat;
                    categoriasNav.appendChild(link);
                });
            }

            // Agrupar y renderizar por categoría
            const categoriasMap = new Map();
            todasLasCategorias.forEach(categoria => {
                categoriasMap.set(categoria, []);
            });

            productosParaMostrar.forEach(producto => {
                if (categoriasMap.has(producto.categoria)) {
                    categoriasMap.get(producto.categoria).push(producto);
                }
            });

            for (const [categoria, productosDeCategoria] of categoriasMap.entries()) {
                if (productosDeCategoria.length > 0) { // Solo crear sección si hay productos
                    const sectionId = categoria.replace(/[^a-zA-Z0-9]/g, '');
                    const section = document.createElement('section');
                    section.id = sectionId;
                    section.className = 'categoria-productos';
                    section.innerHTML = `<h2 class="categoria-titulo">${categoria}</h2><div class="productos-grid"></div>`;
                    contenedor.appendChild(section);

                    const gridContainer = section.querySelector('.productos-grid');
                    productosDeCategoria.forEach(producto => gridContainer.appendChild(crearCardProducto(producto)));
                }
            }
        } else {
            // Si no es el catálogo completo (ej. destacados), simplemente añadirlos al contenedor
            productosParaMostrar.forEach(producto => contenedor.appendChild(crearCardProducto(producto)));
        }

        // Asignar event listeners a los botones "Agregar al carrito"
        contenedor.querySelectorAll('.btn-agregar').forEach(button => {
            button.addEventListener('click', (e) => {
                const productoId = parseInt(e.currentTarget.dataset.id);
                agregarAlCarrito(productoId);
            });
        });
    };

    // --- Lógica para productos destacados (Solo para index.html) ---
    const cargarProductosDestacados = () => {
        const contenedorDestacados = document.getElementById('contenedorDestacados');
        if (contenedorDestacados && window.productos.length > 0) {
            const productosFiltrados = window.productos.filter(producto => producto.destacado);
            generarCardsProductos(productosFiltrados, contenedorDestacados, false); // false indica que NO es el catálogo completo
        }
    };

    // --- Carga inicial de productos desde JSON ---
    fetch('productos.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            window.productos = data; // Asigna los productos a la variable global

            // Lógica específica para cada página DESPUÉS de cargar los productos
            if (contenedorCatalogo) { // Si estamos en catalogo.html
                // Se llama a aplicarFiltros para que muestre el catálogo inicial (todos los productos)
                // y también para que configure los listeners de los filtros.
                aplicarFiltros(); // <--- Ahora 'aplicarFiltros' ya estará definida aquí
            }
            if (document.getElementById('contenedorDestacados')) { // Si estamos en index.html
                cargarProductosDestacados();
            }

            renderizarCarrito(); // Renderiza el carrito inicial
            updateCartCount(); // Actualiza el contador del carrito al cargar la página
        })
        .catch(error => console.error('Error al cargar los productos:', error));

    // --- Lógica del Carrusel (Solo para index.html) ---
    const galeriaSlider = document.getElementById('galeriaSlider');
    const prevBtnGaleria = document.getElementById('prevBtnGaleria');
    const nextBtnGaleria = document.getElementById('nextBtnGaleria');
    let imagenesCarrusel = [];
    let indiceActualCarrusel = 0;

    if (galeriaSlider) { // Esto asegura que solo se ejecute en index.html
        imagenesCarrusel = galeriaSlider.querySelectorAll('img');

        // Duplicar las imágenes al principio y al final para un bucle continuo
        const primerElemento = imagenesCarrusel[0].cloneNode(true);
        const ultimoElemento = imagenesCarrusel[imagenesCarrusel.length - 1].cloneNode(true);
        galeriaSlider.appendChild(primerElemento);
        galeriaSlider.insertBefore(ultimoElemento, imagenesCarrusel[0]);

        // Volver a obtener las referencias ya con los clones
        imagenesCarrusel = galeriaSlider.querySelectorAll('img');

        // El índice inicial debe ajustarse para que empiece en la primera imagen real
        indiceActualCarrusel = 1;

        function actualizarCarrusel() {
            if (imagenesCarrusel.length === 0) return;

            galeriaSlider.style.transition = 'transform 0.5s ease-in-out';

            imagenesCarrusel.forEach(img => img.classList.remove('central'));

            // Calcular el ancho de un "slot" (cada imagen)
            const anchoContenedor = galeriaSlider.parentElement.offsetWidth; // Ancho del .galeria-container
            const anchoSlot = anchoContenedor / 3; // Suponiendo 3 imágenes visibles

            // Calcular el offset para centrar la imagen actual (indiceActualCarrusel)
            const offset = -(indiceActualCarrusel - 1) * anchoSlot; // Mover hacia la izquierda

            galeriaSlider.style.transform = `translateX(${offset}px)`;

            // Añadir clase 'central' a la imagen realmente central (visual)
            if (imagenesCarrusel[indiceActualCarrusel]) {
                imagenesCarrusel[indiceActualCarrusel].classList.add('central');
            }
        }

        if (prevBtnGaleria) {
            prevBtnGaleria.addEventListener('click', () => {
                indiceActualCarrusel--;
                galeriaSlider.style.transition = 'transform 0.5s ease-in-out';
                actualizarCarrusel();
                if (indiceActualCarrusel < 1) { // Si hemos llegado al clon del último
                    setTimeout(() => {
                        galeriaSlider.style.transition = 'none';
                        indiceActualCarrusel = imagenesCarrusel.length - 2; // Ir a la penúltima (última real)
                        actualizarCarrusel();
                    }, 500);
                }
            });
        }

        if (nextBtnGaleria) {
            nextBtnGaleria.addEventListener('click', () => {
                indiceActualCarrusel++;
                galeriaSlider.style.transition = 'transform 0.5s ease-in-out';
                actualizarCarrusel();
                if (indiceActualCarrusel >= imagenesCarrusel.length - 1) { // Si hemos llegado al clon del primero
                    setTimeout(() => {
                        galeriaSlider.style.transition = 'none';
                        indiceActualCarrusel = 1; // Ir a la segunda (primera real)
                        actualizarCarrusel();
                    }, 500);
                }
            });
        }

        // Inicializar el carrusel en la carga
        setTimeout(() => {
            actualizarCarrusel();
        }, 100);

        // Ajustar el carrusel si la ventana cambia de tamaño
        window.addEventListener('resize', actualizarCarrusel);
    } // Fin if (galeriaSlider)
});