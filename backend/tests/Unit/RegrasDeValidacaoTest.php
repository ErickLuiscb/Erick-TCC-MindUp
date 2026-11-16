<?php

namespace Tests\Unit;

use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Http\Requests\StoreAnotacaoRequest;
use App\Http\Requests\StoreFavoritoRequest;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Validator;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * Regras de validação dos formulários que não consultam o banco.
 */
class RegrasDeValidacaoTest extends TestCase
{
    private function validar(FormRequest $request, array $dados)
    {
        return Validator::make($dados, $request->rules(), $request->messages());
    }

    // ---------- anotação ----------

    private function anotacao(array $extra = []): array
    {
        return array_merge(['titulo' => 'Meu dia', 'texto' => 'Foi bom.', 'humor' => 'feliz'], $extra);
    }

    public function test_anotacao_valida_passa(): void
    {
        $this->assertTrue($this->validar(new StoreAnotacaoRequest(), $this->anotacao())->passes());
        $this->assertTrue($this->validar(new StoreAnotacaoRequest(), $this->anotacao(['humor' => null]))->passes());
    }

    public function test_anotacao_exige_titulo_e_texto(): void
    {
        $erros = $this->validar(new StoreAnotacaoRequest(), [])->errors();

        $this->assertTrue($erros->has('titulo'));
        $this->assertTrue($erros->has('texto'));
        $this->assertFalse($erros->has('humor'), 'O humor é opcional.');
    }

    public function test_anotacao_respeita_os_limites_de_tamanho(): void
    {
        $this->assertTrue($this->validar(new StoreAnotacaoRequest(), $this->anotacao(['titulo' => str_repeat('a', 100)]))->passes());
        $this->assertTrue($this->validar(new StoreAnotacaoRequest(), $this->anotacao(['titulo' => str_repeat('a', 101)]))->errors()->has('titulo'));

        $this->assertTrue($this->validar(new StoreAnotacaoRequest(), $this->anotacao(['texto' => str_repeat('a', 5000)]))->passes());
        $this->assertTrue($this->validar(new StoreAnotacaoRequest(), $this->anotacao(['texto' => str_repeat('a', 5001)]))->errors()->has('texto'));
    }

    public function test_anotacao_recusa_humor_fora_da_lista(): void
    {
        $this->assertTrue($this->validar(new StoreAnotacaoRequest(), $this->anotacao(['humor' => 'eufórico']))->errors()->has('humor'));
    }

    // ---------- favorito ----------

    public static function tiposDeFavorito(): array
    {
        return [['video'], ['artigo'], ['sugestao'], ['autoajuda']];
    }

    #[DataProvider('tiposDeFavorito')]
    public function test_favorito_aceita_os_4_tipos(string $tipo): void
    {
        $this->assertTrue($this->validar(new StoreFavoritoRequest(), ['tipo' => $tipo, 'favoritavel_id' => 1])->passes());
    }

    public function test_favorito_recusa_tipo_e_id_invalidos(): void
    {
        $request = new StoreFavoritoRequest();

        $this->assertTrue($this->validar($request, ['tipo' => 'musica', 'favoritavel_id' => 1])->errors()->has('tipo'));
        $this->assertTrue($this->validar($request, [])->errors()->has('tipo'));
        $this->assertTrue($this->validar($request, [])->errors()->has('favoritavel_id'));

        foreach (['abc', 0, -3, 1.5] as $id) {
            $this->assertTrue(
                $this->validar($request, ['tipo' => 'video', 'favoritavel_id' => $id])->errors()->has('favoritavel_id'),
                'ID inválido: ' . var_export($id, true)
            );
        }
    }

    // ---------- esqueci a senha / redefinir senha ----------

    public function test_esqueci_a_senha_exige_email_valido(): void
    {
        $request = new ForgotPasswordRequest();

        $this->assertTrue($this->validar($request, ['email' => 'ana@teste.com'])->passes());
        $this->assertTrue($this->validar($request, ['email' => 'invalido'])->errors()->has('email'));
        $this->assertTrue($this->validar($request, [])->errors()->has('email'));
    }

    private function reset(array $extra = []): array
    {
        return array_merge([
            'email' => 'ana@teste.com', 'token' => 'abc123',
            'senha' => 'novaSenha1', 'senha_confirmation' => 'novaSenha1',
        ], $extra);
    }

    public function test_redefinir_senha_valida_passa(): void
    {
        $this->assertTrue($this->validar(new ResetPasswordRequest(), $this->reset())->passes());
    }

    public function test_redefinir_senha_exige_email_token_e_senha(): void
    {
        $erros = $this->validar(new ResetPasswordRequest(), [])->errors();

        foreach (['email', 'token', 'senha'] as $campo) {
            $this->assertTrue($erros->has($campo), $campo);
        }
    }

    public function test_confirmacao_diferente_usa_a_mensagem_em_portugues(): void
    {
        $erros = $this->validar(new ResetPasswordRequest(), $this->reset(['senha_confirmation' => 'outra']))->errors();

        $this->assertSame('A confirmação de senha não corresponde.', $erros->first('senha'));
    }

    public function test_nova_senha_curta_usa_a_mensagem_em_portugues(): void
    {
        $erros = $this->validar(new ResetPasswordRequest(), $this->reset(['senha' => '123', 'senha_confirmation' => '123']))->errors();

        $this->assertSame('A nova senha precisa ter pelo menos 6 caracteres.', $erros->first('senha'));
    }

    public function test_nova_senha_nao_pode_ter_espacos(): void
    {
        $v = $this->validar(new ResetPasswordRequest(), $this->reset(['senha' => 'com espaco', 'senha_confirmation' => 'com espaco']));

        $this->assertTrue($v->errors()->has('senha'));
    }
}
