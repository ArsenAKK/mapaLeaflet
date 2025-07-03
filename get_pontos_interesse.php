<?php
header('Content-Type: application/json');

// Liga à base de dados
$host = "localhost";
$user = "root";
$password = "";
$dbname = "mapa_leaflet";

$conn = new mysqli($host, $user, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["erro" => "Erro na ligação: " . $conn->connect_error]));
}

// Busca os dados
$sql = "SELECT nome, tipo_local, descricao, latitude, longitude FROM pontos_interesse";
$result = $conn->query($sql);

$pontos = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $pontos[] = $row;
    }
}

$conn->close();

// Retorna JSON
echo json_encode($pontos);
?>
