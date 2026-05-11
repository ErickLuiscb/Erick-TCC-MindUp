<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UsuarioController extends Controller
{
    /** Lista todos os usuários */
    public function index()
    {
        $usuarios = User::all();
        return view('usuarios.index', compact('usuarios'));
    }

    /** Mostra formulário de criação */
    public function create()
    {
        return view('usuarios.create');
    }

    /** Armazena novo usuário */
    public function store(Request $request)
    {
        $request->validate([
            'nome' => 'required|string|max:100',
            'email' => 'required|email|unique:usuarios,email',
            'senha' => 'required|string|min:6',
            'imagem_perfil' => 'nullable|string|max:255',
            'crp' => 'nullable|string|max:20',
            'tipo' => 'required|in:psicologo,usuario',
        ]);

        User::create([
            'nome' => $request->nome,
            'email' => $request->email,
            'senha' => bcrypt($request->senha),
            'imagem_perfil' => $request->imagem_perfil,
            'crp' => $request->crp,
            'tipo' => $request->tipo,
        ]);

        return redirect()->route('usuarios.index')->with('success', 'Usuário criado com sucesso!');
    }

    /** Mostra um único usuário */
    public function show($id)
    {
        $usuario = User::findOrFail($id);
        return view('usuarios.show', compact('usuario'));
    }

    /** Mostra formulário de edição */
    public function edit($id)
    {
        $usuario = User::findOrFail($id);
        return view('usuarios.edit', compact('usuario'));
    }

    /** Atualiza usuário existente */
    public function update(Request $request, $id)
    {
        $usuario = User::findOrFail($id);

        $request->validate([
            'nome' => 'required|string|max:100',
            'email' => 'required|email|unique:usuarios,email,' . $id,
            'senha' => 'nullable|string|min:6',
            'imagem_perfil' => 'nullable|string|max:255',
            'crp' => 'nullable|string|max:20',
            'tipo' => 'required|in:psicologo,usuario',
        ]);

        $data = $request->all();
        if (!empty($data['senha'])) {
            $data['senha'] = bcrypt($data['senha']);
        } else {
            unset($data['senha']);
        }

        $usuario->update($data);

        return redirect()->route('usuarios.index')->with('success', 'Usuário atualizado com sucesso!');
    }

    /** Mostra página de confirmação para exclusão */
    public function remove($id)
    {
        $usuario = User::findOrFail($id);
        return view('usuarios.remove', compact('usuario'));
    }

    /** Remove um usuário após confirmação */
    public function destroy(Request $request, $id)
    {
        $usuario = User::findOrFail($id);

        if ($request->input('confirmar') === 'Deletar') {
            $usuario->delete();
            return redirect()->route('usuarios.index')->with('success', 'Usuário excluído com sucesso!');
        }

        return redirect()->route('usuarios.index')->with('info', 'Exclusão cancelada.');
    }
}
