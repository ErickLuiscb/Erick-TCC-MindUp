<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Autoajuda extends Model
{
    use HasFactory;

    protected $table = 'autoajudas';

    public $timestamps = true;

    protected $fillable = [
        'titulo',
        'descricao',
        'tipo_midia',
        'midia',
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
            'categoria_autoajuda'
        );
    }
}
