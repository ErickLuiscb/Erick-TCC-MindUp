<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detalhes do Vídeo</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f7f7f7; padding: 40px; }
        .container { background: #fff; max-width: 700px; margin: auto; padding: 30px 40px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h2 { margin-bottom: 15px; color: #333; }
        p { margin-bottom: 10px; font-size: 16px; }
        a.btn { display: inline-block; margin-top: 20px; padding: 12px 22px; border-radius: 6px; text-decoration: none; color: white; }
        a.btn-warning { background: #ffc107; }
        a.btn-danger { background: #dc3545; }
        a.btn-secondary { background: #6c757d; }
    </style>
</head>
<body>
<div class="container">
    <h2>🎞️ {{ $video->titulo }}</h2>

    <p><strong>Descrição:</strong> {{ $video->descricao ?? '—' }}</p>
    <p><strong>Arquivo:</strong> {{ $video->arquivo }}</p>
    <p><strong>Autor:</strong> {{ $video->autor->nome ?? '—' }}</p>
    <p><strong>Data:</strong> {{ \Carbon\Carbon::parse($video->data_criacao)->format('d/m/Y H:i') }}</p>

    <a href="{{ route('videos.edit', $video->id) }}" class="btn btn-warning">Editar</a>
    <a href="{{ route('videos.remove', $video->id) }}" class="btn btn-danger">Remover</a>
    <a href="{{ route('videos.index') }}" class="btn btn-secondary">Voltar</a>
</div>
</body>
</html>
