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

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

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

    // --- Carga de productos (común a ambas páginas para el contexto) ---
    // Declarar productos a nivel global para que sea accesible desde agregarAlCarrito
    window.productos = [];

    // Carga los productos desde el JSON una única vez al cargar el script
    fetch('productos.json')
        .then(response => response.json())
        .then(data => {
            window.productos = data; // Asigna a window.productos

            // Lógica específica para cada página DESPUÉS de cargar los productos
            if (document.getElementById('contenedorCatalogo')) { // Si estamos en catalogo.html
                mostrarTodosLosProductos(); // Llama a la función que mostrará todo el catálogo
            }
            if (document.getElementById('contenedorDestacados')) { // Si estamos en index.html
                cargarProductosDestacados();
            }

            renderizarCarrito(); // Renderiza el carrito inicial
            updateCartCount(); // Actualiza el contador del carrito al cargar la página
        })
        .catch(error => console.error('Error al cargar los productos:', error));


    // --- Funciones para generar y mostrar productos (comunes o específicas) ---

    // Función auxiliar para crear una sola card de producto
    const crearCardProducto = (producto) => { // Eliminar el parámetro 'contenedor' aquí
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
        return productoDiv; // Retornar el div para que sea añadido por la función padre
    };

    // Función para generar las cards de productos en un contenedor dado
    const generarCardsProductos = (productosParaMostrar, contenedor) => {
        if (!contenedor) return;

        contenedor.innerHTML = ''; // Limpiar el contenedor antes de añadir nuevos productos

        const esCatalogoCompleto = (contenedor.id === 'contenedorCatalogo');

        if (esCatalogoCompleto) {
            // Agrupar por categoría solo si es el catálogo completo
            const categoriasMap = new Map();
            // Obtener todas las categorías únicas del JSON completo
            const todasLasCategorias = [...new Set(window.productos.map(p => p.categoria))].sort(); // Asegurarse de tener todas las categorías del JSON y ordenarlas

            todasLasCategorias.forEach(categoria => {
                categoriasMap.set(categoria, []);
            });

            productosParaMostrar.forEach(producto => {
                if (categoriasMap.has(producto.categoria)) { // Solo añadir si la categoría existe
                    categoriasMap.get(producto.categoria).push(producto);
                }
            });

            // Re-generar los enlaces de categoría en el HTML para incluir "Todos" y el orden
            // Solo si estamos en el catalogo.html y tenemos el elemento categoriasNav
            if (categoriasNav && todasLasCategorias.length > 0) {
                 categoriasNav.innerHTML = `<a href="#" data-categoria="Todos" class="filtro-categoria active-category">Todos</a>`; // Poner "Todos" como activo por defecto
                 todasLasCategorias.forEach(cat => {
                     const link = document.createElement('a');
                     link.href = `#${cat.replace(/[^a-zA-Z0-9]/g, '')}`; // ID limpio para la sección
                     link.dataset.categoria = cat;
                     link.classList.add('filtro-categoria');
                     link.textContent = cat;
                     categoriasNav.appendChild(link);
                 });
            }


            for (const [categoria, productosDeCategoria] of categoriasMap.entries()) {
                const sectionId = categoria.replace(/[^a-zA-Z0-9]/g, ''); // Limpia la categoría para usarla como ID
                const section = document.createElement('section');
                section.id = sectionId;
                section.className = 'categoria-productos'; // Clase para aplicar estilos de sección de categoría
                section.innerHTML = `<h2 class="categoria-titulo">${categoria}</h2><div class="productos-grid"></div>`; // Grid para productos dentro de la categoría
                contenedor.appendChild(section);

                const gridContainer = section.querySelector('.productos-grid'); // Selecciona el grid DENTRO de la sección
                productosDeCategoria.forEach(producto => gridContainer.appendChild(crearCardProducto(producto)));
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

    // Función para mostrar todos los productos (para catalogo.html)
    window.mostrarTodosLosProductos = () => { // Se expone globalmente para ser llamada desde catalogo.html
        if (document.getElementById('contenedorCatalogo') && window.productos.length > 0) {
            generarCardsProductos(window.productos, document.getElementById('contenedorCatalogo'));
        }
    };

    // Lógica para productos destacados (Solo para index.html)
    // Se expone globalmente para ser llamada desde index.html
    window.cargarProductosDestacados = () => {
        const contenedorDestacados = document.getElementById('contenedorDestacados');
        if (contenedorDestacados && window.productos.length > 0) {
            const productosFiltrados = window.productos.filter(producto => producto.destacado);
            generarCardsProductos(productosFiltrados, contenedorDestacados);
        }
    };


    // --- Lógica específica para la página 'catalogo.html' ---
    const contenedorCatalogo = document.getElementById('contenedorCatalogo');
    const buscador = document.getElementById('buscador');
    const filtroMaterial = document.getElementById('filtroMaterial');
    const categoriasNav = document.getElementById('categoriasNav');

    if (contenedorCatalogo) { // Esto asegura que solo se ejecute la lógica del catálogo en catalogo.html

        // Función unificada para aplicar los filtros (buscador y material)
        const aplicarFiltrosVisuales = () => {
            const textoBusqueda = buscador ? buscador.value.toLowerCase() : '';
            const materialSeleccionado = filtroMaterial ? filtroMaterial.value.toLowerCase() : '';

            // Obtener todos los productos individualmente renderizados en el DOM
            document.querySelectorAll('.producto').forEach(productoDiv => {
                const nombreProducto = productoDiv.querySelector('h3').textContent.toLowerCase();
                const materialProducto = productoDiv.dataset.material.toLowerCase();

                const coincideNombre = nombreProducto.includes(textoBusqueda);
                const coincideMaterial = !materialSeleccionado || materialSeleccionado === '' || materialProducto === materialSeleccionado;

                // Si ambos filtros coinciden, mostrar el producto, de lo contrario ocultarlo
                if (coincideNombre && coincideMaterial) {
                    productoDiv.style.display = 'block'; // O el display original, si no es 'block'
                } else {
                    productoDiv.style.display = 'none';
                }
            });

            // Opcional: Ocultar secciones de categoría si no tienen productos visibles
            document.querySelectorAll('.categoria-productos').forEach(section => {
                const productosVisiblesEnSeccion = section.querySelectorAll('.producto:not([style*="display: none"])');
                if (productosVisiblesEnSeccion.length === 0) {
                    section.style.display = 'none';
                } else {
                    section.style.display = 'block';
                }
            });
        };


        // Funcionalidad del buscador
        if (buscador) {
            buscador.addEventListener('input', aplicarFiltrosVisuales);
        }

        // Funcionalidad del filtro por material
        if (filtroMaterial) {
            filtroMaterial.addEventListener('change', aplicarFiltrosVisuales);
        }

        // Funcionalidad de filtro por categoría (para los enlaces de navegación de categorías)
        if (categoriasNav) {
            categoriasNav.addEventListener('click', (e) => {
                e.preventDefault(); // Evitar el comportamiento predeterminado del enlace
                if (e.target.tagName === 'A' && e.target.classList.contains('filtro-categoria')) {
                    const categoria = e.target.dataset.categoria;

                    // Remover la clase 'active-category' de todos los enlaces y añadirla al clicado
                    categoriasNav.querySelectorAll('.filtro-categoria').forEach(link => {
                        link.classList.remove('active-category');
                    });
                    e.target.classList.add('active-category');

                    if (categoria === 'Todos') {
                        // Si se selecciona "Todos", mostrar todos los productos y categorías
                        document.querySelectorAll('.categoria-productos').forEach(section => {
                            section.style.display = 'block';
                            section.querySelectorAll('.producto').forEach(prod => prod.style.display = 'block');
                        });
                        // Asegurarse de que los filtros de buscador y material se apliquen al estado "Todos"
                        aplicarFiltrosVisuales();
                        window.scrollTo({ top: 0, behavior: 'smooth' }); // Volver arriba
                    } else {
                        // Ocultar todas las categorías/productos y mostrar solo la seleccionada
                        document.querySelectorAll('.categoria-productos').forEach(section => {
                            section.style.display = 'none'; // Oculta la sección completa
                        });
                        const sectionId = categoria.replace(/[^a-zA-Z0-9]/g, '');
                        const seccion = document.getElementById(sectionId);
                        if (seccion) {
                            seccion.style.display = 'block'; // Muestra la sección de la categoría seleccionada
                            // Aplicar los filtros de búsqueda y material solo a los productos dentro de esta sección
                            seccion.querySelectorAll('.producto').forEach(productoDiv => {
                                const nombreProducto = productoDiv.querySelector('h3').textContent.toLowerCase();
                                const materialProducto = productoDiv.dataset.material.toLowerCase();
                                const textoBusqueda = buscador ? buscador.value.toLowerCase() : '';
                                const materialSeleccionado = filtroMaterial ? filtroMaterial.value.toLowerCase() : '';

                                const coincideNombre = nombreProducto.includes(textoBusqueda);
                                const coincideMaterial = !materialSeleccionado || materialSeleccionado === '' || materialProducto === materialSeleccionado;

                                if (coincideNombre && coincideMaterial) {
                                    productoDiv.style.display = 'block';
                                } else {
                                    productoDiv.style.display = 'none';
                                }
                            });

                            // Desplazarse suavemente a la sección
                            window.scrollTo({
                                top: seccion.offsetTop - 80, // Ajusta este valor si tu header tiene otra altura
                                behavior: 'smooth'
                            });
                        }
                    }
                }
            });
        }
    } // Fin if (contenedorCatalogo)

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