export default class Platillo{
    id;
    nombre;
    descripcion;
    precio;
    cantidad;
    RutaImagen;
    categoria;

    static UltimoId=0;

    constructor(id,nombre,descripcion,precio,cantidad,imagen,categoria){
        this.id=id;
        this.nombre=nombre;
        this.descripcion=descripcion;
        this.precio=precio;
        this.cantidad=cantidad;
        this.imagen=imagen;
        this.categoria=categoria;
        Platillo.UltimoId++;
    }

}