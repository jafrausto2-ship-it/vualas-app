
const PRODUCTOS = [
    { id: "cajeta_ind", nombre: "Vualá Cajeta Individual", precio: 17, imagen: "Cajeta.jpg" },
    { id: "cajeta_tira", nombre: "Vualá Cajeta Tira", precio: 100, imagen: "Cajeta.jpg" },

    { id: "vainilla_ind", nombre: "Vualá Vainilla Individual", precio: 17, imagen: "Vainilla.jpg" },
    { id: "vainilla_tira", nombre: "Vualá Vainilla Tira", precio: 100, imagen: "Vainilla.jpg" },

    { id: "chocolate_ind", nombre: "Vualá Chocolate Individual", precio: 17, imagen: "Chocolate.jpg" },
    { id: "chocolate_tira", nombre: "Vualá Chocolate Tira", precio: 100, imagen: "Chocolate.jpg" },

    { id: "prispas", nombre: "Prispas", precio: 5, imagen: "Prispas.jpg" },
    { id: "extreme", nombre: "Chetos Extreme", precio: 15, imagen: "Chetos-Extreme.jpg" },
    { id: "spicante", nombre: "Chetos Spicante", precio: 22, imagen: "Chetos-Spicante.jpg" },
    { id: "queso", nombre: "Chetos Queso", precio: 17, imagen: "Chetos-Queso.jpg" }
];

const URL_GOOGLE_SHEETS =
    "https://script.google.com/macros/s/AKfycbzgajAV7KXScTqtH1PE7EQXbOqa29unuxdFQkhJ5WURUewTrpwGv6cwK4S4nt74FTzuKw/exec";


// Guarda el pedido en el navegador y lo envía a Google Sheets
async function guardarPedido(cliente, productos, total, detalle) {
    const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

    const pedido = {
        id: Date.now(),
        cliente: cliente,
        fecha: new Date().toLocaleString("es-MX"),
        productos: productos,
        total: total,
        detalle: detalle
    };

    pedidos.push(pedido);

    localStorage.setItem("pedidos", JSON.stringify(pedidos));
    localStorage.setItem("ultimoPedido", JSON.stringify(pedido));

    enviarAGoogleSheets(pedido);

    return pedido;
}


// Captura los productos y crea el pedido
async function crearPedido() {
    const campoCliente = document.getElementById("cliente");

    if (!campoCliente) {
        alert("No se encontró el campo del nombre del cliente.");
        return;
    }

    const cliente = campoCliente.value.trim();

    if (cliente === "") {
        alert("Por favor captura el nombre del cliente.");
        return;
    }

    let total = 0;
    let hayProductos = false;

    let detalle = `PEDIDO

Cliente: ${cliente}

PRODUCTOS

`;

    const productosPedido = [];

    PRODUCTOS.forEach(producto => {
        const campo = document.getElementById(producto.id);

        if (!campo) {
            return;
        }

        const cantidad = parseInt(campo.value, 10) || 0;

        if (cantidad > 0) {
            hayProductos = true;

            const subtotal = cantidad * producto.precio;
            total += subtotal;

            detalle += `${cantidad} x ${producto.nombre} = $${subtotal}\n`;

            productosPedido.push({
                nombre: producto.nombre,
                cantidad: cantidad,
                subtotal: subtotal
            });
        }
    });

    if (!hayProductos) {
        alert("Selecciona al menos un producto.");
        return;
    }

    detalle += `\nTOTAL: $${total}`;

    try {
        await guardarPedido(cliente, productosPedido, total, detalle);

        // Dar tiempo para iniciar el envío antes de cambiar de página.
        // Esto no garantiza que Google ya haya guardado el pedido.
        setTimeout(() => {
            window.location.href = "confirmacion.html";
        }, 1000);

    } catch (error) {
        console.error("Error al crear el pedido:", error);
        alert("Ocurrió un problema al preparar el pedido.");
    }
}


// Envía el pedido mediante un formulario oculto a Google Apps Script
function enviarAGoogleSheets(pedido) {
    let iframe = document.getElementById("googleSheetsFrame");

    if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.name = "googleSheetsFrame";
        iframe.id = "googleSheetsFrame";
        iframe.style.display = "none";
        document.body.appendChild(iframe);
    }

    const formulario = document.createElement("form");

    formulario.method = "POST";
    formulario.action = URL_GOOGLE_SHEETS;
    formulario.target = "googleSheetsFrame";
    formulario.style.display = "none";

    const campo = document.createElement("input");

    campo.type = "hidden";
    campo.name = "payload";
    campo.value = JSON.stringify(pedido);

    formulario.appendChild(campo);
    document.body.appendChild(formulario);

    formulario.submit();

    // Eliminar el formulario después de enviarlo.
    setTimeout(() => {
        formulario.remove();
    }, 3000);
}


// Muestra los pedidos guardados en este navegador
function mostrarPedidos() {
    const tabla = document.getElementById("tablaPedidos");

    if (!tabla) {
        return;
    }

    const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

    tabla.innerHTML = "";

    pedidos.forEach((pedido, index) => {
        const fila = document.createElement("tr");

        const celdaCliente = document.createElement("td");
        celdaCliente.textContent = pedido.cliente;

        const celdaFecha = document.createElement("td");
        celdaFecha.textContent = pedido.fecha;

        const celdaTotal = document.createElement("td");
        celdaTotal.textContent = "$" + pedido.total;

        const celdaAcciones = document.createElement("td");

        const botonVer = document.createElement("button");
        botonVer.textContent = "Ver";
        botonVer.type = "button";
        botonVer.onclick = () => verPedido(index);

        const botonEliminar = document.createElement("button");
        botonEliminar.textContent = "Eliminar";
        botonEliminar.type = "button";
        botonEliminar.onclick = () => eliminarPedido(index);

        celdaAcciones.appendChild(botonVer);
        celdaAcciones.appendChild(document.createTextNode(" "));
        celdaAcciones.appendChild(botonEliminar);

        fila.appendChild(celdaCliente);
        fila.appendChild(celdaFecha);
        fila.appendChild(celdaTotal);
        fila.appendChild(celdaAcciones);

        tabla.appendChild(fila);
    });
}


// Abre el detalle del pedido seleccionado
function verPedido(index) {
    localStorage.setItem("pedido_ver", String(index));
    window.location.href = "ver_pedido.html";
}


// Elimina un pedido de la lista local de este navegador
function eliminarPedido(index) {
    const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

    pedidos.splice(index, 1);

    localStorage.setItem("pedidos", JSON.stringify(pedidos));

    mostrarPedidos();
}


// Muestra el detalle del pedido seleccionado
function mostrarDetallePedido() {
    const contenedor = document.getElementById("detallePedido");

    if (!contenedor) {
        return;
    }

    const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
    const indice = parseInt(localStorage.getItem("pedido_ver"), 10);

    if (Number.isNaN(indice) || !pedidos[indice]) {
        contenedor.textContent = "No se encontró el pedido.";
        return;
    }

    contenedor.textContent = pedidos[indice].detalle;
}


// Ejecuta las funciones necesarias al cargar cada página
document.addEventListener("DOMContentLoaded", () => {
    mostrarPedidos();
    mostrarDetallePedido();
});

