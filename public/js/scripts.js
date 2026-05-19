const API_URL = "http://localhost:3000/api/elementos";

const obtenerElementos = async () => {
    try {
        const respuesta = await fetch(API_URL);
        if (!respuesta.ok) throw new Error("Error al obtener datos");
        return await respuesta.json();
    } catch (error) {
        console.error("Error:", error);
        return [];
    }
};

const crearId = (elementos) => {
    const ultimoId = elementos.reduce((maximo, elemento) => Math.max(maximo, elemento.id), 0);
    return ultimoId + 1;
};

const texto = (valor) => String(valor || "").trim();

const normalizar = (valor) => texto(valor).toLowerCase();

const alerta = (icono, titulo, mensaje) => {
    if (window.Swal) {
        return Swal.fire({
            icon: icono,
            title: titulo,
            text: mensaje,
            confirmButtonColor: "#2563eb"
        });
    }

    alert(`${titulo}\n${mensaje}`);
    return Promise.resolve();
};

const confirmarAlerta = async (titulo, mensaje) => {
    if (window.Swal) {
        const resultado = await Swal.fire({
            icon: "warning",
            title: titulo,
            text: mensaje,
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#2563eb",
            confirmButtonText: "Si, eliminar",
            cancelButtonText: "Cancelar"
        });

        return resultado.isConfirmed;
    }

    return window.confirm(`${titulo}\n${mensaje}`);
};

const mostrarMensaje = (tipo, mensaje) => {
    const exito = document.getElementById("exito");
    const error = document.getElementById("error");

    if (exito) exito.textContent = "";
    if (error) error.textContent = "";

    const destino = tipo === "error" ? error : exito;
    if (destino) destino.textContent = mensaje;
};

const columnasElementos = [
    { titulo: "ID", campo: "id" },
    { titulo: "Cantidad", campo: "cantidad" },
    { titulo: "Descripcion", campo: "descripcion" },
    { titulo: "Marca", campo: "marca" },
    { titulo: "Serial", campo: "serial" },
    { titulo: "Placa", campo: "placa" },
    { titulo: "Fecha de ingreso", campo: "fechaIngreso" },
    { titulo: "Fecha de baja", campo: "fechaBaja" }
];

const fechaArchivo = () => {
    const ahora = new Date();
    return ahora.toISOString().slice(0, 10);
};

const escaparHtml = (valor) => {
    const contenedor = document.createElement("div");
    contenedor.textContent = valor || "";
    return contenedor.innerHTML;
};

const descargarArchivo = (contenido, nombreArchivo, tipo) => {
    const archivo = new Blob([contenido], { type: tipo });
    const enlace = document.createElement("a");

    enlace.href = URL.createObjectURL(archivo);
    enlace.download = nombreArchivo;
    enlace.click();
    URL.revokeObjectURL(enlace.href);
};

const crearTablaExportacion = (elementos) => {
    const encabezados = columnasElementos
        .map((columna) => `<th>${escaparHtml(columna.titulo)}</th>`)
        .join("");

    const filas = elementos
        .map((elemento) => {
            const celdas = columnasElementos
                .map((columna) => `<td>${escaparHtml(elemento[columna.campo] || "-")}</td>`)
                .join("");

            return `<tr>${celdas}</tr>`;
        })
        .join("");

    return `<table><thead><tr>${encabezados}</tr></thead><tbody>${filas}</tbody></table>`;
};

const exportarExcel = async (mostrarConfirmacion = true) => {
    const elementos = await obtenerElementos();

    if (elementos.length === 0) {
        await alerta("warning", "Sin datos", "No hay elementos registrados para exportar.");
        return;
    }

    const tabla = crearTablaExportacion(elementos);
    const contenido = `
        <html>
        <head>
            <meta charset="UTF-8">
        </head>
        <body>
            <h1>Inventario GUAICARAMO SAS - AREA TICS</h1>
            ${tabla}
        </body>
        </html>
    `;

    descargarArchivo(
        contenido,
        `inventario-elementos-${fechaArchivo()}.xls`,
        "application/vnd.ms-excel;charset=utf-8"
    );

    if (mostrarConfirmacion) {
        await alerta("success", "Excel generado", "El archivo contiene todos los elementos registrados.");
    }
};

