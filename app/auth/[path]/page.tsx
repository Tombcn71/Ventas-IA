import { AuthView } from '@neondatabase/neon-js/auth/react/ui';

export const dynamicParams = false;

export default async function AuthPage({ 
  params 
}: { 
  params: Promise<{ path: string }> 
}) {
  const { path } = await params;
  
  return (
    <main className="container mx-auto flex grow flex-col items-center justify-center gap-3 self-center p-4 md:p-6 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center">
          VentasIA
        </h1>
        <p className="text-gray-600 text-center mt-2">
          Copiloto de Ventas IA
        </p>
      </div>
      <AuthView path={path} />
    </main>
  );
}

