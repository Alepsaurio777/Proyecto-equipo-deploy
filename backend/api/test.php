<?php
$conn = new mysqli('localhost', 'root', 'parra', 'ferreteria_db');
echo $conn->connect_error ?: "Conexión OK";
