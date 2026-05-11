<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lista de Usuários</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f7f7f7; padding: 40px; }
        .container { background: #fff; max-width: 900px; margin: auto; padding: 30px 40px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h2 { margin-bottom: 25px; color: #333; }
        a.btn { display: inline-block; padding: 10px 20px; border-radius: 6px; color: #fff; text-decoration: none; font-size: 16px; }
        a.btn-primary { background: #007bff; }
        a.btn-warning { background: #ffc107; }
        a.btn-danger { background: #dc3545; }
        a.btn:hover { opacity: 0.9; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px 12px; text-align: left; }
        th { background: #efefef; }
    </style>
</head>
<body>
<div class="container">
    <h2>👥 Lista de Usuários</h2>

    <a href="{{ route('usuarios.create') }}" class="btn btn-primary">Novo Usuário</a>

    <a href="{{ route('videos.index') }}" class="btn btn-primary">Ver videos</a>

    <a href="{{ route('anotacoes.index') }}" class="btn btn-primary">Ver Anotações</a>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Tipo</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody>
            @foreach($usuarios as $u)
                <tr>
                    <td>{{ $u->id }}</td>
                    <td><a href="{{ route('usuarios.show', $u->id) }}">{{ $u->nome }}</a></td>
                    <td>{{ $u->email }}</td>
                    <td>{{ $u->tipo }}</td>
                    <td>
                        <a href="{{ route('usuarios.edit', $u->id) }}" class="btn btn-warning">Editar</a>
                        <a href="{{ route('usuarios.remove', $u->id) }}" class="btn btn-danger">Remover</a>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>
</div>
</body>
</html>
