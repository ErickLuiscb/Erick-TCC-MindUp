<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categoria_artigo', function (Blueprint $table) {

            $table->id();

            $table->foreignId('categoria_id')
                ->constrained('categorias')
                ->cascadeOnDelete();

            $table->foreignId('artigo_id')
                ->constrained('artigos')
                ->cascadeOnDelete();

            $table->unique([
                'categoria_id',
                'artigo_id'
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categoria_artigo');
    }
};
