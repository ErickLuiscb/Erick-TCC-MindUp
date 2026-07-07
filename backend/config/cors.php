<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Aqui liberamos que o frontend (Netlify) consiga chamar a API (Render)
    | mesmo estando em domínios diferentes. Como a autenticação é feita via
    | token Bearer (Sanctum), e não por cookie de sessão, não há problema em
    | liberar as origens de forma ampla — não estamos usando credentials.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'status', 'status/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
