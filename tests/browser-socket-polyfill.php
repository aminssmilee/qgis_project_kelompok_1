<?php

declare(strict_types=1);

namespace Pest\Browser\Support;

if (! function_exists(__NAMESPACE__.'\\socket_create_listen')) {
    function socket_create_listen(int $port = 0)
    {
        return fopen('php://memory', 'r+');
    }
}

if (! function_exists(__NAMESPACE__.'\\socket_getsockname')) {
    function socket_getsockname($socket, &$address = null, &$port = null): bool
    {
        $address = '127.0.0.1';
        $port = 9515;

        return true;
    }
}

if (! function_exists(__NAMESPACE__.'\\socket_close')) {
    function socket_close($socket): bool
    {
        if (is_resource($socket)) {
            fclose($socket);
        }

        return true;
    }
}
