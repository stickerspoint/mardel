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

    // --- 3. Declaración de Funciones ---

    const crearCardProducto = (producto) => {
        const productoDiv = document.createElement('div');
        productoDiv.classList.add('producto');
        if (producto.stock === 0) {
            productoDiv.classList.add('fuera-stock');
        }
        productoDiv.dataset.material = producto.material;
        productoDiv.dataset.categoria = producto.categoria;

        // Validar y usar ruta de imagen correcta
        // Asegúrate de que 'imagenescatalogo/' sea la ruta base correcta donde están tus imágenes.
        // Si sin-imagen.jpg no está en la raíz, debes especificar su ruta completa.
        const defaultImagePath = 'imagenescatalogo/sin-imagen.jpg'; 
        const imagenSrc = producto.imagen && producto.imagen !== "" ? producto.imagen : defaultImagePath;
        const imagenAlt = producto.nombre || 'Producto'; // Fallback para alt text

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

        // 1. Generar los enlaces de categorías en el nav (si es el catálogo completo)
        if (esCatalogoCompleto && categoriasNav && window.productos.length > 0) {
            const todasLasCategorias = [...new Set(window.productos.map(p => p.categoria))].sort();
            const currentActiveCategory = categoriasNav.querySelector('.filtro-categoria.active-category')?.dataset.categoria;
            
            // Limpia los enlaces actuales antes de regenerarlos si ya existen
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

        // 2. Determinar si se deben agrupar los productos por categoría
        // Solo agrupamos si estamos en el catálogo completo, si la categoría activa es "Todos",
        // y si no hay búsqueda o filtro de material activos.
        const categoriaActiva = categoriasNav ? categoriasNav.querySelector('.filtro-categoria.active-category')?.dataset.categoria : 'Todos';
        const hayBusquedaActiva = buscador && buscador.value.trim() !== '';
        const hayFiltroMaterialActivo = filtroMaterial && filtroMaterial.value !== '';
        
        const agruparPorCategorias = esCatalogoCompleto && 
                                     categoriaActiva === 'Todos' && 
                                     !hayBusquedaActiva && 
                                     !hayFiltroMaterialActivo;

        if (agruparPorCategorias) {
            const categoriasMap = new Map();
            // Asegurarse de que todas las categorías posibles (incluso si no tienen productos en esta vista filtrada)
            // se consideren para los títulos, pero solo se muestren si tienen productos.
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
            // Si no se agrupa por categorías (ej. un filtro está activo o una categoría específica seleccionada)
            // se muestran todos los productos filtrados en una sola grilla.
            const gridContainerMain = document.createElement('div');
            gridContainerMain.classList.add('productos-grid');
            contenedor.appendChild(gridContainerMain);
            
            productosParaMostrar.forEach(producto => gridContainerMain.appendChild(crearCardProducto(producto)));
        }

        // Añadir event listeners a los botones de agregar al carrito
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

        if (materialSeleccionado && materialSeleccionado !== 'todos los materiales') { // Comparar con el valor real del option
            productosFiltrados = productosFiltrados.filter(producto =>
                producto.material.toLowerCase() === materialSeleccionado
            );
        }
        
        // Si una categoría específica está activa y no es "Todos", filtramos por ella.
        // Esto se aplica antes de pasar los productos a generarCardsProductos para que esta función
        // decida si agrupar o no el subconjunto de productos ya filtrado.
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

                    // Solo scroll si no hay otros filtros activos y si la categoría seleccionada no es 'Todos'
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
                        } else { // Si es "Todos" y no hay otros filtros, ir al inicio del contenedor del catálogo
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
                // Si la respuesta no es OK, arroja un error con el estado
                throw new Error(`Error de red: ${response.status} - ${response.statusText}`); 
            }
            return response.json();
        })
        .then(data => {
            window.productos = data;
            console.log("Productos cargados:", window.productos); // Para depuración

            // Solo si estamos en la página del catálogo, procesamos y mostramos los productos
            if (contenedorCatalogo) {
                // Primero, asegurar que los botones de categoría se generen y 'Todos' se active.
                // Llamamos a generarCardsProductos con un array vacío para que solo construya el nav de categorías
                // a partir de `window.productos`, sin renderizar los productos aún en el contenedor.
                generarCardsProductos([], categoriasNav, true); 
                const todosLink = categoriasNav.querySelector('[data-categoria="Todos"]');
                if (todosLink) {
                    todosLink.classList.add('active-category'); 
                }
                
                // Luego, aplicar los filtros, que ahora sí renderizarán los productos en contenedorCatalogo
                // basándose en la categoría "Todos" y sin otros filtros.
                aplicarFiltros(); 
            }
            if (document.getElementById('contenedorDestacados')) {
                cargarProductosDestacados();
            }

            renderizarCarrito();
            updateCartCount();
        })
        .catch(error => {
            console.error('Error al cargar los productos o inicializar:', error);
            // Mostrar un mensaje al usuario si no se pudieron cargar los productos
            if (contenedorCatalogo) {
                contenedorCatalogo.innerHTML = '<p>Lo sentimos, no pudimos cargar los productos en este momento. Intenta recargar la página.</p>';
            }
        });
});