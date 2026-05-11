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
    Schema::create('usuarios', function (Blueprint $table) {
        $table->id();

        $table->string('nome', 100);
        $table->string('email', 100)->unique();
        $table->string('senha', 255); // armazenada como password
        $table->string('imagem_perfil', 255)->nullable();
        $table->string('crp', 20)->nullable();

        // Aqui está o tipo de usuário do SEU app (psicologo ou usuario)
        $table->enum('tipo', ['psicologo', 'usuario']);

        // Abilities
        $table->boolean('is_admin')->default(false); // psicólogo é admin
        $table->string('role')->default('user'); // user, autor, etc.

        // Necessário para autenticação (Sanctum)
        $table->rememberToken();

        $table->timestamp('criado_em')->useCurrent();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};
