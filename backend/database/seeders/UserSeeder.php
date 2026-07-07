<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Psicólogo / Admin
        User::firstOrCreate(
            ['email' => 'erick@gmail.com'],
            [
                'nome'      => 'Erick',
                'senha'     => Hash::make('123456'),
                'tipo'      => 'psicologo',
                'is_admin'  => true,
                'role'      => 'admin',
            ]
        );

        // Usuário comum
        User::firstOrCreate(
            ['email' => 'luis@gmail.com'],
            [
                'nome'      => 'Luis',
                'senha'     => Hash::make('123456'),
                'tipo'      => 'usuario',
                'is_admin'  => false,
                'role'      => 'user',
            ]
        );
    }
}
