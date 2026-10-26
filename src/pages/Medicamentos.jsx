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
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
} from "lucide-react";

import {
  pesquisarMedicamentos,
  consultarMedicamentoPorId,
  verificarAdministrador,
  cadastrarMedicamento,
  editarMedicamento,
  excluirMedicamento,
} from "../services/medicamentos";

import DetalhesMedicamento from "./DetalhesMedicamento";

const FORMULARIO_VAZIO = {
  medicamento: "",
  laboratorio: "",
  volume_diluente: "",
  concentracao: "",
  estabilidade_ta: "",
  estabilidade_refrigerado: "",
  via_administracao: "",
  observacoes: "",
  validado: false,
};

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

function Campo({ label, value, onChange, multiline = false }) {
  const classes =
    "w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </span>

      {multiline ? (
        <textarea
          value={value}
          onChange={onChange}
          rows={3}
          className={classes}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={onChange}
          className={classes}
        />
      )}
    </label>
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

  const [administrador, setAdministrador] = useState(false);
  const [verificandoAdmin, setVerificandoAdmin] = useState(true);

  const [formularioAberto, setFormularioAberto] = useState(false);
  const [medicamentoEditando, setMedicamentoEditando] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] = useState(null);
  const [mensagemAdmin, setMensagemAdmin] = useState("");
  const [erroAdmin, setErroAdmin] = useState("");

  useEffect(() => {
    let ativo = true;

    async function conferirPermissao() {
      try {
        const autorizado = await verificarAdministrador();

        if (ativo) {
          setAdministrador(autorizado);
        }
      } catch (error) {
        console.error("Erro ao verificar administrador:", error);

        if (ativo) {
          setAdministrador(false);
        }
      } finally {
        if (ativo) {
          setVerificandoAdmin(false);
        }
      }
    }

    conferirPermissao();

    return () => {
      ativo = false;
    };
  }, []);

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

  function abrirCadastro() {
    setMedicamentoEditando(null);
    setFormulario(FORMULARIO_VAZIO);
    setMensagemAdmin("");
    setErroAdmin("");
    setFormularioAberto(true);
  }

  function abrirEdicao(item) {
    setMedicamentoEditando(item);
    setFormulario({
      medicamento: item.medicamento ?? "",
      laboratorio: item.laboratorio ?? "",
      volume_diluente: item.volume_diluente ?? "",
      concentracao: item.concentracao ?? "",
      estabilidade_ta: item.estabilidade_ta ?? "",
      estabilidade_refrigerado: item.estabilidade_refrigerado ?? "",
      via_administracao: item.via_administracao ?? "",
      observacoes: item.observacoes ?? "",
      validado: item.validado === true,
    });

    setMensagemAdmin("");
    setErroAdmin("");
    setFormularioAberto(true);
  }

  function atualizarCampo(event) {
    const { name, value, type, checked } = event.target;

    setFormulario((atual) => ({
      ...atual,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function salvarMedicamento(event) {
    event.preventDefault();

    if (!formulario.medicamento.trim()) {
      setErroAdmin("O nome do medicamento é obrigatório.");
      return;
    }

    setSalvando(true);
    setErroAdmin("");
    setMensagemAdmin("");

    const dados = {
      ...formulario,
      medicamento: formulario.medicamento.trim(),
      laboratorio: formulario.laboratorio.trim() || null,
      volume_diluente: formulario.volume_diluente.trim() || null,
      concentracao: formulario.concentracao.trim() || null,
      estabilidade_ta: formulario.estabilidade_ta.trim() || null,
      estabilidade_refrigerado:
        formulario.estabilidade_refrigerado.trim() || null,
      via_administracao: formulario.via_administracao.trim() || null,
      observacoes: formulario.observacoes.trim() || null,
      validado: formulario.validado,
    };

    try {
      if (medicamentoEditando) {
        await editarMedicamento(medicamentoEditando.id, dados);
        setMensagemAdmin("Medicamento atualizado com sucesso!");
      } else {
        await cadastrarMedicamento(dados);
        setMensagemAdmin("Medicamento cadastrado com sucesso!");
      }

      const nomeSalvo = dados.medicamento;

      setFormularioAberto(false);
      setMedicamentoEditando(null);
      setFormulario(FORMULARIO_VAZIO);

      setPesquisa(nomeSalvo);
      await executarPesquisa(nomeSalvo);
    } catch (error) {
      console.error("Erro ao salvar medicamento:", error);

      setErroAdmin(
        error?.message ||
          "Não foi possível salvar o medicamento. Verifique as permissões e tente novamente."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir(item) {
    const confirmou = window.confirm(
      `Tem certeza de que deseja excluir "${item.medicamento}"?\n\nEssa ação não pode ser desfeita.`
    );

    if (!confirmou) return;

    setExcluindoId(item.id);
    setErroAdmin("");
    setMensagemAdmin("");

    try {
      await excluirMedicamento(item.id);

      setMensagemAdmin(
        `Medicamento "${item.medicamento}" excluído com sucesso.`
      );

      if (medicamentoEditando?.id === item.id) {
        setFormularioAberto(false);
        setMedicamentoEditando(null);
        setFormulario(FORMULARIO_VAZIO);
      }

      await executarPesquisa(pesquisa);
    } catch (error) {
      console.error("Erro ao excluir medicamento:", error);

      setErroAdmin(
        error?.message ||
          "Não foi possível excluir o medicamento. Verifique as permissões e tente novamente."
      );
    } finally {
      setExcluindoId(null);
    }
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
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

        {!verificandoAdmin && administrador && (
          <button
            type="button"
            onClick={abrirCadastro}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-3 font-semibold text-white transition hover:bg-green-800"
          >
            <Plus size={19} />
            Cadastrar medicamento
          </button>
        )}
      </div>

      {mensagemAdmin && (
        <div
          role="status"
          className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          {mensagemAdmin}
        </div>
      )}

      {erroAdmin && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <p>{erroAdmin}</p>
        </div>
      )}

      {formularioAberto && administrador && (
        <form
          onSubmit={salvarMedicamento}
          className="mb-6 rounded-xl border border-blue-200 bg-blue-50/50 p-5"
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-gray-800">
              {medicamentoEditando
                ? "Editar medicamento"
                : "Cadastrar medicamento"}
            </h3>

            <button
              type="button"
              onClick={() => {
                setFormularioAberto(false);
                setErroAdmin("");
              }}
              aria-label="Fechar formulário"
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-200 hover:text-gray-800"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Campo
              label="Nome do medicamento *"
              value={formulario.medicamento}
              onChange={(e) =>
                setFormulario((atual) => ({
                  ...atual,
                  medicamento: e.target.value,
                }))
              }
            />

            <Campo
              label="Laboratório"
              value={formulario.laboratorio}
              onChange={(e) =>
                setFormulario((atual) => ({
                  ...atual,
                  laboratorio: e.target.value,
                }))
              }
            />

            <Campo
              label="Volume do diluente"
              value={formulario.volume_diluente}
              onChange={(e) =>
                setFormulario((atual) => ({
                  ...atual,
                  volume_diluente: e.target.value,
                }))
              }
            />

            <Campo
              label="Concentração"
              value={formulario.concentracao}
              onChange={(e) =>
                setFormulario((atual) => ({
                  ...atual,
                  concentracao: e.target.value,
                }))
              }
            />

            <Campo
              label="Estabilidade em temperatura ambiente"
              value={formulario.estabilidade_ta}
              onChange={(e) =>
                setFormulario((atual) => ({
                  ...atual,
                  estabilidade_ta: e.target.value,
                }))
              }
            />

            <Campo
              label="Estabilidade sob refrigeração"
              value={formulario.estabilidade_refrigerado}
              onChange={(e) =>
                setFormulario((atual) => ({
                  ...atual,
                  estabilidade_refrigerado: e.target.value,
                }))
              }
            />

            <Campo
              label="Via de administração"
              value={formulario.via_administracao}
              onChange={(e) =>
                setFormulario((atual) => ({
                  ...atual,
                  via_administracao: e.target.value,
                }))
              }
            />

            <Campo
              label="Observações"
              value={formulario.observacoes}
              multiline
              onChange={(e) =>
                setFormulario((atual) => ({
                  ...atual,
                  observacoes: e.target.value,
                }))
              }
            />
          </div>

          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <input
              type="checkbox"
              name="validado"
              checked={formulario.validado}
              onChange={atualizarCampo}
              className="mt-1 h-4 w-4"
            />

            <span>
              <span className="block text-sm font-semibold text-amber-900">
                Registro validado
              </span>
              <span className="mt-1 block text-sm text-amber-800">
                Marque somente após a revisão e aprovação por profissional
                habilitado, conforme as fontes e os procedimentos institucionais.
              </span>
            </span>
          </label>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={salvando}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-800 px-5 py-3 font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvando ? (
                <LoaderCircle size={19} className="animate-spin" />
              ) : (
                <Save size={19} />
              )}

              {salvando
                ? "Salvando..."
                : medicamentoEditando
                  ? "Salvar alterações"
                  : "Cadastrar"}
            </button>

            <button
              type="button"
              onClick={() => {
                setFormularioAberto(false);
                setErroAdmin("");
              }}
              disabled={salvando}
              className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-60"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

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
                  {administrador && (
                    <th className="border-b p-3">Ações</th>
                  )}
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

                    {administrador && (
                      <td className="border-b p-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            title="Editar medicamento"
                            aria-label={`Editar ${item.medicamento}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              abrirEdicao(item);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-800 transition hover:bg-blue-50"
                          >
                            <Pencil size={15} />
                            Editar
                          </button>

                          <button
                            type="button"
                            title="Excluir medicamento"
                            aria-label={`Excluir ${item.medicamento}`}
                            disabled={excluindoId === item.id}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleExcluir(item);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            {excluindoId === item.id ? (
                              <LoaderCircle
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={15} />
                            )}
                            Excluir
                          </button>
                        </div>
                      </td>
                    )}
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