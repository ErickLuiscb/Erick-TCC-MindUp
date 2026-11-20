<?php

namespace Tests\Feature;

use App\Models\Favorito;
use App\Models\Video;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\ApiTestCase;

/**
 * O que acontece com os FAVORITOS quando o psicólogo apaga um conteúdo.
 *
 * A tabela "favoritos" é polimórfica, então o banco não apaga em cascata.
 * Se o favorito sobrar apontando para um conteúdo que não existe mais,
 * /favoritos e principalmente /bootstrap (a carga inicial do app inteiro)
 * quebram para todo mundo que tinha favoritado aquele conteúdo.
 */
class ConteudoApagadoTest extends ApiTestCase
{
    public static function tipos(): array
    {
        return [
            'video' => ['video', 'videos'],
            'artigo' => ['artigo', 'artigos'],
            'sugestao' => ['sugestao', 'sugestoes'],
            'autoajuda' => ['autoajuda', 'autoajudas'],
        ];
    }

    private function favoritar($usuario, string $tipo, int $id): void
    {
        $this->autenticarComo($usuario);
        $this->postJson('/api/favoritos', ['tipo' => $tipo, 'favoritavel_id' => $id])->assertCreated();
    }

    #[DataProvider('tipos')]
    public function test_apagar_um_conteudo_apaga_os_favoritos_dele(string $tipo, string $colecao): void
    {
        $autor = $this->criarPsicologo();
        $item = $this->criarConteudo($colecao, $autor);
        $outro = $this->criarConteudo($colecao, $autor, ['titulo' => 'Outro']);
        $ana = $this->criarUsuario();
        $bruno = $this->criarUsuario();

        $this->favoritar($ana, $tipo, $item->id);
        $this->favoritar($bruno, $tipo, $item->id);
        $this->favoritar($ana, $tipo, $outro->id);
        $this->assertDatabaseCount('favoritos', 3);

        $this->autenticarComo($autor, ['publicador']);
        $this->deleteJson("/api/{$colecao}/{$item->id}")->assertOk();

        // Só sobra o favorito do conteúdo que continua existindo
        $this->assertDatabaseCount('favoritos', 1);
        $this->assertDatabaseHas('favoritos', ['favoritavel_id' => $outro->id, 'usuario_id' => $ana->id]);
    }

    public function test_favoritos_e_bootstrap_continuam_funcionando_depois_que_o_conteudo_e_apagado(): void
    {
        $autor = $this->criarPsicologo();
        $apagado = $this->criarVideo($autor, ['titulo' => 'Vai ser apagado']);
        $fica = $this->criarVideo($autor, ['titulo' => 'Continua']);
        $ana = $this->criarUsuario();

        $this->favoritar($ana, 'video', $apagado->id);
        $this->favoritar($ana, 'video', $fica->id);

        $this->autenticarComo($autor, ['publicador']);
        $this->deleteJson("/api/videos/{$apagado->id}")->assertOk();

        $this->autenticarComo($ana);
        $this->getJson('/api/favoritos')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/bootstrap')->assertOk()->assertJsonCount(1, 'favoritos');
    }

    public function test_favorito_orfao_que_ja_existe_no_banco_nao_quebra_as_listagens(): void
    {
        // Situação real de quem já tinha conteúdo apagado ANTES da correção:
        // um favorito apontando para um vídeo que não existe mais.
        $autor = $this->criarPsicologo();
        $existe = $this->criarVideo($autor, ['titulo' => 'Existe']);
        $ana = $this->criarUsuario();

        $this->favoritar($ana, 'video', $existe->id);
        Favorito::create([
            'usuario_id' => $ana->id,
            'favoritavel_type' => Video::class,
            'favoritavel_id' => 999999,
            'data_criacao' => now(),
        ]);

        $this->autenticarComo($ana);
        $this->getJson('/api/favoritos')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/bootstrap')->assertOk()->assertJsonCount(1, 'favoritos');
    }
}
