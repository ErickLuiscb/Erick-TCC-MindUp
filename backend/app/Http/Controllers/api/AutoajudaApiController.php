<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAutoajudaRequest;
use App\Http\Requests\UpdateAutoajudaRequest;
use App\Http\Resources\AutoajudaResource;
use App\Models\Autoajuda;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AutoajudaApiController extends Controller
{
    public function index(Request $request)
    {
        $query = Autoajuda::with([
            'autor',
            'categorias',
            'favoritos'
        ]);

        if ($request->filled('categoria')) {

            $query->whereHas('categorias', function ($q) use ($request) {

                $q->where('categorias.id', $request->categoria);
            });
        }

        if ($request->filled('tipo_midia')) {
            $query->where(
                'tipo_midia',
                $request->tipo_midia
            );
        }

        $conteudos = $query
            ->latest()
            ->get();

        return response()->json([
            'data' => AutoajudaResource::collection($conteudos)
        ]);
    }

    public function show(Autoajuda $autoajuda)
    {
        return response()->json([
            'data' => new AutoajudaResource(
                $autoajuda->load([
                    'autor',
                    'categorias',
                    'favoritos'
                ])
            )
        ]);
    }

    public function meusConteudos(Request $request)
    {
        $conteudos = Autoajuda::where(
                'autor_id',
                $request->user()->id
            )
            ->with([
                'autor',
                'categorias',
                'favoritos'
            ])
            ->latest()
            ->get();

        return response()->json([
            'data' => AutoajudaResource::collection($conteudos)
        ]);
    }

    public function store(StoreAutoajudaRequest $request)
    {
        if (
            !$request->user()->tokenCan('admin') &&
            !$request->user()->tokenCan('publicador')
        ) {
            return response()->json([
                'message' => 'Acesso negado.'
            ], 403);
        }

        $data = $request->validated();

        $data['autor_id'] = $request->user()->id;

        if ($request->hasFile('midia')) {

            $nome = uniqid('autoajuda_', true) . '.' .
                $request->file('midia')
                    ->getClientOriginalExtension();

            $request->file('midia')
                ->storeAs('autoajuda', $nome, 'public');

            $data['midia'] = 'autoajuda/' . $nome;
        }

        $categorias = $data['categorias'] ?? [];

        unset($data['categorias']);

        $autoajuda = Autoajuda::create($data);

        if (!empty($categorias)) {
            $autoajuda->categorias()->sync($categorias);
        }

        return response()->json([
            'message' => 'Conteúdo criado com sucesso.',
            'data' => new AutoajudaResource(
                $autoajuda->load([
                    'autor',
                    'categorias',
                    'favoritos'
                ])
            )
        ], 201);
    }

    public function update(
        UpdateAutoajudaRequest $request,
        Autoajuda $autoajuda
    ) {
        if (
            !$request->user()->tokenCan('admin') &&
            $request->user()->id !== $autoajuda->autor_id
        ) {
            return response()->json([
                'message' => 'Acesso negado.'
            ], 403);
        }

        $data = $request->validated();

        if ($request->hasFile('midia')) {

            if (
                $autoajuda->midia &&
                Storage::disk('public')->exists($autoajuda->midia)
            ) {
                Storage::disk('public')->delete($autoajuda->midia);
            }

            $nome = uniqid('autoajuda_', true) . '.' .
                $request->file('midia')
                    ->getClientOriginalExtension();

            $request->file('midia')
                ->storeAs('autoajuda', $nome, 'public');

            $data['midia'] = 'autoajuda/' . $nome;
        }

       $categorias = $data['categorias'] ?? null;
       unset($data['categorias']);

       $autoajuda->update($data);

       if ($categorias !== null) {
       $autoajuda->categorias()->sync($categorias);

        }

        return response()->json([
            'message' => 'Conteúdo atualizado com sucesso.',
            'data' => new AutoajudaResource(
                $autoajuda->fresh()->load([
                    'autor',
                    'categorias',
                    'favoritos'
                ])
            )
        ]);
    }

    public function destroy(
        Request $request,
        Autoajuda $autoajuda
    ) {
        if (
            !$request->user()->tokenCan('admin') &&
            $request->user()->id !== $autoajuda->autor_id
        ) {
            return response()->json([
                'message' => 'Acesso negado.'
            ], 403);
        }

        if (
            $autoajuda->midia &&
            Storage::disk('public')->exists($autoajuda->midia)
        ) {
            Storage::disk('public')->delete($autoajuda->midia);
        }

        $autoajuda->delete();

        return response()->json([
            'message' => 'Conteúdo removido com sucesso.'
        ]);
    }
}
