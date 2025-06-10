document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos comunes
    const shoppingCartBtn = document.getElementById('cartIconBtn'); // Seleccionamos el botón por su ID
    const cartCountSpan = document.querySelector('.cart-count'); // NUEVO: Contador de items en el carrito
    const carritoModal = document.getElementById('carritoModal');
    const cerrarCarrito = document.getElementById('cerrarCarrito');
    const listaCarrito = document.getElementById('listaCarrito');
    const totalCarrito = document.getElementById('totalCarrito');
    const vaciarCarritoBtn = document.getElementById('vaciarCarrito');

    // NUEVO: Referencias a elementos del mini-carrito de notificación
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
        // NUEVO: Cerrar la notificación del mini-carrito si el modal principal se abre
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

    // NUEVO: Funcionalidad para la notificación del mini-carrito
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
            notificacionTotal.textContent = totalMontoCarrito;

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

    // Función para renderizar el carrito
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

    // Función para eliminar un producto del carrito
    const eliminarDelCarrito = (productoId) => {
        carrito = carrito.filter(item => item.id !== productoId);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderizarCarrito();
        updateCartCount(); // Actualiza el contador al eliminar
        // No se muestra alerta al eliminar, solo se actualiza el carrito.
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
            // Lógica específica para cada página después de cargar los productos
            if (document.getElementById('contenedorCatalogo')) { // Si estamos en catalogo.html
                generarCardsProductos(window.productos);
            }
            if (document.getElementById('contenedorDestacados')) { // Si estamos en index.html
                cargarProductosDestacados();
            }
            renderizarCarrito(); // Renderiza el carrito inicial
            updateCartCount(); // Actualiza el contador del carrito al cargar la página
        })
        .catch(error => console.error('Error al cargar los productos:', error));


    // --- Lógica específica para la página 'catalogo.html' ---
    const contenedorCatalogo = document.getElementById('contenedorCatalogo');
    const buscador = document.getElementById('buscador');
    const filtroMaterial = document.getElementById('filtroMaterial');
    const categoriasNav = document.getElementById('categoriasNav');

    if (contenedorCatalogo) { // Esto asegura que solo se ejecute en catalogo.html
        // Función para generar las cards de productos (usada por catálogo y destacados)
        const generarCardsProductos = (productosParaMostrar, contenedor) => {
            if (!contenedor) return; // Asegurarse de que el contenedor exista

            contenedor.innerHTML = '';
            // Si es el catálogo completo, agrupamos por categoría.
            // Si es el de destacados, no necesitamos agrupar.
            const esCatalogoCompleto = (contenedor === contenedorCatalogo);
            const categoriasMap = new Map();

            if (esCatalogoCompleto) {
                productosParaMostrar.forEach(producto => {
                    if (!categoriasMap.has(producto.categoria)) {
                        categoriasMap.set(producto.categoria, []);
                    }
                    categoriasMap.get(producto.categoria).push(producto);
                });

                for (const [categoria, productosDeCategoria] of categoriasMap.entries()) {
                    const sectionId = categoria.replace(/[^a-zA-Z0-9]/g, '');
                    const section = document.createElement('section');
                    section.id = sectionId;
                    section.innerHTML = `<h2>${categoria}</h2><div class="destacados-grid"></div>`; // Se reutiliza la clase
                    contenedor.appendChild(section);

                    const gridContainer = section.querySelector('.destacados-grid');
                    productosDeCategoria.forEach(producto => crearCardProducto(producto, gridContainer));
                }
            } else { // Si no es el catálogo completo (ej. destacados)
                productosParaMostrar.forEach(producto => crearCardProducto(producto, contenedor));
            }

            // Asignar event listeners a los botones "Agregar al carrito"
            contenedor.querySelectorAll('.btn-agregar').forEach(button => {
                button.addEventListener('click', (e) => {
                    const productoId = parseInt(e.currentTarget.dataset.id);
                    agregarAlCarrito(productoId);
                });
            });
        };

        // Función auxiliar para crear una sola card de producto
        const crearCardProducto = (producto, contenedor) => {
            const productoDiv = document.createElement('div');
            productoDiv.classList.add('producto');
            if (producto.stock === 0) {
                productoDiv.classList.add('fuera-stock');
            }
            productoDiv.dataset.material = producto.material;

            const imagenSrc = producto.imagen ? producto.imagen : 'imagenescatalogo/sin-imagen.jpg'; // Ruta por defecto
            const imagenAlt = producto.nombre;

            productoDiv.innerHTML = `
                <img src="${imagenSrc}" alt="${imagenAlt}">
                <h3>${producto.nombre}</h3>
                <p>$${producto.precio}</p>
                ${producto.stock > 0 ? `<button class="btn-agregar" data-id="${producto.id}">Agregar al carrito</button>` : '<span class="sin-stock">FUERA DE STOCK</span>'}
            `;
            contenedor.appendChild(productoDiv);
        };


        // Funcionalidad del buscador (solo en catalogo.html)
        if (buscador) {
            buscador.addEventListener('input', () => {
                const textoBusqueda = buscador.value.toLowerCase();
                const materialSeleccionado = filtroMaterial ? filtroMaterial.value.toLowerCase() : '';

                const productosFiltrados = window.productos.filter(producto => {
                    const coincideNombre = producto.nombre.toLowerCase().includes(textoBusqueda);
                    const coincideMaterial = !materialSeleccionado || producto.material.toLowerCase() === materialSeleccionado;
                    return coincideNombre && coincideMaterial;
                });
                generarCardsProductos(productosFiltrados, contenedorCatalogo); // Pasar contenedorCatalogo
            });
        }

        // Funcionalidad del filtro por material (solo en catalogo.html)
        if (filtroMaterial) {
            filtroMaterial.addEventListener('change', () => {
                const textoBusqueda = buscador ? buscador.value.toLowerCase() : '';
                const materialSeleccionado = filtroMaterial.value.toLowerCase();

                const productosFiltrados = window.productos.filter(producto => {
                    const coincideNombre = producto.nombre.toLowerCase().includes(textoBusqueda);
                    const coincideMaterial = !materialSeleccionado || producto.material.toLowerCase() === materialSeleccionado;
                    return coincideNombre && coincideMaterial;
                });
                generarCardsProductos(productosFiltrados, contenedorCatalogo); // Pasar contenedorCatalogo
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
                            top: seccion.offsetTop - 80, // Ajusta este valor si tu header tiene otra altura
                            behavior: 'smooth'
                        });
                    }
                }
            });
        }
    } // Fin if (contenedorCatalogo)

    // --- NUEVO: Lógica para productos destacados (Solo para index.html) ---
    const contenedorDestacados = document.getElementById('contenedorDestacados');

    const cargarProductosDestacados = () => {
        if (contenedorDestacados && window.productos.length > 0) {
            const productosFiltrados = window.productos.filter(producto => producto.destacado);
            generarCardsProductos(productosFiltrados, contenedorDestacados);
        }
    };


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
            // Se asume que siempre hay 3 imágenes visibles en el carrusel real
            const anchoSlot = galeriaSlider.offsetWidth / 3;

            // Calcular el offset para centrar la imagen actual (indiceActualCarrusel)
            // El primer elemento real está en indice 1.
            // Para mostrar indiceActualCarrusel, la posición del transform debe ser
            // (1 - indiceActualCarrusel) * anchoSlot, ya que la imagen "0" es el clon del último
            // y la imagen "longitud-1" es el clon del primero.
            // Queremos que la imagen en `indiceActualCarrusel` esté en la posición central de los 3 visibles.
            // Para eso, necesitamos desplazar el slider de forma que el centro de la imagen
            // en `indiceActualCarrusel` quede en el centro del `galeria-container`.
            // Si tenemos 3 imágenes visibles, el centro de la "ventana" está en `1.5 * anchoSlot`.
            // La imagen `indiceActualCarrusel` comienza en `indiceActualCarrusel * anchoSlot`.
            // Por lo tanto, el desplazamiento necesario es `(1.5 - indiceActualCarrusel) * anchoSlot`.
            const offset = (1.5 - indiceActualCarrusel) * anchoSlot - (anchoSlot / 2); // Ajuste adicional para centrar si es necesario

            galeriaSlider.style.transform = `translateX(${offset}px)`;

            // Añadir clase 'central' a la imagen realmente central (visual)
            const centralImageIndex = Math.floor(galeriaSlider.children.length / 2); // Índice de la imagen central en la vista
            // Esto necesita ser ajustado para reflejar la imagen real que está en el centro.
            // Ya que tenemos clones, y el transform mueve el grupo, la imagen "central"
            // es la que corresponde a `indiceActualCarrusel`.
            if (imagenesCarrusel[indiceActualCarrusel]) {
                imagenesCarrusel[indiceActualCarrusel].classList.add('central');
            }
        }


        if (prevBtnGaleria) {
            prevBtnGaleria.addEventListener('click', () => {
                indiceActualCarrusel--;
                galeriaSlider.style.transition = 'transform 0.5s ease-in-out'; // Asegurar la transición
                actualizarCarrusel();
                if (indiceActualCarrusel < 1) { // Si hemos llegado al clon del último
                    setTimeout(() => {
                        galeriaSlider.style.transition = 'none'; // Desactivar transición
                        indiceActualCarrusel = imagenesCarrusel.length - 2; // Ir a la penúltima (última real)
                        actualizarCarrusel(); // Actualizar inmediatamente sin transición
                    }, 500); // Mismo tiempo que la transición
                }
            });
        }

        if (nextBtnGaleria) {
            nextBtnGaleria.addEventListener('click', () => {
                indiceActualCarrusel++;
                galeriaSlider.style.transition = 'transform 0.5s ease-in-out'; // Asegurar la transición
                actualizarCarrusel();
                if (indiceActualCarrusel >= imagenesCarrusel.length - 1) { // Si hemos llegado al clon del primero
                    setTimeout(() => {
                        galeriaSlider.style.transition = 'none'; // Desactivar transición
                        indiceActualCarrusel = 1; // Ir a la segunda (primera real)
                        actualizarCarrusel(); // Actualizar inmediatamente sin transición
                    }, 500); // Mismo tiempo que la transición
                }
            });
        }

        // Inicializar el carrusel en la carga
        setTimeout(() => {
            actualizarCarrusel();
        }, 100);
    } // Fin if (galeriaSlider)

    // Llama a renderizarCarrito y updateCartCount al inicio para cargar el estado del carrito
    // y el contador al cargar CUALQUIER página (index.html o catalogo.html)
    // Esto se mueve al .then() del fetch de productos.json para asegurar que `window.productos` esté cargado.
});