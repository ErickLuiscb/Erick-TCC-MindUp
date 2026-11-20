<?php

namespace Tests\Feature;

use App\Models\Artigo;
use App\Models\Favorito;
use App\Models\Video;
use Illuminate\Database\QueryException;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\ApiTestCase;

class FavoritosTest extends ApiTestCase
{
    /** tipo enviado pelo front => coleção da rota => classe gravada no banco */
    public static function tipos(): array
    {
        return [
            'video' => ['video', 'videos', 'App\Models\Video'],
            'artigo' => ['artigo', 'artigos', 'App\Models\Artigo'],
            'sugestao' => ['sugestao', 'sugestoes', 'App\Models\Sugestao'],
            'autoajuda' => ['autoajuda', 'autoajudas', 'App\Models\Autoajuda'],
        ];
    }

    /** $id é "mixed" de propósito: o teste de validação envia valores inválidos ("abc", 1.5...) */
    private function favoritar(string $tipo, mixed $id)
    {
        return $this->postJson('/api/favoritos', ['tipo' => $tipo, 'favoritavel_id' => $id]);
    }

    // =====================================================================
    // ACESSO
    // =====================================================================

    public function test_exige_login(): void
    {
        $this->getJson('/api/favoritos')->assertUnauthorized();
        $this->favoritar('video', 1)->assertUnauthorized();
        $this->deleteJson('/api/favoritos/1')->assertUnauthorized();
    }

    // =====================================================================
    // FAVORITAR / DESFAVORITAR (interruptor)
    // =====================================================================

    #[DataProvider('tipos')]
    public function test_favoritar_e_desfavoritar_funciona_como_um_interruptor(string $tipo, string $colecao, string $classe): void
    {
        $item = $this->criarConteudo($colecao, $this->criarPsicologo());
        $usuario = $this->autenticarComo($this->criarUsuario());

        $this->favoritar($tipo, $item->id)
            ->assertCreated()
            ->assertJsonPath('favoritado', true)
            ->assertJsonPath('data.tipo', $tipo);

        $this->assertDatabaseHas('favoritos', [
            'usuario_id' => $usuario->id,
            'favoritavel_id' => $item->id,
            'favoritavel_type' => $classe,
        ]);

        $this->favoritar($tipo, $item->id)
            ->assertOk()
            ->assertJsonPath('favoritado', false);

        $this->assertDatabaseCount('favoritos', 0);
    }

    public function test_favoritar_de_novo_depois_de_desfavoritar_volta_a_favoritar(): void
    {
        $video = $this->criarVideo($this->criarPsicologo());
        $this->autenticarComo($this->criarUsuario());

        $this->favoritar('video', $video->id)->assertCreated();
        $this->favoritar('video', $video->id)->assertOk();
        $this->favoritar('video', $video->id)->assertCreated()->assertJsonPath('favoritado', true);

        $this->assertDatabaseCount('favoritos', 1);
    }

    public function test_validacoes_do_favorito(): void
    {
        $this->autenticarComo($this->criarUsuario());

        $this->postJson('/api/favoritos', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['tipo', 'favoritavel_id']);

        $this->favoritar('musica', 1)
            ->assertJsonValidationErrors(['tipo' => 'Tipo de conteúdo inválido.']);

        foreach (['abc', 0, -3, 1.5] as $id) {
            $this->favoritar('video', $id)->assertJsonValidationErrors('favoritavel_id');
        }

        $this->assertDatabaseCount('favoritos', 0);
    }

    public function test_favoritar_conteudo_inexistente_retorna_404_e_nao_grava_nada(): void
    {
        $this->autenticarComo($this->criarUsuario());

        $this->favoritar('video', 999999)->assertNotFound();

        $this->assertDatabaseCount('favoritos', 0);
    }

    public function test_o_tipo_e_o_id_precisam_combinar(): void
    {
        // Existe um VÍDEO com este id, mas nenhum ARTIGO: não pode favoritar "artigo" com ele
        $video = $this->criarVideo($this->criarPsicologo());
        $this->autenticarComo($this->criarUsuario());

        $this->assertNull(Artigo::find($video->id));
        $this->favoritar('artigo', $video->id)->assertNotFound();

        $this->assertDatabaseCount('favoritos', 0);
    }

    public function test_o_banco_impede_favorito_duplicado(): void
    {
        $video = $this->criarVideo($this->criarPsicologo());
        $usuario = $this->criarUsuario();
        $dados = [
            'usuario_id' => $usuario->id,
            'favoritavel_id' => $video->id,
            'favoritavel_type' => Video::class,
            'data_criacao' => now(),
        ];

        Favorito::create($dados);

        $this->expectException(QueryException::class);
        Favorito::create($dados);
    }

