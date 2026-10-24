import { useState } from "react";
import {
  Search,
  FlaskConical,
  QrCode,
  FileText,
  ClipboardList,
  Building2,
  ArrowLeft,
} from "lucide-react";

import Medicamentos from "./pages/Medicamentos";

export default function App() {
  const [pesquisa, setPesquisa] = useState("");
  const [tela, setTela] = useState("inicio");

  const funcionalidades = [
    {
      titulo: "Medicamentos",
      descricao: "Consultar medicamentos cadastrados",
      icone: Search,
    },
    {
      titulo: "Estabilidade",
      descricao: "Consultar dados de estabilidade",
      icone: FlaskConical,
    },
    {
      titulo: "Laboratórios",
      descricao: "Pesquisar por fabricante",
      icone: Building2,
    },
    {
      titulo: "QR Code",
      descricao: "Acessar fichas pelo celular",
      icone: QrCode,
    },
    {
      titulo: "Rótulos",
      descricao: "Criar rótulos de manipulação",
      icone: FileText,
    },
    {
      titulo: "Protocolos",
      descricao: "Consultar protocolos aprovados",
      icone: ClipboardList,
    },
  ];

  function abrirMedicamentos() {
    setTela("medicamentos");
    setPesquisa("");
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-blue-900 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold">🏥 OncoPrep</h1>

          <p className="text-blue-200 mt-2">
            Sistema de Consulta e Manipulação Oncológica
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {tela === "medicamentos" ? (
          <>
            <button
              type="button"
              onClick={() => setTela("inicio")}
              className="mb-5 inline-flex items-center gap-2 text-blue-800 hover:text-blue-950 font-medium"
            >
              <ArrowLeft size={20} />
              Voltar ao painel
            </button>

            <Medicamentos />
          </>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Consultar Medicamento
              </h2>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  abrirMedicamentos();
                }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="search"
                  placeholder="Digite o nome do medicamento..."
                  value={pesquisa}
                  onChange={(event) => setPesquisa(event.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg p-3"
                />

                <button
                  type="submit"
                  className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg"
                >
                  Pesquisar
                </button>
              </form>

              <p className="text-sm text-gray-500 mt-3">
                Pesquise medicamentos cadastrados no Supabase.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Painel de Funcionalidades
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {funcionalidades.map((item) => {
                const Icone = item.icone;

                return (
                  <button
                    key={item.titulo}
                    type="button"
                    onClick={() => {
                      if (item.titulo === "Medicamentos") {
                        abrirMedicamentos();
                      }
                    }}
                    disabled={item.titulo !== "Medicamentos"}
                    className={`text-left bg-white p-6 rounded-xl shadow transition ${
                      item.titulo === "Medicamentos"
                        ? "hover:shadow-lg hover:ring-2 hover:ring-blue-300 cursor-pointer"
                        : "opacity-80 cursor-not-allowed"
                    }`}
                  >
                    <Icone
                      size={36}
                      className="text-blue-700 mb-4"
                    />

                    <h3 className="text-lg font-bold text-gray-800">
                      {item.titulo}
                    </h3>

                    <p className="text-gray-500 mt-2">
                      {item.descricao}
                    </p>

                    <span
                      className={`inline-block mt-4 text-sm ${
                        item.titulo === "Medicamentos"
                          ? "text-green-700"
                          : "text-amber-700"
                      }`}
                    >
                      {item.titulo === "Medicamentos"
                        ? "Consultar medicamentos"
                        : "Em desenvolvimento"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-10 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-900 text-sm">
                Ambiente de demonstração. Não utilizar para orientar
                preparações de medicamentos ou emitir rótulos clínicos.
              </p>
            </div>
          </>
        )}
      </main>

      <footer className="text-center text-gray-500 p-6">
        OncoPrep — Sistema de Apoio à Farmácia Oncológica
      </footer>
    </div>
  );
}