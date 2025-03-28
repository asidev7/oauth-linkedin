"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { SendIcon, Code, MicIcon, Menu, Search, Settings, StopCircle, Volume2 } from "lucide-react";
import Head from "next/head";
import { generateChatCompletion } from "@/lib/api"; // Import the API handler

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const { data: session, status } = useSession();
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: "assistant", content: "Bonjour! Je suis Asidev, votre assistant de développement. Comment puis-je vous aider aujourd'hui?" }
  ]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [apiKey, setApiKey] = useState(""); // Pour stocker la clé API
  
  // Add proper typing to the ref
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, currentResponse]);

  // Charger la clé API depuis localStorage au chargement
  useEffect(() => {
    const savedKey = localStorage.getItem('deepseek_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isGenerating) return;
    
    // Ajouter le message de l'utilisateur à l'historique
    setChatHistory(prev => [...prev, { role: "user", content: message }]);
    
    setIsGenerating(true);
    setCurrentResponse("");
    
    try {
      // Utiliser notre fonction d'API externe
      const response = await generateChatCompletion(
        chatHistory.concat({ role: "user", content: message }),
        apiKey,
        (partialResponse: string) => {
          // Callback pour la génération caractère par caractère
          setCurrentResponse(partialResponse);
        }
      );
      
      // Ajouter la réponse complète à l'historique
      setChatHistory(prev => [...prev, { role: "assistant", content: response }]);
      setCurrentResponse("");
      
    } catch (error) {
      console.error("Erreur lors de l'appel API:", error);
      setChatHistory(prev => [...prev, { 
        role: "assistant", 
        content: "Désolé, je n'ai pas pu traiter votre demande. Veuillez vérifier votre clé API ou réessayer plus tard." 
      }]);
    } finally {
      setIsGenerating(false);
    }
    
    setMessage("");
  };

  const stopGeneration = () => {
    setIsGenerating(false);
    if (currentResponse) {
      setChatHistory(prev => [...prev, { role: "assistant", content: currentResponse }]);
      setCurrentResponse("");
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Ici, vous intégreriez une vraie API de reconnaissance vocale
    if (!isRecording) {
      setTimeout(() => {
        setMessage("Comment puis-je implémenter un hook React personnalisé?");
        setIsRecording(false);
      }, 2000);
    }
  };

  const speakText = (text: string) => {
    setIsSpeaking(!isSpeaking);
    // Ici, vous intégreriez une vraie API de synthèse vocale
    if (!isSpeaking) {
      // Simuler la lecture
      setTimeout(() => {
        setIsSpeaking(false);
      }, 3000);
    }
  };

  const handleSetAPIKey = () => {
    const key = prompt("Veuillez entrer votre clé API DeepSeek:");
    if (key) {
      setApiKey(key);
      localStorage.setItem('deepseek_api_key', key);
      alert("Clé API DeepSeek définie avec succès!");
    }
  };

  // Fonction simple pour formater du texte en Markdown basique
  const formatMarkdown = (text: string) => {
    if (!text) return '';
    
    // Formatage des titres (# Titre)
    text = text.replace(/^# (.*?)$/gm, '<h1 class="text-xl font-bold my-3">$1</h1>');
    text = text.replace(/^## (.*?)$/gm, '<h2 class="text-lg font-bold my-2">$1</h2>');
    text = text.replace(/^### (.*?)$/gm, '<h3 class="text-md font-bold my-2">$1</h3>');
    
    // Formatage du texte en gras (**texte**)
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-indigo-300">$1</strong>');
    
    // Formatage du texte en italique (*texte*)
    text = text.replace(/\*(.*?)\*/g, '<em class="italic text-purple-300">$1</em>');
    
    // Formatage des blocs de code (```code```)
    text = text.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-700 p-3 rounded-md my-3 overflow-x-auto text-xs"><code>$1</code></pre>');
    
    // Formatage du code inline (`code`)
    text = text.replace(/`([^`]+)`/g, '<code class="bg-gray-700 px-1.5 py-0.5 rounded text-purple-200 font-mono text-sm">$1</code>');
    
    // Formatage des listes non-ordonnées
    text = text.replace(/^- (.*?)$/gm, '<li class="ml-6 my-1 list-disc">$1</li>');
    
    // Formatage des listes ordonnées
    text = text.replace(/^(\d+)\. (.*?)$/gm, '<li class="ml-6 my-1 list-decimal">$2</li>');
    
    // Formatage des citations
    text = text.replace(/^> (.*?)$/gm, '<blockquote class="border-l-4 border-indigo-500 pl-4 my-3 italic text-gray-300">$1</blockquote>');
    
    // Formatage des liens [texte](url)
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Convertir les sauts de ligne en balises <p>
    const paragraphs = text.split('\n\n');
    text = paragraphs.map(p => {
      // Ne pas encapsuler dans <p> si c'est déjà un élément HTML
      if (p.trim().startsWith('<') && !p.trim().startsWith('<code') && !p.trim().startsWith('<em') && !p.trim().startsWith('<strong')) {
        return p;
      }
      // Grouper les éléments de liste
      if (p.includes('<li')) {
        return `<ul>${p.replace(/\n/g, '')}</ul>`;
      }
      // Autres paragraphes normaux
      if (p.trim() !== '') {
        return `<p class="my-2">${p.replace(/\n/g, '<br />')}</p>`;
      }
      return '';
    }).join('');
    
    return text;
  };

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 font-[Inter]">
        {/* Header avec design orienté développement */}
        <header className="border-b border-indigo-900/30 bg-gray-900/90 backdrop-blur-sm z-10 sticky top-0">
          <div className="flex justify-between items-center px-6 py-4 max-w-6xl mx-auto">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-full hover:bg-gray-800/70 transition-all"
              >
                <Menu size={20} className="text-gray-300" />
              </button>
              <div className="flex items-center">
                <div className="h-9 w-9 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-md flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Code size={18} className="text-white" />
                </div>
                <span className="ml-3 font-semibold text-xl tracking-tight text-white">
                  Asi<span className="text-indigo-400">dev</span>
                </span>
              </div>
            </div>
            
            <div className="hidden md:flex items-center bg-gray-800/40 backdrop-blur-sm rounded-full px-4 py-2 flex-1 max-w-md mx-8 border border-indigo-900/20 shadow-inner">
              <Search size={16} className="text-gray-400 mr-3" />
              <input 
                type="text" 
                placeholder="Rechercher des solutions..." 
                className="bg-transparent border-none focus:outline-none text-sm flex-1 text-gray-200 placeholder-gray-500 font-[JetBrains Mono] tracking-tight" 
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleSetAPIKey}
                className="p-2 rounded-full hover:bg-gray-800/70 transition-all text-indigo-300 hover:text-indigo-200"
                title="Configurer la clé API"
              >
                <Settings size={18} />
              </button>
              
              {session ? (
                <div className="flex items-center space-x-3">
                  {session.user?.image ? (
                    <div className="h-9 w-9 rounded-full ring-2 ring-indigo-500/30 overflow-hidden">
                      <Image 
                        src={session.user.image} 
                        alt="Profile" 
                        width={36} 
                        height={36} 
                        className="rounded-full" 
                      />
                    </div>
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <span className="font-medium">{session.user?.name?.charAt(0) || "D"}</span>
                    </div>
                  )}
                  <span className="text-sm hidden md:inline font-medium">{session.user?.name || "Développeur"}</span>
                </div>
              ) : (
                <button className="bg-gradient-to-r from-indigo-600 to-purple-500 hover:opacity-90 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg shadow-indigo-500/20 transition-all">
                  Connexion
                </button>
              )}
            </div>
          </div>
        </header>
        
        {menuOpen && (
          <div className="absolute top-16 left-6 bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl p-2 z-20 border border-indigo-900/30">
            <div className="py-2.5 px-4 hover:bg-gray-700/70 rounded-lg flex items-center space-x-3 cursor-pointer transition-all">
              <Code size={16} className="text-indigo-400" />
              <span className="font-medium">Nouvelle session</span>
            </div>
            <div className="py-2.5 px-4 hover:bg-gray-700/70 rounded-lg flex items-center space-x-3 cursor-pointer transition-all" onClick={handleSetAPIKey}>
              <Settings size={16} className="text-indigo-400" />
              <span className="font-medium">Configurer l'API</span>
            </div>
          </div>
        )}
      
        <main className="flex-1 flex flex-col items-center overflow-hidden">
          {/* Zone de chat avec design orienté code */}
          <div className="flex-1 w-full max-w-3xl px-6 overflow-y-auto py-8">
            {chatHistory.map((chat, index) => (
              <div key={index} className={`flex mb-6 ${chat.role === 'assistant' ? 'justify-start' : 'justify-end'} group`}>
                {chat.role === 'assistant' && (
                  <div className="h-10 w-10 rounded-md bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/20">
                    <Code size={18} className="text-white" />
                  </div>
                )}
                <div className="flex flex-col">
                  <div 
                    className={`px-5 py-3.5 rounded-xl max-w-md ${
                      chat.role === 'assistant' 
                        ? 'bg-gray-800/60 backdrop-blur-sm text-gray-100 shadow-lg border border-indigo-900/20 font-[JetBrains Mono] text-sm' 
                        : 'bg-gradient-to-r from-indigo-600 to-purple-500 text-white shadow-lg shadow-indigo-500/20'
                    }`}
                  >
                    {chat.role === 'assistant' ? (
                      <div dangerouslySetInnerHTML={{ __html: formatMarkdown(chat.content) }} />
                    ) : (
                      chat.content
                    )}
                  </div>
                  
                  {chat.role === 'assistant' && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex mt-2 space-x-3 ml-1">
                      <button 
                        onClick={() => speakText(chat.content)}
                        className="text-xs text-gray-400 hover:text-gray-200 flex items-center transition-colors"
                      >
                        <Volume2 size={14} className="mr-1.5" />
                        {isSpeaking ? "Arrêter" : "Écouter"}
                      </button>
                    </div>
                  )}
                </div>
                {chat.role === 'user' && session?.user?.image && (
                  <div className="h-10 w-10 rounded-full overflow-hidden ml-3 ring-2 ring-indigo-500/30">
                    <Image 
                      src={session.user.image} 
                      alt="User" 
                      width={40} 
                      height={40} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                {chat.role === 'user' && !session?.user?.image && (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center ml-3 shadow-lg shadow-purple-500/20">
                    <span className="text-sm font-medium text-white">
                      {session?.user?.name?.charAt(0) || "D"}
                    </span>
                  </div>
                )}
              </div>
            ))}
            
            {/* Message en cours de génération avec animation améliorée */}
            {isGenerating && (
              <div className="flex mb-6 justify-start">
                <div className="h-10 w-10 rounded-md bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/20">
                  <Code size={18} className="text-white" />
                </div>
                <div className="flex flex-col">
                  <div className="px-5 py-3.5 rounded-xl max-w-md bg-gray-800/60 backdrop-blur-sm text-gray-100 shadow-lg border border-indigo-900/20 font-[JetBrains Mono] text-sm">
                    <div dangerouslySetInnerHTML={{ __html: formatMarkdown(currentResponse) }} />
                    <span className="ml-1 inline-block w-2 h-5 bg-indigo-500 animate-pulse rounded"></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Zone de saisie stylisée */}
          <div className="w-full max-w-3xl px-6 mb-8">
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Posez votre question de développement..."
                className="w-full bg-gray-800/40 backdrop-blur-sm text-white rounded-full pl-6 pr-16 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 border border-indigo-900/20 shadow-lg font-[JetBrains Mono] text-sm"
                disabled={isGenerating}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-2">
                {isGenerating ? (
                  <button 
                    type="button" 
                    onClick={stopGeneration}
                    className="bg-red-500/90 text-white p-2.5 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <StopCircle size={18} />
                  </button>
                ) : (
                  <>
                    <button 
                      type="button" 
                      className={`text-gray-400 hover:text-gray-200 p-2 ${isRecording ? 'text-red-500' : ''}`}
                      onClick={toggleRecording}
                    >
                      <MicIcon size={20} className={isRecording ? 'animate-pulse' : ''} />
                    </button>
                    <button 
                      type="submit" 
                      className="bg-gradient-to-r from-indigo-600 to-purple-500 text-white p-2.5 rounded-full hover:opacity-90 transition-all shadow-lg shadow-indigo-500/20"
                      disabled={!message.trim() || isGenerating}
                    >
                      <SendIcon size={18} />
                    </button>
                  </>
                )}
              </div>
            </form>
            
            <div className="flex justify-center items-center mt-4 px-1 text-xs text-gray-500">
              <div className="flex items-center bg-gray-800/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <Code size={12} className="mr-1.5 text-indigo-400" />
                <span>Asidev - Votre assistant de développement</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}