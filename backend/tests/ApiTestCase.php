<?php

namespace Tests;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\Concerns\CriaDados;

/**
 * Base dos testes da API.
 *
 * - RefreshDatabase: cada teste começa com o banco (SQLite em memória) limpo.
 * - Storage::fake: uploads vão para um disco falso, nada é gravado de verdade
 *   nem enviado ao Cloudinary.
 */
abstract class ApiTestCase extends TestCase
{
    use RefreshDatabase, CriaDados;

    /**
     * TRAVA DE SEGURANÇA: roda ANTES do RefreshDatabase apagar/criar tabelas.
     *
     * Só deixa os testes seguirem se o banco for um banco de TESTES local:
     * Postgres com nome terminado em "_testing" e host local (pgsql do Sail,
     * 127.0.0.1 ou localhost). Qualquer outra coisa (o banco de desenvolvimento,
     * o Supabase, um .env que escapou) aborta aqui, sem encostar em nada.
     */
    protected function beforeRefreshingDatabase(): void
    {
        $conexao = config('database.connections.' . config('database.default'));

        $seguro = ($conexao['driver'] ?? null) === 'pgsql'
            && str_ends_with((string) ($conexao['database'] ?? ''), '_testing')
            && in_array($conexao['host'] ?? null, ['pgsql', '127.0.0.1', 'localhost'], true);

        if (!$seguro) {
            throw new \RuntimeException(
                'Teste abortado: o banco configurado não é um banco de testes local '
                . '(esperado: Postgres, nome terminando em "_testing", host pgsql/localhost). '
                . 'Confira o phpunit.xml e rode "sail artisan config:clear".'
            );
        }
    }

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'filesystems.default' => 'public',
            'app.frontend_url' => 'http://front.test',
        ]);

        Storage::fake('public');
    }
}
