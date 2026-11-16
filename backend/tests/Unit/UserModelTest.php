<?php

namespace Tests\Unit;

use App\Http\Resources\UserResource;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Http\Request;
use Tests\TestCase;

class UserModelTest extends TestCase
{
    private function usuario(array $extra = []): User
    {
        return (new User())->forceFill(array_merge([
            'id' => 1,
            'nome' => 'Ana',
            'email' => 'ana@teste.com',
            'senha' => 'hash-qualquer',
            'cpf' => '52998224725',
            'tipo' => 'psicologo',
        ], $extra));
    }

    public function test_a_tabela_do_model_e_usuarios(): void
    {
        $this->assertSame('usuarios', (new User())->getTable());
    }

    public function test_senha_e_cpf_ficam_escondidos_na_serializacao(): void
    {
        $array = $this->usuario()->toArray();

        $this->assertArrayNotHasKey('senha', $array);
        $this->assertArrayNotHasKey('cpf', $array);
        $this->assertArrayNotHasKey('remember_token', $array);
        $this->assertArrayHasKey('email', $array);
    }

    public function test_cpf_e_guardado_criptografado_e_lido_em_texto_puro(): void
    {
        $user = $this->usuario();

        $this->assertSame('52998224725', $user->cpf);
        $this->assertNotSame('52998224725', $user->getAttributes()['cpf'], 'O valor bruto (o que vai ao banco) não pode ser o CPF puro.');
        $this->assertStringNotContainsString('52998224725', $user->getAttributes()['cpf']);
    }

    public function test_cpf_pode_ser_apagado(): void
    {
        $user = $this->usuario();
        $user->cpf = null;

        $this->assertNull($user->cpf);
    }

    public function test_email_verified_at_vira_data(): void
    {
        $user = $this->usuario(['email_verified_at' => '2026-01-01 10:00:00']);

        $this->assertInstanceOf(CarbonInterface::class, $user->email_verified_at);
    }

    public function test_status_do_crp_e_verificacao_nao_podem_ser_preenchidos_em_massa(): void
    {
        $user = new User();

        // Só o servidor define esses campos (cadastro => pendente; admin => aprovado/rejeitado)
        foreach (['crp_status', 'crp_motivo', 'crp_analisado_por', 'crp_analisado_em', 'email_verified_at'] as $campo) {
            $this->assertFalse($user->isFillable($campo), "{$campo} não deveria ser fillable.");
        }
    }

    public function test_campos_do_cadastro_podem_ser_preenchidos_em_massa(): void
    {
        $user = new User();

        foreach (['nome', 'email', 'senha', 'crp', 'crp_regiao', 'cpf', 'tipo', 'imagem_perfil'] as $campo) {
            $this->assertTrue($user->isFillable($campo), $campo);
        }
    }

    public function test_user_resource_mostra_o_email_do_proprio_perfil_mas_nunca_senha_nem_cpf(): void
    {
        $dados = (new UserResource($this->usuario()))->toArray(new Request());

        $this->assertSame('ana@teste.com', $dados['email']);
        $this->assertArrayNotHasKey('senha', $dados);
        $this->assertArrayNotHasKey('cpf', $dados);
        $this->assertStringNotContainsString('52998224725', json_encode($dados));
    }
}
