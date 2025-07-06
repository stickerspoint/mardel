document.addEventListener('DOMContentLoaded', () => {
    let productos = [];
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    const contadorCarrito = document.getElementById('contadorCarrito');
    const listaCarrito = document.getElementById('listaCarrito');
    const totalCarrito = document.getElementById('totalCarrito');
    const vaciarCarritoBtn = document.getElementById('vaciarCarrito');
    const cartIcon = document.getElementById('cart-icon');
    const cartModal = document.getElementById('cartModal');
    const closeModal = document.querySelector('.close-modal');
    const carritoVacioMensaje = document.querySelector('.carrito-vacio-mensaje');

    // Elementos de la notificación de mini-carrito
    const miniCartNotification = document.getElementById('miniCartNotification');
    const cerrarNotificacionBtn = document.querySelector('.cerrar-notificacion');
    const notificacionImagen = document.getElementById('notificacionImagen');
    const notificacionNombre = document.getElementById('notificacionNombre');
    const notificacionPrecio = document.getElementById('notificacionPrecio');
    const notificacionMensaje = document.getElementById('notificacionMensaje');
    const notificacionCantidadTotal = document.getElementById('notificacionCantidadTotal');
    const notificacionTotal = document.getElementById('notificacionTotal');
    const verCarritoDesdeNotificacionBtn = document.getElementById('verCarritoDesdeNotificacion');

    // Variables para el carrusel
    let currentSlide = 0;
    let autoSlideInterval;
    const slider = document.getElementById('galeria-slider');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');


    // Función para obtener productos
    async function fetchProductos() {
        try {
            const response = await fetch('./productos.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            productos = await response.json();
            console.log('Productos cargados:', productos);
            if (document.body.classList.contains('index-page')) {
                renderDestacados();
                renderGaleria();
                startAutoSlide();
            } else if (document.body.classList.contains('catalogo-page')) {
                renderFiltros();
                renderCatalogo(productos);
            }
            actualizarContadorCarrito(); // Actualizar contador al cargar la página
        } catch (error) {
            console.error('Error al cargar los productos:', error);
            // Podrías mostrar un mensaje al usuario aquí
        }
    }

    // --- Funciones del Carrito ---

    function guardarCarritoEnLocalStorage() {
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }

    function agregarAlCarrito(productoId, cantidad = 1, mostrarNotificacion = true) {
        const productoExistente = carrito.find(item => item.id === productoId);
        const productoEnCatalogo = productos.find(p => p.id === productoId);

        if (!productoEnCatalogo) {
            console.error('Producto no encontrado en el catálogo:', productoId);
            return;
        }

        if (productoExistente) {
            if (productoExistente.cantidad + cantidad <= productoEnCatalogo.stock) {
                productoExistente.cantidad += cantidad;
                if (mostrarNotificacion) {
                    mostrarNotificacionMiniCarrito(productoEnCatalogo, 'sumado');
                }
            } else {
                alert(`No hay suficiente stock de "${productoEnCatalogo.nombre}". Stock disponible: ${productoEnCatalogo.stock - productoExistente.cantidad}`);
                return;
            }
        } else {
            if (cantidad <= productoEnCatalogo.stock) {
                carrito.push({ ...productoEnCatalogo, cantidad });
                if (mostrarNotificacion) {
                    mostrarNotificacionMiniCarrito(productoEnCatalogo, 'agregado');
                }
            } else {
                alert(`No hay suficiente stock de "${productoEnCatalogo.nombre}". Stock disponible: ${productoEnCatalogo.stock}`);
                return;
            }
        }
        guardarCarritoEnLocalStorage();
        renderCarrito();
        actualizarContadorCarrito();
    }

    function eliminarDelCarrito(productoId) {
        carrito = carrito.filter(item => item.id !== productoId);
        guardarCarritoEnLocalStorage();
        renderCarrito();
        actualizarContadorCarrito();
    }

    function modificarCantidad(productoId, nuevaCantidad) {
        const itemCarrito = carrito.find(item => item.id === productoId);
        const productoEnCatalogo = productos.find(p => p.id === productoId);

        if (itemCarrito && productoEnCatalogo) {
            if (nuevaCantidad > 0 && nuevaCantidad <= productoEnCatalogo.stock) {
                itemCarrito.cantidad = nuevaCantidad;
            } else if (nuevaCantidad > productoEnCatalogo.stock) {
                alert(`No puedes agregar más de ${productoEnCatalogo.stock} unidades de este producto.`);
                itemCarrito.cantidad = productoEnCatalogo.stock; // Ajustar a la cantidad máxima
            } else {
                eliminarDelCarrito(productoId);
            }
        }
        guardarCarritoEnLocalStorage();
        renderCarrito();
        actualizarContadorCarrito();
    }

    function vaciarCarrito() {
        if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
            carrito = [];
            guardarCarritoEnLocalStorage();
            renderCarrito();
            actualizarContadorCarrito();
        }
    }

    function renderCarrito() {
        listaCarrito.innerHTML = '';
        let total = 0;

        if (carrito.length === 0) {
            carritoVacioMensaje.style.display = 'block';
            listaCarrito.style.display = 'none';
        } else {
            carritoVacioMensaje.style.display = 'none';
            listaCarrito.style.display = 'block';
            carrito.forEach(item => {
                const subtotal = item.precio * item.cantidad;
                total += subtotal;

                const li = document.createElement('li');
                li.classList.add('carrito-item');
                li.innerHTML = `
                    <div class="carrito-item-info">
                        <img src="${item.imagen}" alt="${item.nombre}" class="carrito-item-img">
                        <div class="carrito-item-details">
                            <span class="carrito-item-nombre">${item.nombre}</span>
                            <span class="carrito-item-precio-unidad">$${item.precio} c/u</span>
                        </div>
                    </div>
                    <div class="carrito-item-controles">
                        <button class="restar-cantidad" data-id="${item.id}">-</button>
                        <input type="number" class="cantidad-input" value="${item.cantidad}" min="1" data-id="${item.id}" readonly>
                        <button class="sumar-cantidad" data-id="${item.id}">+</button>
                        <span class="carrito-item-subtotal">$${subtotal}</span>
                        <button class="btn-eliminar" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
                    </div>
                `;
                listaCarrito.appendChild(li);
            });
        }
        totalCarrito.textContent = `$${total}`;

        // Asignar eventos a los botones de cantidad y eliminar
        document.querySelectorAll('.restar-cantidad').forEach(button => {
            button.onclick = (e) => {
                const id = parseInt(e.target.dataset.id);
                const input = e.target.nextElementSibling;
                let cantidad = parseInt(input.value);
                modificarCantidad(id, cantidad - 1);
            };
        });

        document.querySelectorAll('.sumar-cantidad').forEach(button => {
            button.onclick = (e) => {
                const id = parseInt(e.target.dataset.id);
                const input = e.target.previousElementSibling;
                let cantidad = parseInt(input.value);
                modificarCantidad(id, cantidad + 1);
            };
        });

        document.querySelectorAll('.btn-eliminar').forEach(button => {
            button.onclick = (e) => {
                const id = parseInt(e.target.closest('.btn-eliminar').dataset.id);
                eliminarDelCarrito(id);
            };
        });
    }

    function actualizarContadorCarrito() {
        const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
        contadorCarrito.textContent = totalItems;
    }

    // Mostrar/Ocultar Modal del Carrito
    cartIcon.onclick = () => {
        cartModal.style.display = 'flex';
        renderCarrito();
    };

    closeModal.onclick = () => {
        cartModal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
    };

    vaciarCarritoBtn.onclick = vaciarCarrito;

    // --- Mini-carrito de Notificación ---
    function mostrarNotificacionMiniCarrito(producto, tipo) {
        notificacionImagen.src = producto.imagen;
        notificacionNombre.textContent = producto.nombre;
        notificacionPrecio.textContent = `$${producto.precio}`;

        if (tipo === 'agregado') {
            notificacionMensaje.textContent = '¡Agregado al carrito!';
            notificacionMensaje.style.color = 'green';
        } else if (tipo === 'sumado') {
            notificacionMensaje.textContent = 'Cantidad actualizada en el carrito.';
            notificacionMensaje.style.color = 'blue';
        }

        const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
        const total = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
        notificacionCantidadTotal.textContent = totalItems;
        notificacionTotal.textContent = `$${total}`;

        miniCartNotification.style.display = 'block';

        // Ocultar la notificación después de unos segundos
        setTimeout(() => {
            miniCartNotification.style.display = 'none';
        }, 3000); // 3 segundos
    }

    cerrarNotificacionBtn.onclick = () => {
        miniCartNotification.style.display = 'none';
    };

    verCarritoDesdeNotificacionBtn.onclick = () => {
        miniCartNotification.style.display = 'none';
        cartModal.style.display = 'flex';
        renderCarrito();
    };

    // --- Funciones para index.html (Destacados y Carrusel) ---

    function renderDestacados() {
        const destacadosGrid = document.getElementById('destacados-grid');
        if (!destacadosGrid) return; // Asegurarse de que el elemento existe

        const productosDestacados = productos.filter(p => p.destacado);
        destacadosGrid.innerHTML = ''; // Limpiar antes de renderizar

        productosDestacados.forEach(producto => {
            const productoDiv = document.createElement('div');
            productoDiv.classList.add('producto');
            if (producto.stock === 0) {
                productoDiv.classList.add('fuera-stock');
            }

            productoDiv.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <h3>${producto.nombre}</h3>
                <p>$${producto.precio}</p>
                ${producto.stock > 0 ? `<button class="btn-agregar" data-id="${producto.id}">Agregar al Carrito</button>` : '<span class="sin-stock">Sin Stock</span>'}
            `;
            destacadosGrid.appendChild(productoDiv);
        });

        document.querySelectorAll('.destacados-grid .btn-agregar').forEach(button => {
            button.onclick = (e) => {
                const id = parseInt(e.target.dataset.id);
                agregarAlCarrito(id);
            };
        });
    }

    function renderGaleria() {
        if (!slider) return;

        const productosConImagen = productos.filter(p => p.imagen && p.imagen !== 'imagenescatalogo/sin-imagen.jpg');
        slider.innerHTML = '';

        productosConImagen.forEach((producto, index) => {
            const img = document.createElement('img');
            img.src = producto.imagen;
            img.alt = producto.nombre;
            img.dataset.index = index;
            slider.appendChild(img);
        });

        // Duplicar elementos para un carrusel infinito (o casi)
        const images = slider.querySelectorAll('img');
        if (images.length > 0) {
            images.forEach(img => {
                const clone = img.cloneNode(true);
                slider.appendChild(clone);
            });
        }

        updateGaleriaDisplay();
    }

    function updateGaleriaDisplay() {
        if (!slider) return;

        const images = slider.querySelectorAll('img');
        if (images.length === 0) return;

        // Reset all images
        images.forEach(img => img.classList.remove('central'));

        // Calculate actual index based on currentSlide and number of original products
        const originalProductCount = products.filter(p => p.imagen && p.imagen !== 'imagenescatalogo/sin-imagen.jpg').length;
        if (originalProductCount === 0) return;

        let centerIndex = currentSlide % originalProductCount;
        if (centerIndex < 0) {
            centerIndex += originalProductCount;
        }

        // Apply 'central' class to all instances of the central image
        images.forEach(img => {
            if (parseInt(img.dataset.index) === centerIndex) {
                img.classList.add('central');
            }
        });

        // Adjust the transform for the slider
        const imageWidth = images[0].offsetWidth + 20; // 20px for gap/padding
        slider.style.transform = `translateX(${-currentSlide * imageWidth + (slider.offsetWidth / 2) - (imageWidth / 2)}px)`;
    }

    function nextSlide() {
        if (!slider) return;
        const originalProductCount = products.filter(p => p.imagen && p.imagen !== 'imagenescatalogo/sin-imagen.jpg').length;
        if (originalProductCount === 0) return;

        currentSlide++;
        updateGaleriaDisplay();

        // If we've moved past the original set, reset to simulate infinite loop
        if (currentSlide >= originalProductCount) {
            setTimeout(() => {
                currentSlide = 0;
                slider.style.transition = 'none'; // Desactivar transición para el salto
                updateGaleriaDisplay();
                setTimeout(() => {
                    slider.style.transition = 'transform 0.5s ease-in-out'; // Reactivar transición
                }, 50);
            }, 500); // Coincidir con la duración de la transición
        }
    }

    function prevSlide() {
        if (!slider) return;
        const originalProductCount = products.filter(p => p.imagen && p.imagen !== 'imagenescatalogo/sin-imagen.jpg').length;
        if (originalProductCount === 0) return;

        currentSlide--;
        updateGaleriaDisplay();

        // If we've moved before the original set, reset to simulate infinite loop
        if (currentSlide < 0) {
            setTimeout(() => {
                currentSlide = originalProductCount - 1;
                slider.style.transition = 'none'; // Desactivar transición para el salto
                updateGaleriaDisplay();
                setTimeout(() => {
                    slider.style.transition = 'transform 0.5s ease-in-out'; // Reactivar transición
                }, 50);
            }, 500); // Coincidir con la duración de la transición
        }
    }

    function startAutoSlide() {
        if (autoSlideInterval) clearInterval(autoSlideInterval); // Limpiar cualquier intervalo anterior
        autoSlideInterval = setInterval(nextSlide, 3000); // Cambiar cada 3 segundos
    }

    // Event listeners para los botones del carrusel
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            clearInterval(autoSlideInterval); // Detener el autoslide al interactuar
            prevSlide();
            startAutoSlide(); // Reiniciar el autoslide después de un clic
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            clearInterval(autoSlideInterval); // Detener el autoslide al interactuar
            nextSlide();
            startAutoSlide(); // Reiniciar el autoslide después de un clic
        });
    }

    // --- Funciones para catalogo.html (Filtros y Renderizado por Categoría) ---

    function getUniqueCategories() {
        const categories = new Set();
        productos.forEach(p => categories.add(p.categoria));
        return Array.from(categories);
    }

    function getUniqueMaterials() {
        const materials = new Set();
        productos.forEach(p => materials.add(p.material));
        return Array.from(materials);
    }

    function renderFiltros() {
        const filtrosCategoriasNav = document.getElementById('filtros-categorias');
        const filtroMaterialSelect = document.getElementById('filtro-material');

        if (filtrosCategoriasNav) {
            const categorias = getUniqueCategories();
            categorias.sort().forEach(categoria => {
                const a = document.createElement('a');
                a.href = "#";
                a.textContent = categoria;
                a.dataset.categoria = categoria;
                filtrosCategoriasNav.appendChild(a);
            });
            // Añadir listener a la navegación de categorías
            filtrosCategoriasNav.addEventListener('click', (e) => {
                if (e.target.tagName === 'A') {
                    e.preventDefault();
                    document.querySelectorAll('#filtros-categorias a').forEach(link => {
                        link.classList.remove('active-category');
                    });
                    e.target.classList.add('active-category');
                    applyFilters();
                }
            });
        }

        if (filtroMaterialSelect) {
            const materiales = getUniqueMaterials();
            materiales.sort().forEach(material => {
                const option = document.createElement('option');
                option.value = material;
                option.textContent = material;
                filtroMaterialSelect.appendChild(option);
            });
            // Añadir listener al select de material
            filtroMaterialSelect.addEventListener('change', applyFilters);
        }

        const filtroNombreInput = document.getElementById('filtro-nombre');
        if (filtroNombreInput) {
            filtroNombreInput.addEventListener('input', applyFilters);
        }

        const filtroPrecioSelect = document.getElementById('filtro-precio');
        if (filtroPrecioSelect) {
            filtroPrecioSelect.addEventListener('change', applyFilters);
        }

        const limpiarFiltrosBtn = document.getElementById('limpiarFiltros');
        if (limpiarFiltrosBtn) {
            limpiarFiltrosBtn.addEventListener('click', () => {
                if (filtrosCategoriasNav) {
                    document.querySelectorAll('#filtros-categorias a').forEach(link => {
                        link.classList.remove('active-category');
                    });
                    document.querySelector('#filtros-categorias a[data-categoria="todos"]').classList.add('active-category');
                }
                if (filtroNombreInput) filtroNombreInput.value = '';
                if (filtroMaterialSelect) filtroMaterialSelect.value = 'todos';
                if (filtroPrecioSelect) filtroPrecioSelect.value = 'todos';
                applyFilters();
            });
        }
    }

    function applyFilters() {
        let productosFiltrados = [...productos];

        // Filtrar por categoría
        const categoriaActivaElement = document.querySelector('#filtros-categorias .active-category');
        const categoriaSeleccionada = categoriaActivaElement ? categoriaActivaElement.dataset.categoria : 'todos';
        if (categoriaSeleccionada !== 'todos') {
            productosFiltrados = productosFiltrados.filter(p => p.categoria === categoriaSeleccionada);
        }

        // Filtrar por nombre
        const filtroNombreInput = document.getElementById('filtro-nombre');
        const nombreBusqueda = filtroNombreInput ? filtroNombreInput.value.toLowerCase() : '';
        if (nombreBusqueda) {
            productosFiltrados = productosFiltrados.filter(p => p.nombre.toLowerCase().includes(nombreBusqueda));
        }

        // Filtrar por material
        const filtroMaterialSelect = document.getElementById('filtro-material');
        const materialSeleccionado = filtroMaterialSelect ? filtroMaterialSelect.value : 'todos';
        if (materialSeleccionado !== 'todos') {
            productosFiltrados = productosFiltrados.filter(p => p.material === materialSeleccionado);
        }

        // Ordenar por precio
        const filtroPrecioSelect = document.getElementById('filtro-precio');
        const ordenPrecio = filtroPrecioSelect ? filtroPrecioSelect.value : 'todos';
        if (ordenPrecio === 'menor-mayor') {
            productosFiltrados.sort((a, b) => a.precio - b.precio);
        } else if (ordenPrecio === 'mayor-menor') {
            productosFiltrados.sort((a, b) => b.precio - a.precio);
        }

        renderCatalogo(productosFiltrados);
    }

    function renderCatalogo(productosAmostrar) {
        const productosPorCategoriaDiv = document.getElementById('productos-por-categoria');
        if (!productosPorCategoriaDiv) return;

        productosPorCategoriaDiv.innerHTML = ''; // Limpiar antes de renderizar

        // Agrupar productos por categoría
        const productosAgrupados = productosAmostrar.reduce((acc, producto) => {
            (acc[producto.categoria] = acc[producto.categoria] || []).push(producto);
            return acc;
        }, {});

        // Obtener categorías para el orden, usando las del filtro o todas si no hay filtro activo
        const categoriasEnOrden = document.querySelector('#filtros-categorias .active-category')?.dataset.categoria === 'todos' ? getUniqueCategories().sort() : [document.querySelector('#filtros-categorias .active-category')?.dataset.categoria];


        // Renderizar por cada categoría
        categoriasEnOrden.forEach(categoria => {
            const productosDeEstaCategoria = productosAgrupados[categoria];
            if (productosDeEstaCategoria && productosDeEstaCategoria.length > 0) {
                const categoriaSection = document.createElement('section');
                categoriaSection.classList.add('categoria-productos');
                categoriaSection.innerHTML = `<h2>${categoria}</h2><div class="productos-grid"></div>`;
                productosPorCategoriaDiv.appendChild(categoriaSection);

                const grid = categoriaSection.querySelector('.productos-grid');
                productosDeEstaCategoria.forEach(producto => {
                    const productoDiv = document.createElement('div');
                    productoDiv.classList.add('producto');
                    if (producto.stock === 0) {
                        productoDiv.classList.add('fuera-stock');
                    }
                    productoDiv.innerHTML = `
                        <img src="${producto.imagen}" alt="${producto.nombre}">
                        <h3>${producto.nombre}</h3>
                        <p>$${producto.precio}</p>
                        ${producto.stock > 0 ? `<button class="btn-agregar" data-id="${producto.id}">Agregar al Carrito</button>` : '<span class="sin-stock">Sin Stock</span>'}
                    `;
                    grid.appendChild(productoDiv);
                });
            }
        });

        // Si no hay productos después de los filtros, mostrar mensaje
        if (Object.keys(productosAgrupados).length === 0 || productosAmostrar.length === 0) {
            productosPorCategoriaDiv.innerHTML = '<p style="text-align: center; margin-top: 50px; font-size: 1.2em; color: #555;">No se encontraron productos con los filtros seleccionados.</p>';
        }

        // Asignar eventos a los botones "Agregar al Carrito"
        document.querySelectorAll('.productos-grid .btn-agregar').forEach(button => {
            button.onclick = (e) => {
                const id = parseInt(e.target.dataset.id);
                agregarAlCarrito(id);
            };
        });
    }

    // Determinar qué página se está cargando
    if (document.querySelector('.index-page') || document.location.pathname.endsWith('index.html') || document.location.pathname === '/') {
        document.body.classList.add('index-page');
    } else if (document.querySelector('.catalogo-page') || document.location.pathname.endsWith('catalogo.html')) {
        document.body.classList.add('catalogo-page');
    }

    // Cargar productos al inicio
    fetchProductos();
    renderCarrito(); // Renderizar el carrito al cargar la página

});