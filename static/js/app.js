
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

// URL de tu aplicación de Google Apps Script
const URL_GOOGLE_SHEETS =
    "https://script.google.com/macros/s/AKfycbzKyj9vNQ1qSFShEF41Mzby11Rq02YY8IjP2oWmElGe7b1cdfjbFqtJZxRGyFTbetKXJQ/exec";


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

    // Guardar una copia en este navegador
    pedidos.push(pedido);
    localStorage.setItem("pedidos", JSON.stringify(pedidos));
    localStorage.setItem("ultimoPedido", JSON.stringify(pedido));

    // Enviar el pedido a Google Sheets
    await enviarAGoogleSheets(pedido);

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

        // El envío fue iniciado; Google Apps Script puede procesarlo
        // aunque el navegador no permita leer su respuesta por CORS.
        window.location.href = "confirmacion.html";

    } catch (error) {
        console.error("Error al enviar el pedido:", error);

        alert(
            "No se pudo completar el envío. " +
            "Revisa tu conexión e inténtalo de nuevo."
        );
    }
}


// Envía el pedido a Google Sheets
async function enviarAGoogleSheets(pedido) {
    const respuesta = await fetch(URL_GOOGLE_SHEETS, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(pedido)
    });

    // Con mode: no-cors, el navegador no permite leer la respuesta.
    // Por eso hay que verificar en Google Sheets si se agregó la fila.
    return respuesta;
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


// Muestra el detalle del último pedido
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
