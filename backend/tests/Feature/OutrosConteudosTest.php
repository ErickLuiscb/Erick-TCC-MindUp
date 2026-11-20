<?php

namespace Tests\Feature;

use App\Models\Artigo;
use App\Models\Autoajuda;
use App\Models\Sugestao;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\ApiTestCase;

/**
 * Artigos, sugestões e autoajuda: as regras de acesso são as mesmas dos vídeos
 * (VideosTest), então aqui elas são conferidas para os três de uma vez, e depois
 * cada tipo ganha os testes das suas particularidades.
 */
class OutrosConteudosTest extends ApiTestCase
{
    /** coleção da rota => coluna que guarda o arquivo no disco */
    private const ARQUIVO = [
        'artigos' => 'arquivo_pdf',
        'sugestoes' => 'capa',
        'autoajudas' => 'midia',
    ];

    public static function tipos(): array
    {
        return [
            'artigos' => ['artigos'],
            'sugestoes' => ['sugestoes'],
            'autoajudas' => ['autoajudas'],
        ];
    }

    public static function tiposComVideo(): array
    {
        return ['videos' => ['videos']] + self::tipos();
    }

    private function publicador(array $atributos = [])
    {
        return $this->criarPsicologo('aprovado', $atributos);
    }

    // =====================================================================
    // REGRAS COMUNS AOS TRÊS TIPOS
    // =====================================================================

    #[DataProvider('tipos')]
    public function test_listar_e_ver_exigem_login(string $tipo): void
    {
        $item = $this->criarConteudo($tipo, $this->publicador());

        $this->getJson("/api/{$tipo}")->assertUnauthorized();
        $this->getJson("/api/{$tipo}/{$item->id}")->assertUnauthorized();
    }

    #[DataProvider('tipos')]
    public function test_usuario_comum_lista_e_ve_mas_nao_publica_nem_ve_o_dashboard(string $tipo): void
    {
        $item = $this->criarConteudo($tipo, $this->publicador(), ['titulo' => 'Conteúdo X']);
        $this->autenticarComo($this->criarUsuario(), []);

        $this->getJson("/api/{$tipo}")->assertOk()->assertJsonCount(1, 'data');
        $this->getJson("/api/{$tipo}/{$item->id}")->assertOk()->assertJsonPath('data.titulo', 'Conteúdo X');
        $this->getJson("/api/{$tipo}/999999")->assertNotFound();

        $this->postJson("/api/{$tipo}", ['titulo' => 'X'])->assertForbidden();
        $this->getJson("/api/dashboard/{$tipo}")->assertForbidden();
    }

    #[DataProvider('tipos')]
    public function test_autor_aparece_sem_expor_o_email(string $tipo): void
    {
        $autor = $this->publicador([
            'nome' => 'Dra. Ana', 'email' => 'dra.ana@privado.com', 'crp' => '54321', 'crp_regiao' => 7,
        ]);
        $this->criarConteudo($tipo, $autor);
        $this->autenticarComo($this->criarUsuario());

        $resposta = $this->getJson("/api/{$tipo}")
            ->assertOk()
            ->assertJsonPath('data.0.autor.nome', 'Dra. Ana')
            ->assertJsonPath('data.0.autor.crp', '07/54321')
            ->assertJsonMissingPath('data.0.autor.email')
            ->assertJsonMissingPath('data.0.autor.cpf');

        $this->assertStringNotContainsString('dra.ana@privado.com', $resposta->getContent());
    }

    #[DataProvider('tipos')]
    public function test_listagem_mostra_o_mais_novo_primeiro_e_filtra_por_categoria(string $tipo): void
    {
        $autor = $this->publicador();
        $ansiedade = $this->criarCategoria('Ansiedade');
        $sono = $this->criarCategoria('Sono');

        $this->criarConteudo($tipo, $autor, ['titulo' => 'Antigo', 'created_at' => now()->subDays(3)])
            ->categorias()->attach($ansiedade->id);
        $this->criarConteudo($tipo, $autor, ['titulo' => 'Novo', 'created_at' => now()->subHour()])
            ->categorias()->attach($sono->id);
        $this->autenticarComo($this->criarUsuario());

        $this->getJson("/api/{$tipo}")
            ->assertJsonPath('data.0.titulo', 'Novo')
            ->assertJsonPath('data.1.titulo', 'Antigo');

        $this->getJson("/api/{$tipo}?categoria={$ansiedade->id}")
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.titulo', 'Antigo');
    }

