<?php

namespace Tests\Unit;

use App\Http\Requests\RegisterRequest;
use PHPUnit\Framework\Attributes\DataProvider;
use ReflectionMethod;
use Tests\TestCase;

/**
 * Testa o algoritmo dos dígitos verificadores do CPF, que é um método
 * privado do RegisterRequest (por isso o uso de Reflection).
 */
class CpfValidacaoTest extends TestCase
{
    private function cpfValido(string $cpf): bool
    {
        return (new ReflectionMethod(RegisterRequest::class, 'cpfValido'))->invoke(null, $cpf);
    }

    public static function cpfsValidos(): array
    {
        return [
            ['52998224725'],
            ['11144477735'],
            ['39053344705'],
            ['12345678909'],
            ['98765432100'],
        ];
    }

    public static function cpfsInvalidos(): array
    {
        return [
            'primeiro dígito errado' => ['52998224625'],
            'último dígito errado' => ['52998224726'],
            'todos zeros' => ['00000000000'],
            'todos uns' => ['11111111111'],
            'todos noves' => ['99999999999'],
            'curto demais' => ['5299822472'],
            'longo demais' => ['529982247250'],
            'vazio' => [''],
            'com letras' => ['5299822472a'],
            'com máscara (a máscara é removida antes)' => ['529.982.247-25'],
        ];
    }

    #[DataProvider('cpfsValidos')]
    public function test_aceita_cpf_valido(string $cpf): void
    {
        $this->assertTrue($this->cpfValido($cpf));
    }

    #[DataProvider('cpfsInvalidos')]
    public function test_recusa_cpf_invalido(string $cpf): void
    {
        $this->assertFalse($this->cpfValido($cpf));
    }
}
