<?php

namespace App\Http\Controllers;

use App\Models\Sugestao;
use App\Models\User;
use App\Models\Categoria;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SugestaoController extends Controller
{
    // LISTAR
    public function index()
    {
        $sugestoes = Sugestao::with([
            'autor',
            'categorias'
        ])
        ->latest()
        ->get();

        return view('sugestoes.index', compact('sugestoes'));
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

        $tipos = [
            'livro',
            'filme',
            'musica',
            'podcast',
            'serie',
            'canal',
            'app',
        ];

        return view('sugestoes.create', compact(
            'usuarios',
            'categorias',
            'tipos'
        ));
    }


    // STORE
    public function store(Request $request)
    {
        $request->validate([

            'tipo' => '
                required|
                in:livro,filme,musica,podcast,serie,canal,app
            ',

            'titulo' => 'required|string|max:150',

            'descricao' => 'nullable|string',

            'link' => 'nullable|url|max:500',

            'capa' => 'nullable|image|max:4096',

            'autor_id' => 'required|exists:usuarios,id',

            'categorias' => 'required|array|min:1|max:3',

            'categorias.*' => 'exists:categorias,id',
        ]);

        // UPLOAD CAPA

        $capa = null;

        if ($request->hasFile('capa')) {

            $capa = $request
                ->file('capa')
                ->store('sugestoes/capas', 'public');
        }

        // CRIAR

        $sugestao = Sugestao::create([
            'tipo' => $request->tipo,
            'titulo' => $request->titulo,
            'descricao' => $request->descricao,
            'link' => $request->link,
            'capa' => $capa,
            'autor_id' => $request->autor_id,
            'ativo' => true,
        ]);

        // CATEGORIAS

        $sugestao->categorias()->sync(
            $request->categorias
        );

        return redirect()
            ->route('sugestoes.index')
            ->with(
                'success',
                'Sugestão criada com sucesso!'
            );
    }

    // SHOW
    public function show($id)
    {
        $sugestao = Sugestao::with([
            'autor',
            'categorias'
        ])->findOrFail($id);

        return view('sugestoes.show', compact('sugestao'));
    }

    // FORM EDIT
    public function edit($id)
    {
        $sugestao = Sugestao::with(
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

        $tipos = [
            'livro',
            'filme',
            'musica',
            'podcast',
            'serie',
            'canal',
            'app',
        ];

        return view('sugestoes.edit', compact(
            'sugestao',
            'usuarios',
            'categorias',
            'tipos'
        ));
    }

    // UPDATE
    public function update(Request $request, $id)
    {
        $sugestao = Sugestao::findOrFail($id);

        $request->validate([

            'tipo' => '
                required|
                in:livro,filme,musica,podcast,serie,canal,app
            ',

            'titulo' => 'required|string|max:150',

            'descricao' => 'nullable|string',

            'link' => 'nullable|url|max:500',

            'capa' => 'nullable|image|max:4096',

            'autor_id' => 'required|exists:usuarios,id',

            'categorias' => 'required|array|min:1|max:3',

            'categorias.*' => 'exists:categorias,id',
        ]);

        // NOVA CAPA

        if ($request->hasFile('capa')) {

            if (
                $sugestao->capa &&
                Storage::disk('public')->exists($sugestao->capa)
            ) {
                Storage::disk('public')
                    ->delete($sugestao->capa);
            }

            $sugestao->capa = $request
                ->file('capa')
                ->store('sugestoes/capas', 'public');
        }

        // UPDATE

        $sugestao->update([
            'tipo' => $request->tipo,
            'titulo' => $request->titulo,
            'descricao' => $request->descricao,
            'link' => $request->link,
            'autor_id' => $request->autor_id,
        ]);

        // CATEGORIAS

        $sugestao->categorias()->sync(
            $request->categorias
        );

        return redirect()
            ->route('sugestoes.index')
            ->with(
                'success',
                'Sugestão atualizada com sucesso!'
            );
    }

    // REMOVE
    public function remove($id)
    {
        $sugestao = Sugestao::findOrFail($id);

        return view('sugestoes.remove', compact('sugestao'));
    }

    // DESTROY
    public function destroy($id)
    {
        $sugestao = Sugestao::findOrFail($id);

        // DELETE CAPA

        if (
            $sugestao->capa &&
            Storage::disk('public')->exists($sugestao->capa)
        ) {
            Storage::disk('public')
                ->delete($sugestao->capa);
        }

        $sugestao->delete();

        return redirect()
            ->route('sugestoes.index')
            ->with(
                'success',
                'Sugestão removida com sucesso!'
            );
    }
}
