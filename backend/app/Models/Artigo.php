<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Artigo extends Model
{
    use HasFactory;

    protected $table = 'artigos';

    public $timestamps = true;

    protected $fillable = [
        'titulo',
        'descricao',
        'arquivo_pdf',
        'thumbnail',
        'autor_id',
        'ativo',
    ];

    // =========================================
    // RELACIONAMENTOS
    // =========================================

    // AUTOR
    public function autor()
    {
        return $this->belongsTo(User::class, 'autor_id');
    }

    // CATEGORIAS
    public function categorias()
    {
        return $this->belongsToMany(
            Categoria::class,
            'categoria_artigo'
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
