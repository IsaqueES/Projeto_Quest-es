import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight, ArrowLeft, BookOpen, AlertTriangle } from "lucide-react";
import Sidebar from "../components/Sidebar";

export default function Subtopics() {
  const { topicId } = useParams();
  const [subtopics, setSubtopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    // Verifica se topicId existe para evitar chamadas inválidas
    if (!topicId) return;

    fetch(`http://localhost:8000/topics/${topicId}/subtopics`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Falha ao conectar com o servidor");
        return res.json();
      })
      .then((data) => {
        // Proteção: Garante que data é um array. Se não for, define vazio.
        if (Array.isArray(data)) {
          setSubtopics(data);
        } else {
          console.error("Formato de dados inválido:", data);
          setSubtopics([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar subtópicos:", err);
        setError(
          "Não foi possível carregar os conteúdos. Verifique se o backend está rodando."
        );
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

          {/* Tratamento de Erro Visual */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-3">
              <AlertTriangle />
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-10 text-gray-500">
              Carregando subtópicos...
            </div>
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
                  <p className="text-gray-500 mb-4">
                    Nenhum subtópico encontrado para este tema.
                  </p>
                  <button
                    onClick={() => navigate(`/quiz/topic/${topicId}`)}
                    className="bg-[var(--accent-color)] text-white px-6 py-2 rounded-lg font-bold hover:brightness-90 transition-all"
                  >
                    Fazer Simulado Geral deste Tema
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
