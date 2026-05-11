<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Anotacao extends Model
{
    use HasFactory;

    protected $table = 'anotacoes';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'titulo',
        'texto',
        'data_criacao'
    ];

    /**
     * Uma anotação pertence a um usuário.
     */
    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
