<?php

namespace Tests\Feature;

use App\Models\Video;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\ApiTestCase;

class VideosTest extends ApiTestCase
{
    private function publicador(array $atributos = [])
    {
        return $this->criarPsicologo('aprovado', $atributos);
    }

    private function arquivoDeVideo(string $nome = 'aula.mp4')
    {
        return UploadedFile::fake()->create($nome, 1024, 'video/mp4');
    }

    // =====================================================================
    // LEITURA
    // =====================================================================

    public function test_listar_e_ver_exigem_login(): void
    {
        $video = $this->criarVideo($this->publicador());

        $this->getJson('/api/videos')->assertUnauthorized();
        $this->getJson("/api/videos/{$video->id}")->assertUnauthorized();
    }

    public function test_usuario_comum_lista_e_ve_um_video(): void
    {
        $video = $this->criarVideo($this->publicador(), ['titulo' => 'Respiração']);
        $this->autenticarComo($this->criarUsuario());

        $this->getJson('/api/videos')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.titulo', 'Respiração');

        $this->getJson("/api/videos/{$video->id}")
            ->assertOk()
            ->assertJsonPath('data.titulo', 'Respiração');

        $this->getJson('/api/videos/999999')->assertNotFound();
    }

    public function test_listagem_mostra_o_mais_novo_primeiro(): void
    {
        $autor = $this->publicador();
        $this->criarVideo($autor, ['titulo' => 'Antigo', 'created_at' => now()->subDays(3)]);
        $this->criarVideo($autor, ['titulo' => 'Novo', 'created_at' => now()->subHour()]);
        $this->autenticarComo($this->criarUsuario());

        $this->getJson('/api/videos')
            ->assertJsonPath('data.0.titulo', 'Novo')
            ->assertJsonPath('data.1.titulo', 'Antigo');
    }

    public function test_filtra_a_listagem_por_categoria(): void
    {
        $autor = $this->publicador();
        $ansiedade = $this->criarCategoria('Ansiedade');
        $sono = $this->criarCategoria('Sono');

        $this->criarVideo($autor, ['titulo' => 'Sobre ansiedade'])->categorias()->attach($ansiedade->id);
        $this->criarVideo($autor, ['titulo' => 'Sobre sono'])->categorias()->attach($sono->id);
        $this->autenticarComo($this->criarUsuario());

        $this->getJson("/api/videos?categoria={$ansiedade->id}")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.titulo', 'Sobre ansiedade');
    }

    // =====================================================================
    // O QUE O PÚBLICO VÊ DO AUTOR
    // =====================================================================

    public function test_autor_expoe_nome_foto_e_crp_mas_nunca_o_email(): void
    {
        $autor = $this->publicador([
            'nome' => 'Dra. Ana', 'email' => 'dra.ana@privado.com',
            'crp' => '54321', 'crp_regiao' => 7, 'imagem_perfil' => 'perfil/ana.jpg',
        ]);
        $this->criarVideo($autor);
        $this->autenticarComo($this->criarUsuario());

        $resposta = $this->getJson('/api/videos')->assertOk()
            ->assertJsonPath('data.0.autor.id', $autor->id)
            ->assertJsonPath('data.0.autor.nome', 'Dra. Ana')
            ->assertJsonPath('data.0.autor.crp', '07/54321')
            ->assertJsonMissingPath('data.0.autor.email')
            ->assertJsonMissingPath('data.0.autor.cpf')
            ->assertJsonMissingPath('data.0.autor.crp_status');

        $this->assertStringContainsString('perfil/ana.jpg', $resposta->json('data.0.autor.imagem_perfil'));
        $this->assertStringNotContainsString('dra.ana@privado.com', $resposta->getContent());
    }

    public function test_autor_sem_foto_ou_sem_regiao_do_crp(): void
    {
        $this->criarVideo($this->publicador(['crp' => '54321', 'crp_regiao' => null, 'imagem_perfil' => null]));
        $this->autenticarComo($this->criarUsuario());

        $this->getJson('/api/videos')
            ->assertJsonPath('data.0.autor.crp', '54321')
            ->assertJsonPath('data.0.autor.imagem_perfil', null);
    }

    public function test_o_video_continua_existindo_quando_o_autor_e_excluido(): void
    {
        $autor = $this->publicador();
        $video = $this->criarVideo($autor, ['titulo' => 'Fica no ar']);

        $autor->delete();
        $this->autenticarComo($this->criarUsuario());

        $this->getJson("/api/videos/{$video->id}")
            ->assertOk()
            ->assertJsonPath('data.titulo', 'Fica no ar')
            ->assertJsonPath('data.autor', null);
    }

    // =====================================================================
    // QUEM PODE PUBLICAR
    // =====================================================================

