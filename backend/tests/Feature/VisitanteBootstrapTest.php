<?php

namespace Tests\Feature;

use App\Models\Favorito;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\ApiTestCase;

/**
 * Duas telas de "carga": a prévia pública do visitante (/visitante/conteudos)
 * e a carga inicial de quem faz login (/bootstrap), que traz o app inteiro de uma vez.
 */
class VisitanteBootstrapTest extends ApiTestCase
{
    private const TIPOS = ['videos', 'artigos', 'sugestoes', 'autoajudas'];

    // =====================================================================
    // VISITANTE (rota pública)
    // =====================================================================

    public function test_visitante_acessa_sem_login_e_ve_no_maximo_3_de_cada_tipo_do_mais_novo_ao_mais_antigo(): void
    {
        $autor = $this->criarPsicologo();
        foreach (range(0, 4) as $i) {
            $this->criarVideo($autor, ['titulo' => "Vídeo {$i}", 'created_at' => now()->subDays($i)]);
        }

        $resposta = $this->getJson('/api/visitante/conteudos')
            ->assertOk()
            ->assertJsonStructure(['data' => ['videos', 'artigos', 'sugestoes', 'autoajudas']])
            ->assertJsonCount(3, 'data.videos');

        $this->assertSame(['Vídeo 0', 'Vídeo 1', 'Vídeo 2'], array_column($resposta->json('data.videos'), 'titulo'));
    }

    public function test_cada_tipo_vem_com_os_campos_que_a_tela_do_visitante_usa(): void
    {
        $autor = $this->criarPsicologo();
        $categoria = $this->criarCategoria('Ansiedade');
        foreach (self::TIPOS as $tipo) {
            $this->criarConteudo($tipo, $autor, ['titulo' => "Item {$tipo}"])->categorias()->attach($categoria->id);
        }

        $dados = $this->getJson('/api/visitante/conteudos')->assertOk()->json('data');

        foreach (self::TIPOS as $tipo) {
            $item = $dados[$tipo][0];
            $this->assertSame("Item {$tipo}", $item['titulo']);
            $this->assertArrayHasKey('id', $item);
            $this->assertArrayHasKey('descricao', $item);
            $this->assertArrayHasKey('created_at', $item);
            $this->assertSame([['id' => $categoria->id, 'nome' => 'Ansiedade']], $item['categorias']);
        }

        $this->assertArrayHasKey('arquivo', $dados['videos'][0]);
        $this->assertArrayHasKey('arquivo_pdf', $dados['artigos'][0]);
        $this->assertArrayHasKey('tipo', $dados['sugestoes'][0]);
        $this->assertArrayHasKey('link_externo', $dados['sugestoes'][0]);
        $this->assertArrayHasKey('tipo_midia', $dados['autoajudas'][0]);
        $this->assertArrayHasKey('midia', $dados['autoajudas'][0]);
    }

    public function test_visitante_nao_recebe_nenhum_dado_do_psicologo_nem_de_favoritos(): void
    {
        $autor = $this->criarPsicologo('aprovado', ['nome' => 'Dra. Sigilosa', 'email' => 'sigilo@privado.com', 'crp' => '98765']);
        foreach (self::TIPOS as $tipo) {
            $this->criarConteudo($tipo, $autor);
        }

        $resposta = $this->getJson('/api/visitante/conteudos')->assertOk();

        foreach (self::TIPOS as $tipo) {
            $resposta->assertJsonMissingPath("data.{$tipo}.0.autor");
            $resposta->assertJsonMissingPath("data.{$tipo}.0.favoritado");
            $resposta->assertJsonMissingPath("data.{$tipo}.0.quantidade_favoritos");
        }

        $conteudo = $resposta->getContent();
        foreach (['Dra. Sigilosa', 'sigilo@privado.com', '98765'] as $segredo) {
            $this->assertStringNotContainsString($segredo, $conteudo);
        }
    }

