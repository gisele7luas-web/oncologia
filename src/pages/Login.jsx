import { useState } from "react";
import { Mail, LockKeyhole, LogIn, LoaderCircle, AlertCircle } from "lucide-react";
import { supabase } from "../services/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function entrar(event) {
    event.preventDefault();
    setErro("");

    if (!email.trim() || !senha) {
      setErro("Preencha o e-mail e a senha.");
      return;
    }

    setCarregando(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });

      if (error) {
        setErro("Não foi possível entrar. Confira o e-mail e a senha.");
      }
    } catch (error) {
      console.error("Erro ao realizar login:", error);
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-slate-100 p-5">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-900 text-3xl">
            🏥
          </div>

          <h2 className="text-2xl font-bold text-slate-800">
            Entrar no OncoPrep
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Acesse sua conta para continuar.
          </p>
        </div>

        <form onSubmit={entrar} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              E-mail
            </label>

            <div className="flex items-center gap-3 rounded-lg border border-slate-300 px-3 focus-within:ring-2 focus-within:ring-blue-500">
              <Mail size={19} className="text-slate-400" />

              <input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seu@email.com"
                className="w-full py-3 outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="senha"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Senha
            </label>

            <div className="flex items-center gap-3 rounded-lg border border-slate-300 px-3 focus-within:ring-2 focus-within:ring-blue-500">
              <LockKeyhole size={19} className="text-slate-400" />

              <input
                id="senha"
                type="password"
                autoComplete="current-password"
                required
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                placeholder="Digite sua senha"
                className="w-full py-3 outline-none"
              />
            </div>
          </div>

          {erro && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              <AlertCircle size={19} className="mt-0.5 shrink-0" />
              <p>{erro}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {carregando ? (
              <>
                <LoaderCircle size={20} className="animate-spin" />
                Entrando...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Entrar
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-relaxed text-slate-500">
          Acesso destinado a usuários autorizados. As informações do sistema
          não substituem protocolos institucionais nem a validação clínica
          por profissional habilitado.
        </p>
      </section>
    </main>
  );
}