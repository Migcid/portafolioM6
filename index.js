import express, { urlencoded } from 'express';
import {v4 as uuid} from 'uuid';
import cors from 'cors';
import {create} from 'express-handlebars';
import fileUpload from 'express-fileupload';
// 5
import fs from 'fs';

//variable que nos permita tener dirname ==> directorio raiz del proyecto para ir navegando y entrar a las carpetas layouts, partial... etc. https://github.com/express-handlebars/express-handlebars/blob/master/examples/advanced/server.js

import * as path from "path"; //path modulo nativo de node
import { fileURLToPath } from "url"; // url modulo nativo de node
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.listen(3000, () => console.log("http://localhost:3000")) 


//MIDDLEWARE

app.use(express.json());
app.use(express.urlencoded({extended: false}))
// middleware de fileupload
 app.use(fileUpload({
  limits: { fileSize: 4 * 1024 * 1024 },
  abortOnLimit: true,
  responseOnLimit: "Imagen sobrepasa 5mb permitidos"
}));
app.use(cors()); // para evitar bloqueos y hacer peticiones desde cualquier origen
app.use('/public', express.static('public')); // para dispinibilizar una carpeta con imagenes



// Configuracion de handlebars ===> la sacamos de esta direccion https://github.com/express-handlebars/express-handlebars/blob/master/examples/advanced/server.js
const hbs = create({
	
	partialsDir: [
		"views/partials/",
	],
});


app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.resolve(__dirname, "./views"));

 
// 1 hasta aqui es la configuracion basica de express con Handlebars
// 4 FUNCIONES

const leerProductos = () => {
  return new Promise((resolve, reject)=> { //lo hace como promesa 
    fs.readFile("productos.json", "utf-8", (error, data)=> {
      if(error) return reject("Error al cargar los productos.");
      let productos = JSON.parse(data)
      resolve(productos.productos)
    })
  })

}

const leerProductosPorID = (id) => {
  return new Promise((resolve, reject)=> { //lo hace como promesa 
    fs.readFile("productos.json", "utf-8", (error, data)=> {
      if(error) return reject("Error al cargar los productos.");
      let productos = JSON.parse(data)
      let found = productos.productos.find(producto => producto.id == id);
      if(found){
        resolve(found)

      }else{
        reject("Producto no encontrado.")
      }
     
    })
  })

}

// 2 ahora hay que crear un archivo json con los productos.

// 3 ahora crear las rutas 

// RUTA PRINCIPAL HOME (EL IF ERROR LO DEJAMOS EN EL HOME PARA QUE LO MUESTRE)***********
app.get("/", (req, res) =>{
  leerProductos().then(productos=> {
    res.render("home", {
      productos
    });
    
}) .catch(error =>{ // colcoar la vista home para renderizar
  res.render("home" ,{
    error
  });

})
})

//RUTA DEL INVENTARIO***********

app.get("/inventario", (req, res) =>{
  leerProductos().then(productos=> {
    res.render("inventario", {
      productos
    });
    
}) .catch(error =>{ 
  res.render("inventario" ,{
    error
  });

})
})
// luego de cargar el get del inventario hay que ir al inventario.hbs para cargar la tabla


// ruta 3 del updateProducto.handlebars y aparte de crear esta ruta tenemos que crear un metodo igual que el de las funciones y lo hacemos en funciones

app.get("/update/productos/:id", (req, res) =>{
  let { id } = req.params;
  leerProductosPorID(id).then(producto => {
    res.render("updateProducto", {
      producto
    })

  }).catch(error => {
    res.render("updateProducto", {
      error
    })
  })

}) 

app.put("productos", (req, res) => {
  console.log(req.body);
  console.log(req.files)
  res.send("recibiendo datos para actualizar")
})