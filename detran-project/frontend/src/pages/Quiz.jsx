import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  ChevronRight,
  AlertTriangle,
  Home,
} from "lucide-react";
import Sidebar from "../components/Sidebar";

export default function Quiz() {
  const { mode, id } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = "aluno-teste-01";

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Constrói a URL
    let url = `http://localhost:8000/questions?user_id=${userId}`;
    if (mode === "topic" && id) {
      url += `&topic_id=${id}`;
    } else if (mode === "subtopic" && id) {
      url += `&subtopic_id=${id}`;
    }

    console.log("Tentando buscar em:", url); // <--- OLHE O CONSOLE (F12)

    // Faz a busca
    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Erro no servidor: ${res.status} - ${text}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Dados recebidos:", data); // <--- VEJA SE VEIO ARRAY []

        if (Array.isArray(data)) {
          setQuestions(data);
          // Busca estatísticas apenas se carregou questões com sucesso
          fetch(`http://localhost:8000/stats?user_id=${userId}`)
            .then((r) => r.json())
            .then((s) => setStats(s))
            .catch((e) => console.warn("Erro ao buscar stats:", e));
        } else {
          throw new Error(
            "O formato dos dados recebidos não é uma lista válida."
          );
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro fatal:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [mode, id]);

  const handleOptionClick = async (optionIndex) => {
    if (isSubmitted) return;

    setSelectedOption(optionIndex);
    setIsSubmitted(true);

    const currentQ = questions[currentIndex];
    const isCorrect = optionIndex === currentQ.correct_option;

    // Tenta salvar sem travar o app se falhar
    try {
      await fetch("http://localhost:8000/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          question_id: currentQ.id,
          is_correct: isCorrect,
        }),
      });
      setStats((prev) => ({
        correct: isCorrect ? prev.correct + 1 : prev.correct,
        wrong: !isCorrect ? prev.wrong + 1 : prev.wrong,
      }));
    } catch (e) {
      console.error("Erro ao salvar progresso:", e);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      alert("Finalizado!");
      navigate("/");
    }
  };

  // --- RENDERS DE ESTADO (Para não dar tela branca) ---

  if (loading)
    return (
      <div className="flex min-h-screen bg-[var(--bg-color)] items-center justify-center">
        <div className="text-xl font-bold text-gray-500 animate-pulse">
          Carregando questões...
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex min-h-screen bg-[var(--bg-color)] items-center justify-center p-8">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-lg border-l-4 border-red-500">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Ops! Ocorreu um erro.
          </h2>
          <p className="text-gray-600 mb-6 bg-gray-100 p-2 rounded text-sm font-mono">
            {error}
          </p>
          <div className="text-sm text-gray-500 mb-4">
            Dica: Verifique se o terminal do backend está rodando sem erros.
          </div>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded font-bold"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );

  if (questions.length === 0)
    return (
      <div className="flex min-h-screen bg-[var(--bg-color)]">
        <Sidebar />
        <div className="flex-1 md:ml-64 p-8 flex flex-col items-center justify-center">
          <div className="bg-white p-10 rounded-xl shadow-lg text-center max-w-lg">
            <CheckCircle className="w-20 h-20 text-blue-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-700 mb-4">
              Nenhuma questão encontrada
            </h2>
            <p className="text-gray-600 mb-8">
              Não encontramos questões para este tópico no banco de dados.
              <br />
              <br />
              <span className="text-sm bg-yellow-100 p-1 rounded text-yellow-800">
                Dica: Você rodou o script "npm run import" no backend?
              </span>
            </p>
            <button
              onClick={() => navigate("/topics")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );

  // Se chegou aqui, temos questões! Renderiza a prova.
  const question = questions[currentIndex];
  // Proteção extra caso a questão esteja vazia
  if (!question) return <div>Erro ao carregar índice {currentIndex}</div>;

  const isCorrect = selectedOption === question.correct_option;

  return (
    <div className="flex min-h-screen bg-[var(--bg-color)]">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border-b-2 border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-[var(--primary-color)]">
              Questão {currentIndex + 1}{" "}
              <span className="text-gray-400 font-normal">
                / {questions.length}
              </span>
            </h2>
          </div>
          <div className="flex gap-4 text-sm font-bold">
            <span className="text-green-600 bg-green-50 px-3 py-1 rounded">
              ✓ {stats.correct}
            </span>
            <span className="text-red-500 bg-red-50 px-3 py-1 rounded">
              ✕ {stats.wrong}
            </span>
          </div>
        </header>

        {/* Questão */}
        <div className="flex-1 overflow-y-auto pb-24">
          <div className="bg-white w-full max-w-[950px] mx-auto rounded-xl shadow-sm p-8 md:p-12">
            <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-8 leading-relaxed">
              {question.question_text}
            </h3>

            <div className="flex flex-col gap-3">
              {question.options.map((opt, idx) => {
                // Lógica de cores
                let style =
                  "w-full text-left p-4 rounded-lg border-2 flex items-center transition-all ";
                if (isSubmitted) {
                  if (idx === question.correct_option)
                    style +=
                      "border-green-500 bg-green-50 text-green-700 font-bold";
                  else if (idx === selectedOption)
                    style += "border-red-500 bg-red-50 text-red-700 font-bold";
                  else style += "border-gray-100 text-gray-400 opacity-60";
                } else {
                  style +=
                    "border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer text-gray-700";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(idx)}
                    disabled={isSubmitted}
                    className={style}
                  >
                    <span className="w-8 h-8 rounded-full border flex items-center justify-center mr-4 bg-white text-xs font-bold shrink-0">
                      {["A", "B", "C", "D", "E"][idx]}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {isSubmitted && (
              <div
                className={`mt-8 p-6 rounded border-l-4 ${
                  isCorrect
                    ? "bg-green-50 border-green-500"
                    : "bg-red-50 border-red-500"
                }`}
              >
                <h4 className="font-bold text-lg mb-2">
                  {isCorrect ? "Correto!" : "Incorreto!"}
                </h4>
                <p className="text-gray-700">{question.explanation}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 md:left-64 left-0 right-0 p-4 bg-white border-t flex justify-end z-20">
          {isSubmitted && (
            <button
              onClick={handleNext}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2"
            >
              Próxima <ChevronRight size={20} />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
