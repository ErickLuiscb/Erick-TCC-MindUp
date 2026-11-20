<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\ApiTestCase;

/**
 * Teste de fumaça: confirma que a base dos testes de Feature está certa
 * (banco separado, migrations rodando, helpers funcionando).
 */
class BancoDeTesteTest extends ApiTestCase
{
    public function test_os_testes_rodam_no_banco_separado_de_testes(): void
    {
        $this->assertSame('pgsql', DB::connection()->getDriverName());
        $this->assertSame('mindup_testing', DB::connection()->getDatabaseName());
    }

    public function test_as_migrations_criaram_as_tabelas_principais(): void
    {
        foreach (['usuarios', 'categorias', 'videos', 'artigos', 'sugestoes', 'autoajudas', 'favoritos', 'personal_access_tokens', 'password_reset_tokens'] as $tabela) {
            $this->assertTrue(Schema::hasTable($tabela), "A tabela '{$tabela}' deveria existir.");
        }
    }

    public function test_o_helper_cria_usuario_no_banco_de_testes(): void
    {
        $usuario = $this->criarUsuario(['email' => 'ana@teste.com']);

        $this->assertDatabaseHas('usuarios', ['id' => $usuario->id, 'email' => 'ana@teste.com']);
    }

    public function test_cada_teste_comeca_com_o_banco_limpo(): void
    {
        $this->assertDatabaseCount('usuarios', 0);
    }
}
