<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use Illuminate\Http\Request;

class CategoriaApiController extends Controller
{
    /**
     * LISTAR CATEGORIAS
     */
    public function index()
    {
        $categorias = Categoria::orderBy('nome')->get();

        return response()->json([
            'data' => $categorias
        ]);
    }

    /**
     * VISUALIZAR UMA CATEGORIA
     */
    public function show(Categoria $categoria)
    {
        return response()->json([
            'data' => $categoria
        ]);
    }
}
