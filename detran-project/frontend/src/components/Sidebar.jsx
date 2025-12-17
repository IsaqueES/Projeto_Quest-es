import { useNavigate, useLocation } from "react-router-dom";
import { Home, LayoutGrid, BookOpen, AlertTriangle } from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path
      ? "bg-[var(--accent-color)] text-white shadow-md"
      : "text-gray-600 hover:bg-blue-50 hover:text-[var(--accent-color)]";

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col h-screen fixed left-0 top-0 z-10 shadow-lg">
      <div
        className="p-6 border-b border-gray-100 flex items-center gap-3 cursor-pointer bg-[var(--primary-color)] text-white"
        onClick={() => navigate("/")}
      >
        <div className="font-bold text-xl tracking-wider">
          DETRAN<span className="text-[var(--accent-color)]">SP</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-2">
        <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Menu Principal
        </p>

        <button
          onClick={() => navigate("/")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive(
            "/"
          )}`}
        >
          <Home size={20} /> Início
        </button>

        <button
          onClick={() => navigate("/topics")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive(
            "/topics"
          )}`}
        >
          <LayoutGrid size={20} /> Questões por Tema
        </button>

        <button
          onClick={() => navigate("/quiz/all")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive(
            "/quiz/all"
          )}`}
        >
          <BookOpen size={20} /> Simulado Geral
        </button>

        <button
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-gray-400 cursor-not-allowed opacity-60`}
        >
          <AlertTriangle size={20} /> Revisar Erros
        </button>
      </nav>

      <div className="p-4 text-xs text-gray-400 text-center border-t">
        Versão Educacional 1.0
      </div>
    </aside>
  );
}
