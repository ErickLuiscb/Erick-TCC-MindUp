<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->timestamp('email_verified_at')->nullable()->after('email');
        });

        /*
        Comentário do desenvolvedor durante a fase de testes para esta funcionalidade:
        Usuários que já existiam antes dessa funcionalidade nunca
        receberam e-mail de confirmação — não é justo bloqueá-los
        agora. Marcamos todos como já verificados, e a exigência
        passa a valer só para cadastros novos, daqui pra frente.
        */
        DB::table('usuarios')
            ->whereNull('email_verified_at')
            ->update(['email_verified_at' => now()]);
    }

    public function down(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropColumn('email_verified_at');
        });
    }
};
