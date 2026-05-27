<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVideoRequest;
use App\Http\Requests\UpdateVideoRequest;
use App\Http\Resources\VideoResource;
use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class VideoApiController extends Controller
{
    public function index(Request $request)
    {
        $query = Video::with([
            'autor',
            'categorias'
        ]);

        if ($request->filled('categoria')) {

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

    public function meusVideos(Request $request)
    {
        $videos = Video::where(
                'autor_id',
                $request->user()->id
            )
            ->with([
                'autor',
                'categorias'
            ])
            ->latest('data_criacao')
            ->get();

        return response()->json([
            'data' => VideoResource::collection($videos)
        ]);
    }

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

        if ($request->hasFile('arquivo')) {

            $nome = uniqid('video_', true) . '.' .
                $request->file('arquivo')
                    ->getClientOriginalExtension();

            $request->file('arquivo')
                ->storeAs('videos', $nome, 'public');

            $data['arquivo'] = 'videos/' . $nome;
        }

        $categorias = $data['categorias'] ?? [];

        unset($data['categorias']);

        $video = Video::create($data);

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

        if ($request->hasFile('arquivo')) {

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

        $categorias = $data['categorias'] ?? [];

        unset($data['categorias']);

        $video->update($data);

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

    public function destroy(
        Request $request,
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

        if (
            $video->arquivo &&
            Storage::disk('public')->exists($video->arquivo)
        ) {
            Storage::disk('public')->delete($video->arquivo);
        }

        $video->delete();

        return response()->json([
            'message' => 'Vídeo removido com sucesso.'
        ]);
    }
}
