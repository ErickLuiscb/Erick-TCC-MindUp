<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class UserFactory extends Factory
{
    protected $model = \App\Models\User::class;

    public function definition()
    {
        return [
            'nome'      => $this->faker->name(),
            'email'     => $this->faker->unique()->safeEmail(),
            'senha'     => Hash::make('123456'),
            'tipo'      => 'usuario',
            'is_admin'  => false,
            'role'      => 'user',
            'criado_em' => now(),
        ];
    }
}
