<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('artigos', function (Blueprint $table) {
            $table->id();

            $table->string('titulo', 150);

            $table->text('descricao')->nullable();

            // PDF do artigo
            $table->string('arquivo_pdf', 255);

            // imagem de capa opcional
            $table->string('thumbnail', 255)->nullable();

            // autor
            $table->foreignId('autor_id')
                ->constrained('usuarios')
                ->cascadeOnDelete();

            $table->boolean('ativo')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('artigos');
    }
};
