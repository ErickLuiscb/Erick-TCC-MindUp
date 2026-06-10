<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Favorito;

class Video extends Model
{
    use HasFactory;

    protected $table = 'videos';

    // Agora usamos created_at e updated_at
    public $timestamps = true;

    protected $fillable = [
        'titulo',
        'descricao',
        'arquivo',
        'autor_id',
        'ativo',
    ];

    // =========================================
    // RELACIONAMENTOS
    // =========================================

    // AUTOR DO VÍDEO
    public function autor()
    {
        return $this->belongsTo(User::class, 'autor_id');
    }

    // CATEGORIAS
    public function categorias()
    {
        return $this->belongsToMany(
            Categoria::class,
            'categoria_video'
        );
    }

    //Relacionamento poliformico com Favoritos
    public function favoritos()
{
    return $this->morphMany(
        Favorito::class,
        'favoritavel'
    );
}
}
