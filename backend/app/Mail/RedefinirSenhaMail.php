<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RedefinirSenhaMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $nomeUsuario;
    public string $urlRedefinicao;

    public function __construct(string $nomeUsuario, string $urlRedefinicao)
    {
        $this->nomeUsuario = $nomeUsuario;
        $this->urlRedefinicao = $urlRedefinicao;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Redefinição de senha — MindUp',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.redefinir-senha',
            with: [
                'nomeUsuario' => $this->nomeUsuario,
                'urlRedefinicao' => $this->urlRedefinicao,
            ],
        );
    }
}
