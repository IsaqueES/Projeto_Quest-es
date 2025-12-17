import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { BookOpen, Shuffle } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-[var(--bg-color)]">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-8 flex flex-col items-center justify-center">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[var(--primary-color)] mb-3">
            Simulado Oficial
          </h1>
          <p className="text-gray-600 text-lg">
            Prepare-se para a prova teórica com a metodologia oficial.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Botão Por Tema */}
          <div
            onClick={() => navigate("/topics")}
            className="bg-white p-10 rounded-2xl shadow-md border-2 border-transparent hover:border-[var(--accent-color)] cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl group"
          >
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-[var(--accent-color)] mb-6 mx-auto group-hover:bg-[var(--accent-color)] group-hover:text-white transition-colors">
              <BookOpen size={32} />
            </div>
            <h3 className="text-2xl font-bold text-[var(--primary-color)] text-center mb-2">
              Estudar por Tema
            </h3>
            <p className="text-gray-500 text-center">
              Foque em Legislação, Mecânica, Primeiros Socorros, etc.
            </p>
          </div>

          {/* Botão Simulado Geral */}
          <div
            onClick={() => navigate("/quiz/all")}
            className="bg-white p-10 rounded-2xl shadow-md border-2 border-transparent hover:border-[var(--success-color)] cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl group"
          >
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-[var(--success-color)] mb-6 mx-auto group-hover:bg-[var(--success-color)] group-hover:text-white transition-colors">
              <Shuffle size={32} />
            </div>
            <h3 className="text-2xl font-bold text-[var(--primary-color)] text-center mb-2">
              Simulado Geral
            </h3>
            <p className="text-gray-500 text-center">
              Prova completa com questões misturadas de todos os assuntos.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
