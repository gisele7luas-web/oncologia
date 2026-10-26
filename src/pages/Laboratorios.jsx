import { useEffect, useState } from "react";
import { ArrowLeft, Building2, LoaderCircle, Search } from "lucide-react";
import { supabase } from "../services/supabase";

export default function Laboratorios() {
  const [laboratorios, setLaboratorios] = useState([]);
  const [pesquisa, setPesquisa] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarLaboratorios() {
      setCarregando(true);
      setErro("");

      try {
        const { data, error } = await supabase
          .from("estabilidade_medicamentos")
          .select("laboratorio")
          .not("laboratorio", "is", null)
          .order("laboratorio");

        if (error) throw error;

        const lista = [
          ...new Set(
            (data || [])
              .map((item) => item.laboratorio?.trim())
              .filter(Boolean)
          ),
        ].sort((a, b) => a.localeCompare(b, "pt-BR"));

        if (ativo) setLaboratorios(lista);
      } catch (error) {
        console.error("Erro ao carregar laboratórios:", error);

        if (ativo) {
          setErro(
            "Não foi possível carregar os laboratórios. Verifique sua conexão e suas permissões."
          );
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarLaboratorios();

    return () => {
      ativo = false;
    };
  }, []);

  const filtrados = laboratorios.filter((laboratorio) =>
    laboratorio.toLowerCase().includes(pesquisa.toLowerCase())
  );

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <div className="mb-6 flex items-center gap-3">
        <Building2 size={32} className="text-blue-700" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Laboratórios
          </h2>
          <p className="text-gray-500">
            Consulte os laboratórios cadastrados nos medicamentos.
          </p>
        </div>
      </div>

      <label className="mb-5 flex items-center gap-3 rounded-lg border border-gray-300 px-3">
        <Search size={20} className="text-gray-500" />
        <input
          type="search"
          value={pesquisa}
          onChange={(event) => setPesquisa(event.target.value)}
          placeholder="Pesquisar laboratório..."
          className="w-full border-0 p-3 outline-none"
        />
      </label>

      {carregando ? (
        <div className="flex items-center gap-3 py-6 text-blue-800">
          <LoaderCircle size={22} className="animate-spin" />
          Carregando laboratórios...
        </div>
      ) : erro ? (
        <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-800">
          {erro}
        </p>
      ) : filtrados.length === 0 ? (
        <p className="rounded-lg bg-slate-50 p-4 text-gray-600">
          Nenhum laboratório encontrado.
        </p>
      ) : (
        <>
          <p className="mb-4 text-sm text-gray-500">
            {filtrados.length} laboratório(s) encontrado(s).
          </p>

          <div className="divide-y divide-gray-100">
            {filtrados.map((laboratorio) => (
              <div key={laboratorio} className="py-4 font-medium text-gray-800">
                {laboratorio}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}