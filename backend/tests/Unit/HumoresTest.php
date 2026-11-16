<?php

namespace Tests\Unit;

use App\Support\Humores;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class HumoresTest extends TestCase
{
    public function test_a_lista_tem_os_8_humores_esperados(): void
    {
        $this->assertSame(
            ['feliz', 'calmo', 'neutro', 'triste', 'ansioso', 'irritado', 'cansado', 'grato'],
            Humores::VALIDOS
        );
    }

    public function test_nao_ha_humores_repetidos_e_todos_sao_minusculos_sem_espaco(): void
    {
        $this->assertSame(Humores::VALIDOS, array_values(array_unique(Humores::VALIDOS)));

        foreach (Humores::VALIDOS as $humor) {
            $this->assertMatchesRegularExpression('/^[a-z]+$/', $humor);
        }
    }

    public function test_a_regra_de_validacao_e_montada_a_partir_da_lista(): void
    {
        $this->assertSame(
            'nullable|in:feliz,calmo,neutro,triste,ansioso,irritado,cansado,grato',
            Humores::regraValidacao()
        );
    }

    public function test_a_regra_aceita_cada_humor_valido_e_o_valor_nulo(): void
    {
        $validador = fn ($valor) => Validator::make(['humor' => $valor], ['humor' => Humores::regraValidacao()]);

        foreach (Humores::VALIDOS as $humor) {
            $this->assertTrue($validador($humor)->passes(), "O humor '{$humor}' deveria ser aceito.");
        }

        $this->assertTrue($validador(null)->passes(), 'O humor é opcional.');
    }

    public function test_a_regra_recusa_humores_fora_da_lista(): void
    {
        foreach (['eufórico', 'FELIZ', 'feliz ', 'qualquer'] as $invalido) {
            $v = Validator::make(['humor' => $invalido], ['humor' => Humores::regraValidacao()]);

            $this->assertTrue($v->fails(), "O valor '{$invalido}' deveria ser recusado.");
        }
    }
}