    public function test_visitante_sem_conteudo_recebe_listas_vazias(): void
    {
        $this->getJson('/api/visitante/conteudos')
            ->assertOk()
            ->assertJsonPath('data.videos', [])
            ->assertJsonPath('data.artigos', [])
            ->assertJsonPath('data.sugestoes', [])
            ->assertJsonPath('data.autoajudas', []);
    }

    public function test_a_previa_do_visitante_fica_em_cache_por_alguns_minutos(): void
    {
        $autor = $this->criarPsicologo();
        $this->criarVideo($autor, ['titulo' => 'Primeiro']);

        $this->getJson('/api/visitante/conteudos')->assertJsonCount(1, 'data.videos');

        // Publicado logo depois: o visitante ainda recebe a versão guardada...
        $this->criarVideo($autor, ['titulo' => 'Segundo']);
        $this->getJson('/api/visitante/conteudos')->assertJsonCount(1, 'data.videos');

        // ...até o cache vencer (aqui simulado limpando a chave)
        Cache::forget('visitante:conteudos');
        $this->getJson('/api/visitante/conteudos')->assertJsonCount(2, 'data.videos');
    }

    // =====================================================================
    // BOOTSTRAP (carga inicial depois do login)
    // =====================================================================

    public function test_bootstrap_exige_login(): void
    {
        $this->getJson('/api/bootstrap')->assertUnauthorized();
    }

    public static function perfis(): array
    {
        return [
            'usuario comum' => ['comum'],
            'psicologo aprovado' => ['psicologo'],
            'psicologo pendente' => ['pendente'],
            'administrador' => ['admin'],
        ];
    }

    #[DataProvider('perfis')]
    public function test_bootstrap_funciona_para_todos_os_perfis(string $perfil): void
    {
        $this->criarCategoria('Ansiedade');
        $this->criarVideo($this->criarPsicologo());

        match ($perfil) {
            'comum' => $this->autenticarComo($this->criarUsuario(), []),
            'psicologo' => $this->autenticarComo($this->criarPsicologo('aprovado'), ['publicador']),
            'pendente' => $this->autenticarComo($this->criarPsicologo('pendente'), []),
            'admin' => $this->autenticarComo($this->criarAdmin(), ['admin']),
        };

        $this->getJson('/api/bootstrap')
            ->assertOk()
            ->assertJsonStructure(['categorias', 'videos', 'artigos', 'sugestoes', 'autoajudas', 'favoritos'])
            ->assertJsonCount(1, 'videos');
    }

    public function test_bootstrap_entrega_tudo_numa_chamada_so_com_categorias_em_ordem_alfabetica(): void
    {
        $autor = $this->criarPsicologo();
        $this->criarCategoria('Sono');
        $this->criarCategoria('Ansiedade');
        foreach (self::TIPOS as $tipo) {
            $this->criarConteudo($tipo, $autor);
        }
        $this->autenticarComo($this->criarUsuario());

        $resposta = $this->getJson('/api/bootstrap')
            ->assertOk()
            ->assertJsonCount(2, 'categorias')
            ->assertJsonCount(1, 'videos')
            ->assertJsonCount(1, 'artigos')
            ->assertJsonCount(1, 'sugestoes')
            ->assertJsonCount(1, 'autoajudas')
            ->assertJsonCount(0, 'favoritos');

        $this->assertSame(['Ansiedade', 'Sono'], array_column($resposta->json('categorias'), 'nome'));
    }

    public function test_bootstrap_traz_o_mais_novo_primeiro(): void
    {
        $autor = $this->criarPsicologo();
        $this->criarVideo($autor, ['titulo' => 'Antigo', 'created_at' => now()->subDays(3)]);
        $this->criarVideo($autor, ['titulo' => 'Novo', 'created_at' => now()->subHour()]);
        $this->autenticarComo($this->criarUsuario());

        $this->getJson('/api/bootstrap')
            ->assertJsonPath('videos.0.titulo', 'Novo')
            ->assertJsonPath('videos.1.titulo', 'Antigo');
    }

