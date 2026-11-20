<?php

namespace Tests\Unit;

use App\Http\Resources\AnotacaoResource;
use App\Models\Anotacao;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Tests\TestCase;

/**
 * O diário é dado pessoal sensível. Estes testes garantem que o que vai
 * para o banco é ilegível, e que o resto do sistema continua vendo texto puro.
 * Não precisam de banco de dados.
 */
class AnotacaoCriptografiaTest extends TestCase
{
    private const TITULO = 'Dia dificil no trabalho';
    private const TEXTO  = 'Hoje conversei sobre minha ansiedade com a minha mae.';
    private const HUMOR  = 'ansioso';

    private function anotacao(array $extra = []): Anotacao
    {
        return (new Anotacao())->forceFill(array_merge([
            'id'         => 1,
            'usuario_id' => 1,
            'titulo'     => self::TITULO,
            'texto'      => self::TEXTO,
            'humor'      => self::HUMOR,
        ], $extra));
    }

    public function test_o_model_continua_devolvendo_texto_puro(): void
    {
        $anotacao = $this->anotacao();

        $this->assertSame(self::TITULO, $anotacao->titulo);
        $this->assertSame(self::TEXTO, $anotacao->texto);
        $this->assertSame(self::HUMOR, $anotacao->humor);
    }

    public function test_o_que_vai_para_o_banco_nao_contem_o_texto_original(): void
    {
        $bruto = $this->anotacao()->getAttributes();

        $this->assertNotSame(self::TITULO, $bruto['titulo']);
        $this->assertNotSame(self::TEXTO, $bruto['texto']);
        $this->assertNotSame(self::HUMOR, $bruto['humor']);

        $this->assertStringNotContainsString('trabalho', $bruto['titulo']);
        $this->assertStringNotContainsString('ansiedade', $bruto['texto']);
        $this->assertStringNotContainsString('ansioso', $bruto['humor']);
    }

    public function test_o_valor_cifrado_usa_o_mesmo_formato_da_migration(): void
    {
        // A migration cifra com Crypt::encryptString; o cast tem de ser compatível.
        $bruto = $this->anotacao()->getAttributes();

        $this->assertSame(self::TEXTO, Crypt::decryptString($bruto['texto']));
    }

    public function test_humor_vazio_continua_nulo(): void
    {
        $anotacao = $this->anotacao(['humor' => null]);

        $this->assertNull($anotacao->humor);
        $this->assertNull($anotacao->getAttributes()['humor']);
    }

    public function test_o_mesmo_texto_cifrado_duas_vezes_gera_valores_diferentes(): void
    {
        $a = $this->anotacao()->getAttributes()['texto'];
        $b = $this->anotacao()->getAttributes()['texto'];

        $this->assertNotSame($a, $b, 'Cada cifragem usa um vetor aleatório (IV).');
    }

    public function test_o_resource_entrega_texto_puro_para_o_frontend(): void
    {
        $dados = (new AnotacaoResource($this->anotacao()))->toArray(new Request());

        $this->assertSame(self::TITULO, $dados['titulo']);
        $this->assertSame(self::TEXTO, $dados['texto']);
        $this->assertSame(self::HUMOR, $dados['humor']);
    }
}
