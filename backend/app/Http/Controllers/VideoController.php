<?php

namespace App\Http\Controllers;

use App\Models\Video;
use App\Models\User;
use Illuminate\Http\Request;

class VideoController extends Controller
{
    public function index()
    {
        $videos = Video::with('autor')->orderBy('id', 'desc')->get();
        return view('videos.index', compact('videos'));
    }

    public function create()
    {
        $usuarios = User::all();
        return view('videos.create', compact('usuarios'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'titulo' => 'required|max:100',
            'descricao' => 'nullable|string',
            'arquivo' => 'required|string|max:255',
            'autor_id' => 'nullable|integer|exists:usuarios,id',
        ]);

        Video::create($request->all());

        return redirect()->route('videos.index')->with('success', 'Vídeo criado com sucesso!');
    }

    public function show($id)
    {
        $video = Video::with('autor')->findOrFail($id);
        return view('videos.show', compact('video'));
    }

    public function edit($id)
    {
        $video = Video::findOrFail($id);
        $usuarios = User::all();
        return view('videos.edit', compact('video', 'usuarios'));
    }

    public function update(Request $request, $id)
    {
        $video = Video::findOrFail($id);

        $request->validate([
            'titulo' => 'required|max:100',
            'descricao' => 'nullable|string',
            'arquivo' => 'required|string|max:255',
            'autor_id' => 'nullable|integer|exists:usuarios,id',
        ]);

        $video->update($request->all());

        return redirect()->route('videos.index')->with('success', 'Vídeo atualizado com sucesso!');
    }

    public function remove($id)
    {
        $video = Video::findOrFail($id);
        return view('videos.remove', compact('video'));
    }

    public function destroy($id)
    {
        $video = Video::findOrFail($id);
        $video->delete();

        return redirect()->route('videos.index')->with('success', 'Vídeo removido com sucesso!');
    }
}
