import { useEffect, useState } from "react";
import {
  Search,
  FlaskConical,
  QrCode,
  FileText,
  ClipboardList,
  Building2,
  ArrowLeft,
  LogOut,
  LoaderCircle,
  ShieldAlert,
} from "lucide-react";

import Medicamentos from "./pages/Medicamentos";
import Login from "./pages/Login";
import { supabase } from "./services/supabase";

export default function App() {
  const [pesquisa, setPesquisa] = useState("");
  const [tela, setTela] = useState("inicio");
  const [sessao, setSessao] = useState(null);
  const [verificandoSessao, setVerificandoSessao] = useState(true);
  const [saindo, setSaindo] = useState(false);
  const [erroSessao, setErroSessao] = useState("");

  useEffect(() => {
    let ativo = true;

    async function verificarSessao() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (ativo) {
          setSessao(data.session);
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);

        if (ativo) {
          setSessao(null);
          setErroSessao(
            "Não foi possível verificar sua sessão. Atualize a página e tente novamente."
          );
        }
      } finally {
        if (ativo) {
          setVerificandoSessao(false);
        }
      }
    }

    verificarSessao();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      if (ativo) {
        setSessao(novaSessao);
        setErroSessao("");
      }
    });

    return () => {
      ativo = false;
      subscription.unsubscribe();
    };
  }, []);

  async function sair() {
    setSaindo(true);
    setErroSessao("");

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setSessao(null);
      setTela("inicio");
      setPesquisa("");
    } catch (error) {
      console.error("Erro ao sair:", error);

      setErroSessao(
        "Não foi possível encerrar a sessão. Tente novamente."
      );
    } finally {
      setSaindo(false);
    }
  }

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
  }

  if (verificandoSessao) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="flex items-center gap-3 text-blue-900">
          <LoaderCircle size={24} className="animate-spin" />
          <span>Verificando acesso...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-blue-900 p-6 text-white shadow-lg">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">🏥 OncoPrep</h1>

            <p className="mt-2 text-blue-200">
              Sistema de Consulta e Manipulação Oncológica
            </p>
          </div>

          {sessao && (
            <div className="flex flex-col gap-2 sm:items-end">
              <span className="break-all text-sm text-blue-100">
                {sessao.user.email}
              </span>

              <button
                type="button"
                onClick={sair}
                disabled={saindo}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-300 px-4 py-2 text-sm font-semibold transition hover:bg-blue-800 disabled:opacity-60"
              >
                {saindo ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <LogOut size={17} />
                )}

                {saindo ? "Saindo..." : "Sair da conta"}
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6">
        {erroSessao && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
          >
            <ShieldAlert size={22} className="mt-0.5 shrink-0" />
            <p>{erroSessao}</p>
          </div>
        )}

        {!sessao ? (
          <Login />
        ) : tela === "medicamentos" ? (
          <>
            <button
              type="button"
              onClick={() => setTela("inicio")}
              className="mb-5 inline-flex items-center gap-2 font-medium text-blue-800 hover:text-blue-950"
            >
              <ArrowLeft size={20} />
              Voltar ao painel
            </button>

            <Medicamentos pesquisaInicial={pesquisa} />
          </>
        ) : (
          <>
            <div className="mb-8 rounded-xl bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-bold text-gray-800">
                Consultar Medicamento
              </h2>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  abrirMedicamentos();
                }}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <input
                  type="search"
                  placeholder="Digite o nome do medicamento..."
                  value={pesquisa}
                  onChange={(event) => setPesquisa(event.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 p-3"
                />

                <button
                  type="submit"
                  className="rounded-lg bg-blue-700 px-6 py-3 text-white hover:bg-blue-800"
                >
                  Pesquisar
                </button>
              </form>

              <p className="mt-3 text-sm text-gray-500">
                Pesquise medicamentos cadastrados no Supabase.
              </p>
            </div>

            <h2 className="mb-6 text-2xl font-bold text-gray-800">
              Painel de Funcionalidades
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {funcionalidades.map((item) => {
                const Icone = item.icone;
                const habilitado = item.titulo === "Medicamentos";

                return (
                  <button
                    key={item.titulo}
                    type="button"
                    onClick={() => {
                      if (habilitado) abrirMedicamentos();
                    }}
                    disabled={!habilitado}
                    className={`rounded-xl bg-white p-6 text-left shadow transition ${
                      habilitado
                        ? "cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-blue-300"
                        : "cursor-not-allowed opacity-80"
                    }`}
                  >
                    <Icone
                      size={36}
                      className="mb-4 text-blue-700"
                    />

                    <h3 className="text-lg font-bold text-gray-800">
                      {item.titulo}
                    </h3>

                    <p className="mt-2 text-gray-500">
                      {item.descricao}
                    </p>

                    <span
                      className={`mt-4 inline-block text-sm ${
                        habilitado ? "text-green-700" : "text-amber-700"
                      }`}
                    >
                      {habilitado
                        ? "Consultar medicamentos"
                        : "Em desenvolvimento"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-10 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-900">
                Ambiente de demonstração. Não utilizar para orientar
                preparações de medicamentos ou emitir rótulos clínicos
                sem validação institucional.
              </p>
            </div>
          </>
        )}
      </main>

      <footer className="p-6 text-center text-gray-500">
        OncoPrep — Sistema de Apoio à Farmácia Oncológica
      </footer>
    </div>
  );
}