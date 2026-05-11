<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detalhes do Usuário</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f7f7f7; padding: 40px; }
        .container { background: #fff; max-width: 700px; margin: auto; padding: 30px 40px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h2 { margin-bottom: 20px; }
        p { margin-bottom: 10px; font-size: 16px; }
        .btn { display: inline-block; margin-top: 20px; padding: 12px 22px; border-radius: 6px; text-decoration: none; color: white; }
        .btn-warning { background: #ffc107; }
        .btn-danger { background: #dc3545; }
        .btn-secondary { background: #6c757d; }
    </style>
</head>
<body>
<div class="container">
    <h2>👤 {{ $usuario->nome }}</h2>
    <p><strong>Email:</strong> {{ $usuario->email }}</p>
    <p><strong>Tipo:</strong> {{ ucfirst($usuario->tipo) }}</p>
    <p><strong>CRP:</strong> {{ $usuario->crp ?? '—' }}</p>
    <p><strong>Imagem:</strong> {{ $usuario->imagem_perfil ?? '—' }}</p>

    <a href="{{ route('usuarios.edit', $usuario->id) }}" class="btn btn-warning">Editar</a>
    <a href="{{ route('usuarios.remove', $usuario->id) }}" class="btn btn-danger">Remover</a>
    <a href="{{ route('usuarios.index') }}" class="btn btn-secondary">Voltar</a>
</div>
</body>
</html>
