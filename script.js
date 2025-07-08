document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado y script.js iniciado."); // Confirmar que el script se ejecuta

    // --- 1. Referencias a elementos del DOM ---
    const shoppingCartBtn = document.getElementById('cartIconBtn');
    const cartCountSpan = document.querySelector('.cart-count');
    const carritoModal = document.getElementById('carritoModal');
    const cerrarCarrito = document.getElementById('cerrarCarrito');
    const listaCarrito = document.getElementById('listaCarrito');
    const totalCarrito = document.getElementById('totalCarrito');
    const vaciarCarritoBtn = document.getElementById('vaciarCarrito');
    const mensajeCarritoVacio = document.getElementById('mensajeCarritoVacio'); // ¡Referencia añadida!

    const miniCarritoNotificacion = document.getElementById('miniCarritoNotificacion');
    const cerrarNotificacionBtn = document.getElementById('cerrarNotificacion');
    const notificacionImagen = document.getElementById('notificacionImagen');
    const notificacionNombre = document.getElementById('notificacionNombre');
    const notificacionPrecio = document.getElementById('notificacionPrecio');
    const notificacionMensaje = document.getElementById('notificacionMensaje');
    const notificacionCantidadTotal = document.getElementById('notificacionCantidadTotal');
    const notificacionTotal = document.getElementById('notificacionTotal');
    const verCarritoDesdeNotificacionBtn = document.getElementById('verCarritoDesdeNotificacion');

    // Estas referencias pueden ser null si el elemento no existe en la página actual (ej. catalogo.html vs index.html)
    const contenedorCatalogo = document.getElementById('contenedorCatalogo');
    const buscador = document.getElementById('buscador');
    const filtroMaterial = document.getElementById('filtroMaterial');
    const categoriasNav = document.getElementById('categoriasNav');

    const galeriaSlider = document.getElementById('galeriaSlider');
    const prevBtnGaleria = document.getElementById('prevBtnGaleria');
    const nextBtnGaleria = document.getElementById('nextBtnGaleria');

    // Referencia al botón de scroll-to-top
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');

    // Referencias para los nuevos elementos del modal de carrito (Medios de Envío)
    const radioEnvioDomicilio = document.getElementById('envioDomicilio');
    const radioRetirarPunto = document.getElementById('retirarPunto');
    const btnIniciarCompra = document.getElementById('btnIniciarCompra');
    // Campo para el mensaje de coordinación (si se elige envío a domicilio)
    const mensajeCoordinarEnvio = document.getElementById('mensajeCoordinarEnvio');
    const divEnvioDomicilio = document.getElementById('divEnvioDomicilio'); // Referencia al div contenedor para estilos
    const divRetirarPunto = document.getElementById('divRetirarPunto');     // Referencia al div contenedor para estilos


    // AÑADIDO: Verificar que las referencias clave no son null (para depuración)
    console.log("Referencia a shoppingCartBtn:", shoppingCartBtn);
    console.log("Referencia a carritoModal:", carritoModal);
    console.log("Referencia a cerrarCarrito:", cerrarCarrito);
    console.log("Referencia a scrollToTopBtn:", scrollToTopBtn);
    console.log("Referencia a contenedorCatalogo:", contenedorCatalogo);
    console.log("Referencia a radioEnvioDomicilio:", radioEnvioDomicilio);
    console.log("Referencia a radioRetirarPunto:", radioRetirarPunto);
    console.log("Referencia a btnIniciarCompra:", btnIniciarCompra);
    console.log("Referencia a mensajeCoordinarEnvio:", mensajeCoordinarEnvio);
    console.log("Referencia a divEnvioDomicilio:", divEnvioDomicilio);
    console.log("Referencia a divRetirarPunto:", divRetirarPunto);


    // --- 2. Variables Globales ---
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    window.productos = []; // Aquí se almacenarán todos los productos cargados desde JSON
    let imagenesCarrusel = [];
    let indiceActualCarrusel = 0;

    // Estado del envío (para habilitar/deshabilitar el botón de compra)
    // true si se ha seleccionado una opción válida de envío (domicilio o punto de retiro)
    let envioSeleccionadoValido = false;

    // --- 3. Declaración de Funciones ---

    const crearCardProducto = (producto) => {
        const productoDiv = document.createElement('div');
        productoDiv.classList.add('producto');
        if (producto.stock === 0) {
            productoDiv.classList.add('fuera-stock');
        }
        // Añadir dataset para filtros, incluso si no se usan directamente en index.html
        productoDiv.dataset.material = producto.material;
        productoDiv.dataset.categoria = producto.categoria;

        const defaultImagePath = 'imagenescatalogo/sin-imagen.jpg';
        // Usar la imagen del producto si existe y no está vacía, de lo contrario, la imagen por defecto
        const imagenSrc = producto.imagen && producto.imagen.trim() !== "" ? producto.imagen : defaultImagePath;
        const imagenAlt = producto.nombre || 'Producto';

        productoDiv.innerHTML = `
            <img src="${imagenSrc}" alt="${imagenAlt}" onerror="this.onerror=null;this.src='${defaultImagePath}';">
            <h3>${producto.nombre}</h3>
            <p>$${producto.precio.toFixed(2)}</p>
            ${producto.stock > 0 ? `<button class="btn-agregar" data-id="${producto.id}">Agregar al carrito</button>` : '<span class="sin-stock">FUERA DE STOCK</span>'}
        `;
        return productoDiv;
    };

    const generarCardsProductos = (productosParaMostrar, contenedor, esCatalogoCompleto) => {
        if (!contenedor) {
            // console.warn("generarCardsProductos: Contenedor no proporcionado o no encontrado.");
            return;
        }

        contenedor.innerHTML = ''; // Limpia el contenedor

        // Lógica para generar las categorías en la navegación del catálogo
        if (esCatalogoCompleto && categoriasNav && window.productos.length > 0) {
            // Obtener todas las categorías únicas y ordenarlas
            const todasLasCategorias = [...new Set(window.productos.map(p => p.categoria))].sort();
            
            // Determinar la categoría activa actual para mantenerla resaltada
            let currentActiveCategory = 'Todos'; // Por defecto, si no hay ninguna activa
            const activeLink = categoriasNav.querySelector('.filtro-categoria.active-category');
            if (activeLink) {
                currentActiveCategory = activeLink.dataset.categoria;
            }

            // Crear el enlace "Todos"
            categoriasNav.innerHTML = `<a href="#" data-categoria="Todos" class="filtro-categoria ${currentActiveCategory === 'Todos' ? 'active-category' : ''}">Todos</a>`;

            // Crear enlaces para cada categoría
            todasLasCategorias.forEach(cat => {
                const link = document.createElement('a');
                link.href = `#${cat.replace(/[^a-zA-Z0-9]/g, '')}`; // ID para el anclaje si es necesario
                link.dataset.categoria = cat;
                link.classList.add('filtro-categoria');
                if (cat === currentActiveCategory) {
                    link.classList.add('active-category');
                }
                link.textContent = cat;
                categoriasNav.appendChild(link);
            });
        }

        // Determinar si se debe agrupar por categorías o mostrar como una sola lista
        const categoriaActiva = categoriasNav ? categoriasNav.querySelector('.filtro-categoria.active-category')?.dataset.categoria : 'Todos';
        const hayBusquedaActiva = buscador && buscador.value.trim() !== '';
        const hayFiltroMaterialActivo = filtroMaterial && filtroMaterial.value !== '';
        
        const agruparPorCategorias = esCatalogoCompleto &&
                                     categoriaActiva === 'Todos' &&
                                     !hayBusquedaActiva &&
                                     !hayFiltroMaterialActivo;

        if (agruparPorCategorias) {
            const categoriasMap = new Map();
            // Inicializar el mapa con todas las categorías para asegurar que aparezcan aunque no tengan productos filtrados
            // Solo si window.productos está cargado, si no, puede dar error.
            if (window.productos && window.productos.length > 0) {
                // Obtener todas las categorías únicas de los productos cargados
                const uniqueCategories = [...new Set(window.productos.map(p => p.categoria))].sort();
                uniqueCategories.forEach(categoria => {
                    categoriasMap.set(categoria, []);
                });
            }


            // Llenar el mapa con los productos que deben mostrarse
            productosParaMostrar.forEach(producto => {
                if (categoriasMap.has(producto.categoria)) {
                    categoriasMap.get(producto.categoria).push(producto);
                }
            });

            // Renderizar cada sección de categoría
            for (const [categoria, productosDeCategoria] of categoriasMap.entries()) {
                if (productosDeCategoria.length > 0) { // Solo si hay productos en la categoría
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
            // Mostrar todos los productos filtrados en un solo grid, sin agrupar por categorías
            const gridContainerMain = document.createElement('div');
            gridContainerMain.classList.add('productos-grid');
            contenedor.appendChild(gridContainerMain);
            
            productosParaMostrar.forEach(producto => gridContainerMain.appendChild(crearCardProducto(producto)));
        }

        // Adjuntar eventos a los botones "Agregar al carrito"
        contenedor.querySelectorAll('.btn-agregar').forEach(button => {
            button.addEventListener('click', (e) => {
                const productoId = parseInt(e.currentTarget.dataset.id);
                agregarAlCarrito(productoId);
            });
        });
    };

    const cargarProductosDestacados = () => {
        const contenedorDestacados = document.getElementById('contenedorDestacados');
        if (contenedorDestacados && window.productos.length > 0) {
            const productosFiltrados = window.productos.filter(producto => producto.destacado);
            generarCardsProductos(productosFiltrados, contenedorDestacados, false); // No es catálogo completo
        }
    };

    const aplicarFiltros = () => {
        let productosFiltrados = [...window.productos];

        const textoBusqueda = buscador ? buscador.value.toLowerCase() : '';
        const materialSeleccionado = filtroMaterial ? filtroMaterial.value.toLowerCase() : '';
        const categoriaActiva = categoriasNav ? categoriasNav.querySelector('.filtro-categoria.active-category')?.dataset.categoria : 'Todos';

        if (textoBusqueda) {
            productosFiltrados = productosFiltrados.filter(producto =>
                producto.nombre.toLowerCase().includes(textoBusqueda)
            );
        }

        if (materialSeleccionado && materialSeleccionado !== 'todos los materiales') {
            productosFiltrados = productosFiltrados.filter(producto =>
                producto.material.toLowerCase() === materialSeleccionado
            );
        }
        
        if (categoriaActiva && categoriaActiva !== 'Todos') {
             productosFiltrados = productosFiltrados.filter(producto =>
                 producto.categoria.toLowerCase() === categoriaActiva.toLowerCase()
             );
        }

        generarCardsProductos(productosFiltrados, contenedorCatalogo, true);
    };

    // Funciones del Carrito
    const updateCartCount = () => {
        if (cartCountSpan) {
            const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
            cartCountSpan.textContent = totalItems > 0 ? totalItems : '';
            cartCountSpan.style.display = totalItems > 0 ? 'inline-block' : 'none';
        }
    };

    const toggleCarritoModal = (e) => {
        console.log("toggleCarritoModal fue llamado.");
        // Comentar la siguiente línea si quieres que el clic en el fondo oscuro cierre el modal
        // if (e && typeof e.stopPropagation === 'function') {
        //     e.stopPropagation();
        //     console.log("e.stopPropagation() fue llamado.");
        // }
        
        if (carritoModal) {
            const currentDisplay = carritoModal.style.display;
            const newDisplay = currentDisplay === 'flex' ? 'none' : 'flex';
            carritoModal.style.display = newDisplay;
            console.log(`Display del carritoModal cambiado de '${currentDisplay}' a '${newDisplay}'.`);
            renderizarCarrito(); // Asegurarse de que se renderiza cada vez que se abre
        } else {
            console.warn("toggleCarritoModal: carritoModal no fue encontrado.");
        }
        if (miniCarritoNotificacion && carritoModal && carritoModal.style.display === 'flex') {
            miniCarritoNotificacion.style.display = 'none';
            console.log("miniCarritoNotificacion ocultado al abrir modal.");
        }
    };

    const mostrarNotificacionCarrito = (producto, cantidadAgregada) => {
        if (miniCarritoNotificacion) {
            notificacionImagen.src = producto.imagen || 'imagenescatalogo/sin-imagen.jpg';
            notificacionImagen.alt = producto.nombre;
            notificacionNombre.textContent = producto.nombre;
            notificacionPrecio.textContent = `${cantidadAgregada} x $${producto.precio.toFixed(2)}`;
            notificacionMensaje.textContent = `¡${producto.nombre} agregado al carrito!`;

            const totalItemsEnCarrito = carrito.reduce((sum, item) => sum + item.cantidad, 0);
            const totalMontoCarrito = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
            notificacionCantidadTotal.textContent = totalItemsEnCarrito;
            notificacionTotal.textContent = totalMontoCarrito.toFixed(2);

            miniCarritoNotificacion.style.display = 'block';
            console.log("miniCarritoNotificacion mostrado.");

            setTimeout(() => {
                miniCarritoNotificacion.style.display = 'none';
                console.log("miniCarritoNotificacion ocultado por timeout.");
            }, 3000);
        } else {
            console.warn("mostrarNotificacionCarrito: miniCarritoNotificacion no fue encontrado.");
        }
    };

    const agregarAlCarrito = (productoId) => {
        console.log(`Intentando agregar producto con ID: ${productoId} al carrito.`);
        if (!window.productos || window.productos.length === 0) {
            console.warn("Intentando agregar al carrito sin productos cargados. Asegúrate de que productos.json se haya cargado.");
            return;
        }

        const productoEnCatalogo = window.productos.find(prod => prod.id === productoId);

        if (!productoEnCatalogo) {
            console.error(`Producto con ID ${productoId} no encontrado en el catálogo.`);
            return;
        }

        if (productoEnCatalogo.stock <= 0) {
            alert(`¡${productoEnCatalogo.nombre} está fuera de stock!`);
            console.log(`${productoEnCatalogo.nombre} fuera de stock.`);
            return;
        }

        const productoExistente = carrito.find(item => item.id === productoId);
        let cantidadAgregadaParaNotificacion = 1; // Cantidad del item al momento de la notificación

        if (productoExistente) {
            if (productoExistente.cantidad < productoEnCatalogo.stock) {
                productoExistente.cantidad++;
                cantidadAgregadaParaNotificacion = productoExistente.cantidad; // La cantidad total en el carrito de ese producto
                console.log(`Cantidad de ${productoEnCatalogo.nombre} en carrito incrementada a ${productoExistente.cantidad}.`);
            } else {
                alert(`¡No hay más stock disponible de ${productoEnCatalogo.nombre}!`);
                console.log(`No hay más stock de ${productoEnCatalogo.nombre}.`);
                return;
            }
        } else {
            carrito.push({ ...productoEnCatalogo, cantidad: 1 });
            console.log(`Producto ${productoEnCatalogo.nombre} agregado al carrito por primera vez.`);
        }

        localStorage.setItem('carrito', JSON.stringify(carrito));
        console.log("Carrito guardado en localStorage:", carrito);
        renderizarCarrito();
        updateCartCount();
        mostrarNotificacionCarrito(productoEnCatalogo, cantidadAgregadaParaNotificacion); // Pasar la cantidad actual del producto en el carrito
    };

    const eliminarDelCarrito = (productoId) => {
        console.log(`Intentando eliminar producto con ID: ${productoId} del carrito.`);
        carrito = carrito.filter(item => item.id !== productoId);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderizarCarrito();
        updateCartCount();
        console.log("Producto eliminado. Carrito actual:", carrito);
    };

    // NUEVA FUNCIÓN: Cambia la cantidad de un producto en el carrito
    const cambiarCantidad = (productoId, nuevaCantidad) => {
        console.log(`Cambiando cantidad para ID ${productoId} a ${nuevaCantidad}.`);
        const productoEnCarrito = carrito.find(item => item.id === productoId);
        const productoEnCatalogo = window.productos.find(prod => prod.id === productoId);

        if (!productoEnCarrito || !productoEnCatalogo) {
            console.error("Producto no encontrado en el carrito o catálogo para cambiar cantidad.");
            return;
        }

        nuevaCantidad = parseInt(nuevaCantidad);
        
        // Si la cantidad es 0 o inválida, se elimina el producto del carrito
        if (isNaN(nuevaCantidad) || nuevaCantidad <= 0) {
            eliminarDelCarrito(productoId);
            console.log(`Cantidad inválida o cero para ID ${productoId}, eliminando del carrito.`);
            return;
        }

        // Limitar la cantidad al stock disponible
        if (nuevaCantidad > productoEnCatalogo.stock) {
            alert(`No hay suficiente stock de ${productoEnCatalogo.nombre}. Solo quedan ${productoEnCatalogo.stock} unidades.`);
            productoEnCarrito.cantidad = productoEnCatalogo.stock; // Ajustar a la cantidad máxima disponible
            console.log(`Stock limitado para ${productoEnCatalogo.nombre}. Cantidad ajustada a ${productoEnCatalogo.stock}.`);
        } else {
            productoEnCarrito.cantidad = nuevaCantidad;
            console.log(`Cantidad de ${productoEnCatalogo.nombre} actualizada a ${nuevaCantidad}.`);
        }

        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderizarCarrito();
        updateCartCount();
    };

    // ACTUALIZADA: Genera el HTML de un solo ítem del carrito (con controles de cantidad)
    const crearItemCarritoHTML = (item) => {
        const productoOriginal = window.productos.find(p => p.id === item.id);
        const defaultImagePath = 'imagenescatalogo/sin-imagen.jpg';
        const itemImageSrc = item.imagen && item.imagen.trim() !== "" ? item.imagen : defaultImagePath;
        // Obtener el stock real del producto, o usar la cantidad actual si no se encuentra el original
        const maxStock = productoOriginal ? productoOriginal.stock : item.cantidad; 

        return `
            <li data-id="${item.id}" class="carrito-item">
                <div class="carrito-item-info">
                    <img src="${itemImageSrc}" alt="${item.nombre}" class="carrito-item-img" onerror="this.onerror=null;this.src='${defaultImagePath}';">
                    <div class="carrito-item-details">
                        <span class="carrito-item-nombre">${item.nombre}</span>
                        <span class="carrito-item-precio-unidad">$${item.precio.toFixed(2)} c/u</span>
                    </div>
                </div>
                <div class="carrito-item-controles">
                    <button class="btn-cantidad-restar" data-id="${item.id}" ${item.cantidad <= 1 ? 'disabled' : ''}>-</button>
                    <input type="number" class="cantidad-input" value="${item.cantidad}" min="1" max="${maxStock}" data-id="${item.id}" readonly>
                    <button class="btn-cantidad-sumar" data-id="${item.id}" ${item.cantidad >= maxStock ? 'disabled' : ''}>+</button>
                    <span class="carrito-item-subtotal">$${(item.precio * item.cantidad).toFixed(2)}</span>
                    <button class="btn-eliminar" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                </div>
            </li>
        `;
    };

    // ACTUALIZADA: Renderiza todo el carrito
    const renderizarCarrito = () => {
        console.log("renderizarCarrito fue llamado. Carrito actual:", carrito);
        if (!listaCarrito || !totalCarrito || !mensajeCarritoVacio) {
            console.error("Elementos del carrito no encontrados en el DOM para renderizar.");
            return;
        }

        listaCarrito.innerHTML = ''; // Limpiar la lista antes de volver a renderizar
        let total = 0;

        if (carrito.length === 0) {
            mensajeCarritoVacio.style.display = 'block'; // Mostrar mensaje de carrito vacío
            listaCarrito.style.display = 'none'; // Ocultar la lista si está vacía
            console.log("Carrito vacío: Mostrando mensaje de vacío.");
        } else {
            mensajeCarritoVacio.style.display = 'none'; // Ocultar mensaje de carrito vacío
            listaCarrito.style.display = 'block'; // Mostrar la lista si hay ítems
            carrito.forEach(item => {
                listaCarrito.innerHTML += crearItemCarritoHTML(item);
                total += item.precio * item.cantidad;
            });
            console.log("Carrito con items: Mostrando items.");
        }
        totalCarrito.textContent = total.toFixed(2);

        // Actualizar estado del botón "Iniciar Compra"
        if (btnIniciarCompra) {
            // El botón se deshabilita si el carrito está vacío O si no se ha seleccionado una opción de envío válida
            btnIniciarCompra.disabled = carrito.length === 0 || !envioSeleccionadoValido;
            if (carrito.length === 0) {
                console.log("Botón 'Iniciar Compra' deshabilitado (carrito vacío).");
            } else if (!envioSeleccionadoValido) {
                console.log("Botón 'Iniciar Compra' deshabilitado (envío no válido).");
            } else {
                console.log("Botón 'Iniciar Compra' habilitado.");
            }
        }

        // Asegurarse de que las secciones de envío se muestran/ocultan según lo definido en HTML
        const opcionesEnvioDomicilio = document.getElementById('opcionesEnvioDomicilio'); // Esta referencia no existe en el HTML que me pasaste, la ignoramos.
        const opcionesRetirarPor = document.getElementById('opcionesRetirarPor'); // Esta referencia no existe en el HTML que me pasaste, la ignoramos.
        
        // La lógica de handleEnvioOptions ya maneja la visibilidad de divEnvioDomicilio y divRetirarPunto.
        // Las líneas de abajo que hacían referencia a opcionesEnvioDomicilio y opcionesRetirarPor las he eliminado
        // porque no existen en tu HTML y causaban confusión.

        // Adjuntar eventos a los botones de eliminar y cantidad DESPUÉS de que se hayan agregado al DOM
        adjuntarEventosCarrito();
    };

    // NUEVA FUNCIÓN: Centraliza la adjunción de eventos a los elementos del carrito
    const adjuntarEventosCarrito = () => {
        // Eventos para botones de eliminar
        document.querySelectorAll('.btn-eliminar').forEach(button => {
            // Se usa removeEventListener + addEventListener o se asigna directamente a .onclick
            // para evitar múltiples listeners en cada renderizado.
            button.onclick = (e) => {
                const productoId = parseInt(e.currentTarget.dataset.id);
                eliminarDelCarrito(productoId);
                console.log(`Evento 'eliminar' disparado para ID: ${productoId}.`);
            };
        });

        // Eventos para botones de sumar cantidad
        document.querySelectorAll('.btn-cantidad-sumar').forEach(button => {
            button.onclick = (e) => {
                const productoId = parseInt(e.currentTarget.dataset.id);
                const itemEnCarrito = carrito.find(item => item.id === productoId);
                if (itemEnCarrito) {
                    cambiarCantidad(productoId, itemEnCarrito.cantidad + 1);
                    console.log(`Evento 'sumar cantidad' disparado para ID: ${productoId}.`);
                }
            };
        });

        // Eventos para botones de restar cantidad
        document.querySelectorAll('.btn-cantidad-restar').forEach(button => {
            button.onclick = (e) => {
                const productoId = parseInt(e.currentTarget.dataset.id);
                const itemEnCarrito = carrito.find(item => item.id === productoId);
                if (itemEnCarrito && itemEnCarrito.cantidad > 1) { // Asegurar que no baje de 1
                    cambiarCantidad(productoId, itemEnCarrito.cantidad - 1);
                    console.log(`Evento 'restar cantidad' disparado para ID: ${productoId}.`);
                } else if (itemEnCarrito && itemEnCarrito.cantidad === 1) {
                    // Si la cantidad es 1 y se intenta restar, se elimina el producto
                    eliminarDelCarrito(productoId);
                    console.log(`Producto con ID: ${productoId} eliminado al intentar bajar de 1.`);
                }
            };
        });
    };


    // Funciones del Carrusel
    function actualizarCarrusel() {
        if (imagenesCarrusel.length === 0 || !galeriaSlider) return;

        galeriaSlider.style.transition = 'transform 0.5s ease-in-out';
        imagenesCarrusel.forEach(img => img.classList.remove('central'));

        const anchoContenedor = galeriaSlider.parentElement.offsetWidth;
        const anchoSlot = anchoContenedor / 3;

        const offset = -(indiceActualCarrusel - 1) * anchoSlot;
        galeriaSlider.style.transform = `translateX(${offset}px)`;

        // Asegurarse de que el índice actual sea válido
        if (indiceActualCarrusel >= 0 && indiceActualCarrusel < imagenesCarrusel.length) {
            imagenesCarrusel[indiceActualCarrusel].classList.add('central');
        }
    }

    // --- 4. Event Listeners y Lógica de Inicialización ---

    // Event Listeners del Carrito
    if (shoppingCartBtn) {
        shoppingCartBtn.addEventListener('click', (e) => {
            console.log("Clic en shoppingCartBtn (icono del carrito).");
            toggleCarritoModal(e);
        });
    } else {
        console.warn("shoppingCartBtn (cartIconBtn) no encontrado.");
    }

    if (cerrarCarrito) {
        cerrarCarrito.addEventListener('click', (e) => {
            console.log("Clic en cerrarCarrito (botón 'X').");
            toggleCarritoModal(e);
        });
    } else {
        console.warn("cerrarCarrito no encontrado.");
    }

    if (carritoModal) {
        carritoModal.addEventListener('click', (e) => {
            console.log("Clic en carritoModal (fondo del modal). Target del clic:", e.target);
            // Asegúrate de que el clic es directamente en el fondo oscuro del modal, no en su contenido
            if (e.target === carritoModal) {
                console.log("Clic detectado en el fondo directo de carritoModal.");
                toggleCarritoModal(e);
            } else {
                console.log("Clic dentro del contenido del modal, no se cierra.");
            }
        });
    } else {
        console.warn("carritoModal no encontrado al adjuntar listener de clic.");
    }

    if (cerrarNotificacionBtn) {
        cerrarNotificacionBtn.addEventListener('click', () => {
            console.log("Clic en cerrarNotificacionBtn.");
            if (miniCarritoNotificacion) {
                miniCarritoNotificacion.style.display = 'none';
            }
        });
    }

    if (verCarritoDesdeNotificacionBtn) {
        verCarritoDesdeNotificacionBtn.addEventListener('click', (e) => {
            console.log("Clic en verCarritoDesdeNotificacionBtn.");
            if (miniCarritoNotificacion) {
                miniCarritoNotificacion.style.display = 'none';
            }
            toggleCarritoModal(e);
        });
    }

    if (vaciarCarritoBtn) {
        vaciarCarritoBtn.addEventListener('click', () => {
            console.log("Clic en vaciarCarritoBtn.");
            carrito = [];
            localStorage.setItem('carrito', JSON.stringify(carrito));
            renderizarCarrito();
            updateCartCount();
            alert('Se ha vaciado el carrito.');
        });
    }

    // Event listener para el botón INICIAR COMPRA
    if (btnIniciarCompra) {
        btnIniciarCompra.addEventListener('click', () => {
            if (carrito.length === 0) {
                alert('Tu carrito está vacío. Agrega productos antes de iniciar la compra.');
                return;
            }

            let metodoEnvioSeleccionado = '';
            if (radioEnvioDomicilio && radioEnvioDomicilio.checked) {
                metodoEnvioSeleccionado = 'domicilio';
            } else if (radioRetirarPunto && radioRetirarPunto.checked) {
                metodoEnvioSeleccionado = 'retiro';
            }

            if (metodoEnvioSeleccionado) {
                // Guardar los datos del carrito y el método de envío en localStorage
                localStorage.setItem('checkoutData', JSON.stringify({
                    carrito: carrito,
                    metodoEnvio: metodoEnvioSeleccionado
                }));
                // Redirigir a la página de checkout
                window.location.href = 'checkout.html';
            } else {
                alert('Por favor, selecciona un método de envío (Domicilio o Retirar por punto) para iniciar la compra.');
                console.log('Ningún método de envío seleccionado.');
            }
        });
    }


    // Event Listeners del Catálogo (solo se adjuntan si los elementos existen en el DOM de la página actual)
    if (contenedorCatalogo) {
        if (buscador) {
            buscador.addEventListener('input', aplicarFiltros);
        }
        if (filtroMaterial) {
            filtroMaterial.addEventListener('change', aplicarFiltros);
        }
        if (categoriasNav) {
            categoriasNav.addEventListener('click', (e) => {
                e.preventDefault(); // Evitar el comportamiento por defecto del enlace
                if (e.target.tagName === 'A' && e.target.classList.contains('filtro-categoria')) {
                    // Remover la clase activa de todos los enlaces de categoría
                    categoriasNav.querySelectorAll('.filtro-categoria').forEach(link => {
                        link.classList.remove('active-category');
                    });
                    // Añadir la clase activa al enlace clicado
                    e.target.classList.add('active-category');

                    const categoriaSeleccionada = e.target.dataset.categoria;
                    aplicarFiltros(); // Re-aplicar filtros para mostrar solo la categoría seleccionada

                    // Desplazarse a la sección si no hay búsqueda o filtro de material activo
                    const hayBusquedaActiva = buscador && buscador.value.trim() !== '';
                    const hayFiltroMaterialActivo = filtroMaterial && filtroMaterial.value !== '';

                    if (!hayBusquedaActiva && !hayFiltroMaterialActivo) {
                        if (categoriaSeleccionada !== 'Todos') {
                            const sectionId = categoriaSeleccionada.replace(/[^a-zA-Z0-9]/g, '');
                            const seccion = document.getElementById(sectionId);
                            if (seccion) {
                                seccion.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                console.log(`Desplazándose a la sección: ${sectionId}`);
                            }
                        } else {
                            // Si se selecciona "Todos", desplazarse al principio del contenedorCatalogo
                            if (contenedorCatalogo) {
                                contenedorCatalogo.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                console.log('Desplazándose al inicio del catálogo (Todos).');
                            }
                        }
                    }
                }
            });
        }
    }

    // Event Listeners del Carrusel (solo si los elementos existen)
    if (galeriaSlider) {
        // Cargar imágenes del carrusel si no están ya en el HTML
        if (galeriaSlider.children.length === 0) {
            // Ejemplo de carga de imágenes (ajusta esto si tus imágenes se cargan de otra forma)
            const imagenes = [
                'imagenescarrusel/carrusel-1.jpg',
                'imagenescarrusel/carrusel-2.jpg',
                'imagenescarrusel/carrusel-3.jpg',
                'imagenescarrusel/carrusel-4.jpg',
                'imagenescarrusel/carrusel-5.jpg',
                'imagenescarrusel/carrusel-6.jpg',
                'imagenescarrusel/carrusel-7.jpg',
                'imagenescarrusel/carrusel-8.jpg',
                'imagenescarrusel/carrusel-9.jpg',
                'imagenescarrusel/carrusel-10.jpg'
            ];
            imagenes.forEach(src => {
                const img = document.createElement('img');
                img.src = src;
                img.alt = 'Imagen del Carrusel';
                img.classList.add('galeria-img');
                galeriaSlider.appendChild(img);
            });
        }
        imagenesCarrusel = Array.from(galeriaSlider.children);
        indiceActualCarrusel = 1; // Para que la segunda imagen (índice 1) empiece centrada
        actualizarCarrusel();

        if (prevBtnGaleria) {
            prevBtnGaleria.addEventListener('click', () => {
                indiceActualCarrusel = (indiceActualCarrusel === 0) ? imagenesCarrusel.length - 1 : indiceActualCarrusel - 1;
                actualizarCarrusel();
            });
        }

        if (nextBtnGaleria) {
            nextBtnGaleria.addEventListener('click', () => {
                indiceActualCarrusel = (indiceActualCarrusel === imagenesCarrusel.length - 1) ? 0 : indiceActualCarrusel + 1;
                actualizarCarrusel();
            });
        }
    } else {
        console.warn("Galeria Slider no encontrado. Los eventos de carrusel no se adjuntarán.");
    }


    // Event Listener para Scroll-to-Top
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) { // Muestra el botón después de 300px de scroll
                scrollToTopBtn.classList.add('show');
            } else {
                scrollToTopBtn.classList.remove('show');
            }
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            console.log("Clic en 'Scroll to Top'.");
        });
    } else {
        console.warn("scrollToTopBtn no encontrado.");
    }

    // --- Lógica y Eventos para Medios de Envío en el Carrito (NUEVO) ---

    // Función para manejar la visibilidad y validación de los métodos de envío
    const handleEnvioOptions = () => {
        if (radioEnvioDomicilio && divEnvioDomicilio && radioRetirarPunto && divRetirarPunto) {
            if (radioEnvioDomicilio.checked) {
                divEnvioDomicilio.style.display = 'block';
                divRetirarPunto.style.display = 'none';
                if (mensajeCoordinarEnvio) {
                    mensajeCoordinarEnvio.style.display = 'block'; // Mostrar mensaje de coordinación
                }
                // Envío a domicilio siempre es válido una vez seleccionado (sin CP)
                envioSeleccionadoValido = true;
                console.log("Envío a domicilio seleccionado. Valido:", envioSeleccionadoValido);
            } else if (radioRetirarPunto.checked) {
                divEnvioDomicilio.style.display = 'none';
                divRetirarPunto.style.display = 'block';
                if (mensajeCoordinarEnvio) {
                    mensajeCoordinarEnvio.style.display = 'none'; // Ocultar mensaje de coordinación
                }
                // Retiro en punto siempre es válido una vez seleccionado
                envioSeleccionadoValido = true;
                console.log("Retirar en punto seleccionado. Valido:", envioSeleccionadoValido);
            } else {
                // Ninguna opción seleccionada o caso inicial
                divEnvioDomicilio.style.display = 'none';
                divRetirarPunto.style.display = 'none';
                if (mensajeCoordinarEnvio) {
                    mensajeCoordinarEnvio.style.display = 'none';
                }
                envioSeleccionadoValido = false;
                console.log("Ningún envío seleccionado.");
            }
            // Asegurarse de que el botón de iniciar compra refleje la validez del envío
            if (btnIniciarCompra) {
                btnIniciarCompra.disabled = carrito.length === 0 || !envioSeleccionadoValido;
            }
        }
    };

    // Event listeners para los radios de envío
    if (radioEnvioDomicilio) {
        radioEnvioDomicilio.addEventListener('change', handleEnvioOptions);
    }
    if (radioRetirarPunto) {
        radioRetirarPunto.addEventListener('change', handleEnvioOptions);
    }
    // inputCodigoPostal y btnCalcularEnvio ya no tienen event listeners aquí
    // linkBuscarAqui ya no tiene event listener aquí

    // --- 5. Carga Inicial de Datos y Renderizado ---

    // Función para cargar productos desde un JSON
    const cargarProductosJSON = async () => {
        try {
            const response = await fetch('productos.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            window.productos = await response.json();
            console.log("Productos cargados desde productos.json:", window.productos);

            // Una vez que los productos estén cargados, renderiza los destacados y el catálogo si existen
            cargarProductosDestacados(); // Para index.html
            if (contenedorCatalogo) { // Para catalogo.html
                aplicarFiltros(); // Renderiza el catálogo completo o con filtros iniciales
            }
            renderizarCarrito(); // Asegura que el carrito se renderiza con stock real
            updateCartCount(); // Actualiza el contador del carrito

            // Después de cargar productos y renderizar el carrito, inicializar opciones de envío
            handleEnvioOptions();

        } catch (error) {
            console.error('Error al cargar los productos:', error);
            // Podrías mostrar un mensaje al usuario aquí si la carga falla
            if (contenedorCatalogo) {
                contenedorCatalogo.innerHTML = '<p class="error-message">Error al cargar los productos. Por favor, inténtalo de nuevo más tarde.</p>';
            }
        }
    };

    // Cargar productos al inicio
    cargarProductosJSON();

    // Renderizar carrito y actualizar contador al inicio, por si ya hay items en localStorage
    renderizarCarrito();
    updateCartCount();

    // Llamada inicial para establecer el estado del botón de compra y opciones de envío
    handleEnvioOptions();


}); // Fin de DOMContentLoaded
