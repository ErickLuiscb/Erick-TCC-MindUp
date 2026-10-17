<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Aviso ao psicólogo sobre a decisão do admin.
 *
 * $decisao: aprovado | rejeitado | revogado | reativado
 */
class ResultadoVerificacaoMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $nomeUsuario;
    public string $decisao;
    public ?string $motivo;
    public string $urlLogin;

    public function __construct(
        string $nomeUsuario,
        string $decisao,
        ?string $motivo,
        string $urlLogin
    ) {
        $this->nomeUsuario = $nomeUsuario;
        $this->decisao = $decisao;
        $this->motivo = $motivo;
        $this->urlLogin = $urlLogin;
    }

    public function envelope(): Envelope
    {
        $assunto = match ($this->decisao) {
            'aprovado' => 'Seu cadastro foi aprovado — MindUp',
            'reativado' => 'Sua permissão de publicação foi reativada — MindUp',
            'revogado' => 'Sua permissão de publicação foi alterada — MindUp',
            default => 'Atualização sobre seu cadastro profissional — MindUp',
        };

        return new Envelope(
            subject: $assunto,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.resultado-verificacao',
            with: [
                'nomeUsuario' => $this->nomeUsuario,
                'decisao' => $this->decisao,
                'motivo' => $this->motivo,
                'urlLogin' => $this->urlLogin,
            ],
        );
    }
}
