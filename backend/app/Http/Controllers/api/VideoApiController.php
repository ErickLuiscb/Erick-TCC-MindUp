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
     * LISTAR VÍDEOS — público
     */
    public function index()
    {
        return VideoResource::collection(
            Video::with('autor')
                ->latest('data_criacao')
                ->get()
        );
    }

    /**
     * VISUALIZAR UM VÍDEO — público
     */
    public function show(Video $video)
    {
        return new VideoResource(
            $video->load('autor')
        );
    }

    /**
     * LISTAR VÍDEOS DO USUÁRIO LOGADO (Dashboard)
     */
    public function meusVideos(Request $request)
    {
        return VideoResource::collection(
            Video::where('autor_id', $request->user()->id)
                ->latest('data_criacao')
                ->get()
        );
    }

    /**
     * CRIAR VÍDEO — admin ou psicólogo
     */
    public function store(StoreVideoRequest $request)
    {
        if (
            !$request->user()->tokenCan('admin') &&
            !$request->user()->tokenCan('publicador')
        ) {
            return response()->json(['error' => 'Acesso negado'], 403);
        }

        $data = $request->validated();
        $data['autor_id'] = $request->user()->id;

        if ($request->hasFile('arquivo')) {
            $nome = uniqid('video_', true) . '.' .
                $request->file('arquivo')->getClientOriginalExtension();

            $request->file('arquivo')->storeAs('videos', $nome, 'public');

            $data['arquivo'] = 'videos/' . $nome;
        }

        $video = Video::create($data);

        return new VideoResource(
            $video->load('autor')
        );
    }

    /**
     * ATUALIZAR VÍDEO — admin ou dono
     */
    public function update(UpdateVideoRequest $request, Video $video)
    {
        if (
            !$request->user()->tokenCan('admin') &&
            $request->user()->id !== $video->autor_id
        ) {
            return response()->json(['error' => 'Acesso negado'], 403);
        }

        $data = $request->validated();

        if ($request->hasFile('arquivo')) {

            // remove arquivo antigo
            if ($video->arquivo && Storage::disk('public')->exists($video->arquivo)) {
                Storage::disk('public')->delete($video->arquivo);
            }

            $nome = uniqid('video_', true) . '.' .
                $request->file('arquivo')->getClientOriginalExtension();

            $request->file('arquivo')->storeAs('videos', $nome, 'public');

            $data['arquivo'] = 'videos/' . $nome;
        }

        $video->update($data);

        return new VideoResource(
            $video->fresh()->load('autor')
        );
    }

    /**
     * DELETAR VÍDEO — admin ou dono
     */
    public function destroy(Request $request, Video $video)
    {
        if (
            !$request->user()->tokenCan('admin') &&
            $request->user()->id !== $video->autor_id
        ) {
            return response()->json(['error' => 'Acesso negado'], 403);
        }

        if ($video->arquivo && Storage::disk('public')->exists($video->arquivo)) {
            Storage::disk('public')->delete($video->arquivo);
        }

        $video->delete();

        return response()->json([
            'message' => 'Vídeo removido com sucesso'
        ]);
    }
}
