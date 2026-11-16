<?php

namespace Tests\Unit;

use App\Mail\RedefinirSenhaMail;
use App\Mail\ResultadoVerificacaoMail;
use App\Mail\VerificarEmailMail;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class MailablesTest extends TestCase
{
    public function test_email_de_confirmacao_leva_nome_tipo_e_link(): void
    {
        $mail = new VerificarEmailMail('Ana', 'psicologo', 'http://api.test/email/verify/1/abc');

        $this->assertSame('Ana', $mail->nomeUsuario);
        $this->assertSame('psicologo', $mail->tipoUsuario);
        $this->assertSame('http://api.test/email/verify/1/abc', $mail->urlVerificacao);
        $this->assertSame('Confirme seu e-mail — MindUp', $mail->envelope()->subject);
    }

    public function test_email_de_redefinicao_leva_nome_e_link(): void
    {
        $mail = new RedefinirSenhaMail('Ana', 'http://front.test/redefinir-senha?token=xyz');

        $this->assertSame('Ana', $mail->nomeUsuario);
        $this->assertSame('http://front.test/redefinir-senha?token=xyz', $mail->urlRedefinicao);
        $this->assertSame('Redefinição de senha — MindUp', $mail->envelope()->subject);
    }

    public static function decisoes(): array
    {
        return [['aprovado'], ['rejeitado'], ['revogado'], ['reativado']];
    }

    #[DataProvider('decisoes')]
    public function test_email_de_resultado_tem_assunto_para_cada_decisao(string $decisao): void
    {
        $mail = new ResultadoVerificacaoMail('Ana', $decisao, null, 'http://front.test/login');

        $this->assertSame($decisao, $mail->decisao);
        $this->assertNotEmpty($mail->envelope()->subject);
    }

    public function test_email_de_resultado_guarda_o_motivo_e_o_link_de_login(): void
    {
        $mail = new ResultadoVerificacaoMail('Ana', 'rejeitado', 'CRP não encontrado.', 'http://front.test/login');

        $this->assertSame('Ana', $mail->nomeUsuario);
        $this->assertSame('CRP não encontrado.', $mail->motivo);
        $this->assertSame('http://front.test/login', $mail->urlLogin);
    }
}
