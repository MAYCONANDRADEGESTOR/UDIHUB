export default function BanidoPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl mb-6">🚫</div>
      <h1 className="font-syne font-bold text-2xl text-foreground mb-3">
        Acesso bloqueado
      </h1>
      <p className="text-sm text-muted max-w-xs leading-relaxed mb-8">
        Sua conta foi suspensa por violar os termos de uso do UDIHUB.
        Entre em contato com o suporte se acredita que foi um erro.
      </p>
      
        href="mailto:udihub@outlook.com"
        className="px-6 py-3 rounded-xl font-bold text-sm text-white mb-4 inline-block bg-blue-600"
      >
        Contatar suporte
      </a>
      <a href="/" className="text-xs text-muted mt-2">
        Voltar para o inicio
      </a>
    </div>
  );
}
