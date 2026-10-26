import { useEffect, useState } from "react";
import {
  UserPlus,
  Search,
  RefreshCw,
  Pencil,
  Lock,
  Unlock,
  Trash2,
  Save,
  X,
  ShieldCheck,
  LoaderCircle,
  Users,
} from "lucide-react";

import {
  listarUsuarios,
  criarUsuario,
  alterarUsuario,
  bloquearUsuario,
  desbloquearUsuario,
  excluirUsuario,
} from "../services/usuarios";

const PERMISSOES = [
  {
    campo: "consultar_medicamentos",
    titulo: "Consultar medicamentos",
  },
  {
    campo: "cadastrar_medicamentos",
    titulo: "Cadastrar medicamentos",
  },
  {
    campo: "editar_medicamentos",
    titulo: "Editar medicamentos",
  },
  {
    campo: "excluir_medicamentos",
    titulo: "Excluir medicamentos",
  },
  {
    campo: "consultar_estabilidade",
    titulo: "Consultar estabilidade",
  },
  {
    campo: "consultar_laboratorios",
    titulo: "Consultar laboratórios",
  },
  {
    campo: "acessar_qr_code",
    titulo: "Acessar QR Code",
  },
  {
    campo: "criar_rotulos",
    titulo: "Criar rótulos",
  },
  {
    campo: "consultar_protocolos",
    titulo: "Consultar protocolos",
  },
];

const PERMISSOES_PADRAO = Object.fromEntries(
  PERMISSOES.map(({ campo }) => [
    campo,
    ["consultar_medicamentos", "consultar_estabilidade"].includes(campo),
  ])
);

