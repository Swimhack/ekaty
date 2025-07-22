<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:8081');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Database connection
$location = "localhost";
$dbusername = "ekatydb";
$dbpassword = "ekatyPASSdb";
$database = "swimhack_ekaty";

$connection = new mysqli($location, $dbusername, $dbpassword, $database);

if ($connection->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

$connection->set_charset("utf8");

try {
    // Get all cuisines with restaurant count
    $query = "SELECT 
        c.id,
        c.name,
        c.keywords,
        COUNT(r.id) as restaurant_count
    FROM cuisine c
    LEFT JOIN restaurants r ON (r.cuisine = c.id OR r.cuisine2 = c.id OR r.cuisine3 = c.id) AND r.status = 2
    GROUP BY c.id, c.name, c.keywords
    ORDER BY c.name ASC";
    
    $result = $connection->query($query);
    $cuisines = [];
    
    while ($row = $result->fetch_assoc()) {
        $cuisines[] = [
            'id' => (int)$row['id'],
            'name' => $row['name'],
            'keywords' => $row['keywords'] ?? '',
            'restaurant_count' => (int)$row['restaurant_count']
        ];
    }
    
    echo json_encode($cuisines, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}

$connection->close();
?>