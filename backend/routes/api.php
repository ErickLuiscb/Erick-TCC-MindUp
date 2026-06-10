<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\Auth\AuthController;

use App\Http\Controllers\Api\UserApiController;
use App\Http\Controllers\Api\AnotacaoApiController;

use App\Http\Controllers\Api\VideoApiController;
use App\Http\Controllers\Api\ArtigoApiController;
use App\Http\Controllers\Api\SugestaoApiController;
use App\Http\Controllers\Api\AutoajudaApiController;

use App\Http\Controllers\Api\CategoriaApiController;
use App\Http\Controllers\Api\FavoritoApiController;

/*
| ROTAS PÚBLICAS
*/
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

/*
| ROTAS AUTENTICADAS:
*/
Route::middleware('auth:sanctum')->group(function () {

    /*
    | AUTH
    */
    Route::get('/me', [AuthController::class, 'me']);

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout/all', [AuthController::class, 'logoutAll']);

    /*
    | USUÁRIOS
    */
    Route::get('/usuarios', [UserApiController::class, 'index'])
        ->middleware('abilities:admin');

    Route::post('/usuarios', [UserApiController::class, 'store'])
        ->middleware('abilities:admin');

    Route::get('/usuarios/{user}', [UserApiController::class, 'show']);

    Route::put('/usuarios/{user}', [UserApiController::class, 'update']);

    Route::delete('/usuarios/{user}', [UserApiController::class, 'destroy']);

    /*
    | ANOTAÇÕES
    */
    Route::get('/anotacoes', [AnotacaoApiController::class, 'index']);
    Route::get('/anotacoes/{anotacao}', [AnotacaoApiController::class, 'show']);

    Route::post('/anotacoes', [AnotacaoApiController::class, 'store']);

    Route::put('/anotacoes/{anotacao}', [AnotacaoApiController::class, 'update']);

    Route::delete('/anotacoes/{anotacao}', [AnotacaoApiController::class, 'destroy']);

    /*
    | CATEGORIAS
    */
    Route::get('/categorias', [CategoriaApiController::class, 'index']);

    Route::get('/categorias/{categoria}', [CategoriaApiController::class, 'show']);

    /*
    | FAVORITOS
    */
    Route::get('/favoritos', [FavoritoApiController::class, 'index']);

    Route::post('/favoritos', [FavoritoApiController::class, 'store']);

    Route::delete('/favoritos/{favorito}', [FavoritoApiController::class, 'destroy']);

    /*
    | VÍDEOS
    */
    Route::get('/videos', [VideoApiController::class, 'index']);

    Route::get('/videos/{video}', [VideoApiController::class, 'show']);

    Route::get('/dashboard/videos', [VideoApiController::class, 'meusVideos'])
        ->middleware('ability:admin,publicador');

    Route::post('/videos', [VideoApiController::class, 'store'])
        ->middleware('ability:admin,publicador');

    Route::put('/videos/{video}', [VideoApiController::class, 'update'])
        ->middleware('ability:admin,publicador');

    Route::delete('/videos/{video}', [VideoApiController::class, 'destroy'])
        ->middleware('ability:admin,publicador');

    /*
    | ARTIGOS
    */
    Route::get('/artigos', [ArtigoApiController::class, 'index']);

    Route::get('/artigos/{artigo}', [ArtigoApiController::class, 'show']);

    Route::get('/dashboard/artigos', [ArtigoApiController::class, 'meusArtigos'])
        ->middleware('ability:admin,publicador');

    Route::post('/artigos', [ArtigoApiController::class, 'store'])
        ->middleware('ability:admin,publicador');

    Route::put('/artigos/{artigo}', [ArtigoApiController::class, 'update'])
        ->middleware('ability:admin,publicador');

    Route::delete('/artigos/{artigo}', [ArtigoApiController::class, 'destroy'])
        ->middleware('ability:admin,publicador');

    /*
    | SUGESTÕES
    */
    Route::get('/sugestoes', [SugestaoApiController::class, 'index']);

    Route::get('/sugestoes/{sugestao}', [SugestaoApiController::class, 'show']);

    Route::get('/dashboard/sugestoes', [SugestaoApiController::class, 'minhasSugestoes'])
        ->middleware('ability:admin,publicador');

    Route::post('/sugestoes', [SugestaoApiController::class, 'store'])
        ->middleware('ability:admin,publicador');

    Route::put('/sugestoes/{sugestao}', [SugestaoApiController::class, 'update'])
        ->middleware('ability:admin,publicador');

    Route::delete('/sugestoes/{sugestao}', [SugestaoApiController::class, 'destroy'])
        ->middleware('ability:admin,publicador');

    /*
    | AUTOAJUDA
    */
    Route::get('/autoajudas', [AutoajudaApiController::class, 'index']);

    Route::get('/autoajudas/{autoajuda}', [AutoajudaApiController::class, 'show']);

    Route::get('/dashboard/autoajudas', [AutoajudaApiController::class, 'meusConteudos'])
        ->middleware('ability:admin,publicador');

    Route::post('/autoajudas', [AutoajudaApiController::class, 'store'])
        ->middleware('ability:admin,publicador');

    Route::put('/autoajudas/{autoajuda}', [AutoajudaApiController::class, 'update'])
        ->middleware('ability:admin,publicador');

    Route::delete('/autoajudas/{autoajuda}', [AutoajudaApiController::class, 'destroy'])
        ->middleware('ability:admin,publicador');
});