    public function test_usuario_comum_nao_pode_publicar_nem_ver_o_dashboard(): void
    {
        $this->autenticarComo($this->criarUsuario(), []);

        $this->postJson('/api/videos', ['titulo' => 'X'])->assertForbidden();
        $this->getJson('/api/dashboard/videos')->assertForbidden();

        $this->assertSame(0, Video::count());
    }

    public function test_psicologo_pendente_ou_revogado_nao_pode_publicar(): void
    {
        // Quem está pendente (ou foi revogado) faz login SEM a ability "publicador",
        // então o token dele é igual ao de um usuário comum.
        $this->autenticarComo($this->criarPsicologo('pendente'), []);

        $this->postJson('/api/videos', [
            'titulo' => 'X',
            'arquivo' => $this->arquivoDeVideo(),
        ])->assertForbidden();

        $this->assertSame(0, Video::count());
    }

    public function test_publicador_cria_video_com_arquivo_e_categorias(): void
    {
        $autor = $this->autenticarComo($this->publicador(['nome' => 'Dra. Ana']), ['publicador']);
        $categoria = $this->criarCategoria('Ansiedade');

        $this->postJson('/api/videos', [
            'titulo' => 'Respiração guiada',
            'descricao' => 'Exercício de 5 minutos',
            'arquivo' => $this->arquivoDeVideo(),
            'categorias' => [$categoria->id],
        ])
            ->assertCreated()
            ->assertJsonPath('data.titulo', 'Respiração guiada')
            ->assertJsonPath('data.autor.nome', 'Dra. Ana')
            ->assertJsonMissingPath('data.autor.email');

        $video = Video::firstOrFail();
        $this->assertSame($autor->id, (int) $video->autor_id, 'O autor é sempre quem está logado.');
        $this->assertSame([$categoria->id], $video->categorias->pluck('id')->all());
        $this->assertCount(1, Storage::disk('public')->allFiles('videos'));
    }

    public function test_o_autor_nao_pode_ser_escolhido_pelo_cliente(): void
    {
        $eu = $this->autenticarComo($this->publicador(), ['publicador']);
        $outro = $this->publicador();

        $this->postJson('/api/videos', [
            'titulo' => 'Tentativa',
            'arquivo' => $this->arquivoDeVideo(),
            'autor_id' => $outro->id,
        ])->assertCreated();

        $this->assertSame($eu->id, (int) Video::firstOrFail()->autor_id);
    }

    public function test_admin_tambem_pode_publicar(): void
    {
        $this->autenticarComo($this->criarAdmin(), ['admin']);

        $this->postJson('/api/videos', [
            'titulo' => 'Do admin',
            'arquivo' => $this->arquivoDeVideo(),
        ])->assertCreated();
    }

    public function test_validacoes_da_criacao(): void
    {
        $this->autenticarComo($this->publicador(), ['publicador']);

        $this->postJson('/api/videos', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['titulo', 'arquivo']);

        $this->postJson('/api/videos', [
            'titulo' => 'X',
            'arquivo' => UploadedFile::fake()->create('nao-e-video.txt', 10, 'text/plain'),
        ])->assertJsonValidationErrors('arquivo');

        $this->postJson('/api/videos', [
            'titulo' => str_repeat('a', 101),
            'arquivo' => $this->arquivoDeVideo(),
        ])->assertJsonValidationErrors('titulo');

        $this->postJson('/api/videos', [
            'titulo' => 'X',
            'arquivo' => $this->arquivoDeVideo(),
            'categorias' => [999999],
        ])->assertJsonValidationErrors('categorias.0');

        $this->assertSame(0, Video::count());
        $this->assertCount(0, Storage::disk('public')->allFiles('videos'), 'Requisição inválida não pode gravar arquivo.');
    }

    public function test_no_maximo_5_categorias_por_video(): void
    {
        $this->autenticarComo($this->publicador(), ['publicador']);
        $ids = collect(range(1, 6))->map(fn ($i) => $this->criarCategoria("Cat {$i}")->id)->all();

        $this->postJson('/api/videos', [
            'titulo' => 'X',
            'arquivo' => $this->arquivoDeVideo(),
            'categorias' => $ids,
        ])->assertJsonValidationErrors('categorias');
    }

    // =====================================================================
    // EDIÇÃO
    // =====================================================================

    public function test_dono_edita_o_proprio_video(): void
    {
        $dono = $this->publicador();
        $video = $this->criarVideo($dono, ['titulo' => 'Antigo']);
        $this->autenticarComo($dono, ['publicador']);

        $this->putJson("/api/videos/{$video->id}", ['titulo' => 'Novo'])
            ->assertOk()
            ->assertJsonPath('data.titulo', 'Novo');

        $this->assertSame('Novo', $video->fresh()->titulo);
    }

