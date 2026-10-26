import { useEffect, useMemo, useState } from "react";
import { FileText, Printer, RefreshCw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "../services/supabase";

export default function CriarRotulo() {
  const [medicamentos, setMedicamentos] = useState([]);
  const [medicamentoNome, setMedicamentoNome] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  async function carregarMedicamentos() {
    setCarregando(true);
    setErro("");

    try {
      const { data, error } = await supabase
        .from("estabilidade_medicamentos")
        .select(
          "id, medicamento, laboratorio, concentracao, via_administracao, validado"
        )
        .order("medicamento", { ascending: true });

      if (error) throw error;

      setMedicamentos(data || []);
    } catch (error) {
      console.error("Erro ao carregar medicamentos:", error);
      setErro(
        "Não foi possível carregar os medicamentos. Verifique sua conexão e suas permissões."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarMedicamentos();
  }, []);

  // Agrupa os cadastros pelo nome do medicamento.
  // Os diferentes laboratórios continuam cadastrados no Supabase.
  const gruposMedicamentos = useMemo(() => {
    const grupos = new Map();

    medicamentos.forEach((item) => {
      const nome = (item.medicamento || "").trim();

      if (!nome) return;

      const chave = nome.toLocaleLowerCase("pt-BR");

      if (!grupos.has(chave)) {
        grupos.set(chave, {
          nome,
          chave,
          cadastros: [],
        });
      }

      grupos.get(chave).cadastros.push(item);
    });

    return Array.from(grupos.values()).sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR")
    );
  }, [medicamentos]);

  const grupoSelecionado = gruposMedicamentos.find(
    (grupo) => grupo.chave === medicamentoNome
  );

  function imprimirRotulo() {
    if (!grupoSelecionado) return;
    window.print();
  }

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-6">
      <header className="flex items-center gap-3">
        <FileText size={32} className="text-blue-700" />

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Criar rótulos
          </h1>

          <p className="text-sm text-slate-600">
            Gere um único QR Code para cada medicamento, independentemente
            do laboratório.
          </p>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:hidden">
        <label
          htmlFor="medicamento-rotulo"
          className="mb-2 block font-semibold text-slate-800"
        >
          Selecione o medicamento
        </label>

        {carregando ? (
          <p className="text-slate-600">Carregando medicamentos...</p>
        ) : (
          <select
            id="medicamento-rotulo"
            value={medicamentoNome}
            onChange={(event) => setMedicamentoNome(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-800"
          >
            <option value="">Escolha um medicamento</option>

            {gruposMedicamentos.map((grupo) => (
              <option key={grupo.chave} value={grupo.chave}>
                {grupo.nome}
              </option>
            ))}
          </select>
        )}

        {erro && (
          <div
            role="alert"
            className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800"
          >
            {erro}
          </div>
        )}

        {!carregando && !erro && gruposMedicamentos.length === 0 && (
          <p className="mt-3 text-sm text-slate-600">
            Nenhum medicamento disponível para consulta.
          </p>
        )}

        {grupoSelecionado && (
          <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-950">
            <p>
              <strong>Cadastros encontrados:</strong>{" "}
              {grupoSelecionado.cadastros.length}
            </p>

            <p className="mt-1">
              <strong>Laboratórios disponíveis:</strong>{" "}
              {[
                ...new Set(
                  grupoSelecionado.cadastros
                    .map((item) => item.laboratorio?.trim())
                    .filter(Boolean)
                ),
              ].join(", ") || "Não informados"}
            </p>

            <p className="mt-2">
              O QR Code será único para este medicamento. No momento da
              consulta, o profissional poderá escolher o laboratório
              correspondente ao produto retirado do estoque.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={carregarMedicamentos}
          disabled={carregando}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Atualizar lista
        </button>
      </section>

      {grupoSelecionado && (
        <section className="space-y-4">
          <div
            id="area-impressao-rotulo"
            className="mx-auto max-w-xl rounded-2xl border-2 border-slate-300 bg-white p-6"
          >
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
                OncoPrep
              </p>

              <h2 className="mt-3 text-2xl font-bold text-slate-900">
                {grupoSelecionado.nome}
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Consulte e selecione o laboratório após ler o QR Code.
              </p>

              <div className="my-5 flex justify-center">
                <QRCodeSVG
                  value={`ONCOPREP_MEDICAMENTO:${encodeURIComponent(
                    grupoSelecionado.nome
                  )}`}
                  size={220}
                  level="H"
                  marginSize={4}
                  title={`QR Code de consulta: ${grupoSelecionado.nome}`}
                />
              </div>

              <p className="text-sm text-slate-700">
                <strong>Laboratórios cadastrados:</strong>
              </p>

              <p className="mt-1 text-sm text-slate-600">
                {[
                  ...new Set(
                    grupoSelecionado.cadastros
                      .map((item) => item.laboratorio?.trim())
                      .filter(Boolean)
                  ),
                ].join(" • ") || "Não informados"}
              </p>

              <p className="mt-4 text-xs text-slate-500">
                Este código identifica o medicamento, não uma preparação
                individual. Confira o laboratório do produto em mãos antes
                de consultar os dados.
              </p>
            </div>
          </div>

          <div className="flex justify-center print:hidden">
            <button
              type="button"
              onClick={imprimirRotulo}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
            >
              <Printer size={18} />
              Imprimir rótulo
            </button>
          </div>
        </section>
      )}

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 print:hidden">
        <strong>Importante:</strong> o QR Code identifica o medicamento
        para consulta. As informações clínicas e os procedimentos de preparo
        devem ser conferidos e validados pela instituição.
      </section>

      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }

          #area-impressao-rotulo,
          #area-impressao-rotulo * {
            visibility: visible !important;
          }

          #area-impressao-rotulo {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: none;
            border: 1px solid #000;
            box-shadow: none;
          }

          @page {
            margin: 10mm;
          }
        }
      `}</style>
    </main>
  );
}