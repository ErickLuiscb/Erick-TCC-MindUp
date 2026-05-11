<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('videos', function (Blueprint $table) {
            $table->id();

            $table->string('titulo', 100);
            $table->text('descricao')->nullable();

            // caminho do vídeo (storage)
            $table->string('arquivo', 255);

            // autor (psicólogo / admin)
            $table->foreignId('autor_id')
                ->constrained('usuarios')
                ->cascadeOnDelete();

            $table->timestamp('data_criacao')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('videos');
    }
};
