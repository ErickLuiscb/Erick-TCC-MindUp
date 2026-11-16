<?php

namespace Tests\Unit;

use App\Http\Requests\RegisterRequest;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Unique;
use PHPUnit\Framework\Attributes\DataProvider;
use ReflectionMethod;
use Tests\TestCase;

/**
 * Regras do cadastro, sem banco: as regras "unique" (que consultam o banco)
 * são retiradas aqui e ficam para um teste de integração.
 */
class RegisterRequestTest extends TestCase
{
    private function validador(array $dados)
    {
        $regras = (new RegisterRequest())->rules();

        $regras['email'] = 'required|email';
        $regras['crp'] = array_values(array_filter($regras['crp'], fn ($r) => !$r instanceof Unique));

        return Validator::make($dados, $regras, (new RegisterRequest())->messages());
    }

    private function usuario(array $extra = []): array
    {
        return array_merge(['nome' => 'Maria', 'email' => 'maria@teste.com', 'senha' => 'segredo1', 'tipo' => 'usuario'], $extra);
    }

    private function psicologo(array $extra = []): array
    {
        return $this->usuario(array_merge([
            'tipo' => 'psicologo', 'crp_regiao' => 7, 'crp' => '12345', 'cpf' => '52998224725',
        ], $extra));
    }

    public function test_cadastro_de_usuario_comum_e_de_psicologo_validos_passam(): void
    {
        $this->assertTrue($this->validador($this->usuario())->passes());
        $this->assertTrue($this->validador($this->psicologo())->passes());
    }

    public function test_usuario_comum_nunca_leva_crp_regiao_nem_cpf_para_o_banco(): void
    {
        $v = $this->validador($this->usuario(['crp' => '99999', 'crp_regiao' => 7, 'cpf' => '52998224725']));

        $this->assertTrue($v->passes());
        $this->assertSame(['nome', 'email', 'senha', 'tipo'], array_keys($v->validated()));
    }

    public function test_cadastro_nao_aceita_is_admin_nem_role(): void
    {
        $v = $this->validador($this->usuario(['is_admin' => true, 'role' => 'admin']));

        $this->assertArrayNotHasKey('is_admin', $v->validated());
        $this->assertArrayNotHasKey('role', $v->validated());
    }

    public function test_campos_obrigatorios(): void
    {
        $this->assertEqualsCanonicalizing(
            ['nome', 'email', 'senha', 'tipo'],
            array_keys($this->validador([])->errors()->toArray())
        );
    }

    public function test_psicologo_precisa_de_regiao_crp_e_cpf(): void
    {
        $erros = $this->validador($this->usuario(['tipo' => 'psicologo']))->errors();

        $this->assertTrue($erros->has('crp_regiao'));
        $this->assertTrue($erros->has('crp'));
        $this->assertTrue($erros->has('cpf'));
        $this->assertSame('Selecione a região do seu CRP.', $erros->first('crp_regiao'));
        $this->assertSame('Psicólogos devem informar o número do CRP.', $erros->first('crp'));
        $this->assertSame('Psicólogos devem informar o CPF.', $erros->first('cpf'));
    }

    public function test_tipo_so_pode_ser_usuario_ou_psicologo(): void
    {
        $this->assertTrue($this->validador($this->usuario(['tipo' => 'admin']))->errors()->has('tipo'));
        $this->assertTrue($this->validador($this->usuario(['tipo' => '']))->errors()->has('tipo'));
    }

    public static function senhasInvalidas(): array
    {
        return [
            'curta' => ['12345'],
            'com espaço no meio' => ['abc 1234'],
            'com espaço no fim' => ['abcd123 '],
            'só espaços' => ['      '],
        ];
    }

    #[DataProvider('senhasInvalidas')]
    public function test_recusa_senha_invalida(string $senha): void
    {
        $this->assertTrue($this->validador($this->usuario(['senha' => $senha]))->errors()->has('senha'));
    }

    public function test_aceita_senha_com_6_caracteres_ou_mais_sem_espaco(): void
    {
        foreach (['123456', 'abcdef', 'Senh@Forte!2026'] as $senha) {
            $this->assertTrue($this->validador($this->usuario(['senha' => $senha]))->passes(), $senha);
        }
    }

    public static function regioesInvalidas(): array
    {
        return [[0], [25], [-1], ['abc'], [7.5]];
    }

    #[DataProvider('regioesInvalidas')]
    public function test_recusa_regiao_do_crp_fora_de_1_a_24(mixed $regiao): void
    {
        $this->assertTrue($this->validador($this->psicologo(['crp_regiao' => $regiao]))->errors()->has('crp_regiao'));
    }

    public function test_aceita_as_24_regioes_do_crp(): void
    {
        foreach (range(1, 24) as $regiao) {
            $this->assertTrue($this->validador($this->psicologo(['crp_regiao' => $regiao]))->passes(), "Região {$regiao}");
        }
    }

    public static function crpsInvalidos(): array
    {
        return [['12A45'], ['07/12345'], ['12 345'], ['12.345'], ['12345678901'], ['']];
    }

    #[DataProvider('crpsInvalidos')]
    public function test_recusa_crp_que_nao_seja_so_numero_de_ate_10_digitos(string $crp): void
    {
        $this->assertTrue($this->validador($this->psicologo(['crp' => $crp]))->errors()->has('crp'));
    }

    public function test_aceita_crp_de_1_a_10_digitos(): void
    {
        foreach (['1', '12345', '1234567890'] as $crp) {
            $this->assertTrue($this->validador($this->psicologo(['crp' => $crp]))->passes(), $crp);
        }
    }

    public function test_recusa_cpf_invalido_com_a_mensagem_certa(): void
    {
        $erros = $this->validador($this->psicologo(['cpf' => '52998224726']))->errors();

        $this->assertSame('CPF inválido. Confira os 11 dígitos.', $erros->first('cpf'));
    }

    public function test_mensagem_de_crp_duplicado(): void
    {
        $this->assertSame(
            'Este CRP já está cadastrado nesta região.',
            (new RegisterRequest())->messages()['crp.unique']
        );
    }

    public function test_a_regra_de_unicidade_do_crp_existe_e_so_vale_dentro_da_regiao(): void
    {
        $unique = array_values(array_filter((new RegisterRequest())->rules()['crp'], fn ($r) => $r instanceof Unique));

        $this->assertCount(1, $unique, 'O CRP deve ter uma regra unique.');
        $this->assertStringContainsString('usuarios', (string) $unique[0]);
    }

    public function test_antes_de_validar_o_cpf_fica_so_com_digitos_e_o_crp_sem_espacos(): void
    {
        $request = RegisterRequest::create('/api/register', 'POST', ['cpf' => '529.982.247-25', 'crp' => '  12345  ']);

        (new ReflectionMethod($request, 'prepareForValidation'))->invoke($request);

        $this->assertSame('52998224725', $request->input('cpf'));
        $this->assertSame('12345', $request->input('crp'));
    }

    public function test_qualquer_um_pode_se_cadastrar(): void
    {
        $this->assertTrue((new RegisterRequest())->authorize());
    }
}
