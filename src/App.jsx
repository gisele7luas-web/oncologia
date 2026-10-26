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
  Users,
} from "lucide-react";

import Medicamentos from "./pages/Medicamentos";
import Usuarios from "./pages/Usuarios";
import Laboratorios from "./pages/Laboratorios";
import ScannerQR from "./pages/ScannerQR";
import CriarRotulo from "./pages/CriarRotulo";
import Protocolos from "./pages/Protocolos";
import Login from "./pages/Login";

import { supabase } from "./services/supabase";
import { verificarAdministrador } from "./services/medicamentos";

const PERMISSOES_PADRAO = {
  consultar_medicamentos: false,
  cadastrar_medicamentos: false,
  editar_medicamentos: false,
  excluir_medicamentos: false,
  consultar_estabilidade: false,
  consultar_laboratorios: false,
  acessar_qr_code: false,
  criar_rotulos: false,
  consultar_protocolos: false,
};

const TODAS_PERMISSOES = Object.fromEntries(
  Object.keys(PERMISSOES_PADRAO).map((permissao) => [
    permissao,
    true,
  ])
);

export default function App() {
  const [pesquisa, setPesquisa] = useState("");
  const [tela, setTela] = useState("inicio");
  const [sessao, setSessao] = useState(null);

  const [verificandoSessao, setVerificandoSessao] = useState(true);
  const [verificandoAcesso, setVerificandoAcesso] = useState(false);
  const [saindo, setSaindo] = useState(false);

  const [erroSessao, setErroSessao] = useState("");
  const [ehAdministrador, setEhAdministrador] = useState(false);

  const [permissoes, setPermissoes] = useState(
    PERMISSOES_PADRAO
  );

  // Verifica a sessão e acompanha login e logout.
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

        if (!novaSessao) {
          setTela("inicio");
          setPesquisa("");
          setEhAdministrador(false);
          setPermissoes(PERMISSOES_PADRAO);
        }
      }
    });

    return () => {
      ativo = false;
      subscription.unsubscribe();
    };
  }, []);

  // Carrega as permissões do usuário conectado.
  useEffect(() => {
    let ativo = true;

    async function carregarAcesso() {
      if (!sessao?.user?.id) {
        setEhAdministrador(false);
        setPermissoes(PERMISSOES_PADRAO);
        setVerificandoAcesso(false);
        return;
      }

      setVerificandoAcesso(true);
      setErroSessao("");

      try {
        const administrador = await verificarAdministrador();

        if (!ativo) return;

        setEhAdministrador(administrador);

        // A administradora mantém acesso a todas as funcionalidades.
        if (administrador) {
          setPermissoes(TODAS_PERMISSOES);
          return;
        }

        // Consulta as permissões do próprio usuário autenticado.
        const { data, error } = await supabase
          .from("oncoprep_permissoes")
          .select(
            [
              "consultar_medicamentos",
              "cadastrar_medicamentos",
              "editar_medicamentos",
              "excluir_medicamentos",
              "consultar_estabilidade",
              "consultar_laboratorios",
              "acessar_qr_code",
              "criar_rotulos",
              "consultar_protocolos",
            ].join(",")
          )
          .eq("user_id", sessao.user.id)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          setPermissoes(PERMISSOES_PADRAO);
          setErroSessao(
            "Sua conta ainda não possui permissões cadastradas. Solicite à administradora que confira seu cadastro."
          );
          return;
        }

        const permissoesCarregadas = {};

        for (const campo of Object.keys(PERMISSOES_PADRAO)) {
          permissoesCarregadas[campo] = data[campo] === true;
        }

        if (ativo) {
          setPermissoes(permissoesCarregadas);
        }
      } catch (error) {
        console.error("Erro ao carregar permissões:", error);

        if (ativo) {
          setPermissoes(PERMISSOES_PADRAO);
          setErroSessao(
            "Não foi possível carregar suas permissões. Atualize a página ou solicite ajuda à administradora."
          );
        }
      } finally {
        if (ativo) {
          setVerificandoAcesso(false);
        }
      }
    }

    carregarAcesso();

    return () => {
      ativo = false;
    };
  }, [sessao?.user?.id]);

  async function sair() {
    setSaindo(true);
    setErroSessao("");

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setSessao(null);
      setTela("inicio");
      setPesquisa("");
      setEhAdministrador(false);
      setPermissoes(PERMISSOES_PADRAO);
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
      permissao: "consultar_medicamentos",
      icone: Search,
      destino: "medicamentos",
    },
    {
      titulo: "Estabilidade",
      descricao: "Consultar dados de estabilidade",
      permissao: "consultar_estabilidade",
      icone: FlaskConical,
      destino: "medicamentos",
    },
    {
      titulo: "Laboratórios",
      descricao: "Pesquisar por fabricante",
      permissao: "consultar_laboratorios",
      icone: Building2,
      destino: "laboratorios",
    },
    {
      titulo: "QR Code",
      descricao: "Acessar fichas pelo celular",
      permissao: "acessar_qr_code",
      icone: QrCode,
      destino: "qrcode",
    },
    {
      titulo: "Rótulos",
      descricao: "Criar rótulos de manipulação",
      permissao: "criar_rotulos",
      icone: FileText,
      destino: "rotulos",
    },
    {
      titulo: "Protocolos",
      descricao: "Consultar protocolos aprovados",
      permissao: "consultar_protocolos",
      icone: ClipboardList,
      destino: "protocolos",
    },
  ];

  function abrirTela(destino) {
    setErroSessao("");

    if (destino === "usuarios" && !ehAdministrador) {
      setErroSessao(
        "Somente a administradora pode gerenciar usuários."
      );
      return;
    }

    if (destino !== "usuarios" && destino !== "inicio") {
      const funcionalidade = funcionalidades.find(
        (item) => item.destino === destino
      );

      // A autorização de cada cartão é conferida separadamente
      // abaixo. Esta verificação não substitui as regras do banco.
      if (
        destino === "medicamentos" &&
        !permissoes.consultar_medicamentos &&
        !permissoes.consultar_estabilidade
      ) {
        setErroSessao(
          "Você não tem permissão para consultar medicamentos ou estabilidade."
        );
        return;
      }

      if (
        destino === "laboratorios" &&
        !permissoes.consultar_laboratorios
      ) {
        setErroSessao("Você não tem permissão para consultar laboratórios.");
        return;
      }

      if (
        destino === "qrcode" &&
        !permissoes.acessar_qr_code
      ) {
        setErroSessao("Você não tem permissão para acessar o QR Code.");
        return;
      }

      if (
        destino === "rotulos" &&
        !permissoes.criar_rotulos
      ) {
        setErroSessao("Você não tem permissão para criar rótulos.");
        return;
      }

      if (
        destino === "protocolos" &&
        !permissoes.consultar_protocolos
      ) {
        setErroSessao("Você não tem permissão para consultar protocolos.");
        return;
      }

      void funcionalidade;
    }

    setTela(destino);
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
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />
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
        ) : verificandoAcesso ? (
          <div className="rounded-xl bg-white p-8 text-center text-blue-900 shadow">
            <LoaderCircle
              size={24}
              className="mx-auto mb-3 animate-spin"
            />
            Carregando suas permissões...
          </div>
        ) : tela === "usuarios" ? (
          ehAdministrador ? (
            <>
              <button
                type="button"
                onClick={() => abrirTela("inicio")}
                className="mb-5 inline-flex items-center gap-2 font-medium text-blue-800 hover:text-blue-950"
              >
                <ArrowLeft size={20} />
                Voltar ao painel
              </button>

              <Usuarios />
            </>
          ) : (
            <p className="rounded-xl bg-white p-6 text-red-800 shadow">
              Você não tem autorização para gerenciar usuários.
            </p>
          )
        ) : tela === "medicamentos" ? (
          permissoes.consultar_medicamentos ||
          permissoes.consultar_estabilidade ? (
            <>
              <button
                type="button"
                onClick={() => abrirTela("inicio")}
                className="mb-5 inline-flex items-center gap-2 font-medium text-blue-800 hover:text-blue-950"
              >
                <ArrowLeft size={20} />
                Voltar ao painel
              </button>

              <Medicamentos pesquisaInicial={pesquisa} />
            </>
          ) : (
            <p className="rounded-xl bg-white p-6 text-red-800 shadow">
              Você não tem permissão para consultar medicamentos.
            </p>
          )
        ) : tela === "laboratorios" ? (
          permissoes.consultar_laboratorios ? (
            <>
              <button
                type="button"
                onClick={() => abrirTela("inicio")}
                className="mb-5 inline-flex items-center gap-2 font-medium text-blue-800 hover:text-blue-950"
              >
                <ArrowLeft size={20} />
                Voltar ao painel
              </button>
              <Laboratorios />
            </>
          ) : null
        ) : tela === "qrcode" ? (
          permissoes.acessar_qr_code ? (
            <>
              <button
                type="button"
                onClick={() => abrirTela("inicio")}
                className="mb-5 inline-flex items-center gap-2 font-medium text-blue-800 hover:text-blue-950"
              >
                <ArrowLeft size={20} />
                Voltar ao painel
              </button>
              <ScannerQR />
            </>
          ) : null
        ) : tela === "rotulos" ? (
          permissoes.criar_rotulos ? (
            <>
              <button
                type="button"
                onClick={() => abrirTela("inicio")}
                className="mb-5 inline-flex items-center gap-2 font-medium text-blue-800 hover:text-blue-950"
              >
                <ArrowLeft size={20} />
                Voltar ao painel
              </button>
              <CriarRotulo />
            </>
          ) : null
        ) : tela === "protocolos" ? (
          permissoes.consultar_protocolos ? (
            <>
              <button
                type="button"
                onClick={() => abrirTela("inicio")}
                className="mb-5 inline-flex items-center gap-2 font-medium text-blue-800 hover:text-blue-950"
              >
                <ArrowLeft size={20} />
                Voltar ao painel
              </button>
              <Protocolos />
            </>
          ) : null
        ) : (
          <>
            {(permissoes.consultar_medicamentos ||
              permissoes.consultar_estabilidade) && (
              <div className="mb-8 rounded-xl bg-white p-6 shadow">
                <h2 className="mb-4 text-xl font-bold text-gray-800">
                  Consultar Medicamento
                </h2>

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    abrirTela("medicamentos");
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
            )}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                Painel de Funcionalidades
              </h2>

              {ehAdministrador && (
                <button
                  type="button"
                  onClick={() => abrirTela("usuarios")}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white shadow transition hover:bg-blue-800"
                >
                  <Users size={19} />
                  Gerenciar usuários
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {funcionalidades
                .filter((item) => permissoes[item.permissao])
                .map((item) => {
                  const Icone = item.icone;

                  return (
                    <button
                      key={item.titulo}
                      type="button"
                      onClick={() => abrirTela(item.destino)}
                      className="rounded-xl bg-white p-6 text-left shadow transition hover:shadow-lg hover:ring-2 hover:ring-blue-300"
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

                      <span className="mt-4 inline-block text-sm text-green-700">
                        Acesso autorizado
                      </span>
                    </button>
                  );
                })}
            </div>

            {funcionalidades.every(
              (item) => !permissoes[item.permissao]
            ) && (
              <div className="rounded-xl bg-white p-6 text-gray-700 shadow">
                Sua conta ainda não tem funcionalidades liberadas.
                Solicite à administradora que confira suas permissões.
              </div>
            )}

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