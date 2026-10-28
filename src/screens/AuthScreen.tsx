import { useState, type FormEvent } from 'react';
import { Lock, Mail, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { BnbLogo } from '../components/ui/BnbLogo';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Display';
import {
  loginWithCredentials,
  registerUserAccount,
  type AuthSessionDto,
} from '../services/auth';

interface AuthScreenProps {
  onAuthenticated: (session: AuthSessionDto) => Promise<void> | void;
}

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const switchMode = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Informe um endereço de e-mail válido.');
      return;
    }

    if (mode === 'register') {
      if (name.trim().length < 2) {
        setError('Informe seu nome (mínimo de 2 caracteres).');
        return;
      }
      if (password.length < 6) {
        setError('A senha deve ter no mínimo 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setError('A confirmação de senha não confere.');
        return;
      }
    } else if (!password) {
      setError('Informe a sua senha.');
      return;
    }

    setLoading(true);
    try {
      const session =
        mode === 'login'
          ? await loginWithCredentials({ email: trimmedEmail, password })
          : await registerUserAccount({
              name: name.trim(),
              email: trimmedEmail,
              password,
            });
      await onAuthenticated(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível autenticar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col lg:flex-row bg-canvas text-fg">
      {/* Painel institucional lateral */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between border-r border-border bg-surface p-10">
        <div className="flex items-center gap-3">
          <BnbLogo className="size-10 shrink-0" />
          <div>
            <h1 className="text-lg font-bold tracking-tight text-fg leading-tight">
              Estudos BNB
            </h1>
            <p className="text-xs font-medium text-fg-subtle">
              Concurso Banco do Nordeste — Analista de Sistemas
            </p>
          </div>
        </div>

        <div className="space-y-6 max-w-lg">
          <h2 className="text-3xl font-bold tracking-tight text-fg leading-snug">
            Gestão analítica e persistente para a sua aprovação em TI no BNB.
          </h2>

          <p className="text-sm text-fg-muted leading-relaxed">
            Todos os seus cronogramas de 24 semanas, sessões cronometradas, caderno de erros,
            baterias de questões, revisões espaçadas e simulados ficam armazenados com segurança
            no banco de dados exclusivo da sua conta.
          </p>
        </div>

        <div className="text-xs text-fg-subtle">
          Cargo: Analista de Sistemas — Desenvolvimento de Sistemas
        </div>
      </div>

      {/* Formulário de Login / Cadastro */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="mb-3 flex items-center gap-2.5 lg:hidden">
              <BnbLogo className="size-9 shrink-0" />
              <div className="text-left">
                <div className="text-base font-bold text-fg leading-tight">Estudos BNB</div>
                <div className="text-xs text-fg-subtle">Analista de Sistemas</div>
              </div>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-fg">
              {mode === 'login' ? 'Acesse sua conta' : 'Crie sua conta de estudos'}
            </h2>
            <p className="mt-1 text-sm text-fg-muted">
              {mode === 'login'
                ? 'Entre com seu e-mail e senha para carregar os dados do seu banco.'
                : 'Cadastre-se para iniciar seu ambiente individual de preparação.'}
            </p>
          </div>

          {/* Seletor de modo */}
          <div
            className="grid grid-cols-2 rounded-xl border border-border bg-surface p-1"
            role="tablist"
            aria-label="Modo de autenticação"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              onClick={() => switchMode('login')}
              className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
                mode === 'login'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-fg-muted hover:text-fg'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              onClick={() => switchMode('register')}
              className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
                mode === 'register'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-fg-muted hover:text-fg'
              }`}
            >
              Cadastrar
            </button>
          </div>

          {error && (
            <Alert tone="danger" title="Falha na autenticação">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-xs" noValidate>
            {mode === 'register' && (
              <div>
                <label htmlFor="auth-name" className="block text-xs font-semibold text-fg mb-1.5">
                  Nome completo
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
                  <input
                    id="auth-name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full rounded-lg border border-border bg-canvas pl-9 pr-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:border-primary focus:outline-hidden"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-xs font-semibold text-fg mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full rounded-lg border border-border bg-canvas pl-9 pr-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:border-primary focus:outline-hidden"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-xs font-semibold text-fg mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'login' ? 'Digite sua senha' : 'Mínimo de 6 caracteres'}
                  className="w-full rounded-lg border border-border bg-canvas pl-9 pr-10 py-2 text-sm text-fg placeholder:text-fg-subtle focus:border-primary focus:outline-hidden"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-fg-subtle hover:text-fg"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label htmlFor="auth-confirm-password" className="block text-xs font-semibold text-fg mb-1.5">
                  Confirmar senha
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
                  <input
                    id="auth-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full rounded-lg border border-border bg-canvas pl-9 pr-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:border-primary focus:outline-hidden"
                    required
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center py-2.5"
              disabled={loading}
              icon={<ArrowRight className="size-4" />}
            >
              {loading
                ? 'Autenticando...'
                : mode === 'login'
                ? 'Entrar na Plataforma'
                : 'Cadastrar e Entrar'}
            </Button>
          </form>

          <p className="text-center text-xs text-fg-muted">
            {mode === 'login' ? (
              <>
                Ainda não possui cadastro?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="font-semibold text-primary hover:underline"
                >
                  Criar uma conta agora
                </button>
              </>
            ) : (
              <>
                Já possui uma conta cadastrada?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-semibold text-primary hover:underline"
                >
                  Fazer login
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
