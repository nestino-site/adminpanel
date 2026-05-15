import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-violet-50 via-white to-slate-100 p-6 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(124,58,237,0.15),transparent_50%)]" />
      <LoginForm />
    </div>
  );
}