    public function test_editar_troca_as_categorias_e_mantem_quando_nao_enviadas(): void
    {
        $dono = $this->publicador();
        $velha = $this->criarCategoria('Velha');
        $nova = $this->criarCategoria('Nova');
        $video = $this->criarVideo($dono);
        $video->categorias()->attach($velha->id);
        $this->autenticarComo($dono, ['publicador']);

        // Sem enviar "categorias", elas ficam como estão
        $this->putJson("/api/videos/{$video->id}", ['titulo' => 'Só o título'])->assertOk();
        $this->assertSame([$velha->id], $video->fresh()->categorias->pluck('id')->all());

        // Enviando, são substituídas
        $this->putJson("/api/videos/{$video->id}", ['categorias' => [$nova->id]])->assertOk();
        $this->assertSame([$nova->id], $video->fresh()->categorias->pluck('id')->all());
    }

    public function test_trocar_o_arquivo_apaga_o_antigo_do_disco(): void
    {
        Storage::disk('public')->put('videos/antigo.mp4', 'conteudo');
        $dono = $this->publicador();
        $video = $this->criarVideo($dono, ['arquivo' => 'videos/antigo.mp4']);
        $this->autenticarComo($dono, ['publicador']);

        $this->putJson("/api/videos/{$video->id}", ['arquivo' => $this->arquivoDeVideo('novo.mp4')])->assertOk();

        Storage::disk('public')->assertMissing('videos/antigo.mp4');
        $this->assertNotSame('videos/antigo.mp4', $video->fresh()->arquivo);
        Storage::disk('public')->assertExists($video->fresh()->arquivo);
    }

    public function test_titulo_nao_pode_ficar_vazio_na_edicao(): void
    {
        $dono = $this->publicador();
        $video = $this->criarVideo($dono, ['titulo' => 'Original']);
        $this->autenticarComo($dono, ['publicador']);

        $this->putJson("/api/videos/{$video->id}", ['titulo' => ''])->assertUnprocessable();

        $this->assertSame('Original', $video->fresh()->titulo);
    }

    public function test_outro_publicador_nao_edita_nem_apaga_video_alheio(): void
    {
        $video = $this->criarVideo($this->publicador(), ['titulo' => 'Do dono']);
        $this->autenticarComo($this->publicador(), ['publicador']);

        $this->putJson("/api/videos/{$video->id}", ['titulo' => 'Invadido'])->assertForbidden();
        $this->deleteJson("/api/videos/{$video->id}")->assertForbidden();

        $this->assertSame('Do dono', $video->fresh()->titulo);
    }

    public function test_dono_que_perdeu_a_permissao_nao_edita_nem_apaga(): void
    {
        $dono = $this->publicador();
        $video = $this->criarVideo($dono, ['titulo' => 'Meu']);

        // Revogado: o token novo vem sem a ability "publicador"
        $this->autenticarComo($dono, []);

        $this->putJson("/api/videos/{$video->id}", ['titulo' => 'Editado'])->assertForbidden();
        $this->deleteJson("/api/videos/{$video->id}")->assertForbidden();

        $this->assertSame('Meu', $video->fresh()->titulo);
    }

    public function test_admin_pode_editar_e_apagar_video_de_qualquer_autor(): void
    {
        $video = $this->criarVideo($this->publicador(), ['titulo' => 'Do dono']);
        $this->autenticarComo($this->criarAdmin(), ['admin']);

        $this->putJson("/api/videos/{$video->id}", ['titulo' => 'Moderado'])->assertOk();
        $this->assertSame('Moderado', $video->fresh()->titulo);

        $this->deleteJson("/api/videos/{$video->id}")->assertOk();
        $this->assertDatabaseMissing('videos', ['id' => $video->id]);
    }

    // =====================================================================
    // EXCLUSÃO
    // =====================================================================

    public function test_dono_apaga_o_video_e_o_arquivo_some_do_disco(): void
    {
        Storage::disk('public')->put('videos/aula.mp4', 'conteudo');
        $dono = $this->publicador();
        $video = $this->criarVideo($dono, ['arquivo' => 'videos/aula.mp4']);
        $this->autenticarComo($dono, ['publicador']);

        $this->deleteJson("/api/videos/{$video->id}")->assertOk();

        $this->assertDatabaseMissing('videos', ['id' => $video->id]);
        Storage::disk('public')->assertMissing('videos/aula.mp4');
    }

    public function test_apagar_video_inexistente_retorna_404(): void
    {
        $this->autenticarComo($this->publicador(), ['publicador']);

        $this->deleteJson('/api/videos/999999')->assertNotFound();
    }

    // =====================================================================
    // DASHBOARD DO PUBLICADOR
    // =====================================================================

    public function test_dashboard_lista_somente_os_videos_do_proprio_publicador(): void
    {
        $eu = $this->publicador();
        $this->criarVideo($eu, ['titulo' => 'Meu']);
        $this->criarVideo($this->publicador(), ['titulo' => 'De outro']);
        $this->autenticarComo($eu, ['publicador']);

        $this->getJson('/api/dashboard/videos')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.titulo', 'Meu');
    }
}
