<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoriaSeeder extends Seeder
{
    /**
     * Esta lista é a FONTE DA VERDADE das categorias (130 no total).
     *
     * O seeder roda a cada subida do serviço (migrate --force --seed) e cria
     * qualquer nome daqui que ainda não exista na tabela. Por isso:
     *  - para ADICIONAR uma categoria: inclua o nome aqui;
     *  - para REMOVER ou RENOMEAR uma categoria: ajuste aqui também, senão o
     *    nome antigo volta no próximo deploy.
     * Este seeder nunca apaga nem altera categorias existentes.
     */
    public function run(): void
    {
        $nomes = [

            // SAÚDE MENTAL
            'Ansiedade',
            'Transtorno de Ansiedade Generalizada',
            'Depressão',
            'Depressão Pós-Parto',
            'Estresse',
            'Burnout',
            'Síndrome de Burnout',
            'Síndrome do Pânico',
            'Transtorno de Pânico',
            'Transtorno Bipolar',
            'Esquizofrenia',
            'Transtorno de Personalidade Borderline',
            'Transtorno do Espectro Autista (TEA)',
            'Transtornos de Aprendizagem',
            'Neurodiversidade',
            'TDAH',
            'Transtorno de Déficit de Atenção e Hiperatividade (TDAH)',
            'Transtorno Obsessivo-Compulsivo (TOC)',
            'Transtornos Alimentares',
            'Fobia Social',
            'Síndrome do Impostor',
            'Insônia',
            'Solidão',
            'Luto',
            'Prevenção ao Suicídio',
            'Autoestima',
            'Autoconhecimento',
            'Autocompaixão',
            'Autoaceitação',
            'Traumas',
            'Traumas Psicológicos',
            'Transtorno de Estresse Pós-Traumático (TEPT)',
            'Dependência Emocional',
            'Dependência Química',
            'Controle Emocional',
            'Regulação Emocional',
            'Inteligência Emocional',
            'Pensamentos Negativos',
            'Perfeccionismo',
            'Saúde Mental',
            'Bem-estar',
            'Mindfulness',
            'Gratidão',
            'Psicoterapia',
            'Terapia Cognitivo-Comportamental',
            'Psicologia Positiva',

            // RELACIONAMENTOS
            'Relacionamentos',
            'Relacionamento Amoroso',
            'Família',
            'Amizade',
            'Término',
            'Término de Relacionamento',
            'Separação',
            'Comunicação',
            'Empatia',
            'Conflitos',
            'Relacionamentos Tóxicos',
            'Limites Pessoais',
            'Violência Doméstica',

            // SEXUALIDADE E IDENTIDADE
            'Sexualidade',
            'Identidade de Gênero',
            'LGBTQIA+',

            // VIDA PESSOAL
            'Motivação',
            'Disciplina',
            'Produtividade',
            'Rotina',
            'Hábitos',
            'Foco',
            'Procrastinação',
            'Organização',
            'Desenvolvimento Pessoal',
            'Propósito',
            'Propósito de Vida',
            'Valorização da vida',
            'Superação',
            'Autocuidado',
            'Resiliência',

            // VIDA ACADÊMICA E PROFISSIONAL
            'Faculdade',
            'Escola',
            'Estudos',
            'Pressão Acadêmica',
            'Carreira',
            'Mercado de Trabalho',
            'Trabalho',
            'Trabalho Remoto',
            'Liderança',
            'Home Office',
            'Assédio Moral',

            // SAÚDE E QUALIDADE DE VIDA
            'Sono',
            'Exercícios',
            'Atividade Física',
            'Exercícios Práticos de Bem-estar',
            'Alimentação',
            'Qualidade de Vida',
            'Meditação',
            'Respiração',
            'Relaxamento',

            // PÚBLICOS
            'Crianças',
            'Adolescentes',
            'Adultos',
            'Idosos',
            'Pais',
            'Maternidade',
            'Paternidade',
            'Estudantes',

            // CONTEÚDOS
            'Vídeos',
            'Artigos',
            'Livros',
            'Filmes',
            'Músicas',
            'Exercícios Práticos',
            'Autoajuda',
            'Mente e Corpo',
            'Psicologia',
            'Neurociência',

            // TEMAS MODERNOS
            'Redes Sociais',
            'Tecnologia',
            'Vício em Celular',
            'Uso Excessivo de Celular',
            'Bullying',
            'Cyberbullying',
            'Comparação Social',

            // EMOÇÕES
            'Felicidade',
            'Tristeza',
            'Raiva',
            'Medo',
            'Frustração',
            'Culpa',
            'Vergonha',
            'Esperança',
        ];

        // Só insere o que falta. Assim não gasta números da sequência de ids
        // a cada deploy (o insertOrIgnore gastava, mesmo sem inserir nada).
        $existentes = DB::table('categorias')->pluck('nome')->all();
        $novos = array_values(array_diff(array_unique($nomes), $existentes));

        if (empty($novos)) {
            return;
        }

        DB::table('categorias')->insert(
            array_map(fn (string $nome) => ['nome' => $nome], $novos)
        );
    }
}
