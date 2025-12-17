import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, ChevronRight, HelpCircle } from "lucide-react";
import Sidebar from "../components/Sidebar";

export default function Quiz() {
  const { mode, id } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null); // Índice da opção clicada
  const [isSubmitted, setIsSubmitted] = useState(false); // Se já respondeu a questão atual
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });
  const [loading, setLoading] = useState(true);

  // Usuário "dummy" para teste. Em produção usaria autenticação real.
  const userId = "aluno-teste-01";

  // 1. Carregar Questões
  useEffect(() => {
    setLoading(true);
    let url = `http://localhost:8000/questions?user_id=${userId}`;

    if (mode === "topic" && id) {
      url += `&topic_id=${id}`;
    }

    Promise.all([
      fetch(url).then((res) => res.json()),
      fetch(`http://localhost:8000/stats?user_id=${userId}`).then((res) =>
        res.json()
      ),
    ])
      .then(([qData, sData]) => {
        setQuestions(qData);
        setStats(sData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro no fetch:", err);
        setLoading(false);
      });
  }, [mode, id]);

  // 2. Lógica ao clicar numa opção (Igual ao checkAnswer do HTML)
  const handleOptionClick = async (optionIndex) => {
    if (isSubmitted) return; // Bloqueia se já respondeu

    setSelectedOption(optionIndex);
    setIsSubmitted(true);

    const currentQ = questions[currentIndex];
    const isCorrect = optionIndex === currentQ.correct_option;

    // Salva no Backend
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

      // Atualiza placar local
      setStats((prev) => ({
        correct: isCorrect ? prev.correct + 1 : prev.correct,
        wrong: !isCorrect ? prev.wrong + 1 : prev.wrong,
      }));
    } catch (error) {
      console.error("Erro ao salvar resposta:", error);
    }
  };

  // 3. Ir para próxima questão
  const handleNext = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      alert("Módulo finalizado! Voltando para o menu.");
      navigate("/");
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-[var(--primary-color)] font-bold text-xl">
        Carregando banco de questões...
      </div>
    );

  if (questions.length === 0)
    return (
      <div className="flex min-h-screen bg-[var(--bg-color)]">
        <Sidebar />
        <div className="flex-1 md:ml-64 p-8 flex flex-col items-center justify-center">
          <div className="bg-white p-10 rounded-xl shadow-lg text-center max-w-lg">
            <CheckCircle className="w-20 h-20 text-[var(--success-color)] mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-4">
              Parabéns!
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Você zerou as questões disponíveis neste tema.
            </p>
            <button
              onClick={() => navigate("/topics")}
              className="btn-primary w-full"
            >
              Voltar aos Temas
            </button>
          </div>
        </div>
      </div>
    );

  const question = questions[currentIndex];
  const isCorrect = selectedOption === question.correct_option;

  return (
    <div className="flex min-h-screen bg-[var(--bg-color)]">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 flex flex-col h-screen overflow-hidden">
        {/* Header Superior (Placar) */}
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
            <div className="flex items-center gap-2 text-[var(--success-color)] bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
              <CheckCircle size={18} /> {stats.correct} Acertos
            </div>
            <div className="flex items-center gap-2 text-[var(--error-color)] bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
              <XCircle size={18} /> {stats.wrong} Erros
            </div>
          </div>
        </header>

        {/* Container Principal da Questão */}
        <div className="flex-1 overflow-y-auto pb-24">
          <div className="card-container mx-auto p-8 md:p-12 relative">
            {/* Texto da Pergunta */}
            <h3 className="text-xl md:text-2xl font-semibold text-[var(--primary-color)] leading-relaxed mb-8">
              {question.question_text}
            </h3>

            {/* Se houver imagem (placeholder, caso seu banco tenha url de imagem futuramente) */}
            {/* {question.image_url && <img src={question.image_url} alt="Ilustração" className="mb-6 max-w-full h-auto rounded-lg border" />} */}

            {/* Lista de Opções */}
            <div className="flex flex-col gap-2">
              {question.options.map((opt, idx) => {
                let btnClass = "option-btn ";
                let circleClass =
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 text-sm font-bold transition-colors ";

                if (isSubmitted) {
                  // Se já respondeu, revela as cores
                  if (idx === question.correct_option) {
                    btnClass += "option-correct"; // Correta fica verde
                    circleClass +=
                      "border-[var(--success-color)] bg-[var(--success-color)] text-white";
                  } else if (idx === selectedOption) {
                    btnClass += "option-incorrect"; // Errada selecionada fica vermelha
                    circleClass +=
                      "border-[var(--error-color)] bg-[var(--error-color)] text-white";
                  } else {
                    btnClass += "opacity-50 grayscale"; // As outras ficam apagadas
                    circleClass += "border-gray-300 text-gray-400";
                  }
                } else {
                  // Estado normal antes de responder
                  btnClass +=
                    "hover:border-[var(--accent-color)] hover:shadow-sm cursor-pointer";
                  circleClass +=
                    "border-gray-300 text-gray-500 group-hover:border-[var(--accent-color)] group-hover:text-[var(--accent-color)]";
                }

                const letters = ["A", "B", "C", "D", "E"];

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(idx)}
                    disabled={isSubmitted}
                    className={btnClass}
                  >
                    <div className={circleClass}>{letters[idx]}</div>
                    <span className="font-medium text-lg text-gray-700 flex-1">
                      {opt}
                    </span>

                    {/* Ícones de status na direita */}
                    {isSubmitted && idx === question.correct_option && (
                      <CheckCircle className="text-[var(--success-color)] ml-2" />
                    )}
                    {isSubmitted &&
                      idx === selectedOption &&
                      idx !== question.correct_option && (
                        <XCircle className="text-[var(--error-color)] ml-2" />
                      )}
                  </button>
                );
              })}
            </div>

            {/* Área de Feedback (Explicação) - Só aparece depois de responder */}
            {isSubmitted && (
              <div
                className={`mt-8 p-6 rounded-lg border-l-4 animate-fade-in ${
                  isCorrect
                    ? "bg-green-50 border-[var(--success-color)]"
                    : "bg-red-50 border-[var(--error-color)]"
                }`}
              >
                <div className="flex gap-3 mb-2">
                  {isCorrect ? (
                    <CheckCircle className="text-[var(--success-color)]" />
                  ) : (
                    <HelpCircle className="text-[var(--error-color)]" />
                  )}
                  <h4
                    className={`font-bold text-lg ${
                      isCorrect
                        ? "text-[var(--success-color)]"
                        : "text-[var(--error-color)]"
                    }`}
                  >
                    {isCorrect
                      ? "Correto! Muito bem."
                      : "Atenção! Resposta Incorreta."}
                  </h4>
                </div>

                <p className="text-gray-700 leading-relaxed pl-9">
                  {question.explanation ||
                    "Confira o gabarito oficial para mais detalhes."}
                </p>

                {!isCorrect && (
                  <div className="mt-4 ml-9 bg-white p-4 rounded border border-gray-200 text-sm text-gray-600 shadow-sm">
                    <strong className="text-[var(--error-color)] uppercase text-xs tracking-wide block mb-1">
                      Dica de Ouro:
                    </strong>
                    {question.trick_tip ||
                      "Leia o enunciado com atenção às palavras 'NÃO', 'EXCETO' ou 'INCORRETO'."}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Barra de Navegação Inferior (Botão Próximo) */}
        <div className="fixed bottom-0 md:left-64 left-0 right-0 p-4 bg-white border-t border-gray-200 flex justify-center md:justify-end z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
          {isSubmitted ? (
            <button
              onClick={handleNext}
              className="btn-primary flex items-center gap-2 text-lg px-8 animate-pulse-slow"
            >
              Próxima Questão <ChevronRight size={24} />
            </button>
          ) : (
            <div className="text-gray-400 text-sm italic py-3">
              Selecione uma alternativa para continuar
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
