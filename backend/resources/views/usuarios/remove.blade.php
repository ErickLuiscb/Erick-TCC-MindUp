<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Remover Usuário</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f7f7f7; padding: 40px; }
        .container { background: #fff; max-width: 600px; margin: auto; padding: 30px 40px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h2 { color: #dc3545; margin-bottom: 20px; }
        p { font-size: 16px; margin-bottom: 20px; }
        button, a.btn { padding: 12px 22px; font-size: 16px; border-radius: 6px; border: none; cursor: pointer; text-decoration: none; color: white; }
        button.btn-danger { background-color: #dc3545; }
        a.btn-secondary { background-color: #6c757d; margin-left: 10px; }
    </style>
</head>
<body>
<div class="container">
    <h2>⚠️ Confirmar Exclusão</h2>
    <p>Tem certeza que deseja excluir o usuário <strong>{{ $usuario->nome }}</strong>?</p>

    <form action="{{ route('usuarios.destroy', $usuario->id) }}" method="POST">
        @csrf
        <input type="hidden" name="confirmar" value="Deletar">
        <button type="submit" class="btn-danger">Sim, excluir</button>
        <a href="{{ route('usuarios.index') }}" class="btn btn-secondary">Cancelar</a>
    </form>
</div>
</body>
</html>
