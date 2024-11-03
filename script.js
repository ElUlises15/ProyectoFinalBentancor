// Variables y constantes globales
const gastos = JSON.parse(localStorage.getItem('gastos')) || [];
const form = document.getElementById('form-gasto');
const listaGastos = document.getElementById('gastos-lista');
const categoriaSelect = document.getElementById('categoria');
const botonModo = document.getElementById('modo-boton'); // Cambiado para el botón

// Clase Gasto para crear nuevos gastos
class Gasto {
    constructor(nombre, monto, categoria) {
        this.nombre = nombre;
        this.monto = monto;
        this.categoria = categoria;
        this.fecha = new Date().toLocaleDateString();
    }
}

// Asincronismo con fetch para cargar categorías desde JSON local
fetch('data.json')
    .then(res => res.json())
    .then(data => {
        data.categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoria;
            categoriaSelect.appendChild(option);
        });
    })
    .catch(err => console.error("Error al cargar categorías:", err));

// Función para agregar un nuevo gasto
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const monto = parseFloat(document.getElementById('monto').value);
    const categoria = categoriaSelect.value;

    if (nombre && monto && categoria) {
        const nuevoGasto = new Gasto(nombre, monto, categoria);
        gastos.push(nuevoGasto);
        localStorage.setItem('gastos', JSON.stringify(gastos));
        mostrarGastos();
        actualizarGrafico();
        form.reset();
    }
});

// Función para mostrar gastos en el DOM
function mostrarGastos() {
    listaGastos.innerHTML = "";
    gastos.forEach(gasto => {
        const gastoItem = document.createElement('div');
        gastoItem.textContent = `${gasto.nombre} - $${gasto.monto} (${gasto.categoria})`;
        listaGastos.appendChild(gastoItem);
    });
}

// Función para actualizar el gráfico de gastos
function actualizarGrafico() {
    const ctx = document.getElementById('graficoGastos').getContext('2d');
    const categorias = [...new Set(gastos.map(gasto => gasto.categoria))];
    const montos = categorias.map(categoria => {
        return gastos
            .filter(gasto => gasto.categoria === categoria)
            .reduce((acc, gasto) => acc + gasto.monto, 0);
    });

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categorias,
            datasets: [{
                data: montos,
                backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56'],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Cargar los gastos desde el almacenamiento al iniciar
document.addEventListener('DOMContentLoaded', () => {
    mostrarGastos();
    if (gastos.length) actualizarGrafico();
});

// Evento para cambiar entre modo claro y oscuro
botonModo.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');

    // Cambiar el ícono del botón según el modo
    if (document.body.classList.contains('dark-mode')) {
        botonModo.textContent = '🌙'; // Cambiar a icono de sol en modo oscuro (para volver a claro)
    } else {
        botonModo.textContent = '☀️'; // Cambiar a icono de luna en modo claro (para volver a oscuro)
    }
});
