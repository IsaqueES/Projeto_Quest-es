import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight, ArrowLeft, BookOpen } from "lucide-react";
import Sidebar from "../components/Sidebar";

export default function Subtopics() {
  const { topicId } = useParams();
  const [subtopics, setSubtopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    // Busca os subtópicos do tema específico
    fetch(`http://localhost:8000/topics/${topicId}/subtopics`)
      .then((res) => res.json())
      .then((data) => {
        setSubtopics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro:", err);
        setLoading(false);
      });
  }, [topicId]);

  return (
    <div className="flex min-h-screen bg-[var(--bg-color)]">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Botão Voltar */}
          <button
            onClick={() => navigate("/topics")}
            className="flex items-center text-gray-500 hover:text-[var(--accent-color)] mb-6 font-medium transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" /> Voltar aos Temas
          </button>

          <h2 className="text-3xl font-bold text-[var(--primary-color)] mb-2">
            O que vamos estudar?
          </h2>
          <p className="text-gray-600 mb-8">
            Selecione um tópico específico para focar seus estudos.
          </p>

          {loading ? (
            <div className="text-center py-10">Carregando subtópicos...</div>
          ) : (
            <div className="grid gap-4">
              {subtopics.length > 0 ? (
                subtopics.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => navigate(`/quiz/subtopic/${sub.id}`)}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-[var(--accent-color)] hover:shadow-md transition-all cursor-pointer flex justify-between items-center group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg text-[var(--accent-color)] group-hover:bg-[var(--accent-color)] group-hover:text-white transition-colors">
                        <BookOpen size={24} />
                      </div>
                      <span className="font-bold text-lg text-gray-700 group-hover:text-[var(--primary-color)]">
                        {sub.name}
                      </span>
                    </div>

                    <ChevronRight className="text-gray-300 group-hover:text-[var(--accent-color)]" />
                  </div>
                ))
              ) : (
                <div className="text-center p-10 bg-white rounded-xl shadow-sm">
                  <p className="text-gray-500">
                    Nenhum subtópico encontrado para este tema.
                  </p>
                  <button
                    onClick={() => navigate(`/quiz/topic/${topicId}`)}
                    className="mt-4 text-[var(--accent-color)] font-bold hover:underline"
                  >
                    Fazer simulado geral deste tema
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
