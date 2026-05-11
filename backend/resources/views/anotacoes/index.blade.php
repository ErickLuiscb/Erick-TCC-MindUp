
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lista de anotacoes</title>
    <style>
    body {
        font-family: Arial, sans-serif;
        background-color: #f7f7f7;
        padding: 40px;
    }
    .container {
        background: #fff;
        max-width: 700px;
        margin: auto;
        padding: 30px 40px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    h2 {
        margin-bottom: 25px;
        color: #333;
    }
    label {
        font-weight: bold;
        display: block;
        margin-top: 15px;
        margin-bottom: 5px;
    }
    input[type="text"],
    select,
    textarea {
        width: 100%;
        padding: 14px;
        font-size: 16px;
        border: 1px solid #ccc;
        border-radius: 6px;
        box-sizing: border-box;
        resize: vertical;
    }
    button,
    a.btn {
        display: inline-block;
        margin-top: 20px;
        padding: 12px 22px;
        font-size: 16px;
        text-decoration: none;
        border: none;
        border-radius: 6px;
        cursor: pointer;
    }
    button.btn-success {
        background-color: #28a745;
        color: white;
    }
    a.btn-secondary {
        background-color: #6c757d;
        color: white;
        margin-left: 10px;
    }
    a.btn-secondary:hover,
    button.btn-success:hover {
        opacity: 0.9;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
    }
    th, td {
        border: 1px solid #ddd;
        padding: 10px 12px;
        text-align: left;
    }
    th {
        background: #efefef;
    }
    a.btn-warning {
        background-color: #ffc107;
        color: white;
    }
    a.btn-danger {
        background-color: #dc3545;
        color: white;
    }
</style>
</head>
<body>
<div class="container mt-4">
    <h2 class="mb-3">📒 Lista de Anotações</h2>

    <a href="{{ route('anotacoes.create') }}" class="btn btn-primary mb-3">Nova Anotação</a>

    <a href="{{ route('usuarios.index') }}" class="btn btn-primary">Ver Usuarios</a>

    <a href="{{ route('videos.index') }}" class="btn btn-primary">Ver Videos</a>

    @if(session('success'))
        <div class="alert alert-success">{{ session('success') }}</div>
    @elseif(session('info'))
        <div class="alert alert-info">{{ session('info') }}</div>
    @endif

    <table class="table table-bordered">
        <thead class="table-dark">
            <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Autor</th>
                <th>Data</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody>
        @foreach($anotacoes as $a)
            <tr>
                <td>{{ $a->id }}</td>
                <td><a href="{{ route('anotacoes.show', $a->id) }}">{{ $a->titulo }}</a></td>
                <td>{{ $a->usuario->nome ?? 'Desconhecido' }}</td>
                <td>{{ \Carbon\Carbon::parse($a->data_criacao)->format('d/m/Y H:i') }}</td>
                <td>
                    <a href="{{ route('anotacoes.edit', $a->id) }}" class="btn btn-sm btn-warning">Editar</a>
                    <a href="{{ route('anotacoes.remove', $a->id) }}" class="btn btn-sm btn-danger">Remover</a>
                </td>
            </tr>
        @endforeach
        </tbody>
    </table>
</div>
</body>
</html>
