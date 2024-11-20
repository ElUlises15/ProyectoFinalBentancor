// Variables y constantes globales
const gastos = JSON.parse(localStorage.getItem('gastos')) || [];
const form = document.getElementById('form-gasto');
const listaGastos = document.getElementById('gastos-lista');
const categoriaSelect = document.getElementById('categoria');
const botonModo = document.getElementById('modo-boton');
const graficoContainer = document.getElementById('grafico-container');
let grafico;

// Clase Gasto para crear nuevos gastos
class Gasto {
    constructor(nombre, monto, categoria) {
        this.nombre = nombre;
        this.monto = monto;
        this.categoria = categoria;
        this.fecha = new Date();
    }
}

// Categorías incrustadas en lugar de usar fetch
const categorias = ["Alimentos", "Transporte", "Salud", "Entretenimiento", "Educación", "Otros"];

// Cargar categorías en el select
categorias.forEach(categoria => {
    const option = document.createElement('option');
    option.value = categoria;
    option.textContent = categoria;
    categoriaSelect.appendChild(option);
});

// Función para agregar un nuevo gasto
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const monto = parseFloat(document.getElementById('monto').value);
    const categoria = categoriaSelect.value;

    if (nombre && monto > 0 && categoria) { // Valida que el monto sea positivo
        const nuevoGasto = new Gasto(nombre, monto, categoria);
        gastos.push(nuevoGasto);
        localStorage.setItem('gastos', JSON.stringify(gastos));
        mostrarGastos();
        actualizarGrafico();
        form.reset();
    } else {
        alert("Por favor, ingrese un monto válido y positivo.");
    }
});

// Función para mostrar gastos en el DOM
function mostrarGastos() {
    listaGastos.innerHTML = "";
    gastos.forEach((gasto, index) => {
        const gastoItem = document.createElement('div');
        gastoItem.classList.add('gasto-item');
        gastoItem.innerHTML = `
            <span>${gasto.nombre} - $${gasto.monto.toFixed(2)} (${gasto.categoria})</span>
            <span>${new Date(gasto.fecha).toLocaleDateString()}</span>
            <button class="eliminar-gasto" data-index="${index}">🗑️</button>
        `;
        listaGastos.appendChild(gastoItem);
    });

    // Agregar eventos para eliminar gastos
    document.querySelectorAll('.eliminar-gasto').forEach(boton => {
        boton.addEventListener('click', (e) => {
            const index = e.target.dataset.index;
            gastos.splice(index, 1);
            localStorage.setItem('gastos', JSON.stringify(gastos));
            mostrarGastos();
            actualizarGrafico();
        });
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

    // Generar colores dinámicamente
    const colores = categorias.map(() => `#${Math.floor(Math.random() * 16777215).toString(16)}`);

    if (grafico) grafico.destroy(); // Destruye el gráfico anterior si existe

    grafico = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categorias,
            datasets: [{
                data: montos,
                backgroundColor: colores, // Colores dinámicos
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

    // Cargar preferencia de modo
    const modoGuardado = localStorage.getItem('modo') || 'claro';
    if (modoGuardado === 'oscuro') {
        document.body.classList.add('dark-mode');
        botonModo.textContent = '🌙';
    } else {
        botonModo.textContent = '☀️';
    }
});

// Evento para cambiar entre modo claro y oscuro
botonModo.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');

    // Cambiar el ícono del botón según el modo
    if (document.body.classList.contains('dark-mode')) {
        botonModo.textContent = '🌙';
        localStorage.setItem('modo', 'oscuro');
    } else {
        botonModo.textContent = '☀️';
        localStorage.setItem('modo', 'claro');
    }
});

// Función para ordenar los gastos
function ordenarGastos(criterio) {
    if (criterio === 'monto') {
        gastos.sort((a, b) => b.monto - a.monto);
    } else if (criterio === 'fecha') {
        gastos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }
    mostrarGastos(); // Actualiza la lista de gastos después de ordenar
    actualizarGrafico(); // Actualiza el gráfico también
}

// Agregar eventos para ordenar
document.getElementById('ordenar-monto').addEventListener('click', () => ordenarGastos('monto'));
document.getElementById('ordenar-fecha').addEventListener('click', () => ordenarGastos('fecha'));
