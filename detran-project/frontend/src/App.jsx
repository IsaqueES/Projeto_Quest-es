import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Topics from "./pages/Topics";
import Subtopics from "./pages/Subtopics"; // <--- Importante importar aqui
import Quiz from "./pages/Quiz";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/topics" element={<Topics />} />

        {/* Nova Rota para os Subtópicos */}
        <Route path="/topics/:topicId/subtopics" element={<Subtopics />} />

        {/* Rota do Quiz (aceita subtopic ou topic) */}
        <Route path="/quiz/:mode/:id?" element={<Quiz />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
