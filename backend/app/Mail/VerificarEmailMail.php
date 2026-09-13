<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VerificarEmailMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $nomeUsuario;
    public string $tipoUsuario;
    public string $urlVerificacao;

    public function __construct(string $nomeUsuario, string $tipoUsuario, string $urlVerificacao)
    {
        $this->nomeUsuario = $nomeUsuario;
        $this->tipoUsuario = $tipoUsuario;
        $this->urlVerificacao = $urlVerificacao;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Confirme seu e-mail — MindUp',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.verificar-email',
            with: [
                'nomeUsuario' => $this->nomeUsuario,
                'tipoUsuario' => $this->tipoUsuario,
                'urlVerificacao' => $this->urlVerificacao,
            ],
        );
    }
}
