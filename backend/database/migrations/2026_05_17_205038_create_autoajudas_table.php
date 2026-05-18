<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('autoajudas', function (Blueprint $table) {
            $table->id();

            $table->string('titulo', 150);

            $table->text('descricao')->nullable();

            // tipo da mídia
            $table->enum('tipo_midia', [
                'imagem',
                'video'
            ]);

            // arquivo da mídia
            $table->string('midia', 255);

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
        Schema::dropIfExists('autoajudas');
    }
};
