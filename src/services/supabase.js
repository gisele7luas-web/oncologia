import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();

const chaveOriginal = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !chaveOriginal) {
  throw new Error(
    "Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY."
  );
}

// Remove espaços e quebras de linha acidentais.
// Se a mesma chave foi colada várias vezes, usa apenas uma cópia.
const partesChave = chaveOriginal.split(/\s+/).filter(Boolean);

const chavesUnicas = [...new Set(partesChave)];

if (chavesUnicas.length !== 1) {
  throw new Error(
    "A chave do Supabase contém valores diferentes. Confira VITE_SUPABASE_ANON_KEY no Vercel."
  );
}

const supabaseKey = chavesUnicas[0];

const fetchDiagnostico = async (input, init) => {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;

  console.log("[Supabase diagnóstico] Requisição iniciada:", {
    host: new URL(url).hostname,
    metodo: init?.method ?? "GET",
  });

  try {
    const resposta = await fetch(input, init);

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