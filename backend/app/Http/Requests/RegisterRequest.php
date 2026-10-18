<?php

namespace App\Http\Requests;

use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Cadastro PÚBLICO (POST /register).
 *
 * Diferente do StoreUserRequest (usado só pelo admin em POST /usuarios),
 * este request NÃO aceita is_admin nem role: ninguém ganha permissão
 * especial só por enviar esses campos no cadastro.
 */
class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $ajustes = [];

        if ($this->has('cpf')) {
            // Guarda só os dígitos (aceita com ou sem máscara)
            $ajustes['cpf'] = preg_replace('/\D/', '', (string) $this->input('cpf'));
        }

        if ($this->has('crp')) {
            $ajustes['crp'] = trim((string) $this->input('crp'));
        }

        $this->merge($ajustes);
    }

    public function rules(): array
    {
        return [
            'nome' => 'required|string|max:100',

            'email' => 'required|email|unique:usuarios,email',

            'senha' => 'required|string|min:6|not_regex:/\s/u',

            'tipo' => 'required|in:usuario,psicologo',

            'imagem_perfil' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',

            /*
            Campos do psicólogo. `exclude_unless` tira esses campos do
            validated() quando o tipo não é psicólogo — usuário comum
            nunca grava CRP, região nem CPF.
            */
            'crp_regiao' => [
                'exclude_unless:tipo,psicologo',
                'required',
                'integer',
                'between:1,24',
            ],

            'crp' => [
                'exclude_unless:tipo,psicologo',
                'required',
                'regex:/^\d{1,10}$/',
                Rule::unique('usuarios', 'crp')->where(
                    fn ($query) => $query->where('crp_regiao', $this->input('crp_regiao'))
                ),
            ],

            'cpf' => [
                'exclude_unless:tipo,psicologo',
                'required',
                function (string $attribute, mixed $value, Closure $fail) {
                    if (!self::cpfValido((string) $value)) {
                        $fail('CPF inválido. Confira os 11 dígitos.');
                    }
                },
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'crp_regiao.required' => 'Selecione a região do seu CRP.',
            'crp_regiao.integer' => 'Região do CRP inválida.',
            'crp_regiao.between' => 'Região do CRP inválida.',

            'crp.required' => 'Psicólogos devem informar o número do CRP.',
            'crp.regex' => 'Informe somente o número do CRP, sem a região nem símbolos.',
            'crp.unique' => 'Este CRP já está cadastrado nesta região.',

            'cpf.required' => 'Psicólogos devem informar o CPF.',
        ];
    }

    /**
     * Valida os dígitos verificadores do CPF (11 dígitos, sem máscara).
     */
    private static function cpfValido(string $cpf): bool
    {
        if (strlen($cpf) !== 11 || preg_match('/^(\d)\1{10}$/', $cpf)) {
            return false;
        }

        for ($posicao = 9; $posicao < 11; $posicao++) {
            $soma = 0;

            for ($i = 0; $i < $posicao; $i++) {
                $soma += (int) $cpf[$i] * (($posicao + 1) - $i);
            }

            $digito = ((10 * $soma) % 11) % 10;

            if ((int) $cpf[$posicao] !== $digito) {
                return false;
            }
        }

        return true;
    }
}
