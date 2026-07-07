<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoriaSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = [

            // SAÚDE MENTAL
            ['nome' => 'Ansiedade'],
            ['nome' => 'Depressão'],
            ['nome' => 'Estresse'],
            ['nome' => 'Burnout'],
            ['nome' => 'Síndrome do Pânico'],
            ['nome' => 'Transtorno Bipolar'],
            ['nome' => 'TDAH'],
            ['nome' => 'TOC'],
            ['nome' => 'Insônia'],
            ['nome' => 'Solidão'],
            ['nome' => 'Luto'],
            ['nome' => 'Autoestima'],
            ['nome' => 'Autoconhecimento'],
            ['nome' => 'Traumas'],
            ['nome' => 'Dependência Emocional'],
            ['nome' => 'Controle Emocional'],
            ['nome' => 'Regulação Emocional'],
            ['nome' => 'Inteligência Emocional'],
            ['nome' => 'Saúde Mental'],
            ['nome' => 'Bem-estar'],
            ['nome' => 'Mindfulness'],
            ['nome' => 'Psicoterapia'],
            ['nome' => 'Psicologia Positiva'],

            // RELACIONAMENTOS
            ['nome' => 'Relacionamentos'],
            ['nome' => 'Relacionamento Amoroso'],
            ['nome' => 'Família'],
            ['nome' => 'Amizade'],
            ['nome' => 'Término'],
            ['nome' => 'Separação'],
            ['nome' => 'Comunicação'],
            ['nome' => 'Empatia'],
            ['nome' => 'Conflitos'],
            ['nome' => 'Relacionamentos Tóxicos'],

            // VIDA PESSOAL
            ['nome' => 'Motivação'],
            ['nome' => 'Disciplina'],
            ['nome' => 'Produtividade'],
            ['nome' => 'Rotina'],
            ['nome' => 'Hábitos'],
            ['nome' => 'Foco'],
            ['nome' => 'Procrastinação'],
            ['nome' => 'Organização'],
            ['nome' => 'Desenvolvimento Pessoal'],
            ['nome' => 'Propósito'],
            ['nome' => 'Superação'],
            ['nome' => 'Autocuidado'],
            ['nome' => 'Resiliência'],

            // VIDA ACADÊMICA E PROFISSIONAL
            ['nome' => 'Faculdade'],
            ['nome' => 'Escola'],
            ['nome' => 'Estudos'],
            ['nome' => 'Pressão Acadêmica'],
            ['nome' => 'Carreira'],
            ['nome' => 'Mercado de Trabalho'],
            ['nome' => 'Trabalho'],
            ['nome' => 'Liderança'],
            ['nome' => 'Home Office'],

            // SAÚDE E QUALIDADE DE VIDA
            ['nome' => 'Sono'],
            ['nome' => 'Exercícios'],
            ['nome' => 'Alimentação'],
            ['nome' => 'Qualidade de Vida'],
            ['nome' => 'Meditação'],
            ['nome' => 'Respiração'],
            ['nome' => 'Relaxamento'],

            // PÚBLICOS
            ['nome' => 'Adolescentes'],
            ['nome' => 'Adultos'],
            ['nome' => 'Idosos'],
            ['nome' => 'Pais'],
            ['nome' => 'Maternidade'],
            ['nome' => 'Paternidade'],
            ['nome' => 'Estudantes'],

            // CONTEÚDOS
            ['nome' => 'Vídeos'],
            ['nome' => 'Artigos'],
            ['nome' => 'Livros'],
            ['nome' => 'Filmes'],
            ['nome' => 'Músicas'],
            ['nome' => 'Exercícios Práticos'],
            ['nome' => 'Autoajuda'],

            // TEMAS MODERNOS
            ['nome' => 'Redes Sociais'],
            ['nome' => 'Tecnologia'],
            ['nome' => 'Vício em Celular'],
            ['nome' => 'Cyberbullying'],
            ['nome' => 'Comparação Social'],

            // EMOÇÕES
            ['nome' => 'Felicidade'],
            ['nome' => 'Tristeza'],
            ['nome' => 'Raiva'],
            ['nome' => 'Medo'],
            ['nome' => 'Frustração'],
            ['nome' => 'Culpa'],
            ['nome' => 'Vergonha'],
            ['nome' => 'Esperança'],
        ];

        DB::table('categorias')->insertOrIgnore($categorias);
    }
}