    public function test_bootstrap_traz_so_os_favoritos_de_quem_esta_logado_com_a_flag_correta(): void
    {
        $video = $this->criarVideo($this->criarPsicologo());
        $ana = $this->criarUsuario();
        $bruno = $this->criarUsuario();

        $this->autenticarComo($ana);
        $this->postJson('/api/favoritos', ['tipo' => 'video', 'favoritavel_id' => $video->id])->assertCreated();
        $this->getJson('/api/bootstrap')
            ->assertJsonCount(1, 'favoritos')
            ->assertJsonPath('videos.0.favoritado', true)
            ->assertJsonPath('videos.0.quantidade_favoritos', 1);

        $this->autenticarComo($bruno);
        $this->getJson('/api/bootstrap')
            ->assertJsonCount(0, 'favoritos')
            ->assertJsonPath('videos.0.favoritado', false)
            ->assertJsonPath('videos.0.quantidade_favoritos', 1);
    }

    public function test_bootstrap_mostra_o_autor_sem_vazar_email_nem_cpf(): void
    {
        $autor = $this->criarPsicologo('pendente', ['nome' => 'Dra. Ana', 'email' => 'sigilo@privado.com', 'crp' => '54321', 'crp_regiao' => 7]);
        foreach (self::TIPOS as $tipo) {
            $this->criarConteudo($tipo, $autor);
        }
        $this->autenticarComo($this->criarUsuario());

        $resposta = $this->getJson('/api/bootstrap')
            ->assertOk()
            ->assertJsonPath('videos.0.autor.nome', 'Dra. Ana')
            ->assertJsonPath('videos.0.autor.crp', '07/54321')
            ->assertJsonMissingPath('videos.0.autor.email');

        $conteudo = $resposta->getContent();
        $this->assertStringNotContainsString('sigilo@privado.com', $conteudo);
        $this->assertStringNotContainsString('52998224725', $conteudo);
    }

    // =====================================================================
    // DESEMPENHO: o número de consultas ao banco não pode crescer com o conteúdo
    // =====================================================================

    private function popular(int $porTipo, User $autor, User $leitor): void
    {
        $categoria = $this->criarCategoria('Cat ' . uniqid());

        foreach (self::TIPOS as $tipo) {
            for ($i = 0; $i < $porTipo; $i++) {
                $item = $this->criarConteudo($tipo, $autor, ['titulo' => "{$tipo} {$i} " . uniqid()]);
                $item->categorias()->attach($categoria->id);

                // metade dos itens é favoritada pelo leitor
                if ($i % 2 === 0) {
                    Favorito::create([
                        'usuario_id' => $leitor->id,
                        'favoritavel_id' => $item->id,
                        'favoritavel_type' => $item::class,
                        'data_criacao' => now(),
                    ]);
                }
            }
        }
    }

    private function consultasDoBootstrap(): int
    {
        DB::flushQueryLog();
        DB::enableQueryLog();

        $this->getJson('/api/bootstrap')->assertOk();

        $total = count(DB::getQueryLog());
        DB::disableQueryLog();

        return $total;
    }

    public function test_o_bootstrap_nao_faz_mais_consultas_quando_ha_mais_conteudo(): void
    {
        $autor = $this->criarPsicologo();
        $leitor = $this->autenticarComo($this->criarUsuario());

        $this->popular(2, $autor, $leitor);
        $poucos = $this->consultasDoBootstrap();

        $this->popular(10, $autor, $leitor);
        $muitos = $this->consultasDoBootstrap();

        // Se isto falhar, alguma relação deixou de ser carregada de uma vez (problema "N+1"):
        // cada item novo passaria a custar consultas extras ao banco, e com o banco
        // remoto (Supabase) isso vira lentidão e timeout.
        $this->assertSame($poucos, $muitos, "Com mais conteúdo o /bootstrap passou de {$poucos} para {$muitos} consultas.");
        $this->assertLessThan(60, $muitos, "O /bootstrap está fazendo {$muitos} consultas ao banco.");
    }
}