    // =====================================================================
    // LISTAGEM E PRIVACIDADE
    // =====================================================================

    public function test_cada_usuario_ve_somente_os_proprios_favoritos(): void
    {
        $autor = $this->criarPsicologo();
        $video1 = $this->criarVideo($autor, ['titulo' => 'Da Ana']);
        $video2 = $this->criarVideo($autor, ['titulo' => 'Do Bruno']);
        $ana = $this->criarUsuario();
        $bruno = $this->criarUsuario();

        $this->autenticarComo($ana);
        $this->favoritar('video', $video1->id);
        $this->autenticarComo($bruno);
        $this->favoritar('video', $video2->id);

        $this->autenticarComo($ana);
        $this->getJson('/api/favoritos')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.tipo', 'video');

        $this->autenticarComo($bruno);
        $this->getJson('/api/favoritos')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_a_lista_mistura_os_tipos_e_mostra_o_mais_recente_primeiro(): void
    {
        $autor = $this->criarPsicologo();
        $video = $this->criarVideo($autor);
        $artigo = $this->criarConteudo('artigos', $autor);
        $ana = $this->criarUsuario();

        Favorito::create([
            'usuario_id' => $ana->id, 'favoritavel_id' => $video->id,
            'favoritavel_type' => Video::class, 'data_criacao' => now()->subDays(2),
        ]);
        Favorito::create([
            'usuario_id' => $ana->id, 'favoritavel_id' => $artigo->id,
            'favoritavel_type' => Artigo::class, 'data_criacao' => now()->subHour(),
        ]);

        $this->autenticarComo($ana);

        $this->getJson('/api/favoritos')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.tipo', 'artigo')
            ->assertJsonPath('data.1.tipo', 'video');
    }

    public function test_a_flag_favoritado_e_o_contador_do_conteudo_sao_por_usuario(): void
    {
        $video = $this->criarVideo($this->criarPsicologo());
        $ana = $this->criarUsuario();
        $bruno = $this->criarUsuario();
        $carla = $this->criarUsuario();

        $this->autenticarComo($ana);
        $this->favoritar('video', $video->id);
        $this->autenticarComo($bruno);
        $this->favoritar('video', $video->id);

        $this->autenticarComo($ana);
        $this->getJson('/api/videos')
            ->assertJsonPath('data.0.favoritado', true)
            ->assertJsonPath('data.0.quantidade_favoritos', 2);

        $this->autenticarComo($carla);
        $this->getJson('/api/videos')
            ->assertJsonPath('data.0.favoritado', false)
            ->assertJsonPath('data.0.quantidade_favoritos', 2);
    }

    public function test_excluir_a_conta_apaga_os_favoritos_da_pessoa(): void
    {
        $video = $this->criarVideo($this->criarPsicologo());
        $ana = $this->criarUsuario();
        $bruno = $this->criarUsuario();

        $this->autenticarComo($ana);
        $this->favoritar('video', $video->id);
        $this->autenticarComo($bruno);
        $this->favoritar('video', $video->id);

        $ana->delete();

        $this->assertDatabaseCount('favoritos', 1);
        $this->assertDatabaseHas('favoritos', ['usuario_id' => $bruno->id]);
    }

    // =====================================================================
    // REMOVER PELO ID DO FAVORITO
    // =====================================================================

    public function test_dono_remove_o_proprio_favorito_e_outro_usuario_nao_remove(): void
    {
        $video = $this->criarVideo($this->criarPsicologo());
        $ana = $this->criarUsuario();

        $this->autenticarComo($ana);
        $this->favoritar('video', $video->id);
        $favorito = Favorito::firstOrFail();

        $this->autenticarComo($this->criarUsuario());
        $this->deleteJson("/api/favoritos/{$favorito->id}")->assertForbidden();
        $this->assertDatabaseHas('favoritos', ['id' => $favorito->id]);

        $this->autenticarComo($ana);
        $this->deleteJson("/api/favoritos/{$favorito->id}")->assertOk();
        $this->assertDatabaseMissing('favoritos', ['id' => $favorito->id]);
    }

    public function test_remover_favorito_inexistente_retorna_404(): void
    {
        $this->autenticarComo($this->criarUsuario());

        $this->deleteJson('/api/favoritos/999999')->assertNotFound();
    }
}
