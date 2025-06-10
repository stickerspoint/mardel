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
});