    #[DataProvider('tipos')]
    public function test_dashboard_lista_somente_o_que_e_do_proprio_publicador(string $tipo): void
    {
        $eu = $this->publicador();
        $this->criarConteudo($tipo, $eu, ['titulo' => 'Meu']);
        $this->criarConteudo($tipo, $this->publicador(), ['titulo' => 'De outro']);
        $this->autenticarComo($eu, ['publicador']);

        $this->getJson("/api/dashboard/{$tipo}")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.titulo', 'Meu');
    }

    #[DataProvider('tipos')]
    public function test_dono_edita_o_proprio_conteudo_e_o_admin_edita_qualquer_um(string $tipo): void
    {
        $dono = $this->publicador();
        $item = $this->criarConteudo($tipo, $dono, ['titulo' => 'Antigo']);

        $this->autenticarComo($dono, ['publicador']);
        $this->putJson("/api/{$tipo}/{$item->id}", ['titulo' => 'Do dono'])->assertOk();
        $this->assertSame('Do dono', $item->fresh()->titulo);

        $this->autenticarComo($this->criarAdmin(), ['admin']);
        $this->putJson("/api/{$tipo}/{$item->id}", ['titulo' => 'Moderado'])->assertOk();
        $this->assertSame('Moderado', $item->fresh()->titulo);
    }

    #[DataProvider('tipos')]
    public function test_outro_publicador_e_o_dono_revogado_nao_editam_nem_apagam(string $tipo): void
    {
        $dono = $this->publicador();
        $item = $this->criarConteudo($tipo, $dono, ['titulo' => 'Do dono']);

        // Outro psicólogo aprovado
        $this->autenticarComo($this->publicador(), ['publicador']);
        $this->putJson("/api/{$tipo}/{$item->id}", ['titulo' => 'Invadido'])->assertForbidden();
        $this->deleteJson("/api/{$tipo}/{$item->id}")->assertForbidden();

        // O próprio dono depois de revogado (token novo sem a ability)
        $this->autenticarComo($dono, []);
        $this->putJson("/api/{$tipo}/{$item->id}", ['titulo' => 'Editado'])->assertForbidden();
        $this->deleteJson("/api/{$tipo}/{$item->id}")->assertForbidden();

        $this->assertSame('Do dono', $item->fresh()->titulo);
    }

    #[DataProvider('tipos')]
    public function test_apagar_remove_o_registro_e_o_arquivo_do_disco(string $tipo): void
    {
        $coluna = self::ARQUIVO[$tipo];
        Storage::disk('public')->put("{$tipo}/arquivo.bin", 'conteudo');
        $dono = $this->publicador();
        $item = $this->criarConteudo($tipo, $dono, [$coluna => "{$tipo}/arquivo.bin"]);
        $this->autenticarComo($dono, ['publicador']);

        $this->deleteJson("/api/{$tipo}/{$item->id}")->assertOk();

        $this->assertDatabaseMissing($item->getTable(), ['id' => $item->id]);
        Storage::disk('public')->assertMissing("{$tipo}/arquivo.bin");
    }

    #[DataProvider('tipos')]
    public function test_apagar_conteudo_inexistente_retorna_404(string $tipo): void
    {
        $this->autenticarComo($this->publicador(), ['publicador']);

        $this->deleteJson("/api/{$tipo}/999999")->assertNotFound();
    }

    #[DataProvider('tiposComVideo')]
    public function test_a_descricao_tem_o_mesmo_limite_na_criacao_e_na_edicao(string $tipo): void
    {
        $dono = $this->publicador();
        $item = $this->criarConteudo($tipo, $dono);
        $this->autenticarComo($dono, ['publicador']);

        // Se a criação recusa descrições gigantes, a edição não pode ser um atalho para burlar
        $this->putJson("/api/{$tipo}/{$item->id}", ['descricao' => str_repeat('a', 5001)])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('descricao');

        $this->putJson("/api/{$tipo}/{$item->id}", ['descricao' => str_repeat('a', 5000)])->assertOk();
    }

    // =====================================================================
    // ARTIGOS (PDF)
    // =====================================================================

