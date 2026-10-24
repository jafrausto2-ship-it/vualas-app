const PRODUCTOS = [
    { id:"cajeta_ind", nombre:"Vualá Cajeta Individual", precio:17, imagen:"Cajeta.jpg" },
    { id:"cajeta_tira", nombre:"Vualá Cajeta Tira", precio:100, imagen:"Cajeta.jpg" },

    { id:"vainilla_ind", nombre:"Vualá Vainilla Individual", precio:17, imagen:"Vainilla.jpg" },
    { id:"vainilla_tira", nombre:"Vualá Vainilla Tira", precio:100, imagen:"Vainilla.jpg" },

    { id:"chocolate_ind", nombre:"Vualá Chocolate Individual", precio:17, imagen:"Chocolate.jpg" },
    { id:"chocolate_tira", nombre:"Vualá Chocolate Tira", precio:100, imagen:"Chocolate.jpg" },

    { id:"prispas", nombre:"Prispas", precio:5, imagen:"Prispas.jpg" },
    { id:"extreme", nombre:"Chetos Extreme", precio:15, imagen:"Chetos-Extreme.jpg" },
    { id:"spicante", nombre:"Chetos Spicante", precio:22, imagen:"Chetos-Spicante.jpg" },
    { id:"queso", nombre:"Chetos Queso", precio:17, imagen:"Chetos-Queso.jpg" }
];

function guardarPedido(cliente, productos, total, detalle){

    let pedidos =
        JSON.parse(localStorage.getItem("pedidos")) || [];

    const pedido = {
        id: Date.now(),
        cliente: cliente,
        fecha: new Date().toLocaleString(),
        productos: productos,
        total: total,
        detalle: detalle
    };

    pedidos.push(pedido);

    localStorage.setItem(
        "pedidos",
        JSON.stringify(pedidos)
    );

    localStorage.setItem(
        "ultimoPedido",
        JSON.stringify(pedido)
    );

    enviarAGoogleSheets(pedido);
}

function crearPedido(){

    const cliente =
        document.getElementById("cliente").value.trim();

    if(cliente === ""){

        alert("Por favor captura el nombre del cliente.");

        return;
    }

    let total = 0;

    let hayProductos = false;

    let detalle =
`PEDIDO

Cliente: ${cliente}

PRODUCTOS

`;

    let productosPedido = [];

    PRODUCTOS.forEach(producto => {

        const cantidad =
            parseInt(
                document.getElementById(producto.id).value
            ) || 0;

        if(cantidad > 0){

            hayProductos = true;

            const subtotal =
                cantidad * producto.precio;

            total += subtotal;

            detalle +=
                `${cantidad} x ${producto.nombre} = $${subtotal}\n`;

            productosPedido.push({
                nombre: producto.nombre,
                cantidad: cantidad,
                subtotal: subtotal
            });
        }
    });

    if(!hayProductos){

        alert("Selecciona al menos un producto.");

        return;
    }

    detalle += `\nTOTAL: $${total}`;

    guardarPedido(
        cliente,
        productosPedido,
        total,
        detalle
    );

    window.location.href =
        "confirmacion.html";
}

function mostrarPedidos(){

    const tabla =
        document.getElementById("tablaPedidos");

    if(!tabla) return;

    const pedidos =
        JSON.parse(
            localStorage.getItem("pedidos")
        ) || [];

    tabla.innerHTML = "";

    pedidos.forEach((pedido,index)=>{

        tabla.innerHTML += `
        <tr>
            <td>${pedido.cliente}</td>
            <td>${pedido.fecha}</td>
            <td>$${pedido.total}</td>

            <td>

                <button onclick="verPedido(${index})">
                    Ver
                </button>

                <button onclick="eliminarPedido(${index})">
                    Eliminar
                </button>

            </td>
        </tr>
        `;
    });

}

function verPedido(index){

    localStorage.setItem(
        "pedido_ver",
        index
    );

    window.location.href =
        "ver_pedido.html";
}

function eliminarPedido(index){

    let pedidos =
        JSON.parse(
            localStorage.getItem("pedidos")
        ) || [];

    pedidos.splice(index,1);

    localStorage.setItem(
        "pedidos",
        JSON.stringify(pedidos)
    );

    mostrarPedidos();
}

async function enviarAGoogleSheets(pedido){

    const url =
    "PEGA_AQUI_LA_URL_DE_GOOGLE_APPS_SCRIPT";

    try{

        await fetch(url,{
            method:"POST",

            headers:{
                "Content-Type":
                "application/json"
            },

            body: JSON.stringify(pedido)
        });

        console.log(
            "Pedido enviado correctamente"
        );

    }catch(error){

        console.error(
            "Error enviando pedido:",
            error
        );
    }
}