<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Anotacao;
use App\Models\User;

class AnotacaoController extends Controller
{
    /** Lista todas as anotações */
    public function index()
    {
        $anotacoes = Anotacao::with('usuario')->get();
        return view('anotacoes.index', compact('anotacoes'));
    }

    /** Mostra formulário de criação */
    public function create()
    {
        $usuarios = User::all(); // para selecionar o autor da anotação
        return view('anotacoes.create', compact('usuarios'));
    }

    /** Armazena nova anotação */
    public function store(Request $request)
    {
        $request->validate([
            'usuario_id' => 'required|exists:usuarios,id',
            'titulo' => 'required|string|max:100',
            'texto' => 'required|string',
        ]);

        Anotacao::create($request->only(['usuario_id', 'titulo', 'texto']));

        return redirect()->route('anotacoes.index')->with('success', 'Anotação criada com sucesso!');
    }

    /** Mostra uma única anotação */
    public function show($id)
    {
        $anotacao = Anotacao::with('usuario')->findOrFail($id);
        return view('anotacoes.show', compact('anotacao'));
    }

    /** Mostra formulário de edição */
    public function edit($id)
    {
        $anotacao = Anotacao::findOrFail($id);
        $usuarios = User::all();
        return view('anotacoes.edit', compact('anotacao', 'usuarios'));
    }

    /** Atualiza uma anotação existente */
    public function update(Request $request, $id)
    {
        $anotacao = Anotacao::findOrFail($id);

        $request->validate([
            'usuario_id' => 'required|exists:usuarios,id',
            'titulo' => 'required|string|max:100',
            'texto' => 'required|string',
        ]);

        $anotacao->update($request->only(['usuario_id', 'titulo', 'texto']));

        return redirect()->route('anotacoes.index')->with('success', 'Anotação atualizada com sucesso!');
    }

    /** Mostra página de confirmação de exclusão */
    public function remove($id)
    {
        $anotacao = Anotacao::with('usuario')->findOrFail($id);
        return view('anotacoes.remove', compact('anotacao'));
    }

    /** Exclui uma anotação após confirmação */
    public function destroy(Request $request, $id)
    {
        $anotacao = Anotacao::findOrFail($id);

        if ($request->input('confirmar') === 'Deletar') {
            $anotacao->delete();
            return redirect()->route('anotacoes.index')->with('success', 'Anotação removida com sucesso!');
        }

        return redirect()->route('anotacoes.index')->with('info', 'Exclusão cancelada.');
    }
}
