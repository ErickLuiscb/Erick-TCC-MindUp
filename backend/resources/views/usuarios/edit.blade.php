<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editar Usuário</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f7f7f7; padding: 40px; }
        .container { background: #fff; max-width: 700px; margin: auto; padding: 30px 40px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h2 { margin-bottom: 25px; color: #333; }
        label { font-weight: bold; display: block; margin-top: 15px; margin-bottom: 5px; }
        input, select { width: 100%; padding: 14px; font-size: 16px; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; }
        button, a.btn { margin-top: 20px; padding: 12px 22px; font-size: 16px; border-radius: 6px; border: none; cursor: pointer; text-decoration: none; color: white; }
        button.btn-success { background-color: #28a745; }
        a.btn-secondary { background-color: #6c757d; margin-left: 10px; }
    </style>
</head>
<body>
<div class="container">
    <h2>✏️ Editar Usuário</h2>

    <form action="{{ route('usuarios.update', $usuario->id) }}" method="POST">
        @csrf
        @method('PUT')

        <label for="nome">Nome</label>
        <input type="text" id="nome" name="nome" value="{{ $usuario->nome }}" required maxlength="100">

        <label for="email">Email</label>
        <input type="email" id="email" name="email" value="{{ $usuario->email }}" required maxlength="100">

        <label for="senha">Senha (deixe em branco para não alterar)</label>
        <input type="password" id="senha" name="senha" minlength="6">

        <label for="imagem_perfil">Imagem de Perfil</label>
        <input type="text" id="imagem_perfil" name="imagem_perfil" value="{{ $usuario->imagem_perfil }}">

        <label for="crp">CRP</label>
        <input type="text" id="crp" name="crp" value="{{ $usuario->crp }}">

        <label for="tipo">Tipo</label>
        <select id="tipo" name="tipo" required>
            <option value="psicologo" {{ $usuario->tipo == 'psicologo' ? 'selected' : '' }}>Psicólogo</option>
            <option value="usuario" {{ $usuario->tipo == 'usuario' ? 'selected' : '' }}>Usuário</option>
        </select>

        <button type="submit" class="btn-success">Salvar Alterações</button>
        <a href="{{ route('usuarios.index') }}" class="btn btn-secondary">Cancelar</a>
    </form>
</div>
</body>
</html>
