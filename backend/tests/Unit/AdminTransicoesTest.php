<?php

namespace Tests\Unit;

use App\Http\Controllers\api\AdminPsicologoApiController;
use ReflectionClass;
use Tests\TestCase;

/**
 * As regras de quais mudanças de status o admin pode fazer ficam em
 * constantes do controller. Aqui elas são conferidas sem subir a API.
 */
class AdminTransicoesTest extends TestCase
{
    private function constante(string $nome): array
    {
        return (new ReflectionClass(AdminPsicologoApiController::class))->getConstant($nome);
    }

    public function test_os_status_possiveis(): void
    {
        $this->assertSame(['pendente', 'aprovado', 'rejeitado'], $this->constante('STATUS'));
    }

    public function test_mapa_de_transicoes_permitidas(): void
    {
        $this->assertSame([
            'pendente' => ['aprovado', 'rejeitado'],  // aprovar ou rejeitar
            'aprovado' => ['rejeitado'],              // revogar
            'rejeitado' => ['aprovado'],              // reativar
        ], $this->constante('TRANSICOES'));
    }

    public function test_o_admin_nunca_devolve_alguem_para_pendente(): void
    {
        foreach ($this->constante('TRANSICOES') as $destinos) {
            $this->assertNotContains('pendente', $destinos);
        }
    }

    public function test_nenhum_status_pode_ir_para_ele_mesmo(): void
    {
        foreach ($this->constante('TRANSICOES') as $origem => $destinos) {
            $this->assertNotContains($origem, $destinos, "'{$origem}' não pode ir para '{$origem}'.");
        }
    }

    public function test_todo_destino_e_um_status_valido_e_todo_status_tem_saida(): void
    {
        $status = $this->constante('STATUS');
        $transicoes = $this->constante('TRANSICOES');

        $this->assertEqualsCanonicalizing($status, array_keys($transicoes));

        foreach ($transicoes as $destinos) {
            $this->assertNotEmpty($destinos);
            foreach ($destinos as $destino) {
                $this->assertContains($destino, $status);
            }
        }
    }
}
