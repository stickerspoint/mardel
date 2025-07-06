document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Referencias a elementos del DOM ---
    const shoppingCartBtn = document.getElementById('cartIconBtn');
    const cartCountSpan = document.querySelector('.cart-count');
    const carritoModal = document.getElementById('carritoModal');
    const cerrarCarrito = document.getElementById('cerrarCarrito');
    const listaCarrito = document.getElementById('listaCarrito');
    const totalCarrito = document.getElementById('totalCarrito');
    const vaciarCarritoBtn = document.getElementById('vaciarCarrito');

    const miniCarritoNotificacion = document.getElementById('miniCarritoNotificacion');
    const cerrarNotificacionBtn = document.getElementById('cerrarNotificacion');
    const notificacionImagen = document.getElementById('notificacionImagen');
    const notificacionNombre = document.getElementById('notificacionNombre');
    const notificacionPrecio = document.getElementById('notificacionPrecio');
    const notificacionMensaje = document.getElementById('notificacionMensaje');
    const notificacionCantidadTotal = document.getElementById('notificacionCantidadTotal');
    const notificacionTotal = document.getElementById('notificacionTotal');
    const verCarritoDesdeNotificacionBtn = document.getElementById('verCarritoDesdeNotificacion');
    const mensajeCarritoVacio = document.getElementById('mensajeCarritoVacio'); // Asegúrate de tener este elemento en tu HTML dentro del modal del carrito

    const contenedorCatalogo = document.getElementById('contenedorCatalogo');
    const buscador = document.getElementById('buscador');
    const filtroMaterial = document.getElementById('filtroMaterial');
    const categoriasNav = document.getElementById('categoriasNav');

    const galeriaSlider = document.getElementById('galeriaSlider');
    const prevBtnGaleria = document.getElementById('prevBtnGaleria');
    const nextBtnGaleria = document.getElementById('nextBtnGaleria');

    // --- 2. Variables Globales ---
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    window.productos = []; // Aquí se almacenarán todos los productos cargados desde JSON
    let imagenesCarrusel = [];
    let indiceActualCarrusel = 0;

    // --- 3. Declaración de Funciones ---

    const crearCardProducto = (producto) => {
        const productoDiv = document.createElement('div');
        productoDiv.classList.add('producto');
        if (producto.stock === 0) {
            productoDiv.classList.add('fuera-stock');
        }
        productoDiv.dataset.material = producto.material;
        productoDiv.dataset.categoria = producto.categoria;

        const defaultImagePath = 'imagenescatalogo/sin-imagen.jpg';
        const imagenSrc = producto.imagen && producto.imagen !== "" ? producto.imagen : defaultImagePath;
        const imagenAlt = producto.nombre || 'Producto';

        productoDiv.innerHTML = `
            <img src="${imagenSrc}" alt="${imagenAlt}" onerror="this.onerror=null;this.src='${defaultImagePath}';">
            <h3>${producto.nombre}</h3>
            <p>$${producto.precio}</p>
            ${producto.stock > 0 ? `<button class="btn-agregar" data-id="${producto.id}">Agregar al carrito</button>` : '<span class="sin-stock">FUERA DE STOCK</span>'}
        `;
        return productoDiv;
    };

    const generarCardsProductos = (productosParaMostrar, contenedor, esCatalogoCompleto) => {
        if (!contenedor) return;

        contenedor.innerHTML = '';

        if (esCatalogoCompleto && categoriasNav && window.productos.length > 0) {
            const todasLasCategorias = [...new Set(window.productos.map(p => p.categoria))].sort();
            const currentActiveCategory = categoriasNav.querySelector('.filtro-categoria.active-category')?.dataset.categoria;

            categoriasNav.innerHTML = `<a href="#" data-categoria="Todos" class="filtro-categoria ${currentActiveCategory === 'Todos' || !currentActiveCategory ? 'active-category' : ''}">Todos</a>`;

            todasLasCategorias.forEach(cat => {
                const link = document.createElement('a');
                link.href = `#${cat.replace(/[^a-zA-Z0-9]/g, '')}`;
                link.dataset.categoria = cat;
                link.classList.add('filtro-categoria');
                if (cat === currentActiveCategory) {
                    link.classList.add('active-category');
                }
                link.textContent = cat;
                categoriasNav.appendChild(link);
            });
        }

        const categoriaActiva = categoriasNav ? categoriasNav.querySelector('.filtro-categoria.active-category')?.dataset.categoria : 'Todos';
        const hayBusquedaActiva = buscador && buscador.value.trim() !== '';
        const hayFiltroMaterialActivo = filtroMaterial && filtroMaterial.value !== '';

        const agruparPorCategorias = esCatalogoCompleto &&
                                     categoriaActiva === 'Todos' &&
                                     !hayBusquedaActiva &&
                                     !hayFiltroMaterialActivo;

        if (agruparPorCategorias) {
            const categoriasMap = new Map();
            [...new Set(window.productos.map(p => p.categoria))].sort().forEach(categoria => {
                categoriasMap.set(categoria, []);
            });

            productosParaMostrar.forEach(producto => {
                if (categoriasMap.has(producto.categoria)) {
                    categoriasMap.get(producto.categoria).push(producto);
                }
            });

            for (const [categoria, productosDeCategoria] of categoriasMap.entries()) {
                if (productosDeCategoria.length > 0) {
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
            const gridContainerMain = document.createElement('div');
            gridContainerMain.classList.add('productos-grid');
            contenedor.appendChild(gridContainerMain);

            productosParaMostrar.forEach(producto => gridContainerMain.appendChild(crearCardProducto(producto)));
        }

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
            generarCardsProductos(productosFiltrados, contenedorDestacados, false);
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
        if (e && typeof e.stopPropagation === 'function') {
            e.stopPropagation();
        }
        if (carritoModal) {
            carritoModal.style.display = carritoModal.style.display === 'flex' ? 'none' : 'flex';
            renderizarCarrito(); // Asegurarse de renderizar cuando se abre/cierra
        }
        if (miniCarritoNotificacion && carritoModal && carritoModal.style.display === 'flex') {
            miniCarritoNotificacion.style.display = 'none';
        }
    };

    const mostrarNotificacionCarrito = (producto, cantidadAgregada) => {
        if (miniCarritoNotificacion) {
            notificacionImagen.src = producto.imagen && producto.imagen !== "" ? producto.imagen : 'imagenescatalogo/sin-imagen.jpg'; // Usar default image
            notificacionImagen.alt = producto.nombre;
            notificacionNombre.textContent = producto.nombre;
            notificacionPrecio.textContent = `${cantidadAgregada} x $${producto.precio}`;
            notificacionMensaje.textContent = `¡${producto.nombre} agregado al carrito!`;

            const totalItemsEnCarrito = carrito.reduce((sum, item) => sum + item.cantidad, 0);
            const totalMontoCarrito = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
            notificacionCantidadTotal.textContent = totalItemsEnCarrito;
            notificacionTotal.textContent = totalMontoCarrito.toFixed(2);

            miniCarritoNotificacion.style.display = 'block';

            setTimeout(() => {
                miniCarritoNotificacion.style.display = 'none';
            }, 3000);
        }
    };

    // Función que crea el HTML para cada ítem en la lista del carrito
    const crearItemCarritoHTML = (item) => {
        // Busca el producto original en el catálogo para obtener el stock
        const productoEnCatalogo = window.productos.find(p => p.id === item.id);
        const maxStock = productoEnCatalogo ? productoEnCatalogo.stock : item.cantidad; // Fallback si no se encuentra en catálogo

        return `
            <li data-id="${item.id}">
                <div class="carrito-item-info">
                    <span>${item.nombre}</span>
                    <span class="carrito-item-precio">$${(item.precio * item.cantidad).toFixed(2)}</span>
                </div>
                <div class="carrito-item-controles">
                    <button class="btn-cantidad-restar" data-id="${item.id}" ${item.cantidad <= 1 ? 'disabled' : ''}>-</button>
                    <input type="number" class="cantidad-input" value="${item.cantidad}" min="1" max="${maxStock}" data-id="${item.id}" readonly>
                    <button class="btn-cantidad-sumar" data-id="${item.id}" ${item.cantidad >= maxStock ? 'disabled' : ''}>+</button>
                    <button class="btn-eliminar" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                </div>
            </li>
        `;
    };

    // Función para manejar el cambio de cantidad (sumar/restar)
    const cambiarCantidad = (productoId, delta) => {
        const itemIndex = carrito.findIndex(item => item.id == productoId);

        if (itemIndex > -1) {
            const productoEnCatalogo = window.productos.find(p => p.id == productoId);
            const stockDisponible = productoEnCatalogo ? productoEnCatalogo.stock : Infinity; // Usar stock del catálogo

            let nuevaCantidad = carrito[itemIndex].cantidad + delta;

            // Asegurarse de que la cantidad no sea menor que 1 y no exceda el stock
            if (nuevaCantidad < 1) {
                nuevaCantidad = 0; // Se eliminará el producto si la cantidad es 0
            } else if (nuevaCantidad > stockDisponible) {
                alert(`No hay más stock de ${carrito[itemIndex].nombre}. Stock disponible: ${stockDisponible}`);
                nuevaCantidad = stockDisponible; // Limitar a la cantidad máxima disponible
            }

            if (nuevaCantidad === 0) {
                eliminarDelCarrito(productoId); // Eliminar si la cantidad llega a 0
            } else {
                carrito[itemIndex].cantidad = nuevaCantidad;
                localStorage.setItem('carrito', JSON.stringify(carrito));
                renderizarCarrito(); // Re-renderizar el carrito
                updateCartCount(); // Actualizar el contador del icono del carrito
            }
        }
    };

    // Adjuntar eventos a los botones del carrito (eliminar, sumar, restar)
    const adjuntarEventosCarrito = () => {
        if (!listaCarrito) return;

        listaCarrito.querySelectorAll('.btn-eliminar').forEach(button => {
            // Se usa onclick para sobrescribir si ya hay un evento, asegurando que solo uno esté activo
            button.onclick = (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                eliminarDelCarrito(id);
            };
        });

        listaCarrito.querySelectorAll('.btn-cantidad-sumar').forEach(button => {
            button.onclick = (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                cambiarCantidad(id, 1); // Sumar 1
            };
        });

        listaCarrito.querySelectorAll('.btn-cantidad-restar').forEach(button => {
            button.onclick = (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                cambiarCantidad(id, -1); // Restar 1
            };
        });
    };


    const agregarAlCarrito = (productoId) => {
        if (!window.productos || window.productos.length === 0) {
            console.warn("Intentando agregar al carrito sin productos cargados. Asegúrate de que productos.json se haya cargado.");
            return;
        }

        const productoEnCatalogo = window.productos.find(prod => prod.id === productoId);

        if (!productoEnCatalogo) {
            console.error(`Producto con ID ${productoId} no encontrado en el catálogo.`);
            return;
        }

        const productoExistente = carrito.find(item => item.id === productoId);
        let cantidadAgregada = 1; // Por defecto se agrega 1 unidad

        if (productoExistente) {
            // Si el producto ya está en el carrito, solo incrementamos su cantidad,
            // pero verificando el stock disponible.
            if (productoExistente.cantidad < productoEnCatalogo.stock) {
                productoExistente.cantidad++;
            } else {
                alert(`¡No hay más stock de ${productoEnCatalogo.nombre}!`);
                return; // No se agrega si no hay stock adicional
            }
        } else {
            // Si el producto no está en el carrito, lo agregamos con cantidad 1,
            // pero solo si hay stock inicial.
            if (productoEnCatalogo.stock > 0) {
                carrito.push({ ...productoEnCatalogo, cantidad: 1 });
            } else {
                alert(`¡${productoEnCatalogo.nombre} está fuera de stock!`);
                return; // No se agrega si no hay stock inicial
            }
        }

        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderizarCarrito(); // Re-renderiza el carrito para mostrar el cambio
        updateCartCount();
        mostrarNotificacionCarrito(productoEnCatalogo, cantidadAgregada);
    };

    const eliminarDelCarrito = (productoId) => {
        carrito = carrito.filter(item => item.id !== productoId);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderizarCarrito();
        updateCartCount();
    };

    const renderizarCarrito = () => {
        if (!listaCarrito || !totalCarrito || !mensajeCarritoVacio) {
            return;
        }

        listaCarrito.innerHTML = '';
        let total = 0;
        if (carrito.length === 0) {
            mensajeCarritoVacio.style.display = 'block';
            totalCarrito.style.display = 'none'; // Ocultar el total si no hay items
            if (vaciarCarritoBtn) vaciarCarritoBtn.style.display = 'none'; // Ocultar botón vaciar
        } else {
            mensajeCarritoVacio.style.display = 'none';
            totalCarrito.style.display = 'block';
            if (vaciarCarritoBtn) vaciarCarritoBtn.style.display = 'inline-block'; // Mostrar botón vaciar

            carrito.forEach(item => {
                listaCarrito.innerHTML += crearItemCarritoHTML(item);
                total += item.precio * item.cantidad;
            });
        }
        totalCarrito.textContent = `Total: $${total.toFixed(2)}`;

        // Después de renderizar, adjuntar los eventos a los nuevos elementos
        adjuntarEventosCarrito();
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

        if (imagenesCarrusel[indiceActualCarrusel]) {
            imagenesCarrusel[indiceActualCarrusel].classList.add('central');
        }
    }

    // --- 4. Event Listeners y Lógica de Inicialización ---

    // Event Listeners del Carrito
    if (shoppingCartBtn) {
        shoppingCartBtn.addEventListener('click', toggleCarritoModal);
    }
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
                miniCarritoNotificacion.style.display = 'none';
            }
            toggleCarritoModal();
        });
    }
    if (vaciarCarritoBtn) {
        vaciarCarritoBtn.addEventListener('click', () => {
            carrito = [];
            localStorage.setItem('carrito', JSON.stringify(carrito));
            renderizarCarrito();
            updateCartCount();
            alert('Se ha vaciado el carrito.');
        });
    }

    // Event Listeners del Catálogo
    if (contenedorCatalogo) {
        if (buscador) {
            buscador.addEventListener('input', aplicarFiltros);
        }
        if (filtroMaterial) {
            filtroMaterial.addEventListener('change', aplicarFiltros);
        }
        if (categoriasNav) {
            categoriasNav.addEventListener('click', (e) => {
                e.preventDefault();
                if (e.target.tagName === 'A' && e.target.classList.contains('filtro-categoria')) {
                    categoriasNav.querySelectorAll('.filtro-categoria').forEach(link => {
                        link.classList.remove('active-category');
                    });
                    e.target.classList.add('active-category');

                    const categoriaSeleccionada = e.target.dataset.categoria;
                    aplicarFiltros();

                    const hayBusquedaActiva = buscador && buscador.value.trim() !== '';
                    const hayFiltroMaterialActivo = filtroMaterial && filtroMaterial.value !== '';

                    if (!hayBusquedaActiva && !hayFiltroMaterialActivo) {
                        if (categoriaSeleccionada !== 'Todos') {
                            const sectionId = categoriaSeleccionada.replace(/[^a-zA-Z0-9]/g, '');
                            const seccion = document.getElementById(sectionId);
                            if (seccion) {
                                window.scrollTo({
                                    top: seccion.offsetTop - 80,
                                    behavior: 'smooth'
                                });
                            }
                        } else {
                            window.scrollTo({
                                top: contenedorCatalogo.offsetTop - 80,
                                behavior: 'smooth'
                            });
                        }
                    }
                }
            });
        }
    }

    // Lógica del Carrusel (Solo para index.html)
    if (galeriaSlider) {
        imagenesCarrusel = galeriaSlider.querySelectorAll('img');

        if (imagenesCarrusel.length > 0) {
            const primerElemento = imagenesCarrusel[0].cloneNode(true);
            const ultimoElemento = imagenesCarrusel[imagenesCarrusel.length - 1].cloneNode(true);
            galeriaSlider.appendChild(primerElemento);
            galeriaSlider.insertBefore(ultimoElemento, imagenesCarrusel[0]);

            imagenesCarrusel = galeriaSlider.querySelectorAll('img');
            indiceActualCarrusel = 1;
        } else {
            if (prevBtnGaleria) prevBtnGaleria.style.display = 'none';
            if (nextBtnGaleria) nextBtnGaleria.style.display = 'none';
        }

        if (prevBtnGaleria) {
            prevBtnGaleria.addEventListener('click', () => {
                indiceActualCarrusel--;
                galeriaSlider.style.transition = 'transform 0.5s ease-in-out';
                actualizarCarrusel();
                if (indiceActualCarrusel < 1) {
                    setTimeout(() => {
                        galeriaSlider.style.transition = 'none';
                        indiceActualCarrusel = imagenesCarrusel.length - 2;
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
                if (indiceActualCarrusel >= imagenesCarrusel.length - 1) {
                    setTimeout(() => {
                        galeriaSlider.style.transition = 'none';
                        indiceActualCarrusel = 1;
                        actualizarCarrusel();
                    }, 500);
                }
            });
        }

        if (imagenesCarrusel.length > 0) {
            setTimeout(() => {
                actualizarCarrusel();
            }, 100);
        }
        window.addEventListener('resize', actualizarCarrusel);
    }

    // --- 5. Carga inicial de productos desde JSON ---
    fetch('productos.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error de red: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            window.productos = data;
            console.log("Productos cargados:", window.productos);

            if (contenedorCatalogo) {
                generarCardsProductos([], categoriasNav, true);
                const todosLink = categoriasNav.querySelector('[data-categoria="Todos"]');
                if (todosLink) {
                    todosLink.classList.add('active-category');
                }
                aplicarFiltros();
            }
            if (document.getElementById('contenedorDestacados')) {
                cargarProductosDestacados();
            }

            renderizarCarrito(); // Se llama aquí para que el carrito se inicialice con los productos cargados
            updateCartCount();
        })
        .catch(error => {
            console.error('Error al cargar los productos o inicializar:', error);
            if (contenedorCatalogo) {
                contenedorCatalogo.innerHTML = '<p>Lo sentimos, no pudimos cargar los productos en este momento. Intenta recargar la página.</p>';
            }
        });
});