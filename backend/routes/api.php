<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserApiController;
use App\Http\Controllers\Api\VideoApiController;
use App\Http\Controllers\Api\AnotacaoApiController;
use App\Http\Controllers\Api\Auth\AuthController;
// ROTAS PÚBLICAS APENAS
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// ROTAS AUTENTICADAS
Route::middleware('auth:sanctum')->group(function () {

     Route::get('/me', [AuthController::class, 'me']);

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout/all', [AuthController::class, 'logoutAll']);

    // USERS
    Route::get('/users/{user}', [UserApiController::class, 'show']);
    Route::post('/users/{user}', [UserApiController::class, 'update']);
    Route::delete('/users/{user}', [UserApiController::class, 'destroy']);
    Route::get('/users', [UserApiController::class, 'index'])->middleware('abilities:admin');
    Route::post('/users', [UserApiController::class, 'store'])->middleware('abilities:admin');

    // UPLOAD DE IMAGEM DO USUÁRIO
    Route::post('/users/{user}/upload-foto', [UserApiController::class, 'uploadFoto'])
        ->middleware('auth:sanctum');

    // VIDEOS
 // VÍDEOS PÚBLICOS
Route::get('/videosapi', [VideoApiController::class, 'index']);
Route::get('/videosapi/{video}', [VideoApiController::class, 'show']);

// DASHBOARD (psicólogo/admin)
Route::get('/dashboard/videos', [VideoApiController::class, 'meusVideos'])
    ->middleware('abilities:admin,publicador');

// CRUD
Route::post('/videosapi', [VideoApiController::class, 'store'])
    ->middleware('abilities:admin,publicador');

Route::put('/videosapi/{video}', [VideoApiController::class, 'update'])
    ->middleware('abilities:admin,publicador');

Route::delete('/videosapi/{video}', [VideoApiController::class, 'destroy'])
    ->middleware('abilities:admin,publicador');


    // ANOTACOES
    Route::get('/anotacoesapi', [AnotacaoApiController::class, 'index']);
    Route::post('/anotacoesapi', [AnotacaoApiController::class, 'store']);
    Route::put('/anotacoesapi/{anotacao}', [AnotacaoApiController::class, 'update']);
    Route::delete('/anotacoesapi/{anotacao}', [AnotacaoApiController::class, 'destroy']);
});
