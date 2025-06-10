document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos comunes
    const shoppingCartBtn = document.getElementById('cartIconBtn'); // Seleccionamos el botón por su ID
    const carritoModal = document.getElementById('carritoModal');
    const cerrarCarrito = document.getElementById('cerrarCarrito');
    const listaCarrito = document.getElementById('listaCarrito');
    const totalCarrito = document.getElementById('totalCarrito');
    const vaciarCarritoBtn = document.getElementById('vaciarCarrito');

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // --- Funcionalidad del Carrito (Común a ambas páginas si el modal está presente) ---

    // Función para mostrar/ocultar el modal del carrito
    const toggleCarritoModal = (e) => {
        if (e && typeof e.stopPropagation === 'function') { // Asegura que 'e' existe y tiene stopPropagation
            e.stopPropagation(); // Detiene la propagación del evento que activó el modal
        }
        if (carritoModal) {
            carritoModal.style.display = carritoModal.style.display === 'flex' ? 'none' : 'flex';
            renderizarCarrito(); // Asegura que el carrito se actualice cada vez que se abre
        }
    };

    // Abre el carrito solo al hacer clic en el botón del carrito
    if (shoppingCartBtn) {
        shoppingCartBtn.addEventListener('click', toggleCarritoModal); // Pasamos la función directamente
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

    // Función para agregar un producto al carrito
    const agregarAlCarrito = (productoId) => {
        if (!window.productos || window.productos.length === 0) {
            console.warn("Intentando agregar al carrito sin productos cargados. ¿Estás en la página del catálogo?");
            return;
        }

        const productoExistente = carrito.find(item => item.id === productoId);
        const productoEnCatalogo = window.productos.find(prod => prod.id === productoId);

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
            if (!contenedorCatalogo) return;
            contenedorCatalogo.innerHTML = '';
            const categoriasMap = new Map();

            productosParaMostrar.forEach(producto => {
                if (!categoriasMap.has(producto.categoria)) {
                    categoriasMap.set(producto.categoria, []);
                }
                categoriasMap.get(producto.categoria).push(producto);
            });

            for (const [categoria, productosDeCategoria] of categoriasMap.entries()) {
                // Genera un ID compatible con el href del menú de categorías
                const sectionId = categoria.replace(/[^a-zA-Z0-9]/g, ''); // Elimina caracteres no alfanuméricos
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
                            top: seccion.offsetTop - 80, // Ajusta este valor si tu header tiene otra altura
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

            if (imagenesCarrusel[indiceActualCarrusel]) {
                imagenesCarrusel[indiceActualCarrusel].classList.add('central');
            }

            const anchoRanura = galeriaSlider.offsetWidth / 3;
            const offset = -(indiceActualCarrusel - 1) * anchoRanura;
            galeriaSlider.style.transform = `translateX(${offset}px)`;
        }

        if (prevBtnGaleria) {
            prevBtnGaleria.addEventListener('click', () => {
                indiceActualCarrusel--;
                if (indiceActualCarrusel < 0) {
                    galeriaSlider.style.transition = 'none';
                    indiceActualCarrusel = imagenesCarrusel.length - 2;
                    const anchoRanura = galeriaSlider.offsetWidth / 3;
                    galeriaSlider.style.transform = `translateX(${-(indiceActualCarrusel - 1) * anchoRanura}px)`;
                    galeriaSlider.offsetHeight; // Forzar reflow
                }
                actualizarCarrusel();
            });
        }

        if (nextBtnGaleria) {
            nextBtnGaleria.addEventListener('click', () => {
                indiceActualCarrusel++;
                if (indiceActualCarrusel >= imagenesCarrusel.length) {
                    galeriaSlider.style.transition = 'none';
                    indiceActualCarrusel = 1;
                    const anchoRanura = galeriaSlider.offsetWidth / 3;
                    galeriaSlider.style.transform = `translateX(${-(indiceActualCarrusel - 1) * anchoRanura}px)`;
                    galeriaSlider.offsetHeight; // Forzar reflow
                }
                actualizarCarrusel();
            });
        }

        // Inicializar el carrusel en la carga
        setTimeout(() => {
            actualizarCarrusel();
        }, 100);
    }
});