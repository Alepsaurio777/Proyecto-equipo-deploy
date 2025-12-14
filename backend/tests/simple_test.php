<?php
// Define TESTING constant to prevent transactions.php from executing main logic
define('TESTING', true);

// Mock mysqli class
class MockMysqli {
    public $insert_id = 999;
    public $error = '';
    public $affected_rows = 1;

    public function query($sql) {
        return new MockResult();
    }
    public function prepare($sql) {
        return new MockStmt();
    }
    public function begin_transaction() {}
    public function commit() {}
    public function rollback() {}
    public function close() {}
}

class MockStmt {
    public $affected_rows = 1;
    public $num_rows = 1;
    public $error = '';
    
    public function bind_param($types, ...$vars) {}
    public function execute() { return true; }
    public function get_result() { return new MockResult(); }
    public function fetch_assoc() { return ['id' => 1, 'name' => 'Test']; }
    public function fetch() { return true; }
    public function close() {}
    public function store_result() {}
    public function bind_result(&...$vars) {
        foreach ($vars as &$var) { $var = 1; }
    }
}

class MockResult {
    public $num_rows = 1;
    public function fetch_assoc() { return false; }
}

// Mock globals
$_SERVER['REQUEST_METHOD'] = 'POST';
$_ENV['DB_HOST'] = '127.0.0.1';

// Import file to test
require_once __DIR__ . '/../api/transactions.php';

// Helper for assertions
function assertEquals($expected, $actual, $message = '') {
    if ($expected !== $actual) {
        echo "[FAIL] $message - Expected: " . json_encode($expected) . ", Got: " . json_encode($actual) . "\n";
    } else {
        echo "[PASS] $message\n";
    }
}

echo "Running Transactions Tests...\n";

// Test 1: productExists
$mockConn = new MockMysqli();
$exists = productExists($mockConn, 123);
assertEquals(true, $exists, "productExists should return true on mock");

echo "Done.\n";
?>