const exportarPdf = async () => {
    const elementos = await obtenerElementos();

    if (elementos.length === 0) {
        await alerta("warning", "Sin datos", "No hay elementos registrados para exportar.");
        return;
    }

    const ventana = window.open("", "_blank");

    if (!ventana) {
        await alerta("error", "Ventana bloqueada", "Permite ventanas emergentes para exportar el PDF.");
        return;
    }

    ventana.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Inventario elementos</title>
            <style>
                body {
                    font-family: Arial, Helvetica, sans-serif;
                    padding: 24px;
                    color: #142235;
                }

                h1 {
                    margin: 0 0 6px;
                    font-size: 22px;
                }

                h2 {
                    margin: 0 0 20px;
                    color: #2563eb;
                    font-size: 15px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 11px;
                }

                th,
                td {
                    border: 1px solid #cdd6e3;
                    padding: 8px;
                    text-align: left;
                }

                th {
                    background: #16324f;
                    color: #ffffff;
                }
            </style>
        </head>
        <body>
            <h1>GUAICARAMO SAS</h1>
            <h2>AREA TICS - Inventario de elementos</h2>
            ${crearTablaExportacion(elementos)}
            <script>
                window.onload = function () {
                    window.print();
                };
            <\/script>
        </body>
        </html>
    `);
    ventana.document.close();

    await alerta("success", "PDF listo", "Se abrio la vista de impresion para guardar como PDF.");
};

const iniciarExportaciones = () => {
    const botonExcel = document.getElementById("exportar-excel");
    const botonPdf = document.getElementById("exportar-pdf");

    if (botonExcel) botonExcel.addEventListener("click", exportarExcel);
    if (botonPdf) botonPdf.addEventListener("click", exportarPdf);
};

const limpiarResultado = () => {
    [
        "idp",
        "cantidadp",
        "descripcionp",
        "marcap",
        "serialp",
        "placap",
        "fechadeingresop",
        "fechadebajap",
        "btndel"
    ].forEach((id) => {
        const celda = document.getElementById(id);
        if (celda) celda.textContent = "";
    });
};

const pintarElemento = (elemento, permitirEliminar = false) => {
    const valores = {
        idp: elemento.id,
        cantidadp: elemento.cantidad,
        descripcionp: elemento.descripcion,
        marcap: elemento.marca,
        serialp: elemento.serial,
        placap: elemento.placa,
        fechadeingresop: elemento.fechaIngreso,
        fechadebajap: elemento.fechaBaja
    };

    Object.entries(valores).forEach(([id, valor]) => {
        const celda = document.getElementById(id);
        if (celda) celda.textContent = valor || "-";
    });

    const celdaBoton = document.getElementById("btndel");
    if (!celdaBoton) return;

    celdaBoton.textContent = "";
    if (!permitirEliminar) return;

    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "boton-eliminar";
    boton.textContent = "Eliminar";
    boton.addEventListener("click", () => eliminarElemento(elemento.id));
    celdaBoton.appendChild(boton);
};

const buscarElemento = async (valorBuscado) => {
    const busqueda = normalizar(valorBuscado);
    if (!busqueda) return null;

    const elementos = await obtenerElementos();
    return elementos.find((elemento) => {
        return [
            String(elemento.id),
            elemento.descripcion,
            elemento.marca,
            elemento.serial,
            elemento.placa
        ].some((campo) => normalizar(campo).includes(busqueda));
    });
};

const registrarElemento = () => {
    const formulario = document.getElementById("form-registro");
    if (!formulario) return;

    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const elemento = {
            cantidad: texto(document.getElementById("texto")?.value),
            descripcion: texto(document.getElementById("texto2")?.value),
            marca: texto(document.getElementById("texto3")?.value),
            serial: texto(document.getElementById("texto4")?.value),
            placa: texto(document.getElementById("texto5")?.value),
            fechaIngreso: texto(document.getElementById("fecha_ingreso")?.value),
            fechaBaja: texto(document.getElementById("fecha_de_baja")?.value)
        };

        if (!elemento.cantidad || !elemento.descripcion || !elemento.marca || !elemento.serial || !elemento.placa) {
            await alerta("warning", "Campos incompletos", "Completa cantidad, descripcion, marca, serial y placa.");
            return;
        }

        try {
            const respuesta = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(elemento)
            });

            if (respuesta.ok) {
                formulario.reset();
                await alerta("success", "Registro exitoso", "Elemento registrado correctamente.");
            } else {
                throw new Error("Error al registrar");
            }
        } catch (error) {
            await alerta("error", "Error", "No se pudo conectar con el servidor.");
        }
    });
};

const listarElementos = async () => {
    const cuerpoTabla = document.getElementById("elementos-body");
    if (!cuerpoTabla) return;

    const elementos = await obtenerElementos();
    cuerpoTabla.textContent = "";

    if (elementos.length === 0) {
        const fila = document.createElement("tr");
        const celda = document.createElement("td");
        celda.colSpan = 7;
        celda.className = "tabla-vacia";
        celda.textContent = "No hay elementos registrados.";
        fila.appendChild(celda);
        cuerpoTabla.appendChild(fila);
        return;
    }

    elementos.forEach((elemento) => {
        const fila = document.createElement("tr");
        [
            elemento.cantidad,
            elemento.descripcion,
            elemento.marca,
            elemento.serial,
            elemento.placa,
            elemento.fechaIngreso,
            elemento.fechaBaja
        ].forEach((valor) => {
            const celda = document.createElement("td");
            celda.textContent = valor || "-";
            fila.appendChild(celda);
        });
        cuerpoTabla.appendChild(fila);
    });
};

const consultarElemento = () => {
    const formulario = document.getElementById("form");
    const entrada = document.getElementById("dato1");
    const esVistaEliminar = Boolean(document.getElementById("tabla-elementos-eliminar"));

    if (!formulario || !entrada) return;

    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        limpiarResultado();

        const elemento = await buscarElemento(entrada.value);
        if (!elemento) {
            mostrarMensaje("error", "No se encontro ningun elemento.");
            await alerta("error", "Sin resultados", "No se encontro ningun elemento.");
            return;
        }

        pintarElemento(elemento, esVistaEliminar);
        mostrarMensaje("exito", "Elemento encontrado.");
        await alerta("success", "Elemento encontrado", "El elemento se cargo en la tabla.");
    });
};

const eliminarElemento = async (id) => {
    const confirmar = await confirmarAlerta(
        "Confirmar eliminacion",
        `Deseas eliminar el elemento con ID "${id}"?`
    );

    if (!confirmar) return;

    try {
        const respuesta = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (respuesta.ok) {
            limpiarResultado();
            mostrarMensaje("exito", "Elemento eliminado correctamente.");
            await alerta("success", "Elemento eliminado", "Elemento eliminado correctamente.");
        } else {
            throw new Error("Error al eliminar");
        }
    } catch (error) {
        await alerta("error", "Error", "No se pudo eliminar el elemento.");
    }
};

document.addEventListener("DOMContentLoaded", () => {
    registrarElemento();
    listarElementos();
    consultarElemento();
    iniciarExportaciones();
});