const FORMULARIO_VAZIO = {
  nome: "",
  email: "",
  senha: "",
  permissoes: { ...PERMISSOES_PADRAO },
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [busca, setBusca] = useState("");
  const [formulario, setFormulario] = useState(FORMULARIO_VAZIO);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [operandoId, setOperandoId] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function carregarUsuarios() {
    setCarregando(true);
    setErro("");

    try {
      const resultado = await listarUsuarios();
      setUsuarios(resultado.usuarios ?? []);
    } catch (error) {
      setErro(error.message || "Não foi possível carregar os usuários.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  function abrirCadastro() {
    setUsuarioEditando(null);
    setFormulario({
      ...FORMULARIO_VAZIO,
      permissoes: { ...PERMISSOES_PADRAO },
    });
    setMostrarFormulario(true);
    setErro("");
    setSucesso("");
  }

  function abrirEdicao(usuario) {
    if (usuario.administrador) return;

    setUsuarioEditando(usuario);
    setFormulario({
      nome: usuario.nome ?? "",
      email: usuario.email ?? "",
      senha: "",
      permissoes: {
        ...PERMISSOES_PADRAO,
        ...(usuario.permissoes ?? {}),
      },
    });
    setMostrarFormulario(true);
    setErro("");
    setSucesso("");
  }

  function fecharFormulario() {
    setMostrarFormulario(false);
    setUsuarioEditando(null);
    setFormulario(FORMULARIO_VAZIO);
  }

  function atualizarCampo(campo, valor) {
    setFormulario((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  function atualizarPermissao(campo, valor) {
    setFormulario((atual) => ({
      ...atual,
      permissoes: {
        ...atual.permissoes,
        [campo]: valor,
      },
    }));
  }

  async function salvarUsuario(event) {
    event.preventDefault();
    setErro("");
    setSucesso("");

    if (!formulario.nome.trim() || !formulario.email.trim()) {
      setErro("Informe o nome e o e-mail.");
      return;
    }

    if (!usuarioEditando && formulario.senha.length < 8) {
      setErro("A senha inicial precisa ter pelo menos 8 caracteres.");
      return;
    }

    if (formulario.senha && formulario.senha.length < 8) {
      setErro("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    setSalvando(true);

    try {
      if (usuarioEditando) {
        await alterarUsuario({
          user_id: usuarioEditando.id,
          nome: formulario.nome.trim(),
          email: formulario.email.trim(),
          ...(formulario.senha ? { senha: formulario.senha } : {}),
          permissoes: formulario.permissoes,
        });

        setSucesso("Usuário atualizado com sucesso.");
      } else {
        await criarUsuario({
          nome: formulario.nome.trim(),
          email: formulario.email.trim(),
          senha: formulario.senha,
          permissoes: formulario.permissoes,
        });

        setSucesso("Usuário cadastrado com sucesso.");
      }

      fecharFormulario();
      await carregarUsuarios();
    } catch (error) {
      setErro(error.message || "Não foi possível salvar o usuário.");
    } finally {
      setSalvando(false);
    }
  }

  async function executarAcao(usuario, acao) {
    if (usuario.administrador) {
      setErro("A conta administradora principal está protegida.");
      return;
    }

    if (
      acao === "excluir" &&
      !window.confirm(
        `Deseja realmente excluir a conta ${usuario.email}? Essa ação é permanente.`
      )
    ) {
      return;
    }

    if (
      acao === "bloquear" &&
      !window.confirm(`Deseja bloquear o acesso de ${usuario.email}?`)
    ) {
      return;
    }

    setErro("");
    setSucesso("");
    setOperandoId(usuario.id);

    try {
      if (acao === "bloquear") {
        await bloquearUsuario(usuario.id);
        setSucesso("Usuário bloqueado.");
      } else if (acao === "desbloquear") {
        await desbloquearUsuario(usuario.id);
        setSucesso("Usuário desbloqueado.");
      } else if (acao === "excluir") {
        await excluirUsuario(usuario.id);
        setSucesso("Usuário excluído.");
      }

      await carregarUsuarios();
    } catch (error) {
      setErro(error.message || "Não foi possível concluir a operação.");
    } finally {
      setOperandoId("");
    }
  }

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const termo = busca.trim().toLowerCase();

    return (
      (usuario.nome ?? "").toLowerCase().includes(termo) ||
      (usuario.email ?? "").toLowerCase().includes(termo)
    );
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Users className="text-blue-800" size={32} />
            <h2 className="text-2xl font-bold text-gray-800">
              Gerenciar usuários
            </h2>
          </div>

          <p className="mt-2 text-gray-600">
            Cadastre contas e administre as permissões de acesso.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={carregarUsuarios}
            disabled={carregando}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={18} />
            Atualizar
          </button>

          <button
            type="button"
            onClick={abrirCadastro}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-800 px-4 py-3 font-semibold text-white hover:bg-blue-900"
          >
            <UserPlus size={18} />
            Novo usuário
          </button>
        </div>
      </div>

      {erro && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
        >
          {erro}
        </div>
      )}

      {sucesso && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800"
        >
          {sucesso}
        </div>
      )}

      {mostrarFormulario && (
        <form
          onSubmit={salvarUsuario}
          className="space-y-5 rounded-xl border border-blue-100 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl font-bold text-gray-800">
              {usuarioEditando ? "Editar usuário" : "Cadastrar usuário"}
            </h3>

            <button
              type="button"
              onClick={fecharFormulario}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              aria-label="Fechar formulário"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                Nome completo
              </span>
              <input
                required
                value={formulario.nome}
                onChange={(event) =>
                  atualizarCampo("nome", event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 p-3"
                autoComplete="name"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                E-mail
              </span>
              <input
                required
                type="email"
                value={formulario.email}
                onChange={(event) =>
                  atualizarCampo("email", event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 p-3"
                autoComplete="email"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                {usuarioEditando
                  ? "Nova senha (opcional)"
                  : "Senha inicial"}
              </span>
              <input
                type="password"
                required={!usuarioEditando}
                minLength={8}
                value={formulario.senha}
                onChange={(event) =>
                  atualizarCampo("senha", event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 p-3"
                autoComplete="new-password"
                placeholder="Mínimo de 8 caracteres"
              />
            </label>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-gray-800">
              Permissões deste usuário
            </h4>

            <p className="mb-4 text-sm text-gray-500">
              Marque apenas os recursos que esta conta poderá utilizar.
            </p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PERMISSOES.map(({ campo, titulo }) => (
                <label
                  key={campo}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(formulario.permissoes[campo])}
                    onChange={(event) =>
                      atualizarPermissao(campo, event.target.checked)
                    }
                    className="mt-1 h-4 w-4 accent-blue-800"
                  />
                  <span className="text-sm text-gray-700">{titulo}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={salvando}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-800 px-5 py-3 font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
            >
              {salvando ? (
                <LoaderCircle className="animate-spin" size={18} />
              ) : (
                <Save size={18} />
              )}
              {salvando ? "Salvando..." : "Salvar usuário"}
            </button>

            <button
              type="button"
              onClick={fecharFormulario}
              disabled={salvando}
              className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <label className="relative block">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        {carregando ? (
          <div className="flex items-center justify-center gap-3 p-10 text-blue-800">
            <LoaderCircle className="animate-spin" size={24} />
            Carregando usuários...
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            Nenhum usuário encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-gray-50 text-sm text-gray-600">
                <tr>
                  <th className="px-5 py-4 font-semibold">Usuário</th>
                  <th className="px-5 py-4 font-semibold">Perfil</th>
                  <th className="px-5 py-4 font-semibold">Situação</th>
                  <th className="px-5 py-4 text-right font-semibold">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {usuariosFiltrados.map((usuario) => {
                  const ocupado = operandoId === usuario.id;

                  return (
                    <tr key={usuario.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-800">
                          {usuario.nome || "Nome não informado"}
                        </div>
                        <div className="break-all text-sm text-gray-500">
                          {usuario.email}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {usuario.administrador ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800">
                            <ShieldCheck size={14} />
                            Administradora
                          </span>
                        ) : (
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
                            Usuário
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            usuario.bloqueado
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {usuario.bloqueado ? "Bloqueado" : "Ativo"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            title="Editar usuário"
                            aria-label={`Editar ${usuario.email}`}
                            disabled={usuario.administrador || ocupado}
                            onClick={() => abrirEdicao(usuario)}
                            className="rounded-lg border border-gray-200 p-2 text-blue-800 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            title={usuario.bloqueado ? "Desbloquear" : "Bloquear"}
                            aria-label={`${usuario.bloqueado ? "Desbloquear" : "Bloquear"} ${usuario.email}`}
                            disabled={usuario.administrador || ocupado}
                            onClick={() =>
                              executarAcao(
                                usuario,
                                usuario.bloqueado ? "desbloquear" : "bloquear"
                              )
                            }
                            className="rounded-lg border border-gray-200 p-2 text-amber-800 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {ocupado ? (
                              <LoaderCircle size={17} className="animate-spin" />
                            ) : usuario.bloqueado ? (
                              <Unlock size={17} />
                            ) : (
                              <Lock size={17} />
                            )}
                          </button>

                          <button
                            type="button"
                            title="Excluir usuário"
                            aria-label={`Excluir ${usuario.email}`}
                            disabled={usuario.administrador || ocupado}
                            onClick={() => executarAcao(usuario, "excluir")}
                            className="rounded-lg border border-gray-200 p-2 text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-500">
        A conta administradora é protegida contra edição, bloqueio e exclusão
        nesta tela. A autorização também precisa ser validada no servidor.
      </p>
    </section>
  );
}