import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";

import { AuthProvider } from "./context/AuthContext";
import { AnotacoesProvider } from "./context/AnotacoesContext";
import { VideosProvider } from "./context/VideosContext";

import Layout from "./components/Layout";
import RotaProtegida from "./components/RotaProtegida";
import RotaPsicologo from "./components/RotaPsicologo";

// Páginas públicas
import Inicial from "./pages/inicial/Inicial";
import Login from "./pages/login/Login";
import Cadastro from "./pages/cadastro/Cadastro";

// Perfil
import Perfil from "./pages/perfil/Perfil";
import Editar_Perfil from "./pages/perfil/Editar_Perfil";

// Vídeos (usuários)
import Videos from "./pages/videos/Videos";
import Ver_Videos from "./pages/videos/Ver_Videos";

// Anotações
import Anotacoes from "./pages/anotacoes/Anotacoes";
import CriarAnotacao from "./pages/anotacoes/CriarAnotacao";
import Editar_Anotacao from "./pages/anotacoes/Editar_Anotacao";
import Ver_Anotacao from "./pages/anotacoes/Ver_Anotacao";

// Dashboard (psicólogo/admin)
import Dashboard from "./pages/dashboard/Dashboard";
import MeusVideos from "./pages/dashboard/MeusVideos";
import CriarVideo from "./pages/dashboard/CriarVideo";
import EditarVideo from "./pages/dashboard/EditarVideo";

export default function App() {
  return (
    <AuthProvider>
      <VideosProvider>
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
                  <Route path="/perfil/editar" element={<Editar_Perfil />} />

                  {/* Vídeos */}
                  <Route path="/videos" element={<Videos />} />
                  <Route path="/videos/:id" element={<Ver_Videos />} />

                  {/* Anotações */}
                  <Route path="/anotacoes" element={<Anotacoes />} />
                  <Route path="/anotacoes/criar" element={<CriarAnotacao />} />
                  <Route path="/anotacoes/editar/:id" element={<Editar_Anotacao />} />
                  <Route path="/anotacoes/:id" element={<Ver_Anotacao />} />

                  {/* Outras */}
                  <Route path="/artigos" element={<div>Artigos (em construção)</div>} />
                  <Route path="/autoajuda" element={<div>Autoajuda (em construção)</div>} />

                </Route>
              </Route>

              {/* ROTAS EXCLUSIVAS PSICÓLOGO*/}
              <Route element={<RotaPsicologo />}>
                <Route element={<Layout />}>

                  <Route path="/dashboard" element={<Dashboard />} />

                  <Route path="/dashboard/videos" element={<MeusVideos />} />
                  <Route path="/dashboard/videos/criar" element={<CriarVideo />} />
                  <Route path="/dashboard/videos/editar/:id" element={<EditarVideo />} />

                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/inicial" replace />} />

            </Routes>
          </BrowserRouter>
        </AnotacoesProvider>
      </VideosProvider>
    </AuthProvider>
  );
}
