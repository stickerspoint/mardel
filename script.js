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
            // Alternar la propiedad display directamente
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
                // Eliminar caracteres no alfanuméricos y espacios para crear un ID válido
                const sectionId = categoria.replace(/[^a-zA-Z0-9]/g, '').replace(/\s/g, ''); 
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

                    const imagenSrc = producto.imagen ? producto.imagen : 'sin-imagen.jpg'; // Ruta por defecto si no hay imagen
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
    let indiceActualCarrusel = 0; // Índice de la imagen que estará en la posición CENTRAL de las 3 visibles.

    if (galeriaSlider) { // Esto asegura que solo se ejecute en index.html
        imagenesCarrusel = galeriaSlider.querySelectorAll('img');

        // Duplicar las imágenes al principio y al final para un bucle continuo
        // Esto crea un efecto "infinito" sin saltos abruptos.
        const primerElemento = imagenesCarrusel[0].cloneNode(true);
        const ultimoElemento = imagenesCarrusel[imagenesCarrusel.length - 1].cloneNode(true);
        galeriaSlider.appendChild(primerElemento);
        galeriaSlider.insertBefore(ultimoElemento, imagenesCarrusel[0]);

        // Volver a obtener las referencias ya con los clones
        imagenesCarrusel = galeriaSlider.querySelectorAll('img');
        
        // El índice inicial debe ajustarse para que empiece en la primera imagen real
        // (después del clon del último elemento)
        indiceActualCarrusel = 1; // La primera imagen real está en el índice 1 (el clon está en el 0)

        function actualizarCarrusel() {
            if (imagenesCarrusel.length === 0) return;

            // Transición suave
            galeriaSlider.style.transition = 'transform 0.5s ease-in-out';

            // Remover la clase 'central' de todas las imágenes
            imagenesCarrusel.forEach(img => img.classList.remove('central'));

            // Aplicar la clase 'central' a la imagen actual (la que está en el centro visual)
            // Cuando mostramos 3 imágenes y la central está en la posición 1 del display (visual),
            // la imagen con la clase 'central' es la que está en `indiceActualCarrusel`.
            if (imagenesCarrusel[indiceActualCarrusel]) {
                imagenesCarrusel[indiceActualCarrusel].classList.add('central');
            }
            
            // Calcular el desplazamiento:
            // Cada imagen tiene un ancho de (100%/3 - 20px) + 20px de margen = 100%/3
            // Así que el ancho efectivo de una "ranura" de imagen es (contenedor.offsetWidth / 3)
            // Si queremos que el elemento en `indiceActualCarrusel` esté en la posición central de las 3 visibles,
            // necesitamos mover el slider de tal forma que ese elemento se alinee con el centro.
            // Para el índice 1 (primera imagen real), queremos que no se mueva.
            // Para el índice 2, queremos moverlo 1 ranura a la izquierda.
            // Para el índice 0 (el clon), queremos moverlo 1 ranura a la derecha.
            // El punto de partida es el índice que quieres centrar, que es `indiceActualCarrusel`.
            // La posición ideal para centrar es la segunda de las tres, que es visualmente `1`.
            // Por lo tanto, el desplazamiento es `-(indiceActualCarrusel - 1)` * ancho de una ranura.
            
            // Calculamos el ancho de una "ranura" de imagen (el ancho total del slider dividido por 3)
            const anchoRanura = galeriaSlider.offsetWidth / 3; 
            const offset = -(indiceActualCarrusel - 1) * anchoRanura; // Calcular el desplazamiento necesario
            
            galeriaSlider.style.transform = `translateX(${offset}px)`;
        }

        // Asignar event listeners a los botones de navegación del carrusel
        if (prevBtnGaleria) {
            prevBtnGaleria.addEventListener('click', () => {
                indiceActualCarrusel--;
                if (indiceActualCarrusel < 0) {
                    // Si llegamos al principio, saltamos al clon del final (índice real -2)
                    // y luego hacemos la transición suave a la imagen real equivalente
                    galeriaSlider.style.transition = 'none'; // Desactivar la transición para el salto
                    indiceActualCarrusel = imagenesCarrusel.length - 2; // -2 porque el último es el clon
                    const anchoRanura = galeriaSlider.offsetWidth / 3;
                    galeriaSlider.style.transform = `translateX(${-(indiceActualCarrusel - 1) * anchoRanura}px)`;
                    // Forzar un reflow para que el cambio de transform sea instantáneo antes de la siguiente transición
                    galeriaSlider.offsetHeight; 
                }
                actualizarCarrusel();
            });
        }

        if (nextBtnGaleria) {
            nextBtnGaleria.addEventListener('click', () => {
                indiceActualCarrusel++;
                if (indiceActualCarrusel >= imagenesCarrusel.length) {
                    // Si llegamos al final, saltamos al clon del principio (índice real 1)
                    // y luego hacemos la transición suave a la imagen real equivalente
                    galeriaSlider.style.transition = 'none'; // Desactivar la transición para el salto
                    indiceActualCarrusel = 1; // Volver a la primera imagen real
                    const anchoRanura = galeriaSlider.offsetWidth / 3;
                    galeriaSlider.style.transform = `translateX(${-(indiceActualCarrusel - 1) * anchoRanura}px)`;
                    // Forzar un reflow para que el cambio de transform sea instantáneo antes de la siguiente transición
                    galeriaSlider.offsetHeight; 
                }
                actualizarCarrusel();
            });
        }

        // Inicializar el carrusel en la carga
        // Retrasamos un poco la actualización inicial para asegurar que el DOM esté completamente renderizado
        // y los anchos de las imágenes sean correctos.
        setTimeout(() => {
            actualizarCarrusel();
        }, 100); 
    }
});