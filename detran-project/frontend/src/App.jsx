import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Topics from "./pages/Topics";
import Subtopics from "./pages/Subtopics"; // <--- OBRIGATÓRIO TER ISSO
import Quiz from "./pages/Quiz";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/topics" element={<Topics />} />
        {/* ESSA ROTA É OBRIGATÓRIA PARA FUNCIONAR: */}
        <Route path="/topics/:topicId/subtopics" element={<Subtopics />} />
        <Route path="/quiz/:mode/:id?" element={<Quiz />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
