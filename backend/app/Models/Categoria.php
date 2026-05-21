<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    use HasFactory;

    protected $table = 'categorias';

    public $timestamps = true;

    protected $fillable = [
        'nome',
        'ativo',
    ];

    // =========================================
    // RELACIONAMENTOS
    // =========================================

    // VÍDEOS
    public function videos()
    {
        return $this->belongsToMany(
            Video::class,
            'categoria_video'
        );
    }

    // ARTIGOS
    public function artigos()
    {
        return $this->belongsToMany(
            Artigo::class,
            'categoria_artigo'
        );
    }

    // SUGESTÕES
    public function sugestoes()
    {
        return $this->belongsToMany(
            Sugestao::class,
            'categoria_sugestao'
        );
    }

    // AUTOAJUDAS
    public function autoajudas()
    {
        return $this->belongsToMany(
            Autoajuda::class,
            'categoria_autoajuda'
        );
    }
}
