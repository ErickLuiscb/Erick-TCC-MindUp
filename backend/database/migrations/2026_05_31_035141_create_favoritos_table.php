<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('favoritos', function (Blueprint $table) {

            $table->id();

            /*
            USUÁRIO QUE FAVORITOU
            */

            $table->foreignId('usuario_id')
                ->constrained('usuarios')
                ->cascadeOnDelete();

            /*
            RELAÇÃO POLIMÓRFICA
            */

            $table->morphs('favoritavel');

            /*
            DATA
            */

            $table->timestamp('data_criacao')
                ->useCurrent();

            /*
            EVITA FAVORITOS DUPLICADOS
            */

            $table->unique([
                'usuario_id',
                'favoritavel_id',
                'favoritavel_type'
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('favoritos');
    }
};
