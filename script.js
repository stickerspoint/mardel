document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos comunes (pueden existir en ambas páginas o solo en una)
    const shoppingCartIcon = document.querySelector('.fa-shopping-cart');
    const carritoModal = document.getElementById('carritoModal');
    const cerrarCarrito = document.getElementById('cerrarCarrito');
    const listaCarrito = document.getElementById('listaCarrito');
    const totalCarrito = document.getElementById('totalCarrito');
    const vaciarCarritoBtn = document.getElementById('vaciarCarrito');

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // --- Funcionalidad del Carrito (Común a ambas páginas si el modal está presente) ---

    // Función para mostrar/ocultar el modal del carrito
    const toggleCarritoModal = () => {
        if (carritoModal) {
            carritoModal.style.display = carritoModal.style.display === 'flex' ? 'none' : 'flex';
            renderizarCarrito(); // Asegura que el carrito se actualice cada vez que se abre
        }
    };

    if (shoppingCartIcon) {
        shoppingCartIcon.addEventListener('click', toggleCarritoModal);
    }

    if (cerrarCarrito) {
        cerrarCarrito.addEventListener('click', toggleCarritoModal);
    }

    if (carritoModal) {
        // Cierra el modal si se hace clic fuera del contenido
        carritoModal.addEventListener('click', (e) => {
            if (e.target === carritoModal) {
                toggleCarritoModal();
            }
        });
    }

    // Función para agregar un producto al carrito
    const agregarAlCarrito = (productoId) => {
        // 'productos' es una variable global definida en el scope del catalogo.html
        // Si no estamos en catalogo.html, productos estará vacío o indefinido.
        if (!window.productos || window.productos.length === 0) {
            console.warn("Intentando agregar al carrito sin productos cargados. ¿Estás en la página del catálogo?");
            return;
        }

        const productoExistente = carrito.find(item => item.id === productoId);
        const productoEnCatalogo = window.productos.find(prod => prod.id === productoId); // Usar window.productos

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
            {
                alert(`¡${productoEnCatalogo.nombre} está fuera de stock!`);
            }
            }
        }
        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderizarCarrito();
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
                li.innerHTML = `${item.nombre} x ${item.cantidad} - $${item.precio * item.cantidad}
                                 <button class="btn-eliminar" data-id="${item.id}"><i class="fas fa-trash"></i></button>`;
                listaCarrito.appendChild(li);
                total += item.precio * item.cantidad;
            });
        }
        totalCarrito.textContent = total;

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

    // Renderizar el carrito al cargar la página si el modal está presente
    if (carritoModal) {
        renderizarCarrito();
    }


    // --- Lógica específica para la página 'catalogo.html' ---
    const contenedorCatalogo = document.getElementById('contenedorCatalogo');
    const buscador = document.getElementById('buscador');
    const filtroMaterial = document.getElementById('filtroMaterial');
    const categoriasNav = document.getElementById('categoriasNav');

    // Declarar productos a nivel global para que sea accesible desde agregarAlCarrito
    window.productos = [];

    if (contenedorCatalogo) { // Esto asegura que solo se ejecute en catalogo.html
        // Función para generar las cards de productos
        const generarCardsProductos = (productosParaMostrar) => {
            if (!contenedorCatalogo) return; // Doble chequeo por si acaso
            contenedorCatalogo.innerHTML = ''; // Limpia el contenedor principal
            const categoriasMap = new Map();

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
                window.productos = data; // Asigna a window.productos
                generarCardsProductos(window.productos);
            })
            .catch(error => console.error('Error al cargar los productos:', error));

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
                generarCardsProductos(productosFiltrados);
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
                            top: seccion.offsetTop - 80,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        }
    }


    // --- Lógica del Carrusel (Solo para index.html) ---
    const galeriaSlider = document.getElementById('galeriaSlider');
    const prevBtnGaleria = document.getElementById('prevBtnGaleria');
    const nextBtnGaleria = document.getElementById('nextBtnGaleria');
    let imagenesCarrusel = [];
    let indiceActualCarrusel = 0;

    if (galeriaSlider) { // Esto asegura que solo se ejecute en index.html
        imagenesCarrusel = galeriaSlider.querySelectorAll('img');

        function actualizarCarrusel() {
            if (imagenesCarrusel.length === 0) return;

            // Ajustar el índice para un bucle infinito
            if (indiceActualCarrusel < 0) {
                indiceActualCarrusel = imagenesCarrusel.length - 1;
            } else if (indiceActualCarrusel >= imagenesCarrusel.length) {
                indiceActualCarrusel = 0;
            }

            // Remover la clase 'central' de todas las imágenes
            imagenesCarrusel.forEach(img => img.classList.remove('central'));

            // Aplicar la clase 'central' a la imagen actual
            if (imagenesCarrusel.length > indiceActualCarrusel) {
                imagenesCarrusel.item(indiceActualCarrusel).classList.add('central');
            }

            // Calcular el desplazamiento:
            // Queremos que la imagen `indiceActualCarrusel` esté en el centro de la vista.
            // Si hay 3 imágenes visibles en el `galeria-slider`, la imagen central es la segunda (índice 1).
            // Entonces, el desplazamiento necesario es para que la imagen `indiceActualCarrusel` se mueva a la posición visual 1.
            // Si la imagen `indiceActualCarrusel` es la primera (índice 0), necesitamos moverla 1 posición a la derecha.
            // Si es la segunda (índice 1), no necesitamos moverla (0).
            // Si es la tercera (índice 2), necesitamos moverla 1 posición a la izquierda.
            // Esto se logra con `-(indiceActualCarrusel - 1)`
            const anchoImagenConMargen = imagenesCarrusel[0].offsetWidth + 20; // Ancho + márgenes (10px a cada lado)
            const offset = -(indiceActualCarrusel - 1) * anchoImagenConMargen; 
            
            galeriaSlider.style.transform = `translateX(${offset}px)`;
        }

        // Asignar event listeners a los botones de navegación del carrusel
        if (prevBtnGaleria) {
            prevBtnGaleria.addEventListener('click', () => {
                indiceActualCarrusel--;
                actualizarCarrusel();
            });
        }

        if (nextBtnGaleria) {
            nextBtnGaleria.addEventListener('click', () => {
                indiceActualCarrusel++;
                actualizarCarrusel();
            });
        }

        // Inicializar el carrusel en la carga
        actualizarCarrusel();
    }
});