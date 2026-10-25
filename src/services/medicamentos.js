import { supabase } from "./supabase";

export async function pesquisarMedicamentos(nome) {
  const termo = nome.trim();

  if (termo.length < 2) {
    return [];
  }

  const { data, error } = await supabase
    .from("estabilidade_medicamentos")
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

export async function consultarMedicamentoValidado(id) {
  const { data, error } = await supabase.rpc(
    "consultar_medicamento_validado",
    {
      p_id: id,
    }
  );

  if (error) {
    console.error("Erro ao consultar detalhes do medicamento:", error);
    throw error;
  }

  return data?.[0] ?? null;
}