document.addEventListener('DOMContentLoaded', () => {
    const contenedorCatalogo = document.getElementById('contenedorCatalogo');
    const buscador = document.getElementById('buscador');
    const filtroMaterial = document.getElementById('filtroMaterial');
    const categoriasNav = document.getElementById('categoriasNav');
    const carritoModal = document.getElementById('carritoModal');
    const cerrarCarrito = document.getElementById('cerrarCarrito');
    const listaCarrito = document.getElementById('listaCarrito');
    const totalCarrito = document.getElementById('totalCarrito');
    const vaciarCarritoBtn = document.getElementById('vaciarCarrito');
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // Función para mostrar/ocultar el modal del carrito
    const toggleCarritoModal = () => {
        carritoModal.style.display = carritoModal.style.display === 'flex' ? 'none' : 'flex';
        renderizarCarrito();
    };

    // Abre el modal del carrito al hacer clic en el ícono del carrito
    // Comprobación de que el elemento existe antes de añadir el event listener
    const shoppingCartIcon = document.querySelector('.fa-shopping-cart');
    if (shoppingCartIcon) {
        shoppingCartIcon.addEventListener('click', toggleCarritoModal);
    } else {
        console.warn("Elemento con clase '.fa-shopping-cart' no encontrado. El ícono del carrito no funcionará.");
    }


    // Cierra el modal del carrito
    if (cerrarCarrito) {
        cerrarCarrito.addEventListener('click', toggleCarritoModal);
    } else {
        console.warn("Elemento con ID 'cerrarCarrito' no encontrado.");
    }

    if (carritoModal) {
        carritoModal.addEventListener('click', (e) => {
            if (e.target === carritoModal) {
                toggleCarritoModal();
            }
        });
    } else {
        console.warn("Elemento con ID 'carritoModal' no encontrado.");
    }


    // Función para agregar un producto al carrito
    const agregarAlCarrito = (productoId) => {
        const productoExistente = carrito.find(item => item.id === productoId);
        const productoEnCatalogo = productos.find(prod => prod.id === productoId);

        if (productoExistente) {
            if (productoExistente.cantidad < productoEnCatalogo.stock) {
                productoExistente.cantidad++;
                alert(`¡${productoEnCatalogo.nombre} agregado al carrito! Cantidad: ${productoExistente.cantidad}`);
            } else {
                alert(`¡No hay más stock de ${productoEnCatalogo.nombre}!`);
            }
        } else {
            if (productoEnCatalogo && productoEnCatalogo.stock > 0) {
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
            console.error("Error: Elementos del carrito no encontrados (listaCarrito o totalCarrito).");
            return;
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
        // Agrega event listeners a los botones de eliminar
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
    } else {
        console.warn("Elemento con ID 'vaciarCarrito' no encontrado.");
    }


    // Función para generar las cards de productos
    const generarCardsProductos = (productosParaMostrar) => {
        // Verifica si contenedorCatalogo es null antes de acceder a innerHTML
        if (!contenedorCatalogo) {
            console.error("Error: Elemento 'contenedorCatalogo' no encontrado.");
            return;
        }
        contenedorCatalogo.innerHTML = ''; // Limpia el contenedor principal
        const categoriasMap = new Map();

        // Agrupar productos por categoría
        productosParaMostrar.forEach(producto => {
            if (!categoriasMap.has(producto.categoria)) {
                categoriasMap.set(producto.categoria, []);
            }
            categoriasMap.get(producto.categoria).push(producto);
        });

        // Generar secciones para cada categoría
        for (const [categoria, productos] of categoriasMap.entries()) {
            const sectionId = categoria.replace(/[^a-zA-Z0-9]/g, ''); // Limpiar el nombre para el ID
            const section = document.createElement('section');
            section.id = sectionId;
            section.innerHTML = `<h2>${categoria}</h2><div class="destacados-grid"></div>`;
            contenedorCatalogo.appendChild(section);

            const gridContainer = section.querySelector('.destacados-grid');

            productos.forEach(producto => {
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

        // Agrega event listeners a los botones "Agregar al carrito"
        document.querySelectorAll('.btn-agregar').forEach(button => {
            button.addEventListener('click', (e) => {
                const productoId = parseInt(e.currentTarget.dataset.id);
                agregarAlCarrito(productoId);
            });
        });
    };

    // Carga los productos desde el JSON
    let productos = []; // Almacena todos los productos cargados
    fetch('productos.json')
        .then(response => response.json())
        .then(data => {
            productos = data; // Guarda los productos en la variable global
            generarCardsProductos(productos); // Genera las cards inicialmente
            renderizarCarrito(); // Renderiza el carrito al cargar la página
        })
        .catch(error => console.error('Error al cargar los productos:', error));

    // Funcionalidad del buscador
    // Añadir una comprobación para asegurar que 'buscador' no sea null
    if (buscador) {
        buscador.addEventListener('input', () => {
            const textoBusqueda = buscador.value.toLowerCase();
            const materialSeleccionado = filtroMaterial.value.toLowerCase();

            const productosFiltrados = productos.filter(producto => {
                const coincideNombre = producto.nombre.toLowerCase().includes(textoBusqueda);
                const coincideMaterial = !materialSeleccionado || producto.material.toLowerCase() === materialSeleccionado;
                return coincideNombre && coincideMaterial;
            });
            generarCardsProductos(productosFiltrados);
        });
    } else {
        console.error("Error: Elemento 'buscador' no encontrado.");
    }


    // Funcionalidad del filtro por material
    // Añadir una comprobación para asegurar que 'filtroMaterial' no sea null
    if (filtroMaterial) {
        filtroMaterial.addEventListener('change', () => {
            const textoBusqueda = buscador.value.toLowerCase();
            const materialSeleccionado = filtroMaterial.value.toLowerCase();

            const productosFiltrados = productos.filter(producto => {
                const coincideNombre = producto.nombre.toLowerCase().includes(textoBusqueda);
                const coincideMaterial = !materialSeleccionado || producto.material.toLowerCase() === materialSeleccionado;
                return coincideNombre && coincideMaterial;
            });
            generarCardsProductos(productosFiltrados);
        });
    } else {
        console.error("Error: Elemento 'filtroMaterial' no encontrado.");
    }


    // Funcionalidad para el scroll suave a las categorías
    // Añadir una comprobación para asegurar que 'categoriasNav' no sea null
    if (categoriasNav) {
        categoriasNav.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                const targetId = e.target.getAttribute('href').substring(1);
                const seccion = document.getElementById(targetId);
                if (seccion) {
                    window.scrollTo({
                        top: seccion.offsetTop - 80, // Ajusta el offset si tu header es fijo
                        behavior: 'smooth'
                    });
                }
            }
        });
    } else {
        console.error("Error: Elemento 'categoriasNav' no encontrado.");
    }


    // --- Lógica del Carrusel (ACTUALIZADO) ---
    const galeriaSlider = document.getElementById('galeriaSlider');
    const imagenesCarrusel = galeriaSlider ? galeriaSlider.querySelectorAll('img') : [];
    let indiceActualCarrusel = 0;

    function actualizarCarrusel() {
        if (imagenesCarrusel.length === 0) return;

        // Asegurar que el índice actual esté dentro de los límites para un bucle infinito
        if (indiceActualCarrusel < 0) {
            indiceActualCarrusel = imagenesCarrusel.length - 1;
        } else if (indiceActualCarrusel >= imagenesCarrusel.length) {
            indiceActualCarrusel = 0;
        }

        // Remover la clase 'central' de todas las imágenes
        imagenesCarrusel.forEach(img => img.classList.remove('central'));

        // Añadir la clase 'central' a la imagen central
        const indiceCentral = indiceActualCarrusel;
        if (imagenesCarrusel.length > indiceCentral) {
            imagenesCarrusel.item(indiceCentral).classList.add('central');
        }

        // Calcular el desplazamiento para centrar la imagen central
        const anchoImagenConMargen = imagenesCarrusel.length > 0 ? imagenesCarrusel.item(0).offsetWidth + 20 : 0; // +20 por 10px de margen a cada lado
        const offset = -(indiceActualCarrusel - 1) * anchoImagenConMargen; 

        galeriaSlider.style.transform = `translateX(${offset}px)`;
    }

    // Exportar moverGaleria al objeto global window para que sea accesible desde HTML
    window.moverGaleria = (direccion) => {
        if (imagenesCarrusel.length === 0) return;

        indiceActualCarrusel += direccion;
        actualizarCarrusel();
    };

    // Obtener las referencias a los nuevos botones de navegación del carrusel
    const prevBtnGaleria = document.getElementById('prevBtnGaleria');
    const nextBtnGaleria = document.getElementById('nextBtnGaleria');

    // Asignar event listeners a los botones de navegación del carrusel
    if (prevBtnGaleria) {
        prevBtnGaleria.addEventListener('click', () => {
            window.moverGaleria(-1);
        });
    } else {
        console.warn("Elemento con ID 'prevBtnGaleria' no encontrado.");
    }

    if (nextBtnGaleria) {
        nextBtnGaleria.addEventListener('click', () => {
            window.moverGaleria(1);
        });
    } else {
        console.warn("Elemento con ID 'nextBtnGaleria' no encontrado.");
    }

    // Inicializar el carrusel en la carga
    if (imagenesCarrusel.length > 0) {
        actualizarCarrusel();
    }
});