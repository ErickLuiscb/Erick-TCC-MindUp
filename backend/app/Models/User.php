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

    // Agora usamos timestamps do Laravel
    public $timestamps = true;

    protected $fillable = [
        'nome',
        'email',
        'senha',
        'imagem_perfil',
        'crp',
        'tipo',
        'is_admin',
        'role',
    ];

    protected $hidden = [
        'senha',
        'remember_token',
    ];

    /**
     * Campo de senha personalizado
     */
    public function getAuthPassword()
    {
        return $this->senha;
    }

    // =========================================
    // RELACIONAMENTOS
    // =========================================

    // ANOTAÇÕES
    public function anotacoes()
    {
        return $this->hasMany(Anotacao::class, 'usuario_id');
    }

    // VÍDEOS
    public function videos()
    {
        return $this->hasMany(Video::class, 'autor_id');
    }

    // ARTIGOS
    public function artigos()
    {
        return $this->hasMany(Artigo::class, 'autor_id');
    }

    // SUGESTÕES
    public function sugestoes()
    {
        return $this->hasMany(Sugestao::class, 'autor_id');
    }

    // AUTOAJUDA
    public function autoajudas()
    {
        return $this->hasMany(Autoajuda::class, 'autor_id');
    }
}
