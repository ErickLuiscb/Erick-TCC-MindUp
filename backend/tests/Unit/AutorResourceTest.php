<?php

namespace Tests\Unit;

use App\Http\Resources\AutorResource;
use App\Models\User;
use Illuminate\Http\Request;
use Tests\TestCase;

/**
 * O AutorResource é o que decide o que o público logado vê de um psicólogo.
 * Estes testes garantem que dado sensível nunca saia por ele.
 */
class AutorResourceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['filesystems.default' => 'public']);
    }

    private function psicologo(array $extra = []): User
    {
        return (new User())->forceFill(array_merge([
            'id' => 5,
            'nome' => 'Dra. Ana',
            'email' => 'ana@privado.com',
            'senha' => 'hash-qualquer',
            'cpf' => '52998224725',
            'tipo' => 'psicologo',
            'crp' => '54321',
            'crp_regiao' => 7,
            'crp_status' => 'aprovado',
            'imagem_perfil' => 'perfil/ana.jpg',
        ], $extra));
    }

    private function dados(User $user): array
    {
        return (new AutorResource($user))->toArray(new Request());
    }

    public function test_expoe_somente_id_nome_foto_e_crp(): void
    {
        $this->assertSame(
            ['id', 'nome', 'imagem_perfil', 'crp'],
            array_keys($this->dados($this->psicologo()))
        );
    }

    public function test_nunca_expoe_email_cpf_senha_nem_status(): void
    {
        $json = json_encode($this->dados($this->psicologo()));

        foreach (['ana@privado.com', '52998224725', 'hash-qualquer', 'aprovado'] as $segredo) {
            $this->assertStringNotContainsString($segredo, $json);
        }
    }

    public function test_devolve_id_e_nome(): void
    {
        $dados = $this->dados($this->psicologo());

        $this->assertSame(5, $dados['id']);
        $this->assertSame('Dra. Ana', $dados['nome']);
    }

    public function test_crp_sai_no_formato_regiao_barra_numero(): void
    {
        $this->assertSame('07/54321', $this->dados($this->psicologo())['crp']);
        $this->assertSame('01/54321', $this->dados($this->psicologo(['crp_regiao' => 1]))['crp']);
        $this->assertSame('24/54321', $this->dados($this->psicologo(['crp_regiao' => 24]))['crp']);
    }

    public function test_psicologo_antigo_sem_regiao_mostra_so_o_numero(): void
    {
        $this->assertSame('54321', $this->dados($this->psicologo(['crp_regiao' => null]))['crp']);
    }

    public function test_sem_crp_o_campo_e_nulo(): void
    {
        $this->assertNull($this->dados($this->psicologo(['crp' => null, 'crp_regiao' => null]))['crp']);
    }

    public function test_foto_vira_url_e_sem_foto_e_nula(): void
    {
        $this->assertStringContainsString('perfil/ana.jpg', $this->dados($this->psicologo())['imagem_perfil']);
        $this->assertNull($this->dados($this->psicologo(['imagem_perfil' => null]))['imagem_perfil']);
    }
}
