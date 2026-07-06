<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoriaResource;
use App\Models\Categoria;

class CategoriaApiController extends Controller
{
    public function index()
    {
        $categorias = Categoria::orderBy('nome')->get();

        return response()->json([
            'data' => CategoriaResource::collection($categorias)
        ]);
    }

    public function show(Categoria $categoria)
    {
        return response()->json([
            'data' => new CategoriaResource($categoria)
        ]);
    }
}
