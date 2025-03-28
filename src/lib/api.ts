// lib/api.ts
const DEFAULT_API_KEY = "sk-34ba10a2c61a402f80b1d655773954cf"; // Clé par défaut (remplacer par une vraie clé)

/**
 * Génère une complétion de chat en utilisant l'API DeepSeek
 * 
 * @param messages - Historique des messages pour le contexte
 * @param apiKey - Clé API DeepSeek (optionnelle)
 * @param onPartialResponse - Callback pour traiter les réponses partielles (pour l'affichage progressif)
 * @returns Promise avec la réponse complète
 */
export async function generateChatCompletion(
  messages: Array<{ role: string, content: string }>,
  apiKey?: string,
  onPartialResponse?: (partial: string) => void
): Promise<string> {
  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey || DEFAULT_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { 
            role: "system", 
            content: "Vous êtes Asidev, un assistant de développement expert. Vous aidez les programmeurs à résoudre des problèmes de code, à comprendre des concepts techniques et à améliorer leurs compétences en développement." 
          },
          ...messages
        ],
        stream: false
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`Erreur API (${response.status}): ${errorData?.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    const assistantResponse = data.choices[0].message.content;
    
    // Simuler la génération caractère par caractère si un callback est fourni
    if (onPartialResponse) {
      let currentText = "";
      for (let i = 0; i < assistantResponse.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 15));
        currentText += assistantResponse.charAt(i);
        onPartialResponse(currentText);
      }
    }
    
    return assistantResponse;
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API DeepSeek:", error);
    throw error;
  }
}

/**
 * Version de secours si l'API n'est pas disponible
 * Génère une réponse prédéfinie pour les démonstrations
 */
export async function generateFallbackResponse(
  userMessage: string,
  onPartialResponse?: (partial: string) => void
): Promise<string> {
  // Réponses prédéfinies orientées développement
  const responses = [
    "Pour résoudre ce problème de développement, commençons par analyser la structure du code. Je recommande d'abord de vérifier la gestion des dépendances et ensuite d'examiner la logique du flux de données.",
    "Cette erreur est fréquente en développement. Voici quelques étapes pour la déboguer : 1) Vérifiez les journaux d'erreurs, 2) Isolez le composant problématique, 3) Testez avec des données simplifiées.",
    "Pour optimiser cette partie du code, nous pourrions utiliser une approche plus déclarative. Considérez l'utilisation de méthodes de tableau comme map, filter ou reduce au lieu des boucles traditionnelles."
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  // Simuler la génération caractère par caractère si un callback est fourni
  if (onPartialResponse) {
    let currentText = "";
    for (let i = 0; i < randomResponse.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 20));
      currentText += randomResponse.charAt(i);
      onPartialResponse(currentText);
    }
  }
  
  return randomResponse;
}