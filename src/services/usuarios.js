import { supabase } from "./supabase";

const FUNCAO_USUARIOS = "gerenciar-usuarios";

/**
 * Executa uma ação administrativa na Edge Function.
 * Utiliza a sessão atual do Supabase.
 */
export async function gerenciarUsuarios(dados) {
  const {
    data: { session },
    error: erroSessao,
  } = await supabase.auth.getSession();

  if (erroSessao) {
    throw new Error("Não foi possível verificar sua sessão.");
  }

  if (!session?.access_token) {
    throw new Error("Faça login novamente para continuar.");
  }

  const { data, error } = await supabase.functions.invoke(
    FUNCAO_USUARIOS,
    {
      body: dados,
    }
  );

  if (error) {
    console.error("Erro ao chamar gerenciamento de usuários:", error);
    throw new Error(
      "Não foi possível acessar o gerenciamento de usuários. Confira sua conexão e tente novamente."
    );
  }

  if (data?.erro) {
    throw new Error(data.erro);
  }

  return data;
}

/** Lista os usuários cadastrados. */
export async function listarUsuarios() {
  return gerenciarUsuarios({ acao: "listar" });
}

/** Cadastra um usuário com suas permissões iniciais. */
export async function criarUsuario({
  nome,
  email,
  senha,
  permissoes,
}) {
  return gerenciarUsuarios({
    acao: "criar",
    nome,
    email,
    senha,
    permissoes,
  });
}

/** Altera os dados e, opcionalmente, as permissões de um usuário. */
export async function alterarUsuario({
  user_id,
  nome,
  email,
  senha,
  permissoes,
}) {
  const dados = {
    acao: "alterar",
    user_id,
  };

  if (nome !== undefined) dados.nome = nome;
  if (email !== undefined) dados.email = email;
  if (senha !== undefined && senha !== "") dados.senha = senha;
  if (permissoes !== undefined) dados.permissoes = permissoes;

  return gerenciarUsuarios(dados);
}

/** Bloqueia o acesso de um usuário. */
export async function bloquearUsuario(user_id) {
  return gerenciarUsuarios({
    acao: "bloquear",
    user_id,
  });
}

/** Reativa o acesso de um usuário bloqueado. */
export async function desbloquearUsuario(user_id) {
  return gerenciarUsuarios({
    acao: "desbloquear",
    user_id,
  });
}

/** Exclui um usuário. A função do servidor protege a conta administradora. */
export async function excluirUsuario(user_id) {
  return gerenciarUsuarios({
    acao: "excluir",
    user_id,
  });
}