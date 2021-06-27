<?php

function obtenerContactos() {
    include 'db.php';
    try {

        return $conn->query("SELECT id, nombre, empresa, telefono FROM contactos");
    } catch(Exception $e) {
        echo "ERROR" . $e->getMessage() . "<br>";
        return false;
    }
}

//Obtiene un contacto y toma ID

function obtenerContacto($id){
    include 'db.php';
    try {

        return $conn->query("SELECT id, nombre, empresa, telefono FROM contactos WHERE id = $id");
    } catch(Exception $e) {
        echo "ERROR" . $e->getMessage() . "<br>";
        return false;
    }
}