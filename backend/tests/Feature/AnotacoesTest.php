<?php

namespace Tests\Feature;

use App\Models\Anotacao;
use App\Models\User;
use Tests\ApiTestCase;

class AnotacoesTest extends ApiTestCase
{
    private function criarAnotacao(User $dono, array $extra = []): Anotacao
    {
        $anotacao = new Anotacao();
        $anotacao->forceFill(array_merge([
            'usuario_id' => $dono->id,
            'titulo' => 'Meu dia',
            'texto' => 'Foi tranquilo.',
            'humor' => 'calmo',
        ], $extra))->save();

        return $anotacao;
    }

    // =====================================================================
    // ACESSO
    // =====================================================================

    public function test_exige_login(): void
    {
        $this->getJson('/api/anotacoes')->assertUnauthorized();
        $this->postJson('/api/anotacoes', [])->assertUnauthorized();
        $this->getJson('/api/anotacoes/1')->assertUnauthorized();
        $this->putJson('/api/anotacoes/1', [])->assertUnauthorized();
        $this->deleteJson('/api/anotacoes/1')->assertUnauthorized();
    }

    // =====================================================================
    // CRIAR
    // =====================================================================

    public function test_cria_anotacao_com_humor_para_quem_esta_logado(): void
    {
        $usuario = $this->autenticarComo($this->criarUsuario());

        $this->postJson('/api/anotacoes', ['titulo' => 'Meu dia', 'texto' => 'Foi bom.', 'humor' => 'feliz'])
            ->assertCreated()
            ->assertJsonPath('data.titulo', 'Meu dia')
            ->assertJsonPath('data.humor', 'feliz')
            ->assertJsonPath('data.usuario.id', $usuario->id);

        $anotacao = Anotacao::firstOrFail();
        $this->assertSame($usuario->id, (int) $anotacao->usuario_id);
    }

    public function test_ninguem_cria_anotacao_em_nome_de_outra_pessoa(): void
    {
        $eu = $this->autenticarComo($this->criarUsuario());
        $outra = $this->criarUsuario();

        $this->postJson('/api/anotacoes', [
            'titulo' => 'Tentativa', 'texto' => 'x', 'usuario_id' => $outra->id,
        ])->assertCreated();

        $this->assertSame($eu->id, (int) Anotacao::firstOrFail()->usuario_id);
    }

    public function test_humor_e_opcional(): void
    {
        $this->autenticarComo($this->criarUsuario());

        $this->postJson('/api/anotacoes', ['titulo' => 'Sem humor', 'texto' => 'Texto.'])
            ->assertCreated()
            ->assertJsonPath('data.humor', null);
    }

    public function test_aceita_todos_os_humores_validos_e_recusa_os_demais(): void
    {
        $this->autenticarComo($this->criarUsuario());

        foreach (['feliz', 'calmo', 'neutro', 'triste', 'ansioso', 'irritado', 'cansado', 'grato'] as $humor) {
            $this->postJson('/api/anotacoes', ['titulo' => $humor, 'texto' => 'x', 'humor' => $humor])->assertCreated();
        }

        foreach (['eufórico', 'FELIZ', 'feliz!'] as $invalido) {
            $this->postJson('/api/anotacoes', ['titulo' => 'x', 'texto' => 'x', 'humor' => $invalido])
                ->assertUnprocessable()
                ->assertJsonValidationErrors('humor');
        }

        $this->assertSame(8, Anotacao::count());
    }

    public function test_validacoes_de_titulo_e_texto_na_criacao(): void
    {
        $this->autenticarComo($this->criarUsuario());

        $this->postJson('/api/anotacoes', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['titulo', 'texto']);

        $this->postJson('/api/anotacoes', ['titulo' => '     ', 'texto' => 'x'])->assertJsonValidationErrors('titulo');
        $this->postJson('/api/anotacoes', ['titulo' => str_repeat('a', 101), 'texto' => 'x'])->assertJsonValidationErrors('titulo');
        $this->postJson('/api/anotacoes', ['titulo' => 'x', 'texto' => str_repeat('a', 5001)])->assertJsonValidationErrors('texto');

        $this->postJson('/api/anotacoes', ['titulo' => str_repeat('a', 100), 'texto' => str_repeat('a', 5000)])->assertCreated();
    }

    // =====================================================================
    // LISTAR
    // =====================================================================

    public function test_cada_usuario_lista_somente_as_proprias_anotacoes_da_mais_nova_para_a_mais_antiga(): void
    {
        $ana = $this->criarUsuario();
        $bruno = $this->criarUsuario();
        $this->criarAnotacao($ana, ['titulo' => 'Antiga', 'created_at' => now()->subDays(3)]);
        $this->criarAnotacao($ana, ['titulo' => 'Nova', 'created_at' => now()->subHour()]);
        $this->criarAnotacao($bruno, ['titulo' => 'Do Bruno']);

        $this->autenticarComo($ana);

        $this->getJson('/api/anotacoes')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.titulo', 'Nova')
            ->assertJsonPath('data.1.titulo', 'Antiga');
    }

    public function test_sem_anotacoes_a_lista_vem_vazia(): void
    {
        $this->autenticarComo($this->criarUsuario());

        $this->getJson('/api/anotacoes')->assertOk()->assertJsonCount(0, 'data');
    }

    // =====================================================================
    // VER, EDITAR E APAGAR (somente a própria)
    // =====================================================================

