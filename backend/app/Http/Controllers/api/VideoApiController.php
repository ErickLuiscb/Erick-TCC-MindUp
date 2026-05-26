<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Video;
use App\Http\Requests\StoreVideoRequest;
use App\Http\Requests\UpdateVideoRequest;
use App\Http\Resources\VideoResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class VideoApiController extends Controller
{
    /**
     * LISTAR TODOS OS VÍDEOS
     * Público
     */
    public function index(Request $request)
    {
        $query = Video::with([
            'autor',
            'categorias'
        ]);

        // filtro por categoria
        if ($request->has('categoria')) {

            $query->whereHas('categorias', function ($q) use ($request) {
                $q->where('categorias.id', $request->categoria);
            });
        }

        $videos = $query
            ->latest('data_criacao')
            ->get();

        return response()->json([
            'data' => VideoResource::collection($videos)
        ]);
    }

    /**
     * VISUALIZAR UM VÍDEO
     * Público
     */
    public function show(Video $video)
    {
        return response()->json([
            'data' => new VideoResource(
                $video->load([
                    'autor',
                    'categorias'
                ])
            )
        ]);
    }

    /**
     * LISTAR VÍDEOS DO AUTOR LOGADO
     * Dashboard
     */
    public function meusVideos(Request $request)
    {
        $videos = Video::where(
                'autor_id',
                $request->user()->id
            )
            ->with('categorias')
            ->latest('data_criacao')
            ->get();

        return response()->json([
            'data' => VideoResource::collection($videos)
        ]);
    }

    /**
     * CRIAR VÍDEO
     * Psicólogo/Admin
     */
    public function store(StoreVideoRequest $request)
    {
        if (
            !$request->user()->tokenCan('admin') &&
            !$request->user()->tokenCan('publicador')
        ) {
            return response()->json([
                'message' => 'Acesso negado.'
            ], 403);
        }

        $data = $request->validated();

        $data['autor_id'] = $request->user()->id;

        // upload do vídeo
        if ($request->hasFile('arquivo')) {

            $nome = uniqid('video_', true) . '.' .
                $request->file('arquivo')
                    ->getClientOriginalExtension();

            $request->file('arquivo')
                ->storeAs('videos', $nome, 'public');

            $data['arquivo'] = 'videos/' . $nome;
        }

        // remove categorias do create
        $categorias = $data['categorias'] ?? [];
        unset($data['categorias']);

        // cria vídeo
        $video = Video::create($data);

        // sync categorias
        if (!empty($categorias)) {
            $video->categorias()->sync($categorias);
        }

        return response()->json([
            'message' => 'Vídeo criado com sucesso.',
            'data' => new VideoResource(
                $video->load([
                    'autor',
                    'categorias'
                ])
            )
        ], 201);
    }

    /**
     * ATUALIZAR VÍDEO
     * Admin ou dono
     */
    public function update(
        UpdateVideoRequest $request,
        Video $video
    ) {
        if (
            !$request->user()->tokenCan('admin') &&
            $request->user()->id !== $video->autor_id
        ) {
            return response()->json([
                'message' => 'Acesso negado.'
            ], 403);
        }

        $data = $request->validated();

        // upload novo vídeo
        if ($request->hasFile('arquivo')) {

            // remove antigo
            if (
                $video->arquivo &&
                Storage::disk('public')->exists($video->arquivo)
            ) {
                Storage::disk('public')->delete($video->arquivo);
            }

            $nome = uniqid('video_', true) . '.' .
                $request->file('arquivo')
                    ->getClientOriginalExtension();

            $request->file('arquivo')
                ->storeAs('videos', $nome, 'public');

            $data['arquivo'] = 'videos/' . $nome;
        }

        // categorias
        $categorias = $data['categorias'] ?? [];
        unset($data['categorias']);

        // update vídeo
        $video->update($data);

        // sync categorias
        $video->categorias()->sync($categorias);

        return response()->json([
            'message' => 'Vídeo atualizado com sucesso.',
            'data' => new VideoResource(
                $video->fresh()->load([
                    'autor',
                    'categorias'
                ])
            )
        ]);
    }

    /**
     * REMOVER VÍDEO
     * Admin ou dono
     */
    public function destroy(Request $request, Video $video)
    {
        if (
            !$request->user()->tokenCan('admin') &&
            $request->user()->id !== $video->autor_id
        ) {
            return response()->json([
                'message' => 'Acesso negado.'
            ], 403);
        }

        // remove arquivo
        if (
            $video->arquivo &&
            Storage::disk('public')->exists($video->arquivo)
        ) {
            Storage::disk('public')->delete($video->arquivo);
        }

        $video->delete();

        return response()->json([
            'message' => 'Vídeo removido com sucesso.'
        ], 200);
    }
}
