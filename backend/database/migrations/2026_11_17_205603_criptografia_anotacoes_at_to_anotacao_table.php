<?php

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Criptografa as anotações (titulo, texto e humor) para a maior segurança de dados do usuário.
 *
 * 1) Aumenta as colunas `titulo` e `humor` para TEXT: o valor cifrado é
 *    bem maior que o original e não cabe em varchar(100) / varchar(20).
 * 2) Cifra as anotações que já existem. Sem isso, o cast `encrypted` do
 *    model tentaria decifrar texto puro e daria erro ao listar o diário.
 *
 * Linhas que já estão cifradas são ignoradas, então o passo 2 é seguro
 * mesmo que rode sobre dados parcialmente convertidos. No PostgreSQL a
 * migration roda dentro de uma transação: se algo falhar no meio, nada
 * fica pela metade.
 *
 * Usa DB::table() de propósito (e não o model) para não passar pelo cast.
 */
return new class extends Migration
{
    private const CAMPOS = ['titulo', 'texto', 'humor'];

    public function up(): void
    {
        Schema::table('anotacoes', function (Blueprint $table) {
            $table->text('titulo')->change();
            $table->text('humor')->nullable()->change();
        });

        $this->converter(
            fn (string $valor) => $this->jaCriptografado($valor)
                ? $valor
                : Crypt::encryptString($valor)
        );
    }

    public function down(): void
    {
        // Decifra de volta ANTES de encolher as colunas.
        $this->converter(
            fn (string $valor) => $this->jaCriptografado($valor)
                ? Crypt::decryptString($valor)
                : $valor
        );

        Schema::table('anotacoes', function (Blueprint $table) {
            $table->string('titulo', 100)->change();
            $table->string('humor', 20)->nullable()->change();
        });
    }

    /**
     * Aplica $transformar em cada campo preenchido, em lotes de 100.
     */
    private function converter(callable $transformar): void
    {
        DB::table('anotacoes')->chunkById(100, function ($linhas) use ($transformar) {
            foreach ($linhas as $linha) {
                $novos = [];

                foreach (self::CAMPOS as $campo) {
                    $valor = $linha->{$campo};

                    if ($valor === null || $valor === '') {
                        continue;
                    }

                    $novos[$campo] = $transformar($valor);
                }

                if ($novos !== []) {
                    DB::table('anotacoes')->where('id', $linha->id)->update($novos);
                }
            }
        });
    }

    /**
     * Texto puro nunca passa na verificação de integridade (MAC) do Laravel,
     * então "conseguiu decifrar" significa "já estava cifrado".
     */
    private function jaCriptografado(string $valor): bool
    {
        try {
            Crypt::decryptString($valor);

            return true;
        } catch (DecryptException) {
            return false;
        }
    }
};