    public function test_publicador_cria_artigo_com_pdf_e_categorias(): void
    {
        $autor = $this->autenticarComo($this->publicador(['nome' => 'Dra. Ana']), ['publicador']);
        $categoria = $this->criarCategoria('Sono');

        $this->postJson('/api/artigos', [
            'titulo' => 'Guia de sono',
            'descricao' => 'Dicas',
            'arquivo_pdf' => UploadedFile::fake()->create('guia.pdf', 200, 'application/pdf'),
            'categorias' => [$categoria->id],
        ])
            ->assertCreated()
            ->assertJsonPath('data.titulo', 'Guia de sono')
            ->assertJsonPath('data.autor.nome', 'Dra. Ana')
            ->assertJsonMissingPath('data.autor.email');

        $artigo = Artigo::firstOrFail();
        $this->assertSame($autor->id, (int) $artigo->autor_id);
        $this->assertSame([$categoria->id], $artigo->categorias->pluck('id')->all());
        $this->assertCount(1, Storage::disk('public')->allFiles('artigos'));
    }

    public function test_artigo_exige_titulo_e_pdf_e_recusa_outros_formatos(): void
    {
        $this->autenticarComo($this->publicador(), ['publicador']);

        $this->postJson('/api/artigos', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['titulo', 'arquivo_pdf']);

        $this->postJson('/api/artigos', [
            'titulo' => 'X',
            'arquivo_pdf' => UploadedFile::fake()->create('foto.png', 10, 'image/png'),
        ])->assertJsonValidationErrors('arquivo_pdf');

        $this->postJson('/api/artigos', [
            'titulo' => str_repeat('a', 151),
            'arquivo_pdf' => UploadedFile::fake()->create('guia.pdf', 10, 'application/pdf'),
        ])->assertJsonValidationErrors('titulo');

        $this->assertSame(0, Artigo::count());
        $this->assertCount(0, Storage::disk('public')->allFiles('artigos'));
    }

    public function test_trocar_o_pdf_apaga_o_antigo_do_disco(): void
    {
        Storage::disk('public')->put('artigos/antigo.pdf', 'conteudo');
        $dono = $this->publicador();
        $artigo = $this->criarConteudo('artigos', $dono, ['arquivo_pdf' => 'artigos/antigo.pdf']);
        $this->autenticarComo($dono, ['publicador']);

        $this->putJson("/api/artigos/{$artigo->id}", [
            'arquivo_pdf' => UploadedFile::fake()->create('novo.pdf', 100, 'application/pdf'),
        ])->assertOk();

        Storage::disk('public')->assertMissing('artigos/antigo.pdf');
        Storage::disk('public')->assertExists($artigo->fresh()->arquivo_pdf);
    }

    // =====================================================================
    // SUGESTÕES (livro, filme, série...)
    // =====================================================================

    public function test_publicador_cria_sugestao_com_link_e_tipo(): void
    {
        $autor = $this->autenticarComo($this->publicador(), ['publicador']);

        $this->postJson('/api/sugestoes', [
            'tipo' => 'filme',
            'titulo' => 'Divertida Mente',
            'link_externo' => 'https://exemplo.com/filme',
        ])
            ->assertCreated()
            ->assertJsonPath('data.titulo', 'Divertida Mente')
            ->assertJsonMissingPath('data.autor.email');

        $sugestao = Sugestao::firstOrFail();
        $this->assertSame($autor->id, (int) $sugestao->autor_id);
        $this->assertSame('filme', $sugestao->tipo);
    }

    public function test_publicador_cria_sugestao_com_capa(): void
    {
        $this->autenticarComo($this->publicador(), ['publicador']);

        $this->postJson('/api/sugestoes', [
            'tipo' => 'livro',
            'titulo' => 'Com capa',
            'capa' => UploadedFile::fake()->create('capa.png', 100, 'image/png'),
        ])->assertCreated();

        $this->assertCount(1, Storage::disk('public')->allFiles('sugestoes'));
    }

    public function test_validacoes_da_sugestao(): void
    {
        $this->autenticarComo($this->publicador(), ['publicador']);

        $this->postJson('/api/sugestoes', [])->assertUnprocessable()->assertJsonValidationErrors(['titulo', 'tipo']);
        // Sem o tipo o banco recusaria (coluna obrigatória): tem que ser 422, nunca erro 500
        $this->postJson('/api/sugestoes', ['titulo' => 'X'])->assertUnprocessable()->assertJsonValidationErrors('tipo');
        $this->postJson('/api/sugestoes', ['titulo' => 'X', 'tipo' => 'jogo'])->assertJsonValidationErrors('tipo');
        $this->postJson('/api/sugestoes', ['titulo' => 'X', 'link_externo' => 'isso-nao-e-link'])->assertJsonValidationErrors('link_externo');
        $this->postJson('/api/sugestoes', [
            'titulo' => 'X',
            'capa' => UploadedFile::fake()->create('doc.pdf', 10, 'application/pdf'),
        ])->assertJsonValidationErrors('capa');

        $this->assertSame(0, Sugestao::count());
    }

