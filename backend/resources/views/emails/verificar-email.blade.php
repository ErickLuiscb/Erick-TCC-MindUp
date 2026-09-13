<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Confirme seu e-mail — MindUp</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f1fa; font-family: Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f1fa; padding: 32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color:#ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

                    {{-- Cabeçalho --}}
                    <tr>
                        <td style="background: linear-gradient(135deg, #5b1aa0, #a64bf4); padding: 28px 24px; text-align: center;">
                            <span style="font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: 0.5px;">
                                Mind<span style="color:#ffb300;">Up</span>
                            </span>
                        </td>
                    </tr>

                    {{-- Corpo --}}
                    <tr>
                        <td style="padding: 32px 28px;">
                            <h1 style="font-size: 18px; color:#3a0b6d; margin: 0 0 16px;">
                                Olá, {{ $nomeUsuario }} 👋
                            </h1>

                            @if ($tipoUsuario === 'psicologo')
                                <p style="font-size: 14px; color:#4b4b4b; line-height: 1.6; margin: 0 0 24px;">
                                    Estamos felizes em ter você como profissional no MindUp. Depois de
                                    confirmar seu e-mail, sua conta será ativada e você poderá publicar
                                    vídeos, artigos, sugestões e conteúdos de autoajuda para apoiar
                                    nossos usuários.
                                </p>
                            @else
                                <p style="font-size: 14px; color:#4b4b4b; line-height: 1.6; margin: 0 0 24px;">
                                    Estamos muito felizes em ter você com a gente! Falta só um passo:
                                    confirme seu e-mail para ativar sua conta e começar a explorar
                                    conteúdos de apoio emocional.
                                </p>
                            @endif

                            <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 24px;">
                                <tr>
                                    <td style="border-radius: 12px; background-color:#7a00c1;">
                                        <a href="{{ $urlVerificacao }}"
                                           style="display: inline-block; padding: 14px 32px; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; color: #ffffff; text-decoration: none; border-radius: 12px;">
                                            Confirmar meu e-mail
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="font-size: 12px; color:#9a9a9a; line-height: 1.6; margin: 0 0 8px;">
                                Este link é válido por 60 minutos. Se você não criou uma conta no
                                MindUp, pode ignorar este e-mail com segurança.
                            </p>

                            <p style="font-size: 11px; color:#bbbbbb; line-height: 1.6; margin: 16px 0 0; word-break: break-all;">
                                Se o botão não funcionar, copie e cole este link no navegador:<br>
                                {{ $urlVerificacao }}
                            </p>
                        </td>
                    </tr>

                    {{-- Rodapé --}}
                    <tr>
                        <td style="background-color:#f4f1fa; padding: 16px 24px; text-align: center;">
                            <p style="font-size: 11px; color:#9a9a9a; margin: 0;">
                                © {{ date('Y') }} MindUp — Este e-mail foi enviado automaticamente, não responda.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
