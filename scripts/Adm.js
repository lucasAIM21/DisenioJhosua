import Platillo from "../Clases/Platillo.js";
import Categoria from "../Clases/Categoria.js";
import Cropper from "../libs/node_modules/cropperjs/dist/cropper.esm.js";


const API_URL = "https://laimserver.duckdns.org";
let platillos = [];
let Categorias =[];
let editandoId = null;

let cropper = null;


async function ValidarSesion() {
  const res = await fetch('https://laimserver.duckdns.org/api/ValidarPIN', {
    credentials: 'include',
    method: 'GET'
  });

  const data = await res.json();
  
  if (!data.autenticado) {
    window.location.href = "login.html";
  }
}

async function CargarCategorias() {

  try{
    Categorias.length=0;//vaciamos las categorias

    const response = await fetch(`${API_URL}/api/Categorias`);
    const CategoriasJson = await response.json();

    CategoriasJson.forEach(c => {
      Categorias.push(new Categoria(
        c.id,
        c.nombre,
        c.imagen
      ));
      console.log("ruta: "+c.imagen);
    });
    console.log("rutas: "+Categorias);
  }catch(error){
    console.error("Error al cargar datos: ",error);
  }
}

async function CargarPlatos() {
  
  try{
    platillos.length=0;//vaciamos los platillos

    const response = await fetch(`${API_URL}/api/Productos`);
    const platos = await response.json();

    platos.forEach(p => {
      platillos.push(new Platillo(
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.cantidad,
        p.imagen,
        p.categoria
      ));
      console.log("ruta: "+p.imagen);
    });
    console.log("ruta1: "+platillos);
  }catch(error){
    console.error("Error al cargar datos: ",error);
  }
}
  

// Función principal para mostrar el menú
async function mostrarMenu() {
  await CargarPlatos();
  await CargarCategorias();
  const contenedor = document.getElementById("contenedor-menu");
  contenedor.innerHTML = "";

  platillos.forEach((comida) => {
    const tarjeta = document.createElement("div");
    tarjeta.classList.add("tarjeta");
    tarjeta.style.position = "relative";

    tarjeta.innerHTML = `
      <img src="${API_URL}${comida.RutaImagen}" alt="${comida.nombre}">
      <h2>${comida.nombre}</h2>
      <p>${comida.descripcion}</p>
      <p><strong>S/ ${comida.precio}</strong></p>
      <p>Disponibles: ${comida.cantidad}</p>
    `;

      const botonAcciones = document.createElement("button");
      botonAcciones.textContent = "⋮";
      botonAcciones.classList.add("btn-acciones");

      // Menú de opciones oculto
      const menuOpciones = document.createElement("div");
      menuOpciones.classList.add("opciones");

      const btnEditar = document.createElement("button");
      btnEditar.textContent = "✏️ Editar";
      btnEditar.addEventListener("click", () => {
        menuOpciones.style.display = "none";
        editarComida(comida.id);
      });

      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "🗑️ Eliminar";
      btnEliminar.addEventListener("click", () => {
        eliminarComida(comida.id);
      });

      menuOpciones.appendChild(btnEditar);
      menuOpciones.appendChild(btnEliminar);

      tarjeta.appendChild(botonAcciones);
      tarjeta.appendChild(menuOpciones);

      botonAcciones.addEventListener("click", () => {
        menuOpciones.style.display =
        menuOpciones.style.display === "flex" ? "none" : "flex";
      });

      // Cerrar menú si se hace clic fuera
      document.addEventListener("click", (e) => {
        if (!tarjeta.contains(e.target)) {
          menuOpciones.style.display = "none";
        }
      });

    contenedor.appendChild(tarjeta);
  });
}

// Eliminar
async function eliminarComida(id) {
  try{
    const res = await fetch(`${API_URL}/api/Productos/${id}`,{credentials: 'include', method: 'DELETE'});

    const data = await res.json();
    
  }catch(error){
    console.error("Error al eliminar: ",error);
  }
  mostrarMenu();
}

// Editar
function editarComida(id) {
  const comida = platillos.find((c) => c.id === id);
  if (!comida) return;

  document.getElementById("modal").classList.remove("oculto");
  document.getElementById("titulo-modal").textContent = "Editar Plato";

  document.getElementById("nombre").value = comida.nombre;
  document.getElementById("descripcion").value = comida.descripcion;
  document.getElementById("precio").value = comida.precio;
  document.getElementById("cantidad").value = comida.cantidad;
  document.getElementById("imagenPrevia").src=`${API_URL}${comida.RutaImagen}`;
  document.getElementById("Categorias").value=comida.categoria.id;

  editandoId = id;
}

