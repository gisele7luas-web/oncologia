import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { supabase } from "../services/supabase";

export default function ScannerQR() {
  const scannerRef = useRef(null);
  const processandoRef = useRef(false);

  const [escaneando, setEscaneando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [medicamentos, setMedicamentos] = useState([]);
  const [medicamentoNome, setMedicamentoNome] = useState("");
  const [medicamentoSelecionado, setMedicamentoSelecionado] =
    useState(null);

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;

      if (scanner?.isScanning) {
        scanner.stop().catch((erro) => {
          console.error("Erro ao encerrar câmera:", erro);
        });
      }
    };
  }, []);

  function limparConsulta() {
    setMedicamentos([]);
    setMedicamentoNome("");
    setMedicamentoSelecionado(null);
    setMensagem("");
  }

  async function buscarMedicamento(codigo) {
    limparConsulta();
    setCarregando(true);

    try {
      const codigoLimpo = String(codigo).trim();
      const prefixo = "ONCOPREP_MEDICAMENTO:";

      let nomeMedicamento = "";

      // Novo formato: nome do medicamento dentro do QR Code.
      if (codigoLimpo.startsWith(prefixo)) {
        nomeMedicamento = decodeURIComponent(
          codigoLimpo.slice(prefixo.length)
        ).trim();
      } else {
        // Mantém compatibilidade com QR Codes antigos por ID
        // e com URLs que contenham ?medicamento=ID ou ?id=ID.
        let id = codigoLimpo;

        try {
          const url = new URL(codigoLimpo);

          id =
            url.searchParams.get("medicamento") ||
            url.searchParams.get("id") ||
            "";
        } catch {
          // Não era uma URL; verifica se é um ID numérico.
        }

        if (/^\d+$/.test(id)) {
          const { data, error } = await supabase
            .from("estabilidade_medicamentos")
            .select(
              "id, medicamento, laboratorio, volume_diluente, concentracao, estabilidade_ta, estabilidade_refrigerado, via_administracao, observacoes, validado"
            )
            .eq("id", Number(id))
            .maybeSingle();

          if (error) throw error;

          if (!data) {
            setMensagem(
              "Nenhum cadastro foi encontrado para este QR Code."
            );
            return;
          }

          setMedicamentos([data]);
          setMedicamentoNome(data.medicamento);
          return;
        }

        // Formato desconhecido.
        if (!nomeMedicamento) {
          setMensagem(
            "Este QR Code não foi reconhecido. Gere um novo código na tela Criar Rótulos."
          );
          return;
        }
      }

      if (!nomeMedicamento) {
        setMensagem(
          "O QR Code não contém o nome de um medicamento válido."
        );
        return;
      }

      // Busca os cadastros do medicamento, independentemente do laboratório.
      const { data, error } = await supabase
        .from("estabilidade_medicamentos")
        .select(
          "id, medicamento, laboratorio, volume_diluente, concentracao, estabilidade_ta, estabilidade_refrigerado, via_administracao, observacoes, validado"
        )
        .ilike("medicamento", nomeMedicamento)
        .order("laboratorio", { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        setMensagem(
          "Não foram encontrados cadastros para este medicamento."
        );
        return;
      }

      setMedicamentos(data);
      setMedicamentoNome(data[0].medicamento);

      if (data.length === 1) {
        setMedicamentoSelecionado(data[0]);
      }
    } catch (erro) {
      console.error("Erro ao consultar medicamento:", erro);

      setMensagem(
        "Não foi possível consultar os dados. Verifique sua conexão e suas permissões de acesso."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function iniciarScanner() {
    setMensagem("");
    limparConsulta();

    if (!window.isSecureContext) {
      setMensagem(
        "A câmera exige uma conexão segura HTTPS. Abra o OncoPrep pelo endereço publicado com HTTPS."
      );
      return;
    }

    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }

      const scanner = new Html5Qrcode("leitor-qr-oncoprep");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (textoLido) => {
          if (processandoRef.current) return;

          processandoRef.current = true;
          setEscaneando(false);

          try {
            await scanner.stop();
          } catch (erro) {
            console.warn("Não foi possível parar a câmera:", erro);
          }

          await buscarMedicamento(textoLido);
          processandoRef.current = false;
        },
        () => {
          // Ignora tentativas sem leitura válida.
        }
      );

      setEscaneando(true);
    } catch (erro) {
      console.error("Erro ao iniciar scanner:", erro);

      setMensagem(
        "Não foi possível abrir a câmera. Autorize o acesso e tente novamente."
      );

      scannerRef.current = null;
      processandoRef.current = false;
    }
  }

  async function pararScanner() {
    const scanner = scannerRef.current;

    if (scanner?.isScanning) {
      try {
        await scanner.stop();
      } catch (erro) {
        console.error("Erro ao parar scanner:", erro);
      }
    }

    setEscaneando(false);
    scannerRef.current = null;
    processandoRef.current = false;
  }

  function Campo({ titulo, valor }) {
    if (valor === null || valor === undefined || valor === "") {
      return null;
    }

    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-500">{titulo}</p>
        <p className="mt-1 whitespace-pre-wrap font-medium text-slate-800">
          {valor}
        </p>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
          OncoPrep
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          Scanner de QR Code
        </h1>

        <p className="mt-2 text-slate-600">
          Escaneie o medicamento e selecione o laboratório correspondente
          ao produto retirado do estoque.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div
          id="leitor-qr-oncoprep"
          className="mx-auto w-full max-w-md overflow-hidden rounded-xl"
        />

        <div className="mt-4 flex flex-wrap gap-3">
          {!escaneando ? (
            <button
              type="button"
              onClick={iniciarScanner}
              disabled={carregando}
              className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
            >
              Abrir câmera e escanear
            </button>
          ) : (
            <button
              type="button"
              onClick={pararScanner}
              className="rounded-xl bg-slate-700 px-5 py-3 font-semibold text-white hover:bg-slate-800"
            >
              Parar câmera
            </button>
          )}
        </div>

        <p className="mt-3 text-sm text-slate-500">
          A câmera precisa de sua autorização. Em celulares, use o OncoPrep
          por HTTPS.
        </p>
      </section>

      {carregando && (
        <p role="status" className="rounded-xl bg-slate-100 p-4 text-slate-700">
          Consultando os cadastros do medicamento...
        </p>
      )}

      {mensagem && (
        <div
          role="alert"
          className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900"
        >
          {mensagem}
        </div>
      )}

      {medicamentos.length > 0 && !medicamentoSelecionado && (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <div>
            <p className="text-sm text-slate-500">
              Medicamento identificado
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {medicamentoNome}
            </h2>

            <p className="mt-2 text-slate-600">
              Qual laboratório consta na embalagem do medicamento retirado
              do estoque?
            </p>
          </div>

          <label
            htmlFor="laboratorio-medicamento"
            className="block font-semibold text-slate-800"
          >
            Selecione o laboratório
          </label>

          <select
            id="laboratorio-medicamento"
            value=""
            onChange={(event) => {
              const id = event.target.value;

              const selecionado = medicamentos.find(
                (item) => String(item.id) === id
              );

              if (selecionado) {
                setMedicamentoSelecionado(selecionado);
              }
            }}
            className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-800"
          >
            <option value="">Escolha o laboratório</option>

            {medicamentos.map((item) => (
              <option key={item.id} value={String(item.id)}>
                {item.laboratorio || "Laboratório não informado"}
                {" | "}
                {item.concentracao || "Concentração não informada"}
                {" | ID: "}
                {item.id}
              </option>
            ))}
          </select>

          {medicamentos.length > 1 && (
            <p className="text-sm text-slate-500">
              Existem {medicamentos.length} cadastros para este medicamento.
              Confira o laboratório e a concentração na embalagem antes
              de selecionar.
            </p>
          )}
        </section>
      )}

      {medicamentoSelecionado && (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">
                Cadastro selecionado · ID {medicamentoSelecionado.id}
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {medicamentoSelecionado.medicamento}
              </h2>

              <p className="mt-2 font-semibold text-teal-800">
                Laboratório: {medicamentoSelecionado.laboratorio || "Não informado"}
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                medicamentoSelecionado.validado
                  ? "bg-green-100 text-green-800"
                  : "bg-amber-100 text-amber-900"
              }`}
            >
              {medicamentoSelecionado.validado
                ? "Registro marcado como validado"
                : "Registro não validado"}
            </span>
          </div>

          {!medicamentoSelecionado.validado && (
            <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800">
              <strong>Atenção:</strong> este registro não está marcado como
              validado. Não utilize os dados como instrução clínica aprovada
              até que sejam revisados e aprovados pelos responsáveis
              da instituição.
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Campo
              titulo="Concentração cadastrada"
              valor={medicamentoSelecionado.concentracao}
            />

            <Campo
              titulo="Volume/diluente cadastrado"
              valor={medicamentoSelecionado.volume_diluente}
            />

            <Campo
              titulo="Via de administração"
              valor={medicamentoSelecionado.via_administracao}
            />

            <Campo
              titulo="Estabilidade em temperatura ambiente"
              valor={medicamentoSelecionado.estabilidade_ta}
            />

            <Campo
              titulo="Estabilidade sob refrigeração"
              valor={medicamentoSelecionado.estabilidade_refrigerado}
            />

            <div className="sm:col-span-2">
              <Campo
                titulo="Observações"
                valor={medicamentoSelecionado.observacoes}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {medicamentos.length > 1 && (
              <button
                type="button"
                onClick={() => setMedicamentoSelecionado(null)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-100"
              >
                Escolher outro laboratório
              </button>
            )}

            <button
              type="button"
              onClick={limparConsulta}
              className="rounded-xl bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800"
            >
              Consultar outro medicamento
            </button>
          </div>

          <p className="text-sm text-slate-500">
            Confira se o laboratório e a apresentação correspondem à embalagem.
            Esta ficha exibe dados cadastrados e não substitui o procedimento
            institucional vigente, validado e aprovado.
          </p>
        </section>
      )}
    </main>
  );
}