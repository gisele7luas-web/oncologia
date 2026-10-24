import {
  ArrowLeft,
  FlaskConical,
  Building2,
  Droplets,
  Thermometer,
  Snowflake,
  Route,
  ClipboardList,
  ShieldCheck,
  Clock3,
  CircleHelp,
  AlertTriangle,
  Hash,
} from "lucide-react";

function CampoDetalhe({ titulo, valor, icone: Icone }) {
  const valorDisponivel =
    valor !== null &&
    valor !== undefined &&
    String(valor).trim() !== "";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500">
        {Icone && <Icone size={19} className="text-blue-700" />}
        <span>{titulo}</span>
      </div>

      <p className="whitespace-pre-wrap break-words font-medium leading-relaxed text-gray-800">
        {valorDisponivel
          ? String(valor)
          : "Não informado no cadastro"}
      </p>
    </div>
  );
}

function SeloValidacao({ validado }) {
  if (validado === true) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-800">
        <ShieldCheck size={18} />
        Validado no sistema
      </span>
    );
  }

  if (validado === false) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
        <Clock3 size={18} />
        Pendente de validação
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700">
      <CircleHelp size={18} />
      Estado desconhecido
    </span>
  );
}

export default function DetalhesMedicamento({
  medicamento,
  aoVoltar,
}) {
  if (!medicamento) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <button
          type="button"
          onClick={aoVoltar}
          className="mb-5 inline-flex items-center gap-2 rounded-lg px-3 py-2 font-semibold text-blue-800 transition hover:bg-blue-50"
        >
          <ArrowLeft size={20} />
          Voltar à pesquisa
        </button>

        <p className="text-gray-700">
          Não foi possível carregar os dados deste medicamento.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl bg-slate-50">
      <button
        type="button"
        onClick={aoVoltar}
        className="mb-5 inline-flex items-center gap-2 rounded-lg px-3 py-2 font-semibold text-blue-800 transition hover:bg-blue-100"
      >
        <ArrowLeft size={20} />
        Voltar à pesquisa
      </button>

      <div className="mb-6 overflow-hidden rounded-2xl bg-blue-950 text-white shadow-lg">
        <div className="p-6 sm:p-8">
          <div className="mb-5 flex items-center gap-4">
            <div className="rounded-xl bg-white/10 p-4">
              <FlaskConical size={34} />
            </div>

            <div>
              <p className="mb-1 text-sm text-blue-200">
                ONCOPREP · FICHA DO MEDICAMENTO
              </p>

              <h2 className="text-2xl font-bold sm:text-3xl">
                {medicamento.medicamento ||
                  "Medicamento sem nome"}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm">
              <Building2 size={17} />
              {medicamento.laboratorio ||
                "Laboratório não informado"}
            </span>

            <SeloValidacao validado={medicamento.validado} />
          </div>
        </div>
      </div>

      {medicamento.validado !== true && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-950"
        >
          <AlertTriangle
            size={24}
            className="mt-0.5 shrink-0"
          />

          <div>
            <h3 className="font-bold">
              Registro ainda não validado
            </h3>

            <p className="mt-2 text-sm leading-relaxed">
              Este registro está pendente de validação. As informações
              cadastradas não devem ser consideradas uma referência
              clínica aprovada. Antes de qualquer utilização clínica,
              os dados devem ser conferidos em fontes institucionais
              oficiais e aprovados pelo profissional habilitado
              responsável.
            </p>
          </div>
        </div>
      )}

      <div className="mb-5">
        <h3 className="mb-1 text-xl font-bold text-gray-800">
          Informações cadastradas
        </h3>

        <p className="text-sm text-gray-500">
          Consulte os campos disponíveis para este registro.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <CampoDetalhe
          titulo="Medicamento"
          valor={medicamento.medicamento}
          icone={FlaskConical}
        />

        <CampoDetalhe
          titulo="Laboratório"
          valor={medicamento.laboratorio}
          icone={Building2}
        />

        <CampoDetalhe
          titulo="Concentração"
          valor={medicamento.concentracao}
          icone={FlaskConical}
        />

        <CampoDetalhe
          titulo="Volume do diluente"
          valor={medicamento.volume_diluente}
          icone={Droplets}
        />

        <CampoDetalhe
          titulo="Estabilidade em temperatura ambiente"
          valor={medicamento.estabilidade_ta}
          icone={Thermometer}
        />

        <CampoDetalhe
          titulo="Estabilidade sob refrigeração"
          valor={medicamento.estabilidade_refrigerado}
          icone={Snowflake}
        />

        <CampoDetalhe
          titulo="Via de administração"
          valor={medicamento.via_administracao}
          icone={Route}
        />

        <CampoDetalhe
          titulo="Observações"
          valor={medicamento.observacoes}
          icone={ClipboardList}
        />
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Hash size={18} />
          Identificador do registro
        </div>

        <p className="mt-2 font-mono font-semibold text-gray-800">
          {medicamento.id ?? "Não informado"}
        </p>
      </div>

      <div className="mt-6 rounded-xl bg-blue-50 p-5">
        <h3 className="mb-2 font-bold text-blue-950">
          Sobre a validação
        </h3>

        <p className="text-sm leading-relaxed text-blue-900">
          O estado de validação é uma informação administrativa do
          sistema. Ele não substitui a conferência das fontes
          oficiais, os protocolos institucionais nem a avaliação
          do profissional responsável.
        </p>
      </div>

      <div className="mt-6 flex justify-start">
        <button
          type="button"
          onClick={aoVoltar}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-800 px-5 py-3 font-semibold text-white transition hover:bg-blue-900"
        >
          <ArrowLeft size={19} />
          Voltar à pesquisa
        </button>
      </div>
    </section>
  );
}