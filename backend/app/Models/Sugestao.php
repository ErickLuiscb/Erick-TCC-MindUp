<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sugestao extends Model
{
    use HasFactory;

    protected $table = 'sugestoes';

    public $timestamps = true;

    protected $fillable = [
        'tipo',
        'titulo',
        'descricao',
        'capa',
        'link_externo',
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
            'categoria_sugestao'
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
