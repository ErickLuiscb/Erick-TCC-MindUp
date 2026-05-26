<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sugestoes', function (Blueprint $table) {
            $table->id();

            $table->enum('tipo', [
                'livro',
                'filme',
                'musica'
            ]);

            $table->string('titulo', 150);

            $table->text('descricao')->nullable();

            // imagem da sugestão
            $table->string('capa', 255)->nullable();

            // links opcionais
            $table->string('link_externo', 255)->nullable();

            // autor
            $table->foreignId('autor_id')
            ->nullable()
            ->constrained('usuarios')
            ->nullOnDelete();

            $table->boolean('ativo')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sugestoes');
    }
};
