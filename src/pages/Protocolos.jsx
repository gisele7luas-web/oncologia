import { ClipboardList } from "lucide-react";

export default function Protocolos() {
  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <div className="mb-4 flex items-center gap-3">
        <ClipboardList size={32} className="text-blue-700" />
        <h2 className="text-2xl font-bold text-gray-800">
          Protocolos oncológicos
        </h2>
      </div>

      <p className="text-gray-600">
        Área destinada à consulta de protocolos oncológicos aprovados
        pela instituição.
      </p>

      <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Nenhum protocolo foi conectado a esta tela ainda. Consulte apenas
        protocolos institucionais validados para decisões clínicas.
      </div>
    </section>
  );
}