// Abrir modal para agregar
function abrirModal() {
  document.getElementById("modal").classList.remove("oculto");
  document.getElementById("titulo-modal").textContent = "Agregar Plato";

  document.getElementById("nombre").value = "";
  document.getElementById("descripcion").value = "";
  document.getElementById("precio").value = "";
  document.getElementById("cantidad").value = "";
  document.getElementById("Categorias").value="";
  document.getElementById("imagenPrevia").src="";
  document.getElementById("imagen").value = "";


  editandoId = null;
}

// Guardar cambios o agregar nuevo
document.getElementById("guardar")?.addEventListener("click", async () => {
  const nombre = document.getElementById("nombre").value;
  const descripcion = document.getElementById("descripcion").value;
  const precio = parseFloat(document.getElementById("precio").value);
  const cantidad = parseInt(document.getElementById("cantidad").value);
  let imagen = window.imagenRecortadaFile ?? document.getElementById("imagen").files[0];
  const categoriaid = document.getElementById("Categorias").value;

  const datos= new FormData();
  datos.append("nombre",nombre);
  datos.append("precio",precio);
  datos.append("descripcion",descripcion);
  datos.append("cantidad",cantidad);
  datos.append("imagen",imagen);
  datos.append("CategoriaId",categoriaid);


  if (!nombre || !descripcion || !precio || !cantidad || !imagen || !categoriaid) {
    alert("Por favor llena todos los campos.");
    return;
  }

  let res;

  if (editandoId) {
    // Editar
    res = await fetch(`${API_URL}/api/productos/${editandoId}`, {
                credentials: 'include',
                method: "PUT",
                body: datos
            }); 

  } else {
    // Agregar
    res = await fetch(`${API_URL}/api/productos`, {
                credentials: 'include',
                method: "POST",
                body: datos
            });
    };

    if(res.status === 401){
            alert("Sesión expirada. Por favor, ingresa nuevamente.");
            window.location.href = "../index.html";
        }

  document.getElementById("modal").classList.add("oculto");
  mostrarMenu();
});

// Cancelar modal
document.getElementById("cancelar")?.addEventListener("click", () => {
  document.getElementById("modal").classList.add("oculto");
});


function dataURLtoFile(dataURL, filename) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
}

document.getElementById("imagen").addEventListener("change", (e) => {
  document.getElementById("modal").classList.add("oculto");
  document.getElementById("modalRecorte").classList.remove("oculto");
  
  const preview=document.getElementById("preview");
  
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  preview.src = url;
  preview.style.display = "block";

  // Destruye cropper anterior si existe
  if (cropper) cropper.destroy();

  // Inicia cropper nuevo
  preview.onload = () => {
    cropper = new Cropper(preview, {
    aspectRatio: 1, // cuadrado
    viewMode: 1,
    movable: true,
    zoomable: true,
    rotatable: false,
    scalable: false
  });
  };
});

document.getElementById("btnRecortar").addEventListener("click", () => {
  if (!cropper || typeof cropper.getCroppedCanvas !== 'function') {
    alert("Error: Cropper no está inicializado correctamente.");
    document.getElementById("modalRecorte").classList.add("oculto");
    document.getElementById("modal").classList.remove("oculto");
    return;
  }

  try {
    // 2. OBTENER CANVAS RECORTADO
    const canvas = cropper.getCroppedCanvas({
      width: 300,
      height: 300,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    });

    // 3. VERIFICAR QUE EL CANVAS SE GENERÓ
    if (!canvas) {
      throw new Error("No se pudo generar el canvas recortado");
    }

    // 4. CONVERTIR A BASE64
    const base64 = canvas.toDataURL("image/png");
    const recortada = document.getElementById("imagenPrevia");
    
    recortada.src = base64;
    window.imagenRecortadaFile = dataURLtoFile(base64, "recorte.png");
    recortada.style.display = "block";

    // 5. CERRAR MODALES Y LIMPIAR
    document.getElementById("modalRecorte").classList.add("oculto");
    document.getElementById("modal").classList.remove("oculto");

    // 6. DESTRUIR INSTANCIA
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }

  } catch (error) {
    console.error("Error al recortar:", error);
    alert("Error al recortar la imagen. Por favor, intenta nuevamente.");
  }
});

function cargarSelect(){
  const select=document.getElementById('Categorias');
  console.log("Numero de categorias: "+Categorias.length);
  Categorias.forEach(c=>{
    const option=document.createElement('option');
    option.value=c.id;
    option.textContent=c.nombre;
    select.appendChild(option);
  });
}

document.getElementById("btn-agregar").addEventListener("click", () => abrirModal());

async function init(){
  await ValidarSesion();
  await mostrarMenu();
  await cargarSelect();
}

init();