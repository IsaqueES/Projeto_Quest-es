import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Topics from "./pages/Topics";
import Subtopics from "./pages/Subtopics";
import Quiz from "./pages/Quiz";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Inicial */}
        <Route path="/" element={<Home />} />

        {/* Rotas de Navegação */}
        <Route path="/topics" element={<Topics />} />

        {/* AQUI ESTAVA O PROBLEMA: Faltava a rota intermediária para os subtópicos */}
        <Route path="/topics/:topicId" element={<Subtopics />} />

        {/* Rotas do Quiz */}
        {/* Ex: /quiz/topic/1 (Quiz geral do tema) ou /quiz/subtopic/5 (Quiz específico) */}
        <Route path="/quiz/:mode/:id" element={<Quiz />} />
      </Routes>
    </BrowserRouter>
  );
}
