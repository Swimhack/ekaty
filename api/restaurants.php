<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:8081');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Database connection - modernized with mysqli
$location = "localhost";
$dbusername = "ekatydb";
$dbpassword = "ekatyPASSdb";
$database = "swimhack_ekaty";

$connection = new mysqli($location, $dbusername, $dbpassword, $database);

// Check connection
if ($connection->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Set charset to prevent encoding issues
$connection->set_charset("utf8");

try {
    // Get query parameters
    $limit = isset($_GET['limit']) ? min((int)$_GET['limit'], 100) : 20;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    $cuisine = isset($_GET['cuisine']) ? $connection->real_escape_string($_GET['cuisine']) : '';
    $area = isset($_GET['area']) ? $connection->real_escape_string($_GET['area']) : '';
    $search = isset($_GET['search']) ? $connection->real_escape_string($_GET['search']) : '';
    
    // Build the main restaurants query
    $query = "SELECT 
        r.id,
        r.name,
        r.phy_address,
        r.phy_city,
        r.phy_state,
        r.phy_zip,
        r.phone,
        r.email,
        r.website,
        r.description,
        r.yearopened,
        r.delivery,
        r.togo,
        r.kidfriendly,
        r.wifi,
        r.hours,
        r.prices,
        r.menu,
        r.image_url,
        r.logo_url,
        r.cuisine as cuisine_id,
        r.cuisine2 as cuisine2_id,
        r.cuisine3 as cuisine3_id,
        c1.name as primary_cuisine,
        c2.name as secondary_cuisine,
        c3.name as tertiary_cuisine
    FROM restaurants r
    LEFT JOIN cuisine c1 ON r.cuisine = c1.id
    LEFT JOIN cuisine c2 ON r.cuisine2 = c2.id
    LEFT JOIN cuisine c3 ON r.cuisine3 = c3.id
    WHERE r.status = 2"; // Only active restaurants
    
    // Add search filters
    $params = [];
    $types = '';
    
    if (!empty($search)) {
        $query .= " AND (r.name LIKE ? OR r.description LIKE ? OR c1.name LIKE ? OR c2.name LIKE ? OR c3.name LIKE ?)";
        $searchParam = "%$search%";
        $params = array_merge($params, [$searchParam, $searchParam, $searchParam, $searchParam, $searchParam]);
        $types .= 'sssss';
    }
    
    if (!empty($cuisine)) {
        $query .= " AND (c1.name LIKE ? OR c2.name LIKE ? OR c3.name LIKE ?)";
        $cuisineParam = "%$cuisine%";
        $params = array_merge($params, [$cuisineParam, $cuisineParam, $cuisineParam]);
        $types .= 'sss';
    }
    
    if (!empty($area)) {
        $query .= " AND (r.phy_city LIKE ? OR r.phy_address LIKE ?)";
        $areaParam = "%$area%";
        $params = array_merge($params, [$areaParam, $areaParam]);
        $types .= 'ss';
    }
    
    $query .= " ORDER BY r.name ASC LIMIT ? OFFSET ?";
    $params = array_merge($params, [$limit, $offset]);
    $types .= 'ii';
    
    // Prepare and execute the query
    $stmt = $connection->prepare($query);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    
    $restaurants = [];
    while ($row = $result->fetch_assoc()) {
        // Calculate average rating
        $ratingQuery = "SELECT 
            AVG((food_rate + service_rate + value_rate + atmosphere_rate) / 4) as avg_rating,
            COUNT(*) as total_reviews
        FROM reviews 
        WHERE adid = ? AND status = 2";
        
        $ratingStmt = $connection->prepare($ratingQuery);
        $ratingStmt->bind_param('i', $row['id']);
        $ratingStmt->execute();
        $ratingResult = $ratingStmt->get_result();
        $ratingData = $ratingResult->fetch_assoc();
        
        // Determine price range based on prices field
        $priceRange = 2; // Default to $$
        if (!empty($row['prices'])) {
            if (stripos($row['prices'], '$$$') !== false || stripos($row['prices'], 'expensive') !== false) {
                $priceRange = 4;
            } elseif (stripos($row['prices'], '$$') !== false || stripos($row['prices'], 'moderate') !== false) {
                $priceRange = 3;
            } elseif (stripos($row['prices'], '$') !== false || stripos($row['prices'], 'cheap') !== false || stripos($row['prices'], 'inexpensive') !== false) {
                $priceRange = 1;
            }
        }
        
        // Build restaurant object
        $restaurant = [
            'id' => (int)$row['id'],
            'name' => $row['name'] ?? '',
            'description' => $row['description'] ?? '',
            'address' => trim(($row['phy_address'] ?? '') . ', ' . ($row['phy_city'] ?? '') . ', ' . ($row['phy_state'] ?? '') . ' ' . ($row['phy_zip'] ?? '')),
            'phone' => $row['phone'] ?? '',
            'email' => $row['email'] ?? '',
            'website' => $row['website'] ?? '',
            'average_rating' => $ratingData['avg_rating'] ? round((float)$ratingData['avg_rating'], 1) : 0,
            'total_reviews' => (int)$ratingData['total_reviews'],
            'price_range' => $priceRange,
            'year_opened' => $row['yearopened'] ?? null,
            'hours' => $row['hours'] ?? '',
            'menu_url' => $row['menu'] ?? '',
            'logo_url' => $row['logo_url'] ?? '/images/no_profile_img.jpg',
            'cover_image_url' => $row['image_url'] ?? '/images/no_profile_img.jpg',
            'slug' => strtolower(str_replace([' ', '&', "'"], ['-', 'and', ''], $row['name'])),
            'primary_cuisine' => ['name' => $row['primary_cuisine'] ?? 'Restaurant'],
            'secondary_cuisine' => $row['secondary_cuisine'] ? ['name' => $row['secondary_cuisine']] : null,
            'tertiary_cuisine' => $row['tertiary_cuisine'] ? ['name' => $row['tertiary_cuisine']] : null,
            'area' => ['name' => $row['phy_city'] ?? 'Katy'],
            'delivery_available' => $row['delivery'] === '1' || $row['delivery'] === 'Yes',
            'takeout_available' => $row['togo'] === '1' || $row['togo'] === 'Yes',
            'kid_friendly' => $row['kidfriendly'] === '1' || $row['kidfriendly'] === 'Yes',
            'wifi_available' => $row['wifi'] === '1' || $row['wifi'] === 'Yes',
        ];
        
        $restaurants[] = $restaurant;
        $ratingStmt->close();
    }
    
    // Get total count for pagination
    $countQuery = "SELECT COUNT(*) as total FROM restaurants r 
                   LEFT JOIN cuisine c1 ON r.cuisine = c1.id
                   LEFT JOIN cuisine c2 ON r.cuisine2 = c2.id
                   LEFT JOIN cuisine c3 ON r.cuisine3 = c3.id
                   WHERE r.status = 2";
    
    // Add same filters for count
    $countParams = [];
    $countTypes = '';
    
    if (!empty($search)) {
        $countQuery .= " AND (r.name LIKE ? OR r.description LIKE ? OR c1.name LIKE ? OR c2.name LIKE ? OR c3.name LIKE ?)";
        $searchParam = "%$search%";
        $countParams = array_merge($countParams, [$searchParam, $searchParam, $searchParam, $searchParam, $searchParam]);
        $countTypes .= 'sssss';
    }
    
    if (!empty($cuisine)) {
        $countQuery .= " AND (c1.name LIKE ? OR c2.name LIKE ? OR c3.name LIKE ?)";
        $cuisineParam = "%$cuisine%";
        $countParams = array_merge($countParams, [$cuisineParam, $cuisineParam, $cuisineParam]);
        $countTypes .= 'sss';
    }
    
    if (!empty($area)) {
        $countQuery .= " AND (r.phy_city LIKE ? OR r.phy_address LIKE ?)";
        $areaParam = "%$area%";
        $countParams = array_merge($countParams, [$areaParam, $areaParam]);
        $countTypes .= 'ss';
    }
    
    $countStmt = $connection->prepare($countQuery);
    if (!empty($countParams)) {
        $countStmt->bind_param($countTypes, ...$countParams);
    }
    $countStmt->execute();
    $countResult = $countStmt->get_result();
    $totalCount = $countResult->fetch_assoc()['total'];
    
    // Return response
    $response = [
        'restaurants' => $restaurants,
        'pagination' => [
            'total' => (int)$totalCount,
            'limit' => $limit,
            'offset' => $offset,
            'has_more' => ($offset + $limit) < $totalCount
        ],
        'filters_applied' => [
            'search' => $search,
            'cuisine' => $cuisine,
            'area' => $area
        ]
    ];
    
    echo json_encode($response, JSON_PRETTY_PRINT);
    
    $stmt->close();
    $countStmt->close();
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}

$connection->close();
?>