    public function test_dono_ve_edita_e_apaga_a_propria_anotacao(): void
    {
        $dono = $this->autenticarComo($this->criarUsuario());
        $anotacao = $this->criarAnotacao($dono);

        $this->getJson("/api/anotacoes/{$anotacao->id}")->assertOk()->assertJsonPath('data.titulo', 'Meu dia');

        $this->putJson("/api/anotacoes/{$anotacao->id}", ['titulo' => 'Editada', 'texto' => 'Novo texto', 'humor' => 'grato'])
            ->assertOk()
            ->assertJsonPath('data.titulo', 'Editada')
            ->assertJsonPath('data.humor', 'grato');

        $this->deleteJson("/api/anotacoes/{$anotacao->id}")->assertOk();
        $this->assertModelMissing($anotacao);
    }

    public function test_edicao_parcial_muda_so_o_que_foi_enviado(): void
    {
        $dono = $this->autenticarComo($this->criarUsuario());
        $anotacao = $this->criarAnotacao($dono, ['titulo' => 'Original', 'texto' => 'Texto original', 'humor' => 'calmo']);

        $this->putJson("/api/anotacoes/{$anotacao->id}", ['humor' => 'triste'])->assertOk();

        $anotacao->refresh();
        $this->assertSame('triste', $anotacao->humor);
        $this->assertSame('Original', $anotacao->titulo);
        $this->assertSame('Texto original', $anotacao->texto);
    }

    public function test_da_para_remover_o_humor_enviando_nulo(): void
    {
        $dono = $this->autenticarComo($this->criarUsuario());
        $anotacao = $this->criarAnotacao($dono, ['humor' => 'calmo']);

        $this->putJson("/api/anotacoes/{$anotacao->id}", ['humor' => null])->assertOk();

        $this->assertNull($anotacao->fresh()->humor);
    }

    public function test_edicao_nao_deixa_trocar_o_dono_da_anotacao(): void
    {
        $dono = $this->autenticarComo($this->criarUsuario());
        $outra = $this->criarUsuario();
        $anotacao = $this->criarAnotacao($dono);

        $this->putJson("/api/anotacoes/{$anotacao->id}", ['titulo' => 'Novo', 'usuario_id' => $outra->id])->assertOk();

        $this->assertSame($dono->id, (int) $anotacao->fresh()->usuario_id);
    }

    public function test_validacoes_da_edicao(): void
    {
        $dono = $this->autenticarComo($this->criarUsuario());
        $anotacao = $this->criarAnotacao($dono, ['titulo' => 'Original']);

        $this->putJson("/api/anotacoes/{$anotacao->id}", ['titulo' => ''])->assertUnprocessable();
        $this->putJson("/api/anotacoes/{$anotacao->id}", ['titulo' => str_repeat('a', 101)])->assertJsonValidationErrors('titulo');
        $this->putJson("/api/anotacoes/{$anotacao->id}", ['humor' => 'eufórico'])->assertJsonValidationErrors('humor');

        $this->assertSame('Original', $anotacao->fresh()->titulo);
    }

    public function test_o_texto_tem_o_mesmo_limite_na_criacao_e_na_edicao(): void
    {
        $dono = $this->autenticarComo($this->criarUsuario());
        $anotacao = $this->criarAnotacao($dono);

        // Se a criação recusa textos gigantes, a edição não pode ser um atalho para burlar
        $this->putJson("/api/anotacoes/{$anotacao->id}", ['texto' => str_repeat('a', 5001)])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('texto');

        $this->putJson("/api/anotacoes/{$anotacao->id}", ['texto' => str_repeat('a', 5000)])->assertOk();
    }

    public function test_ninguem_acessa_a_anotacao_de_outra_pessoa(): void
    {
        $anotacao = $this->criarAnotacao($this->criarUsuario(), ['titulo' => 'Privada']);
        $this->autenticarComo($this->criarUsuario());

        $this->getJson("/api/anotacoes/{$anotacao->id}")->assertForbidden();
        $this->putJson("/api/anotacoes/{$anotacao->id}", ['titulo' => 'Invadida'])->assertForbidden();
        $this->deleteJson("/api/anotacoes/{$anotacao->id}")->assertForbidden();

        $this->assertSame('Privada', $anotacao->fresh()->titulo);
    }

    public function test_nem_o_admin_le_nem_mexe_nas_anotacoes_dos_usuarios(): void
    {
        $anotacao = $this->criarAnotacao($this->criarUsuario(), ['titulo' => 'Privada']);
        $this->autenticarComo($this->criarAdmin(), ['admin']);

        $this->getJson("/api/anotacoes/{$anotacao->id}")->assertForbidden();
        $this->putJson("/api/anotacoes/{$anotacao->id}", ['titulo' => 'Mexida'])->assertForbidden();
        $this->deleteJson("/api/anotacoes/{$anotacao->id}")->assertForbidden();

        $this->assertSame('Privada', $anotacao->fresh()->titulo);
    }

    public function test_anotacao_inexistente_retorna_404(): void
    {
        $this->autenticarComo($this->criarUsuario());

        $this->getJson('/api/anotacoes/999999')->assertNotFound();
        $this->putJson('/api/anotacoes/999999', ['titulo' => 'x'])->assertNotFound();
        $this->deleteJson('/api/anotacoes/999999')->assertNotFound();
    }
}
