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
        User::create([
            'nome'      => 'Erick',
            'email'     => 'erick@gmail.com',
            'senha'     => Hash::make('123456'),
            'tipo'      => 'psicologo',
            'is_admin'  => true,
            'role'      => 'admin',
        ]);

        // Usuário comum
        User::create([
            'nome'      => 'Luis',
            'email'     => 'luis@gmail.com',
            'senha'     => Hash::make('123456'),
            'tipo'      => 'usuario',
            'is_admin'  => false,
            'role'      => 'user',
        ]);
    }
}
