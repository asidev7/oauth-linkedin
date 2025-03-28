// Fichier: pages/auth/signin.tsx
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Head from "next/head";

export default function SignIn() {
  const router = useRouter();
  const { callbackUrl, error } = router.query;
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    // Gestion des différents codes d'erreur
    if (error) {
      switch (error) {
        case "OAuthCallback":
          setErrorMessage("Une erreur s'est produite lors de la connexion avec LinkedIn. Veuillez réessayer.");
          break;
        case "OAuthSignin":
          setErrorMessage("Erreur lors de l'initialisation de la connexion OAuth.");
          break;
        case "OAuthAccountNotLinked":
          setErrorMessage("L'email de ce compte existe déjà avec un autre fournisseur.");
          break;
        case "AccessDenied":
          setErrorMessage("Vous n'avez pas autorisé l'accès à votre compte LinkedIn.");
          break;
        default:
          setErrorMessage("Une erreur inattendue s'est produite. Veuillez réessayer.");
      }
    }
  }, [error]);

  return (
    <>
      <Head>
        <title>Connexion</title>
      </Head>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-2">
        <div className="p-10 bg-white rounded-lg shadow-xl max-w-md w-full">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Connexion</h1>
          
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {errorMessage}
            </div>
          )}
          
          <button
            onClick={() => signIn("linkedin", { callbackUrl: callbackUrl as string || "/" })}
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded w-full transition duration-300"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-5 h-5 mr-2"
            >
              <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
            </svg>
            Se connecter avec LinkedIn
          </button>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              En vous connectant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}