    public function test_aceita_todos_os_tipos_de_sugestao(): void
    {
        $this->autenticarComo($this->publicador(), ['publicador']);

        foreach (['livro', 'filme', 'serie', 'anime', 'musica', 'podcast', 'documentario'] as $tipo) {
            $this->postJson('/api/sugestoes', ['titulo' => "Sobre {$tipo}", 'tipo' => $tipo])->assertCreated();
        }

        $this->assertSame(7, Sugestao::count());
    }

    public function test_sugestoes_filtram_por_tipo_e_buscam_pelo_titulo_sem_diferenciar_maiusculas(): void
    {
        $autor = $this->publicador();
        $this->criarConteudo('sugestoes', $autor, ['titulo' => 'Mindfulness na prática', 'tipo' => 'livro']);
        $this->criarConteudo('sugestoes', $autor, ['titulo' => 'Resiliencia em foco', 'tipo' => 'filme']);
        $this->autenticarComo($this->criarUsuario());

        $this->getJson('/api/sugestoes?tipo=filme')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.titulo', 'Resiliencia em foco');

        $this->getJson('/api/sugestoes?busca=MINDFUL')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.titulo', 'Mindfulness na prática');

        $this->getJson('/api/sugestoes?busca=nao-existe')->assertJsonCount(0, 'data');
    }

    // =====================================================================
    // AUTOAJUDA (imagem ou vídeo)
    // =====================================================================

    public function test_publicador_cria_autoajuda_de_imagem_e_de_video(): void
    {
        $autor = $this->autenticarComo($this->publicador(), ['publicador']);

        $this->postJson('/api/autoajudas', [
            'titulo' => 'Mapa de respiração',
            'tipo_midia' => 'imagem',
            'midia' => UploadedFile::fake()->create('mapa.png', 100, 'image/png'),
        ])->assertCreated()->assertJsonMissingPath('data.autor.email');

        $this->postJson('/api/autoajudas', [
            'titulo' => 'Exercício guiado',
            'tipo_midia' => 'video',
            'midia' => UploadedFile::fake()->create('exercicio.mp4', 500, 'video/mp4'),
        ])->assertCreated();

        $this->assertSame(2, Autoajuda::where('autor_id', $autor->id)->count());
        $this->assertCount(2, Storage::disk('public')->allFiles('autoajuda'));
    }

    public function test_autoajuda_aceita_extensao_em_maiuscula(): void
    {
        $this->autenticarComo($this->publicador(), ['publicador']);

        $this->postJson('/api/autoajudas', [
            'titulo' => 'Foto do celular',
            'tipo_midia' => 'imagem',
            'midia' => UploadedFile::fake()->create('FOTO.PNG', 100, 'image/png'),
        ])->assertCreated();
    }

    public function test_autoajuda_exige_titulo_tipo_e_midia(): void
    {
        $this->autenticarComo($this->publicador(), ['publicador']);

        $this->postJson('/api/autoajudas', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['titulo', 'tipo_midia', 'midia']);

        $this->postJson('/api/autoajudas', [
            'titulo' => 'X',
            'tipo_midia' => 'audio',
            'midia' => UploadedFile::fake()->create('a.mp4', 10, 'video/mp4'),
        ])->assertJsonValidationErrors('tipo_midia');

        $this->assertSame(0, Autoajuda::count());
    }

