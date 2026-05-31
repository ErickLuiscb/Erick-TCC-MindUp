<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Favorito extends Model
{
    use HasFactory;

    protected $table = 'favoritos';

    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'favoritavel_id',
        'favoritavel_type',
        'data_criacao',
    ];

    /**
     * Usuário que favoritou
     */
    public function usuario()
    {
        return $this->belongsTo(
            User::class,
            'usuario_id'
        );
    }

    /**
     * Relação polimórfica
     */
    public function favoritavel()
    {
        return $this->morphTo();
    }
}
