
'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session && status !== 'loading') {
      router.push('/login');
    }
  }, [session, status, router]);

  if (!session) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-gray-800">Bienvenue, {session.user?.name}</h2>
        <p className="mt-2">Vous êtes connecté avec LinkedIn.</p>
        <button
          onClick={() => signOut()}
          className="w-full px-4 py-2 mt-4 text-white bg-red-500 rounded-md"
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
}
