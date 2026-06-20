import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";

import { AuthProvider } from "./context/AuthContext";
import { AnotacoesProvider } from "./context/AnotacoesContext";
import { VideosProvider } from "./context/VideosContext";
import { ArtigosProvider } from "./context/ArtigosContext";

import Layout from "./components/Layout";
import RotaProtegida from "./components/RotaProtegida";
import RotaPsicologo from "./components/RotaPsicologo";

// Páginas públicas
import Inicial from "./pages/inicial/Inicial";
import Login from "./pages/login/Login";
import Cadastro from "./pages/cadastro/Cadastro";

// Perfil
import Perfil from "./pages/perfil/Perfil";

// Vídeos (usuários)
import Videos from "./pages/videos/Videos";
import Ver_Videos from "./pages/videos/Ver_Videos";

// Artigos (usuários)
import Artigos from "./pages/artigos/Artigos";
import Ver_Artigo from "./pages/artigos/Ver_Artigo";

// Favoritos e Categorias

// Anotações
import Anotacoes from "./pages/anotacoes/Anotacoes";
import CriarAnotacao from "./pages/anotacoes/CriarAnotacao";
import Editar_Anotacao from "./pages/anotacoes/Editar_Anotacao";
import Ver_Anotacao from "./pages/anotacoes/Ver_Anotacao";

// Dashboard (psicólogo/admin)
import Dashboard from "./pages/dashboard/Dashboard";

// CRUD Vídeos (Profissional)
import MeusVideos from "./pages/dashboard/videos/MeusVideos";
import CriarVideo from "./pages/dashboard/videos/CriarVideo";
import EditarVideo from "./pages/dashboard/videos/EditarVideo";

// CRUD Artigos (Profissional)
import MeusArtigos from "./pages/dashboard/artigos/MeusArtigos";
import CriarArtigo from "./pages/dashboard/artigos/CriarArtigo";
import EditarArtigo from "./pages/dashboard/artigos/EditarArtigo";

export default function App() {
  return (
    <AuthProvider>
      <VideosProvider>
        <ArtigosProvider>
          <AnotacoesProvider>
            <BrowserRouter>
              <Routes>
                {/* Rota inicial */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Públicas */}
                <Route path="/login" element={<Login />} />
                <Route path="/cadastro" element={<Cadastro />} />

                {/* =========================
                  ROTAS PROTEGIDAS (USUÁRIO)
              ========================= */}
                <Route element={<RotaProtegida />}>
                  <Route element={<Layout />}>
                    <Route path="/inicial" element={<Inicial />} />

                    {/* Perfil */}
                    <Route path="/perfil" element={<Perfil />} />

                    {/* Vídeos */}
                    <Route path="/videos" element={<Videos />} />
                    <Route path="/videos/:id" element={<Ver_Videos />} />

                    {/* Artigos */}
                    <Route path="/artigos" element={<Artigos />} />
                    <Route path="/artigos/:id" element={<Ver_Artigo />} />

                    {/* Anotações */}
                    <Route path="/anotacoes" element={<Anotacoes />} />
                    <Route
                      path="/anotacoes/criar"
                      element={<CriarAnotacao />}
                    />
                    <Route
                      path="/anotacoes/editar/:id"
                      element={<Editar_Anotacao />}
                    />
                    <Route path="/anotacoes/:id" element={<Ver_Anotacao />} />

                    {/* Módulos adiados (Em construção) */}
                    <Route
                      path="/sugestoes"
                      element={<div>Sugestões Culturais (Em construção)</div>}
                    />
                    <Route
                      path="/autoajuda"
                      element={<div>Guias de Autoajuda (Em construção)</div>}
                    />
                    <Route
                      path="/mapa"
                      element={
                        <div>
                          Mapa de Consultórios e Farmácias (Em construção)
                        </div>
                      }
                    />
                  </Route>
                </Route>

                {/* =========================
                  ROTAS EXCLUSIVAS PSICÓLOGO / ADMIN
              ========================= */}
                <Route element={<RotaPsicologo />}>
                  <Route element={<Layout />}>
                    <Route path="/dashboard" element={<Dashboard />} />

                    {/* Dashboard - Gerenciamento de Vídeos */}
                    <Route path="/dashboard/videos" element={<MeusVideos />} />
                    <Route
                      path="/dashboard/videos/criar"
                      element={<CriarVideo />}
                    />
                    <Route
                      path="/dashboard/videos/editar/:id"
                      element={<EditarVideo />}
                    />

                    {/* Dashboard - Gerenciamento de Artigos */}
                    <Route
                      path="/dashboard/artigos"
                      element={<MeusArtigos />}
                    />
                    <Route
                      path="/dashboard/artigos/criar"
                      element={<CriarArtigo />}
                    />
                    <Route
                      path="/dashboard/artigos/editar/:id"
                      element={<EditarArtigo />}
                    />

                    {/* Dashboard - Gerenciamento de Sugestões (Comentado/Adiado conforme o plano) */}
                    {/* 
                  <Route path="/dashboard/sugestoes" element={<MinhasSugestoes />} />
                  <Route path="/dashboard/sugestoes/criar" element={<CriarSugestao />} />
                  <Route path="/dashboard/sugestoes/editar/:id" element={<EditarSugestao />} />
                  */}

                    {/* Dashboard - Gerenciamento de Autoajuda (Comentado/Adiado conforme o plano) */}
                    {/* 
                  <Route path="/dashboard/autoajuda" element={<MeusConteudosAutoajuda />} />
                  <Route path="/dashboard/autoajuda/criar" element={<CriarAutoajuda />} />
                  <Route path="/dashboard/autoajuda/editar/:id" element={<EditarAutoajuda />} />
                  */}
                  </Route>
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/inicial" replace />} />
              </Routes>
            </BrowserRouter>
          </AnotacoesProvider>
        </ArtigosProvider>
      </VideosProvider>
    </AuthProvider>
  );
}
