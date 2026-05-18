<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categoria_autoajuda', function (Blueprint $table) {

            $table->id();

            $table->foreignId('categoria_id')
                ->constrained('categorias')
                ->cascadeOnDelete();

            $table->foreignId('autoajuda_id')
                ->constrained('autoajudas')
                ->cascadeOnDelete();

            $table->unique([
                'categoria_id',
                'autoajuda_id'
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categoria_autoajuda');
    }
};
