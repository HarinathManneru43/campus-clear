<?php
// DB Singleton / Global Provider

require_once __DIR__ . '/../config/app.php';

function db() {
    return get_db_connection();
}
