import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function Topics() {
  const [topics, setTopics] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Busca os temas do backend
    fetch("http://localhost:8000/topics")
      .then((res) => res.json())
      .then((data) => setTopics(data))
      .catch((err) => console.error("Erro ao conectar com API:", err));
  }, []);

  return (
    <div className="flex min-h-screen bg-[var(--bg-color)]">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="text-gray-500 hover:text-[var(--accent-color)] mb-4 font-medium"
          >
            ← Voltar
          </button>
          <h2 className="text-3xl font-bold text-[var(--primary-color)] mb-8 pb-4 border-b border-gray-200">
            Escolha um Tema
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => navigate(`/quiz/topic/${topic.id}`)}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer border-l-4 border-[var(--accent-color)] flex flex-col items-center text-center group"
              >
                <div className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all duration-300">
                  {topic.icon || "📘"}
                </div>
                <h3 className="font-bold text-xl text-[var(--primary-color)]">
                  {topic.name}
                </h3>
                <span className="text-xs font-bold text-[var(--accent-color)] mt-3 bg-blue-50 px-3 py-1 rounded-full group-hover:bg-[var(--accent-color)] group-hover:text-white transition-colors">
                  INICIAR
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
