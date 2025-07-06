document.addEventListener('DOMContentLoaded', () => {
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

        contenedor.innerHTML = ''; // Limpia el contenedor

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
            // Asegurarse de que todas las categorías existentes en window.productos se incluyan
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
        // Estas son las líneas que se deben comentar o eliminar:
        // if (e && typeof e.stopPropagation === 'function') {
        //     e.stopPropagation();
        // }
        if (carritoModal) {
            carritoModal.style.display = carritoModal.style.display === 'flex' ? 'none' : 'flex';
            renderizarCarrito(); // Asegurarse de que se renderiza cada vez que se abre
        }
        if (miniCarritoNotificacion && carritoModal && carritoModal.style.display === 'flex') {
            miniCarritoNotificacion.style.display = 'none';
        }
    };

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
            notificacionTotal.textContent = totalMontoCarrito.toFixed(2);

            miniCarritoNotificacion.style.display = 'block';

            setTimeout(() => {
                miniCarritoNotificacion.style.display = 'none';
            }, 3000);
        }
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

        if (productoEnCatalogo.stock <= 0) {
            alert(`¡${productoEnCatalogo.nombre} está fuera de stock!`);
            return;
        }

        const productoExistente = carrito.find(item => item.id === productoId);
        let cantidadAgregada = 1;

        if (productoExistente) {
            if (productoExistente.cantidad < productoEnCatalogo.stock) {
                productoExistente.cantidad++;
                cantidadAgregada = productoExistente.cantidad; // Actualizar la cantidad para la notificación
            } else {
                alert(`¡No hay más stock de ${productoEnCatalogo.nombre}!`);
                return;
            }
        } else {
            carrito.push({ ...productoEnCatalogo, cantidad: 1 });
        }

        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderizarCarrito();
        updateCartCount();
        mostrarNotificacionCarrito(productoEnCatalogo, cantidadAgregada);
    };

    const eliminarDelCarrito = (productoId) => {
        carrito = carrito.filter(item => item.id !== productoId);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderizarCarrito();
        updateCartCount();
    };

    // NUEVA FUNCIÓN: Cambia la cantidad de un producto en el carrito
    const cambiarCantidad = (productoId, nuevaCantidad) => {
        const productoEnCarrito = carrito.find(item => item.id === productoId);
        const productoEnCatalogo = window.productos.find(prod => prod.id === productoId);

        if (!productoEnCarrito || !productoEnCatalogo) {
            console.error("Producto no encontrado en el carrito o catálogo para cambiar cantidad.");
            return;
        }

        nuevaCantidad = parseInt(nuevaCantidad);
        if (isNaN(nuevaCantidad) || nuevaCantidad <= 0) {
            // Si la cantidad es 0 o inválida, se elimina el producto del carrito
            eliminarDelCarrito(productoId);
            return;
        }

        // Limitar la cantidad al stock disponible
        if (nuevaCantidad > productoEnCatalogo.stock) {
            alert(`No hay suficiente stock de ${productoEnCatalogo.nombre}. Solo quedan ${productoEnCatalogo.stock} unidades.`);
            productoEnCarrito.cantidad = productoEnCatalogo.stock; // Ajustar a la cantidad máxima disponible
        } else {
            productoEnCarrito.cantidad = nuevaCantidad;
        }

        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderizarCarrito();
        updateCartCount();
    };

    // ACTUALIZADA: Genera el HTML de un solo ítem del carrito (con controles de cantidad)
    const crearItemCarritoHTML = (item) => {
        const productoOriginal = window.productos.find(p => p.id === item.id);
        // Asegúrate de tener una imagen por defecto o manejar los casos donde la imagen no existe
        const defaultImagePath = 'imagenescatalogo/sin-imagen.jpg';
        const itemImageSrc = item.imagen && item.imagen !== "" ? item.imagen : defaultImagePath;
        const maxStock = productoOriginal ? productoOriginal.stock : item.cantidad; // Fallback si no encuentra el producto original

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
        if (!listaCarrito || !totalCarrito || !mensajeCarritoVacio) {
            console.error("Elementos del carrito no encontrados en el DOM.");
            return;
        }

        listaCarrito.innerHTML = ''; // Limpiar la lista antes de volver a renderizar
        let total = 0;

        if (carrito.length === 0) {
            mensajeCarritoVacio.style.display = 'block'; // Mostrar mensaje de carrito vacío
            listaCarrito.style.display = 'none'; // Ocultar la lista si está vacía
        } else {
            mensajeCarritoVacio.style.display = 'none'; // Ocultar mensaje de carrito vacío
            listaCarrito.style.display = 'block'; // Mostrar la lista si hay ítems
            carrito.forEach(item => {
                listaCarrito.innerHTML += crearItemCarritoHTML(item);
                total += item.precio * item.cantidad;
            });
        }
        totalCarrito.textContent = total.toFixed(2);

        // Adjuntar eventos a los botones de eliminar y cantidad DE PUES de que se hayan agregado al DOM
        adjuntarEventosCarrito();
    };

    // NUEVA FUNCIÓN: Centraliza la adjunción de eventos a los elementos del carrito
    const adjuntarEventosCarrito = () => {
        // Eventos para botones de eliminar
        document.querySelectorAll('.btn-eliminar').forEach(button => {
            button.onclick = (e) => { // Usamos onclick para sobrescribir el evento anterior
                const productoId = parseInt(e.currentTarget.dataset.id);
                eliminarDelCarrito(productoId);
            };
        });

        // Eventos para botones de sumar cantidad
        document.querySelectorAll('.btn-cantidad-sumar').forEach(button => {
            button.onclick = (e) => {
                const productoId = parseInt(e.currentTarget.dataset.id);
                const itemEnCarrito = carrito.find(item => item.id === productoId);
                if (itemEnCarrito) {
                    cambiarCantidad(productoId, itemEnCarrito.cantidad + 1);
                }
            };
        });

        // Eventos para botones de restar cantidad
        document.querySelectorAll('.btn-cantidad-restar').forEach(button => {
            button.onclick = (e) => {
                const productoId = parseInt(e.currentTarget.dataset.id);
                const itemEnCarrito = carrito.find(item => item.id === productoId);
                if (itemEnCarrito) {
                    cambiarCantidad(productoId, itemEnCarrito.cantidad - 1);
                }
            };
        });

        // Opcional: Si quieres que el input de cantidad sea editable, descomenta y ajusta esta parte.
        // Pero dado que los botones +/- son más comunes para móviles, lo dejo como readonly por defecto.
        // document.querySelectorAll('.cantidad-input').forEach(input => {
        //      input.onchange = (e) => {
        //          const productoId = parseInt(e.currentTarget.dataset.id);
        //          const nuevaCantidad = parseInt(e.currentTarget.value);
        //          cambiarCantidad(productoId, nuevaCantidad);
        //      };
        // });
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
            // Asegúrate de que el clic es directamente en el fondo oscuro del modal, no en su contenido
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

            renderizarCarrito(); // ¡IMPORTANTE! Llamar al cargar los productos y el carrito para mostrarlo
            updateCartCount();
        })
        .catch(error => {
            console.error('Error al cargar los productos o inicializar:', error);
            if (contenedorCatalogo) {
                contenedorCatalogo.innerHTML = '<p>Lo sentimos, no pudimos cargar los productos en este momento. Intenta recargar la página.</p>';
            }
        });
});