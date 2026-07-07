<?php

use App\Models\Categoria;
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

/*
| Rota de status das categorias — confirma se o CategoriaSeeder
| rodou de verdade no banco. Acesse pelo navegador:
| https://SEU-BACKEND.onrender.com/status/categorias
*/
Route::get('/status/categorias', function () {
    try {
        $total = Categoria::count();

        return response()->json([
            'total_categorias' => $total,
            'seeder_rodou' => $total > 0,
            'exemplos' => Categoria::orderBy('id')->limit(10)->pluck('nome'),
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'total_categorias' => null,
            'seeder_rodou' => false,
            'erro' => $e->getMessage(),
        ], 500);
    }
});
