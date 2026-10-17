<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

//Ideia de incrementação para validação de CRP (OBS: quase de ultima hora.)

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            // Região do CRP (1 a 23). O número do registro continua em `crp`.
            $table->unsignedTinyInteger('crp_regiao')->nullable()->after('crp');

            // CPF guardado criptografado (cast 'encrypted' no model).
            // text porque o valor cifrado é bem maior que 11 caracteres.
            $table->text('cpf')->nullable()->after('crp_regiao');

            // pendente | aprovado | rejeitado (nulo para quem não é psicólogo)
            $table->string('crp_status', 20)->nullable()->after('cpf');

            // Quem decidiu, quando e por quê
            $table->foreignId('crp_analisado_por')
                ->nullable()
                ->after('crp_status')
                ->constrained('usuarios')
                ->nullOnDelete();
            $table->timestamp('crp_analisado_em')->nullable()->after('crp_analisado_por');
            $table->text('crp_motivo')->nullable()->after('crp_analisado_em');

            // Mesmo CRP não pode aparecer duas vezes na mesma região.
            // No PostgreSQL, NULL não conflita: usuários comuns e psicólogos
            // antigos (sem região) não são afetados.
            $table->unique(['crp_regiao', 'crp'], 'usuarios_crp_regiao_crp_unique');
        });

        /*
        Psicólogos que já existiam antes da verificação:
        - com CRP preenchido: mantidos como aprovados, para não bloquear
          quem já usa o sistema (sem conferência retroativa — decisão
          documentada; o admin poderá revisar e revogar pelo painel).
        - sem CRP preenchido (o backend nunca exigiu): ficam pendentes e
          têm as sessões encerradas, para perderem a permissão de publicar.
        */
        DB::table('usuarios')
            ->where('tipo', 'psicologo')
            ->whereNotNull('crp')
            ->where('crp', '<>', '')
            ->update([
                'crp_status' => 'aprovado',
                'crp_analisado_em' => now(),
                'crp_motivo' => 'Cadastro anterior à verificação de CRP; mantido na migração.',
            ]);

        $semCrp = fn () => DB::table('usuarios')
            ->where('tipo', 'psicologo')
            ->where(function ($q) {
                $q->whereNull('crp')->orWhere('crp', '');
            });

        $idsSemCrp = $semCrp()->pluck('id');

        $semCrp()->update(['crp_status' => 'pendente']);

        if ($idsSemCrp->isNotEmpty()) {
            DB::table('personal_access_tokens')
                ->where('tokenable_type', 'App\\Models\\User')
                ->whereIn('tokenable_id', $idsSemCrp)
                ->delete();
        }
    }

    public function down(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropUnique('usuarios_crp_regiao_crp_unique');
            $table->dropConstrainedForeignId('crp_analisado_por');
            $table->dropColumn([
                'crp_regiao',
                'cpf',
                'crp_status',
                'crp_analisado_em',
                'crp_motivo',
            ]);
        });
    }
};
