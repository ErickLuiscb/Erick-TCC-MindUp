<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nova Anotação</title>
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
<div class="container mt-4">
</head>
<body>
    <h2>✏️ Editar Anotação</h2>

    <form action="{{ route('anotacoes.update', $anotacao->id) }}" method="POST">
        @csrf
        @method('PUT')

        <div class="mb-3">
            <label for="usuario_id" class="form-label">Usuário</label>
            <select name="usuario_id" id="usuario_id" class="form-select" required>
                @foreach($usuarios as $u)
                    <option value="{{ $u->id }}" {{ $u->id == $anotacao->usuario_id ? 'selected' : '' }}>
                        {{ $u->nome }}
                    </option>
                @endforeach
            </select>
        </div>

        <div class="mb-3">
            <label for="titulo" class="form-label">Título</label>
            <input type="text" class="form-control" id="titulo" name="titulo" value="{{ $anotacao->titulo }}" required maxlength="100">
        </div>

        <div class="mb-3">
            <label for="texto" class="form-label">Texto</label>
            <textarea class="form-control" id="texto" name="texto" rows="5" required>{{ $anotacao->texto }}</textarea>
        </div>

        <button type="submit" class="btn btn-success">Salvar Alterações</button>
        <a href="{{ route('anotacoes.index') }}" class="btn btn-secondary">Cancelar</a>
    </form>
</div>
</body>
</html>
