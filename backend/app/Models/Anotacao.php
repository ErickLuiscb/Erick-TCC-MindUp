<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Anotacao extends Model
{
    use HasFactory;

    protected $table = 'anotacoes';

    protected $primaryKey = 'id';

    public $timestamps = true;

    protected $fillable = [
        'usuario_id',
        'titulo',
        'texto',
        'humor',
    ];

    /*
    CRIPTOGRAFIA DO DIÁRIO (dado pessoal sensível: saúde emocional)

    O cast `encrypted` do Laravel cifra o valor (AES-256 com a APP_KEY)
    antes de gravar no banco e decifra ao ler. Para o resto do sistema
    (Controllers, Resources, frontend) nada muda: eles continuam vendo
    texto puro. Quem olha a tabela direto no banco (Supabase, backup,
    dump) vê apenas texto ilegível.

    ATENÇÃO: sem a APP_KEY correta, as anotações não podem ser lidas.
    Por isso a APP_KEY de produção nunca deve ser trocada nem perdida.

    Consequência: não dá para filtrar/ordenar por esses campos em SQL
    (a busca do diário é feita no frontend, então isso não afeta nada).

    Para desfazer: `php artisan migrate:rollback --step=1` (decifra os
    dados) e só depois remover estas linhas.
    */
    protected $casts = [
        'titulo' => 'encrypted',
        'texto'  => 'encrypted',
        'humor'  => 'encrypted',
    ];

    // =========================================
    // RELACIONAMENTOS
    // =========================================

    /**
     * Uma anotação pertence a um usuário.
     */
    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