    public function test_autoajuda_recusa_midia_incompativel_com_o_tipo_escolhido(): void
    {
        $this->autenticarComo($this->publicador(), ['publicador']);

        // Disse "imagem", mandou vídeo
        $this->postJson('/api/autoajudas', [
            'titulo' => 'X', 'tipo_midia' => 'imagem',
            'midia' => UploadedFile::fake()->create('video.mp4', 100, 'video/mp4'),
        ])->assertUnprocessable()->assertJsonValidationErrors('midia');

        // Disse "vídeo", mandou imagem
        $this->postJson('/api/autoajudas', [
            'titulo' => 'X', 'tipo_midia' => 'video',
            'midia' => UploadedFile::fake()->create('foto.png', 100, 'image/png'),
        ])->assertUnprocessable()->assertJsonValidationErrors('midia');

        // Extensão perigosa disfarçada de imagem
        $this->postJson('/api/autoajudas', [
            'titulo' => 'X', 'tipo_midia' => 'imagem',
            'midia' => UploadedFile::fake()->create('script.php', 1, 'image/png'),
        ])->assertUnprocessable()->assertJsonValidationErrors('midia');

        $this->assertSame(0, Autoajuda::count());
        $this->assertCount(0, Storage::disk('public')->allFiles('autoajuda'));
    }

    public function test_autoajuda_filtra_por_tipo_de_midia(): void
    {
        $autor = $this->publicador();
        $this->criarConteudo('autoajudas', $autor, ['titulo' => 'Imagem', 'tipo_midia' => 'imagem']);
        $this->criarConteudo('autoajudas', $autor, ['titulo' => 'Vídeo', 'tipo_midia' => 'video', 'midia' => 'autoajuda/v.mp4']);
        $this->autenticarComo($this->criarUsuario());

        $this->getJson('/api/autoajudas?tipo_midia=video')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.titulo', 'Vídeo');
    }

    public function test_trocar_a_midia_apaga_a_antiga_e_valida_com_o_tipo_que_ja_estava_salvo(): void
    {
        Storage::disk('public')->put('autoajuda/antiga.png', 'conteudo');
        $dono = $this->publicador();
        $item = $this->criarConteudo('autoajudas', $dono, ['tipo_midia' => 'imagem', 'midia' => 'autoajuda/antiga.png']);
        $this->autenticarComo($dono, ['publicador']);

        // O item é "imagem": mandar um vídeo sem avisar que o tipo mudou é recusado
        $this->putJson("/api/autoajudas/{$item->id}", [
            'midia' => UploadedFile::fake()->create('video.mp4', 100, 'video/mp4'),
        ])->assertUnprocessable()->assertJsonValidationErrors('midia');
        Storage::disk('public')->assertExists('autoajuda/antiga.png');

        // Trocar por outra imagem funciona e remove a antiga
        $this->putJson("/api/autoajudas/{$item->id}", [
            'midia' => UploadedFile::fake()->create('nova.jpg', 100, 'image/jpeg'),
        ])->assertOk();
        Storage::disk('public')->assertMissing('autoajuda/antiga.png');
        Storage::disk('public')->assertExists($item->fresh()->midia);
    }

    public function test_mudar_o_tipo_de_midia_junto_com_o_novo_arquivo_funciona(): void
    {
        $dono = $this->publicador();
        $item = $this->criarConteudo('autoajudas', $dono, ['tipo_midia' => 'imagem']);
        $this->autenticarComo($dono, ['publicador']);

        $this->putJson("/api/autoajudas/{$item->id}", [
            'tipo_midia' => 'video',
            'midia' => UploadedFile::fake()->create('novo.mp4', 100, 'video/mp4'),
        ])->assertOk();

        $this->assertSame('video', $item->fresh()->tipo_midia);
    }

    public function test_nao_da_para_mudar_o_tipo_de_midia_sem_enviar_o_novo_arquivo(): void
    {
        // Senão o registro fica incoerente: tipo "vídeo" apontando para um arquivo de imagem
        $dono = $this->publicador();
        $item = $this->criarConteudo('autoajudas', $dono, ['tipo_midia' => 'imagem', 'midia' => 'autoajuda/foto.png']);
        $this->autenticarComo($dono, ['publicador']);

        $this->putJson("/api/autoajudas/{$item->id}", ['tipo_midia' => 'video'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('midia');

        $this->assertSame('imagem', $item->fresh()->tipo_midia);
    }

    public function test_repetir_o_mesmo_tipo_de_midia_sem_arquivo_e_permitido(): void
    {
        $dono = $this->publicador();
        $item = $this->criarConteudo('autoajudas', $dono, ['tipo_midia' => 'imagem']);
        $this->autenticarComo($dono, ['publicador']);

        $this->putJson("/api/autoajudas/{$item->id}", ['tipo_midia' => 'imagem', 'titulo' => 'Novo título'])->assertOk();
    }
}
