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

            $table->string('titulo', 150);
            $table->text('descricao')->nullable();

            $table->string('arquivo', 255);

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
        Schema::dropIfExists('videos');
    }
};
