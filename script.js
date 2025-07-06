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

    // --- 3. Declaración de Funciones (Todas las funciones se declaran primero, incluyendo las que se llaman en la carga) ---

    // Funciones de Productos y Catálogo - DECLARADAS PRIMERO
    const crearCardProducto = (producto) => {
        const productoDiv = document.createElement('div');
        productoDiv.classList.add('producto');
        if (producto.stock === 0) {
            productoDiv.classList.add('fuera-stock');
        }
        productoDiv.dataset.material = producto.material;
        productoDiv.dataset.categoria = producto.categoria;

        // Asegúrate de que esta ruta sea correcta y el archivo exista
        const imagenSrc = producto.imagen && producto.imagen !== "imagenescatalogo/sin-imagen.jpg" ? producto.imagen : 'imagenescatalogo/sin-imagen.jpg';
        const imagenAlt = producto.nombre;

        productoDiv.innerHTML = `
            <img src="${imagenSrc}" alt="${imagenAlt}">
            <h3>${producto.nombre}</h3>
            <p>$${producto.precio}</p>
            ${producto.stock > 0 ? `<button class="btn-agregar" data-id="${producto.id}">Agregar al carrito</button>` : '<span class="sin-stock">FUERA DE STOCK</span>'}
        `;
        return productoDiv;
    };

    const generarCardsProductos = (productosParaMostrar, contenedor, esCatalogoCompleto, mostrarPorCategoriasInicial = false) => {
        if (!contenedor) return;

        contenedor.innerHTML = ''; // Limpia el contenedor

        // Lógica para generar los enlaces de categorías en el nav
        if (esCatalogoCompleto && categoriasNav) {
            const todasLasCategorias = [...new Set(window.productos.map(p => p.categoria))].sort();
            const currentActiveCategory = categoriasNav.querySelector('.filtro-categoria.active-category')?.dataset.categoria;
            
            // Limpia los enlaces actuales antes de regenerarlos si ya existen
            categoriasNav.innerHTML = `<a href="#" data-categoria="Todos" class="filtro-categoria ${currentActiveCategory === 'Todos' || !currentActiveCategory ? 'active-category' : ''}">Todos</a>`;

            todasLasCategorias.forEach(cat => {
                const link = document.createElement('a');
                link.href = `#${cat.replace(/[^a-zA-Z0-9]/g, '')}`; // ID para scroll
                link.dataset.categoria = cat;
                link.classList.add('filtro-categoria');
                if (cat === currentActiveCategory) {
                    link.classList.add('active-category');
                }
                link.textContent = cat;
                categoriasNav.appendChild(link);
            });
        }

        // Lógica para mostrar los productos
        const categoriaActiva = categoriasNav ? categoriasNav.querySelector('.filtro-categoria.active-category')?.dataset.categoria : 'Todos';
        const hayFiltrosActivos = (buscador && buscador.value) || (filtroMaterial && filtroMaterial.value !== '');
        
        // Determina si se deben mostrar los productos agrupados por categoría
        const agruparPorCategorias = esCatalogoCompleto && !hayFiltrosActivos && categoriaActiva === 'Todos';

        if (agruparPorCategorias) {
            const categoriasMap = new Map();
            [...new Set(productosParaMostrar.map(p => p.categoria))].sort().forEach(categoria => {
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
            // Si no se agrupa por categorías, mostrar todos los productos en una sola grilla
            const gridContainerMain = document.createElement('div');
            gridContainerMain.classList.add('productos-grid');
            contenedor.appendChild(gridContainerMain);

            // Filtramos los productos según la categoría activa si no estamos en "Todos"
            let productosParaGrid = productosParaMostrar;
            if (categoriaActiva && categoriaActiva !== 'Todos' && esCatalogoCompleto) {
                productosParaGrid = productosParaMostrar.filter(p => p.categoria.toLowerCase() === categoriaActiva.toLowerCase());
            }
            
            productosParaGrid.forEach(producto => gridContainerMain.appendChild(crearCardProducto(producto)));
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

        if (materialSeleccionado && materialSeleccionado !== '') {
            productosFiltrados = productosFiltrados.filter(producto =>
                producto.material.toLowerCase() === materialSeleccionado
            );
        }

        // Ya no filtramos por categoriaActiva aquí directamente si la idea es que generarCardsProductos maneje la agrupación.
        // aplicamosFiltros ahora solo prepara los productos base para generarCardsProductos
        // que decidirá si agrupar o no según si hay filtros o si la categoría es "Todos".
        generarCardsProductos(productosFiltrados, contenedorCatalogo, true);
    };

    // Funciones del Carrito (También declaradas antes de los listeners)
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
            renderizarCarrito();
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
            console.warn("Intentando agregar al carrito sin productos cargados.");
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

    const renderizarCarrito = () => {
        if (!listaCarrito || !totalCarrito) {
            return;
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
        totalCarrito.textContent = total.toFixed(2);

        document.querySelectorAll('.btn-eliminar').forEach(button => {
            button.addEventListener('click', (e) => {
                const productoId = parseInt(e.currentTarget.dataset.id);
                eliminarDelCarrito(productoId);
            });
        });
    };

    // Funciones del Carrusel (También declaradas antes de los listeners)
    function actualizarCarrusel() {
        if (imagenesCarrusel.length === 0) return;

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

    // Event Listeners del Catálogo (solo si los elementos existen)
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
                    aplicarFiltros(); // Esto re-renderizará la vista

                    const hayFiltrosAdicionales = (buscador && buscador.value) || (filtroMaterial && filtroMaterial.value !== '');

                    if (!hayFiltrosAdicionales) { // Solo scroll si no hay otros filtros activos
                        const sectionId = categoriaSeleccionada.replace(/[^a-zA-Z0-9]/g, '');
                        const seccion = document.getElementById(sectionId);
                        if (seccion) {
                            window.scrollTo({
                                top: seccion.offsetTop - 80,
                                behavior: 'smooth'
                            });
                        } else if (categoriaSeleccionada === 'Todos') {
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

        // Asegúrate de que haya suficientes imágenes para clonar
        if (imagenesCarrusel.length > 0) {
            const primerElemento = imagenesCarrusel[0].cloneNode(true);
            const ultimoElemento = imagenesCarrusel[imagenesCarrusel.length - 1].cloneNode(true);
            galeriaSlider.appendChild(primerElemento);
            galeriaSlider.insertBefore(ultimoElemento, imagenesCarrusel[0]);

            imagenesCarrusel = galeriaSlider.querySelectorAll('img'); // Volver a seleccionar todas las imágenes incluyendo los clones
            indiceActualCarrusel = 1; // Ajusta el índice para el primer elemento real después del clon
        } else {
            // Si no hay imágenes en la galería, oculta los botones de navegación
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

        // Llama a actualizarCarrusel solo si hay imágenes
        if (imagenesCarrusel.length > 0) {
            setTimeout(() => {
                actualizarCarrusel();
            }, 100);
        }
        window.addEventListener('resize', actualizarCarrusel);
    }

    // --- 5. Carga inicial de productos desde JSON (Último paso de inicialización) ---
    fetch('productos.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            window.productos = data;

            // Aseguramos que la navegación de categorías se genere y 'Todos' se active
            // ANTES de aplicar los filtros iniciales.
            if (contenedorCatalogo) {
                // Primero generamos los botones de categoría, asegurando que 'Todos' esté activo
                generarCardsProductos([], categoriasNav, true); // Pasar [] o productos para que solo regenere el nav.
                                                              // Es crucial que esta llamada se haga ANTES de aplicarFiltros
                                                              // para que categoriaActiva se evalúe correctamente en aplicarFiltros
                const todosLink = categoriasNav.querySelector('[data-categoria="Todos"]');
                if (todosLink) {
                    todosLink.classList.add('active-category'); 
                }
                
                // Luego aplicamos los filtros, lo que generará el contenido principal del catálogo
                aplicarFiltros(); 
            }
            if (document.getElementById('contenedorDestacados')) {
                cargarProductosDestacados();
            }

            renderizarCarrito();
            updateCartCount();
        })
        .catch(error => console.error('Error al cargar los productos:', error));
});