document.addEventListener('DOMContentLoaded', function(){
    const formularioContactos = document.querySelector('#contacto'),
          listadoContactos = document.querySelector('#listado-contactos tbody'),
          inputBuscador = document.querySelector('#buscar');

    eventListeners();

    function eventListeners(){
        //Cuando el formulario de crear o editar se ejecuta
        formularioContactos.addEventListener('submit', leerFormulario);

        //Listener para eliminar  contactos
        if (listadoContactos) {
            listadoContactos.addEventListener('click', eliminarContacto);
        }
        //Buscador
        inputBuscador.addEventListener('input', buscarContactos);

        numeroContactos();
        
    }

    function leerFormulario(e) {
        e.preventDefault();
       //Leer los datos de los inputs
        const nombre = document.querySelector("#nombre").value;
        const empresa = document.querySelector("#empresa").value;
        const telefono = document.querySelector("#telefono").value;
        const accion = document.querySelector("#accion").value;

        
        if(nombre === '' || telefono === '' || empresa === '' ) {
            //Dos parametros text y clase
            mostrarNotificacion('Todos los campos son obligatorios', 'error');
        } else {
            //Pasa una validacion, crear llamado a Ajax
            const infoContacto = new FormData();
            infoContacto.append('nombre', nombre);
            infoContacto.append('empresa', empresa);
            infoContacto.append('telefono', telefono);
            infoContacto.append('accion', accion);

            if(accion === 'crear'){
                //Crear un nuevo elemento
                insertarDB(infoContacto);
            }else{
                //editar el contacto
                //Leer ID

                const idRegistro = document.querySelector('#id').value;
                infoContacto.append('id', idRegistro);
                actualizarRegistro(infoContacto);
            }
        }
    }

    // Inserta en la base de datos via Ajax

    function insertarDB(datos) {
        //llamado a AJAX

        //crear el objeto
        const xhr = new XMLHttpRequest();
        //abrir la conexion
        xhr.open('POST', 'includes/modelos/modelo-contactos.php', true);
        //pasar los datos
        xhr.onload = function() {
            if(this.status === 200) {
                //Leer respuesta PHP

                const respuesta = JSON.parse(xhr.responseText);

                //Inserta un nuevo elemento a la tabla

                const nuevoContacto = document.createElement('tr');

                nuevoContacto.innerHTML = ` 
                    <td>${respuesta.datos.nombre}</td>
                    <td>${respuesta.datos.empresa}</td>
                    <td>${respuesta.datos.telefono}</td>
                `;

                //Contenedor para los botones

                const contAcciones = document.createElement('td');

                //Crear el icono de Editar

                const iconoEditar = document.createElement('i');
                iconoEditar.classList.add('fas', 'fa-pen-square');

                //Crea el enlace para editar

                const btnEditar = document.createElement('a');
                btnEditar.appendChild(iconoEditar);
                btnEditar.href = `editar.php?id={respuesta.datos.id_insertado}`;
                btnEditar.classList.add('btn', 'btn-editar');

                contAcciones.appendChild(btnEditar);

                //Crear icono de Eliminar
                const iconoEliminar = document.createElement('i');
                iconoEliminar.classList.add('fas', 'fa-trash-alt');

                //Crear boton de Eliminar
                const btnEliminar = document.createElement('button');
                btnEliminar.appendChild(iconoEliminar);
                btnEliminar.setAttribute('data-id', respuesta.datos.id_insertado);
                btnEliminar.classList.add('btn', 'btn-borrar')

                contAcciones.appendChild(btnEliminar);

                nuevoContacto.appendChild(contAcciones);

                listadoContactos.appendChild(nuevoContacto);

                //Resetear el formulario

                document.querySelector('form').reset();
                //Mostrar notificacion

                mostrarNotificacion('Contacto creado correctamente', 'correcto');

                numeroContactos();

            }
        }
        //enviar los datos
        xhr.send(datos);
    }

    function actualizarRegistro(datos) {
       const xhr = new XMLHttpRequest();

        xhr.open('POST', 'includes/modelos/modelo-contactos.php', true);

        xhr.onload = function(){
            if(this.status === 200) {
                const respuesta = JSON.parse(xhr.responseText);
 
                if(respuesta.respuesta === 'correcto') {
                    mostrarNotificacion('Contacto Editado correctamente', 'correcto');
                } else {
                    mostrarNotificacion('Hubo un error...', 'error');
                }

                setTimeout(() =>{
                    window.location.href = 'index.php';
                }, 3500);
           }
        }
        xhr.send(datos);

    }
    //Eliminar Contactos
    function eliminarContacto(e) {
        if ( e.target.parentElement.classList.contains('btn-borrar')) {
            //Tomar Id 
            const id = e.target.parentElement.getAttribute('data-id');
            
            //Preguntar usuario si están seguros
            const respuesta = confirm('¿Estás seguro/a que quieres eliminar el contacto?');

            if (respuesta) {
                //Llamdo a AJAX
                //crear objeto
                const xhr = new XMLHttpRequest();
                //abrir conexion
                xhr.open('GET', `includes/modelos/modelo-contactos.php?id=${id}&accion=borrar`, true);
                //leer respuesta
                xhr.onload = function() {
                    if(this.status === 200) {
                        const resultado = JSON.parse(xhr.responseText);

                        if(resultado.respuesta === 'correcto') {
                            //Eliminar registro delDOM 
                            e.target.parentElement.parentElement.parentElement.remove();

                            mostrarNotificacion('Contacto eliminado', 'correcto');

                            numeroContactos();
                        } else {
                            //Mostrar notificacion
                            mostrarNotificacion('Hubo un error...', 'error');
                        }
                    }
                }
                //enviar peticion

                xhr.send();
            } 
        }
    }
    //Notificacion en pantalla

    function mostrarNotificacion(mensaje, clase) {
        const notificacion = document.createElement('div');
        notificacion.classList.add(clase, 'notificacion', 'sombra');
        notificacion.textContent = mensaje;

        //Formulario

        formularioContactos.insertBefore(notificacion, document.querySelector('.title-container'));

        //Ocultar y mostrar la notifacion
        setTimeout(() => {
            notificacion.classList.add('visible');
            setTimeout(() =>{
                notificacion.classList.remove('visible');
                setTimeout(() => {
                    notificacion.remove();
                }, 300);
            }, 3000);
        }, 100); 
    }
    //Buscador de Registros
    function buscarContactos(e) {
        const expresion = new RegExp(e.target.value, "i"),
              registros = document.querySelectorAll('tbody tr');

              registros.forEach(registro => {
                registro.style.display = 'none';

                if(registro.childNodes[1].textContent.replace(/\s/g, " ").search(expresion) != -1){
                    registro.style.display = 'table-row';
                }

                numeroContactos();
              });
    }
    //Muestra el numero de cntactos
    function numeroContactos() {
        const totalContactos = document.querySelectorAll('tbody tr'),
              contenedorNumero = document.querySelector('.total-contactos span');

        let total = 0;

        totalContactos.forEach(contacto => {
            if(contacto.style.display === '' || contacto.style.display === 'table-row') {
                total++;
            }
        });

        contenedorNumero.textContent = total;
    }
});




