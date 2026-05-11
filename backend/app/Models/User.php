<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'usuarios';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'nome',
        'email',
        'senha',
        'imagem_perfil',
        'crp',
        'tipo',
        'is_admin',
        'role',
        'criado_em',
    ];

    protected $hidden = [
        'senha',
        'remember_token',
    ];

    /**
     * O Laravel precisa saber qual campo é a senha.
     */
    public function getAuthPassword()
    {
        return $this->senha;
    }

    // RELACIONAMENTOS
    public function videos()
    {
        return $this->hasMany(Video::class, 'autor_id');
    }

    public function anotacoes()
    {
        return $this->hasMany(Anotacao::class, 'usuario_id');
    }
}
