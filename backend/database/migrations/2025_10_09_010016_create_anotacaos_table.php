<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
 public function up(): void
{
    Schema::create('anotacoes', function (Blueprint $table) {
        $table->id();

        $table->foreignId('usuario_id')
              ->constrained('usuarios')
              ->cascadeOnDelete();

        $table->string('titulo', 100);
        $table->text('texto');

        $table->timestamp('data_criacao')->useCurrent();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('anotacoes');
    }
};
