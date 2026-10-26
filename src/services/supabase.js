import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY."
  );
}

const fetchOriginal = globalThis.fetch.bind(globalThis);

const fetchDiagnostico = async (input, init) => {
  const url = typeof input === "string" ? input : input.url;

  console.log("[Supabase diagnóstico] Requisição iniciada:", {
    host: new URL(url).hostname,
    metodo: init?.method ?? "GET",
  });

  try {
    const resposta = await fetchOriginal(input, init);

    console.log("[Supabase diagnóstico] Resposta:", {
      status: resposta.status,
      ok: resposta.ok,
    });

    return resposta;
  } catch (erro) {
    console.error("[Supabase diagnóstico] Falha:", {
      nome: erro.name,
      mensagem: erro.message,
    });

    throw erro;
  }
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: fetchDiagnostico,
  },
});