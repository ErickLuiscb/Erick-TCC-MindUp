<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

/*
| Rota raiz — só pra confirmar visualmente que o Laravel está no ar.
*/
Route::get('/', function () {
    return view('welcome');
});

/*
| Rota de status — testa se a aplicação está de pé E se a conexão
| com o banco (Supabase) está funcionando. Acesse pelo navegador:
| https://SEU-BACKEND.onrender.com/status
*/
Route::get('/status', function () {
    $status = [
        'app' => 'ok',
        'env' => config('app.env'),
        'timestamp' => now()->toDateTimeString(),
    ];

    try {
        DB::connection()->getPdo();

        $status['database'] = 'conectado';
        $status['database_name'] = DB::connection()->getDatabaseName();
    } catch (\Throwable $e) {
        $status['database'] = 'erro';
        $status['database_message'] = $e->getMessage();

        return response()->json($status, 500);
    }

    return response()->json($status);
});
