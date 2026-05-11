<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editar Vídeo</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f7f7f7; padding: 40px; }
        .container { background: #fff; max-width: 700px; margin: auto; padding: 30px 40px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h2 { margin-bottom: 25px; color: #333; }
        label { font-weight: bold; display: block; margin-top: 15px; margin-bottom: 5px; }
        input, textarea, select { width: 100%; padding: 14px; font-size: 16px; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; resize: vertical; }
        button, a.btn { margin-top: 20px; padding: 12px 22px; font-size: 16px; border-radius: 6px; border: none; cursor: pointer; text-decoration: none; color: white; }
        button.btn-success { background-color: #28a745; }
        a.btn-secondary { background-color: #6c757d; margin-left: 10px; }
    </style>
</head>
<body>
<div class="container">
    <h2>✏️ Editar Vídeo</h2>

    <form action="{{ route('videos.update', $video->id) }}" method="POST">
        @csrf
        @method('PUT')

        <label for="titulo">Título</label>
        <input type="text" id="titulo" name="titulo" value="{{ $video->titulo }}" required maxlength="100">

        <label for="descricao">Descrição</label>
        <textarea id="descricao" name="descricao" rows="5">{{ $video->descricao }}</textarea>

        <label for="arquivo">Arquivo (URL ou nome do arquivo)</label>
        <input type="text" id="arquivo" name="arquivo" value="{{ $video->arquivo }}" required maxlength="255">

        <label for="autor_id">Autor</label>
        <select id="autor_id" name="autor_id">
            <option value="">Sem autor</option>
            @foreach($usuarios as $u)
                <option value="{{ $u->id }}" {{ $video->autor_id == $u->id ? 'selected' : '' }}>{{ $u->nome }}</option>
            @endforeach
        </select>

        <button type="submit" class="btn-success">Salvar Alterações</button>
        <a href="{{ route('videos.index') }}" class="btn btn-secondary">Cancelar</a>
    </form>
</div>
</body>
</html>
