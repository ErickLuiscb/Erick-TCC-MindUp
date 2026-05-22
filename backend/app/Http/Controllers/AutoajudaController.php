<?php

namespace App\Http\Controllers;

use App\Models\Autoajuda;
use App\Models\User;
use App\Models\Categoria;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AutoajudaController extends Controller
{
    // LISTAR
    public function index()
    {
        $autoajudas = Autoajuda::with([
            'autor',
            'categorias'
        ])
        ->latest()
        ->get();

        return view('autoajudas.index', compact('autoajudas'));
    }

    // FORM CREATE
    public function create()
    {
        $usuarios = User::where(
            'tipo',
            'psicologo'
        )->get();

        $categorias = Categoria::where(
            'ativo',
            true
        )
        ->orderBy('nome')
        ->get();

        $tiposMidia = [
            'imagem',
            'video',
        ];

        return view('autoajudas.create', compact(
            'usuarios',
            'categorias',
            'tiposMidia'
        ));
    }

    // STORE
    public function store(Request $request)
    {
        $request->validate([

            'titulo' => 'required|string|max:150',

            'descricao' => 'nullable|string',

            'tipo_midia' => '
                required|
                in:imagem,video
            ',

            'midia' => '
                required|
                file|
                max:51200
            ',

            'autor_id' => 'required|exists:usuarios,id',

            'categorias' => 'required|array|min:1|max:3',

            'categorias.*' => 'exists:categorias,id',
        ]);

        // VALIDAR TIPO DA MÍDIA
        if ($request->tipo_midia === 'imagem') {

            $request->validate([
                'midia' => 'image|max:5120'
            ]);

        } elseif ($request->tipo_midia === 'video') {

            $request->validate([
                'midia' => '
                    file|
                    mimes:mp4,mov,avi,webm|
                    max:51200
                '
            ]);
        }

        // UPLOAD

        $midia = $request
            ->file('midia')
            ->store('autoajuda/midias', 'public');

        // CRIAR

        $autoajuda = Autoajuda::create([
            'titulo' => $request->titulo,
            'descricao' => $request->descricao,
            'tipo_midia' => $request->tipo_midia,
            'midia' => $midia,
            'autor_id' => $request->autor_id,
            'ativo' => true,
        ]);

        // CATEGORIAS

        $autoajuda->categorias()->sync(
            $request->categorias
        );

        return redirect()
            ->route('autoajudas.index')
            ->with(
                'success',
                'Conteúdo de autoajuda criado com sucesso!'
            );
    }

    // SHOW
    public function show(int $id)
    {
        $autoajuda = Autoajuda::with([
            'autor',
            'categorias'
        ])->findOrFail($id);

        return view('autoajudas.show', compact('autoajuda'));
    }

    // FORM EDIT
    public function edit(int $id)
    {
        $autoajuda = Autoajuda::with(
            'categorias'
        )->findOrFail($id);

        $usuarios = User::where(
            'tipo',
            'psicologo'
        )->get();

        $categorias = Categoria::where(
            'ativo',
            true
        )
        ->orderBy('nome')
        ->get();

        $tiposMidia = [
            'imagem',
            'video',
        ];

        return view('autoajudas.edit', compact(
            'autoajuda',
            'usuarios',
            'categorias',
            'tiposMidia'
        ));
    }

    // UPDATE
    public function update(Request $request, int $id)
    {
        $autoajuda = Autoajuda::findOrFail($id);

        $request->validate([

            'titulo' => 'required|string|max:150',

            'descricao' => 'nullable|string',

            'tipo_midia' => '
                required|
                in:imagem,video
            ',

            'midia' => '
                nullable|
                file|
                max:51200
            ',

            'autor_id' => 'required|exists:usuarios,id',

            'categorias' => 'required|array|min:1|max:3',

            'categorias.*' => 'exists:categorias,id',
        ]);

        // VALIDAR NOVA MÍDIA

        if ($request->hasFile('midia')) {

            if ($request->tipo_midia === 'imagem') {

                $request->validate([
                    'midia' => 'image|max:5120'
                ]);

            } elseif ($request->tipo_midia === 'video') {

                $request->validate([
                    'midia' => '
                        file|
                        mimes:mp4,mov,avi,webm|
                        max:51200
                    '
                ]);
            }

            // DELETE ANTIGA

            if (
                $autoajuda->midia &&
                Storage::disk('public')->exists($autoajuda->midia)
            ) {
                Storage::disk('public')
                    ->delete($autoajuda->midia);
            }

            // NOVA MÍDIA

            $novaMidia = $request
                ->file('midia')
                ->store('autoajuda/midias', 'public');

            $autoajuda->midia = $novaMidia;
        }

        // UPDATE

        $autoajuda->update([
            'titulo' => $request->titulo,
            'descricao' => $request->descricao,
            'tipo_midia' => $request->tipo_midia,
            'autor_id' => $request->autor_id,
        ]);

        // CATEGORIAS

        $autoajuda->categorias()->sync(
            $request->categorias
        );

        return redirect()
            ->route('autoajudas.index')
            ->with(
                'success',
                'Conteúdo atualizado com sucesso!'
            );
    }

    // REMOVE
    public function remove(int $id)
    {
        $autoajuda = Autoajuda::findOrFail($id);

        return view('autoajudas.remove', compact('autoajuda'));
    }

    // DESTROY
    public function destroy(int $id)
    {
        $autoajuda = Autoajuda::findOrFail($id);


        // DELETE MÍDIA

        if (
            $autoajuda->midia &&
            Storage::disk('public')->exists($autoajuda->midia)
        ) {
            Storage::disk('public')
                ->delete($autoajuda->midia);
        }

        $autoajuda->delete();

        return redirect()
            ->route('autoajudas.index')
            ->with(
                'success',
                'Conteúdo removido com sucesso!'
            );
    }
}
