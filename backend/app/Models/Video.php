<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Video extends Model
{
    use HasFactory;

    protected $table = 'videos';
    public $timestamps = false;

    protected $fillable = [
        'titulo',
        'descricao',
        'arquivo',
        'autor_id',
        'data_criacao',
    ];

    public function autor()
    {
        return $this->belongsTo(User::class, 'autor_id');
    }
}
