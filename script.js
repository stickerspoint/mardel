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
    document.querySelector('.fa-shopping-cart').addEventListener('click', toggleCarritoModal);

    // Cierra el modal del carrito
    cerrarCarrito.addEventListener('click', toggleCarritoModal);
    carritoModal.addEventListener('click', (e) => {
        if (e.target === carritoModal) {
            toggleCarritoModal();
        }
    });

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
    vaciarCarritoBtn.addEventListener('click', () => {
        carrito = [];
        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderizarCarrito();
        alert('Se ha vaciado el carrito.');
    });

    // Función para generar las cards de productos
    const generarCardsProductos = (productosParaMostrar) => {
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

    // Funcionalidad del filtro por material
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

    // Funcionalidad para el scroll suave a las categorías
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

    // --- Lógica del Carrusel (ACTUALIZADO) ---
    const galeriaSlider = document.getElementById('galeriaSlider');
    const imagenesCarrusel = galeriaSlider ? galeriaSlider.querySelectorAll('img') : [];
    // const numVisible = 3; // Esta variable no se usa directamente en el cálculo de offset, se puede eliminar si se quiere, o mantener como referencia.
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
        // NOTA: Asegúrate que las imágenes tengan un ancho definido en CSS para que offsetWidth funcione.
        // El '+ 20' es por el margin de 10px a cada lado (margin: 0 10px; -> 10px izquierda + 10px derecha)
        const anchoImagenConMargen = imagenesCarrusel.length > 0 ? imagenesCarrusel.item(0).offsetWidth + 20 : 0;
        
        // Calculamos el offset para centrar la imagen actual.
        // Si tienes 3 imágenes visibles y la del centro es 'indiceActualCarrusel',
        // necesitas mover el slider de tal forma que la imagen de 'indiceActualCarrusel'
        // quede en la posición central de las 3 visibles.
        // Esto depende del ancho del contenedor y de las imágenes.
        // Una forma común es que el offset sea para alinear el *inicio* de la imagen central
        // o que el centro de la imagen central esté en el centro del contenedor visible.
        // Aquí ajustamos para que la imagen central esté visualmente al centro de las 3.
        // Si el carrusel muestra 3 imágenes, y la central es la que tiene `indiceActualCarrusel`,
        // la primera imagen visible estaría en `indiceActualCarrusel - 1`.
        // El `translateX` debe mover el slider para que `indiceActualCarrusel - 1` quede al inicio del contenedor.
        // O más simplemente, calcular la posición para que la imagen central se vea en el medio.
        
        // Asumiendo que quieres que la imagen con indiceActualCarrusel se centre:
        // El offset es el desplazamiento negativo de la posición de la imagen central
        // menos la mitad del ancho del contenedor visible.
        // Esto puede ser complejo si no manejamos el ancho del contenedor visible con JS también.

        // Volviendo a la lógica original de mover por anchos de imagen.
        // Si queremos que la imagen central sea la de `indiceActualCarrusel`, y se muestren 3,
        // necesitamos que el slider se desplace lo suficiente para que la imagen
        // `indiceActualCarrusel` quede en la posición del medio de las 3.
        // Esto significa que la imagen `indiceActualCarrusel - 1` debería estar visible a la izquierda.
        // Por lo tanto, el desplazamiento necesario es `-(indiceActualCarrusel - 1) * anchoImagenConMargen`.
        // Si `indiceActualCarrusel` es 0, `0 - 1 = -1`. `offset = -(-1) * anchoImagen = 1 * anchoImagen`.
        // Esto movería el slider hacia la derecha.
        // Si `indiceActualCarrusel` es 1, `1 - 1 = 0`. `offset = -(0) * anchoImagen = 0`. No se mueve.
        // Si `indiceActualCarrusel` es 2, `2 - 1 = 1`. `offset = -(1) * anchoImagen`. Se mueve a la izquierda.

        // Esta lógica de offset depende mucho de cómo se esté comportando el flexbox y los márgenes.
        // A veces, es más robusto calcular el centro del slider y el centro de la imagen central.

        // Probemos con el offset original que ya usabas:
        const offset = -indiceActualCarrusel * anchoImagenConMargen; 
        
        // Para centrar 3 imágenes:
        // Si el slider tiene `display: flex` y `justify-content: center` en el CSS,
        // Y cada imagen tiene un `width` fijo y `margin`,
        // la idea es que el `transform: translateX` desplace el grupo de imágenes
        // de tal forma que la imagen con `indiceActualCarrusel` se "alinee" con el centro.
        // El cálculo de `-(indiceActualCarrusel - 1) * anchoImagen` es para mover
        // la imagen que está *antes* de la central al inicio del viewport,
        // logrando que la central esté en el medio.
        
        // Si el carrusel tiene un ancho de contenedor visible y los elementos están centrados por flexbox,
        // el `translateX` necesita mover el *primer elemento visible* a una posición específica.
        // En un carrusel de 3, el `indiceActualCarrusel` es la imagen central.
        // La imagen que debe estar a la izquierda es `indiceActualCarrusel - 1`.
        // La imagen que debe estar a la derecha es `indiceActualCarrusel + 1`.

        // Vamos a mantener la lógica que te di que apunta a centrar el "grupo" de 3,
        // asumiendo que el CSS `justify-content: center` ya hace parte del trabajo.
        // El `offset` debe desplazar el `galeria-slider` de modo que la imagen `indiceActualCarrusel`
        // se mueva a la posición central.

        // Si la imagen 0 debe estar en el centro, y se muestran 3, la imagen -1 debe estar al principio del viewport.
        // El offset es la distancia desde el inicio del galeriaSlider hasta el inicio de la imagen que queremos ver en el centro.
        // Y luego desplazarla al centro del contenedor.
        // Esto es más complejo.

        // Simplifiquemos y volvamos a la lógica que te di que parecía más directa para 3 imágenes:
        // `const offset = -(indiceActualCarrusel - 1) * anchoImagenConMargen;`
        // Esta línea desplaza el slider de tal forma que la imagen que está en
        // `indiceActualCarrusel - 1` se alinee al inicio del contenedor visible.
        // Esto tiene sentido para lograr que la imagen `indiceActualCarrusel` quede en el medio.

        // Comprobemos si `anchoImagenConMargen` está dando un valor.
        // console.log('Ancho de imagen con margen:', anchoImagenConMargen);
        // console.log('Offset calculado:', offset);

        galeriaSlider.style.transform = `translateX(${offset}px)`;
    }

    window.moverGaleria = (direccion) => {
        if (imagenesCarrusel.length === 0) return;

        indiceActualCarrusel += direccion;
        // La función actualizarCarrusel() se encargará de los límites y el bucle infinito.
        actualizarCarrusel();
    };

    // Inicializar el carrusel en la carga
    if (imagenesCarrusel.length > 0) {
        // Establecer el índice inicial para que la primera imagen aparezca en el centro
        // Por ejemplo, si tienes 3 imágenes: 0, 1, 2. Si quieres que la imagen 0 sea la central al inicio:
        // indiceActualCarrusel = 0; // O la imagen que quieres que empiece en el centro.
        actualizarCarrusel(); // Llama a la función para posicionar el carrusel
    }
}); // <-- ¡Esta es la ÚNICA llave de cierre para DOMContentLoaded! Debe estar al final del archivo.