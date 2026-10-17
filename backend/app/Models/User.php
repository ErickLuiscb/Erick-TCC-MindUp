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
        'crp_regiao',
        'cpf',
        'tipo',
        'is_admin',
        'role',
        // crp_status NÃO entra aqui de propósito: só o servidor define
        // (cadastro => pendente; admin => aprovado/rejeitado).
    ];

    protected $hidden = [
        'senha',
        'remember_token',
        'cpf', // nunca sai em serialização acidental para garantir a segurança do dado sensível
               // seguindo justamente a LGPD (Lei Geral de Proteção de Dados Pessoais).
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'crp_analisado_em' => 'datetime',
        'cpf' => 'encrypted',
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

    // FAVORITOS: O usuario pode favoritar os conteudos.
    public function favoritos()
{
    return $this->hasMany(
        Favorito::class,
        'usuario_id'
    );
}
}
