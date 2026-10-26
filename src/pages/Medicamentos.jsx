import { useEffect, useState } from "react";
import {
  Search,
  FlaskConical,
  AlertCircle,
  LoaderCircle,
  ShieldCheck,
  Clock3,
  CircleHelp,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

import {
  pesquisarMedicamentos,
  consultarMedicamentoPorId,
} from "../services/medicamentos";

import DetalhesMedicamento from "./DetalhesMedicamento";

function SeloValidacao({ validado }) {
  if (validado === true) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-800">
        <ShieldCheck size={15} />
        Validado no sistema
      </span>
    );
  }

  if (validado === false) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
        <Clock3 size={15} />
        Pendente de validação
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700">
      <CircleHelp size={15} />
      Estado desconhecido
    </span>
  );
}

export default function Medicamentos({ pesquisaInicial = "" }) {
  const [pesquisa, setPesquisa] = useState(pesquisaInicial);
  const [medicamentos, setMedicamentos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [pesquisou, setPesquisou] = useState(false);

  const [medicamentoSelecionado, setMedicamentoSelecionado] = useState(null);
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);
  const [erroDetalhes, setErroDetalhes] = useState("");

  async function executarPesquisa(termoInformado) {
    const termo = termoInformado.trim();

    if (termo.length < 2) {
      setErro("Digite pelo menos 2 caracteres para pesquisar.");
      setMedicamentos([]);
      setPesquisou(false);
      return;
    }

    setCarregando(true);
    setErro("");
    setErroDetalhes("");
    setPesquisou(true);
    setMedicamentos([]);
    setMedicamentoSelecionado(null);

    try {
      const resultados = await pesquisarMedicamentos(termo);
      setMedicamentos(resultados);
    } catch (error) {
      console.error("Erro ao pesquisar medicamentos:", error);

      setErro(
        "Não foi possível consultar os medicamentos. Verifique a conexão e tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function abrirDetalhes(item) {
    if (carregandoDetalhes) return;

    setCarregandoDetalhes(true);
    setErroDetalhes("");
    setMedicamentoSelecionado(null);

    try {
      const detalhe = await consultarMedicamentoPorId(item.id);

      if (!detalhe) {
        setErroDetalhes(
          "Medicamento não encontrado. Faça uma nova pesquisa e tente novamente."
        );
        return;
      }

      setMedicamentoSelecionado(detalhe);
    } catch (error) {
      console.error("Erro ao abrir detalhes do medicamento:", error);

      setErroDetalhes(
        "Não foi possível carregar os detalhes. Verifique a conexão e as permissões do Supabase."
      );
    } finally {
      setCarregandoDetalhes(false);
    }
  }

  useEffect(() => {
    const termo = pesquisaInicial.trim();

    if (termo.length >= 2) {
      setPesquisa(termo);
      executarPesquisa(termo);
    }
  }, [pesquisaInicial]);

  function handlePesquisar(event) {
    event.preventDefault();
    executarPesquisa(pesquisa);
  }

  if (medicamentoSelecionado) {
    return (
      <DetalhesMedicamento
        medicamento={medicamentoSelecionado}
        aoVoltar={() => {
          setMedicamentoSelecionado(null);
          setErroDetalhes("");
        }}
      />
    );
  }

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-lg bg-blue-100 p-3">
          <FlaskConical size={28} className="text-blue-800" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Consulta de Medicamentos
          </h2>

          <p className="text-sm text-gray-500">
            Pesquise os medicamentos cadastrados no OncoPrep.
          </p>
        </div>
      </div>

      <form
        onSubmit={handlePesquisar}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <input
          type="search"
          value={pesquisa}
          onChange={(event) => setPesquisa(event.target.value)}
          placeholder="Digite o nome do medicamento..."
          aria-label="Nome do medicamento"
          className="flex-1 rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          disabled={carregando}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-800 px-6 py-3 font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {carregando ? (
            <>
              <LoaderCircle size={20} className="animate-spin" />
              Pesquisando...
            </>
          ) : (
            <>
              <Search size={20} />
              Pesquisar
            </>
          )}
        </button>
      </form>

      {carregandoDetalhes && (
        <div
          role="status"
          className="mt-5 flex items-center gap-2 rounded-lg bg-blue-50 p-4 text-blue-800"
        >
          <LoaderCircle size={20} className="animate-spin" />
          Carregando detalhes do medicamento...
        </div>
      )}

      {erroDetalhes && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
        >
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <p>{erroDetalhes}</p>
        </div>
      )}

      {erro && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
        >
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <p>{erro}</p>
        </div>
      )}

      {!erro && pesquisou && !carregando && medicamentos.length === 0 && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
          Nenhum medicamento encontrado para essa pesquisa.
        </div>
      )}

      {medicamentos.length > 0 && (
        <div className="mt-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-600">
              <strong>{medicamentos.length}</strong> resultado(s) encontrado(s).
            </p>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-green-50 px-3 py-1 text-green-800">
                Validado no sistema
              </span>

              <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-800">
                Pendente
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-100 text-sm text-gray-700">
                  <th className="border-b p-3">Medicamento</th>
                  <th className="border-b p-3">Laboratório</th>
                  <th className="border-b p-3">Estado da validação</th>
                  <th className="border-b p-3">Detalhes</th>
                </tr>
              </thead>

              <tbody>
                {medicamentos.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => abrirDetalhes(item)}
                    onKeyDown={(event) => {
                      if (
                        (event.key === "Enter" || event.key === " ") &&
                        !carregandoDetalhes
                      ) {
                        event.preventDefault();
                        abrirDetalhes(item);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Abrir detalhes de ${item.medicamento}`}
                    className="cursor-pointer transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                    title="Clique para consultar os detalhes"
                  >
                    <td className="border-b p-3 font-medium text-gray-800">
                      {item.medicamento || "Nome não informado"}
                    </td>

                    <td className="border-b p-3 text-gray-600">
                      {item.laboratorio || "Não informado"}
                    </td>

                    <td className="border-b p-3">
                      <SeloValidacao validado={item.validado} />
                    </td>

                    <td className="border-b p-3">
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-800">
                        Abrir
                        <ArrowRight size={16} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-sm text-gray-500">
            Clique em um medicamento para consultar os detalhes cadastrados.
          </p>

          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm leading-relaxed text-amber-900">
              <strong>Atenção:</strong> os indicadores representam o estado de
              validação registrado no sistema. Registros pendentes não devem
              ser utilizados como referência clínica aprovada para preparo,
              conservação ou administração de medicamentos. A utilização
              clínica exige revisão e aprovação por profissional habilitado.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}