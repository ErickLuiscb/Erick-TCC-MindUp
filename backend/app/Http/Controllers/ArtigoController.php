<?php

namespace App\Http\Controllers;

use App\Models\Artigo;
use App\Models\User;
use App\Models\Categoria;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ArtigoController extends Controller
{
    // LISTAR
    public function index()
    {
        $artigos = Artigo::with([
            'autor',
            'categorias'
        ])
        ->latest()
        ->get();

        return view('artigos.index', compact('artigos'));
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

        return view('artigos.create', compact(
            'usuarios',
            'categorias'
        ));
    }


    // STORE
    public function store(Request $request)
    {
        $request->validate([
            'titulo' => 'required|string|max:150',

            'descricao' => 'nullable|string',

            'arquivo_pdf' => 'required|file|mimes:pdf|max:10240',

            'thumbnail' => 'nullable|image|max:2048',

            'autor_id' => 'required|exists:usuarios,id',

            'categorias' => 'required|array|min:1|max:3',
            'categorias.*' => 'exists:categorias,id',
        ]);

        // UPLOAD PDF

        $arquivoPdf = $request
            ->file('arquivo_pdf')
            ->store('artigos/pdf', 'public');

        // UPLOAD THUMBNAIL

        $thumbnail = null;

        if ($request->hasFile('thumbnail')) {

            $thumbnail = $request
                ->file('thumbnail')
                ->store('artigos/thumbnails', 'public');
        }

        // CRIAR ARTIGO

        $artigo = Artigo::create([
            'titulo' => $request->titulo,
            'descricao' => $request->descricao,
            'arquivo_pdf' => $arquivoPdf,
            'thumbnail' => $thumbnail,
            'autor_id' => $request->autor_id,
            'ativo' => true,
        ]);

        // CATEGORIAS

        $artigo->categorias()->sync(
            $request->categorias
        );

        return redirect()
            ->route('artigos.index')
            ->with(
                'success',
                'Artigo criado com sucesso!'
            );
    }

    // SHOW
    public function show($id)
    {
        $artigo = Artigo::with([
            'autor',
            'categorias'
        ])->findOrFail($id);

        return view('artigos.show', compact('artigo'));
    }

    // FORM EDIT
    public function edit($id)
    {
        $artigo = Artigo::with('categorias')
            ->findOrFail($id);

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

        return view('artigos.edit', compact(
            'artigo',
            'usuarios',
            'categorias'
        ));
    }

    // UPDATE
    public function update(Request $request, $id)
    {
        $artigo = Artigo::findOrFail($id);

        $request->validate([
            'titulo' => 'required|string|max:150',

            'descricao' => 'nullable|string',

            'arquivo_pdf' => 'nullable|file|mimes:pdf|max:10240',

            'thumbnail' => 'nullable|image|max:2048',

            'autor_id' => 'required|exists:usuarios,id',

            'categorias' => 'required|array|min:1|max:3',
            'categorias.*' => 'exists:categorias,id',
        ]);

        // NOVO PDF

        if ($request->hasFile('arquivo_pdf')) {

            if (
                $artigo->arquivo_pdf &&
                Storage::disk('public')->exists($artigo->arquivo_pdf)
            ) {
                Storage::disk('public')
                    ->delete($artigo->arquivo_pdf);
            }

            $artigo->arquivo_pdf = $request
                ->file('arquivo_pdf')
                ->store('artigos/pdf', 'public');
        }

        // NOVA THUMBNAIL

        if ($request->hasFile('thumbnail')) {

            if (
                $artigo->thumbnail &&
                Storage::disk('public')->exists($artigo->thumbnail)
            ) {
                Storage::disk('public')
                    ->delete($artigo->thumbnail);
            }

            $artigo->thumbnail = $request
                ->file('thumbnail')
                ->store('artigos/thumbnails', 'public');
        }

        // UPDATE

        $artigo->update([
            'titulo' => $request->titulo,
            'descricao' => $request->descricao,
            'autor_id' => $request->autor_id,
        ]);

        // CATEGORIAS

        $artigo->categorias()->sync(
            $request->categorias
        );

        return redirect()
            ->route('artigos.index')
            ->with(
                'success',
                'Artigo atualizado com sucesso!'
            );
    }

    // REMOVE
    public function remove($id)
    {
        $artigo = Artigo::findOrFail($id);

        return view('artigos.remove', compact('artigo'));
    }

    // DESTROY
    public function destroy($id)
    {
        $artigo = Artigo::findOrFail($id);

        // DELETE PDF

        if (
            $artigo->arquivo_pdf &&
            Storage::disk('public')->exists($artigo->arquivo_pdf)
        ) {
            Storage::disk('public')
                ->delete($artigo->arquivo_pdf);
        }

        // DELETE THUMBNAIL

        if (
            $artigo->thumbnail &&
            Storage::disk('public')->exists($artigo->thumbnail)
        ) {
            Storage::disk('public')
                ->delete($artigo->thumbnail);
        }

        $artigo->delete();

        return redirect()
            ->route('artigos.index')
            ->with(
                'success',
                'Artigo removido com sucesso!'
            );
    }
}
