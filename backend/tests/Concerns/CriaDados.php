<?php

namespace Tests\Concerns;

use App\Models\Artigo;
use App\Models\Autoajuda;
use App\Models\Categoria;
use App\Models\Sugestao;
use App\Models\User;
use App\Models\Video;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;

/**
 * Atalhos para montar dados nos testes (o projeto não tem factories).
 * Usa forceFill de propósito: campos como crp_status, is_admin e
 * email_verified_at não são "fillable" no model.
 */
trait CriaDados
{
    protected function criarUsuario(array $atributos = []): User
    {
        $user = new User();

        $user->forceFill(array_merge([
            'nome' => 'Usuário Teste',
            'email' => uniqid('user_', true) . '@teste.com',
            'senha' => Hash::make('123456'),
            'tipo' => 'usuario',
            'is_admin' => false,
            'email_verified_at' => now(),
        ], $atributos))->save();

        return $user;
    }

    protected function criarPsicologo(string $status = 'aprovado', array $atributos = []): User
    {
        static $sequencia = 10000;
        $sequencia++;

        return $this->criarUsuario(array_merge([
            'nome' => 'Psicóloga Teste',
            'tipo' => 'psicologo',
            'crp' => (string) $sequencia,
            'crp_regiao' => 7,
            'crp_status' => $status,
        ], $status === 'pendente' ? ['cpf' => '52998224725'] : [], $atributos));
    }

    protected function criarAdmin(array $atributos = []): User
    {
        return $this->criarUsuario(array_merge([
            'nome' => 'Admin Teste',
            'is_admin' => true,
        ], $atributos));
    }

    /**
     * Autentica a requisição seguinte com as abilities informadas
     * (as mesmas que o login concede: [], ['publicador'] ou ['admin']).
     */
    protected function autenticarComo(User $user, array $abilities = []): User
    {
        Sanctum::actingAs($user, $abilities);

        return $user;
    }

    protected function criarCategoria(string $nome = 'Ansiedade'): Categoria
    {
        return Categoria::create(['nome' => $nome]);
    }

    /**
     * Cria um conteúdo de qualquer tipo: videos | artigos | sugestoes | autoajudas
     */
    protected function criarConteudo(string $tipo, ?User $autor, array $atributos = [])
    {
        $base = ['titulo' => 'Conteúdo de teste', 'descricao' => 'Descrição', 'autor_id' => $autor?->id];

        [$modelo, $extra] = match ($tipo) {
            'videos' => [new Video(), ['arquivo' => 'videos/teste.mp4']],
            'artigos' => [new Artigo(), ['arquivo_pdf' => 'artigos/teste.pdf']],
            'sugestoes' => [new Sugestao(), ['tipo' => 'livro']],
            'autoajudas' => [new Autoajuda(), ['tipo_midia' => 'imagem', 'midia' => 'autoajuda/teste.png']],
        };

        $modelo->forceFill(array_merge($base, $extra, $atributos))->save();

        return $modelo;
    }

    protected function criarVideo(?User $autor, array $atributos = []): Video
    {
        return $this->criarConteudo('videos', $autor, $atributos);
    }
}
