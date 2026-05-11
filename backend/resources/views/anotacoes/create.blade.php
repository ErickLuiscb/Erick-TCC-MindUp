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
        button, a.btn {
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
        a.btn-secondary:hover, button.btn-success:hover {
            opacity: 0.9;
        }
    </style>
</head>
<body>

<div class="container">
    <h2>➕ Nova Anotação</h2>

    <form action="{{ route('anotacoes.store') }}" method="POST">
        @csrf

        <label for="usuario_id">Usuário</label>
        <select name="usuario_id" id="usuario_id" required>
            <option value="">Selecione...</option>
            @foreach($usuarios as $u)
                <option value="{{ $u->id }}">{{ $u->nome }}</option>
            @endforeach
        </select>

        <label for="titulo">Título</label>
        <input type="text" id="titulo" name="titulo" required maxlength="100">

        <label for="texto">Texto</label>
        <textarea id="texto" name="texto" rows="8" required></textarea>

        <button type="submit" class="btn-success">Salvar</button>
        <a href="{{ route('anotacoes.index') }}" class="btn btn-secondary">Cancelar</a>
    </form>
</div>
</body>
</html>

