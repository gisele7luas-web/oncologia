import { supabase } from "./supabase";

const TABELA = "estabilidade_medicamentos";

const CAMPOS_MEDICAMENTO = [
  "medicamento",
  "laboratorio",
  "volume_diluente",
  "concentracao",
  "estabilidade_ta",
  "estabilidade_refrigerado",
  "via_administracao",
  "observacoes",
  "validado",
];

function prepararDadosMedicamento(dados) {
  const dadosLimpos = {};

  for (const campo of CAMPOS_MEDICAMENTO) {
    if (Object.prototype.hasOwnProperty.call(dados, campo)) {
      dadosLimpos[campo] = dados[campo];
    }
  }

  if (
    typeof dadosLimpos.medicamento !== "string" ||
    !dadosLimpos.medicamento.trim()
  ) {
    throw new Error("O nome do medicamento é obrigatório.");
  }

  dadosLimpos.medicamento = dadosLimpos.medicamento.trim();

  return dadosLimpos;
}

// Verifica a permissão administrativa no Supabase.
export async function verificarAdministrador() {
  const {
    data: { user },
    error: erroUsuario,
  } = await supabase.auth.getUser();

  if (erroUsuario) {
    throw erroUsuario;
  }

  if (!user) {
    return false;
  }

  const { data, error } = await supabase.rpc("is_oncoprep_admin");

  if (error) {
    console.error("Erro ao verificar administrador:", error);
    throw error;
  }

  return data === true;
}

// Pesquisa medicamentos.
export async function pesquisarMedicamentos(nome) {
  const termo = nome.trim();

  if (termo.length < 2) {
    return [];
  }

  const { data, error } = await supabase
    .from(TABELA)
    .select("*")
    .ilike("medicamento", `%${termo}%`)
    .order("medicamento")
    .limit(30);

  if (error) {
    console.error("Erro ao pesquisar medicamentos:", error);
    throw error;
  }

  return data ?? [];
}

// Consulta um medicamento pelo ID.
export async function consultarMedicamentoPorId(id) {
  if (id === undefined || id === null) {
    throw new Error("O identificador do medicamento não foi informado.");
  }

  const { data, error } = await supabase
    .from(TABELA)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Erro ao consultar detalhes do medicamento:", error);
    throw error;
  }

  return data;
}

// Cadastra um medicamento.
export async function cadastrarMedicamento(dados) {
  const administrador = await verificarAdministrador();

  if (!administrador) {
    throw new Error("Apenas administradores podem cadastrar medicamentos.");
  }

  const dadosLimpos = prepararDadosMedicamento(dados);

  const { data, error } = await supabase
    .from(TABELA)
    .insert(dadosLimpos)
    .select()
    .single();

  if (error) {
    console.error("Erro ao cadastrar medicamento:", error);
    throw error;
  }

  return data;
}

// Edita um medicamento existente.
export async function editarMedicamento(id, dados) {
  if (id === undefined || id === null) {
    throw new Error("O identificador do medicamento não foi informado.");
  }

  const administrador = await verificarAdministrador();

  if (!administrador) {
    throw new Error("Apenas administradores podem editar medicamentos.");
  }

  const dadosLimpos = prepararDadosMedicamento(dados);

  const { data, error } = await supabase
    .from(TABELA)
    .update(dadosLimpos)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao editar medicamento:", error);
    throw error;
  }

  return data;
}

// Exclui um medicamento existente.
export async function excluirMedicamento(id) {
  if (id === undefined || id === null) {
    throw new Error("O identificador do medicamento não foi informado.");
  }

  const administrador = await verificarAdministrador();

  if (!administrador) {
    throw new Error("Apenas administradores podem excluir medicamentos.");
  }

  const { data, error } = await supabase
    .from(TABELA)
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Erro ao excluir medicamento:", error);
    throw error;
  }

  if (!data) {
    throw new Error(
      "Nenhum medicamento foi excluído. Verifique o registro e suas permissões."
    );
  }

  return true;
}