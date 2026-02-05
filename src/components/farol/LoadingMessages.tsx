import { useState, useEffect } from "react";

const loadingMessages = [
  "Buscando resposta…",
  "Cruzando notícias…",
  "Pesquisando o agro…",
  "Organizando fontes…",
  "Montando resumo…",
];

const LoadingMessages = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const currentFullText = loadingMessages[currentIndex];

    if (isTyping) {
      if (displayedText.length < currentFullText.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(currentFullText.slice(0, displayedText.length + 1));
        }, 40);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, 1500);
        return () => clearTimeout(timeout);
      }
    } else {
      if (displayedText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, 20);
        return () => clearTimeout(timeout);
      } else {
        setCurrentIndex((prev) => (prev + 1) % loadingMessages.length);
        setIsTyping(true);
      }
    }
  }, [displayedText, isTyping, currentIndex]);

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="inline-flex items-center gap-3 px-6 py-4 bg-card rounded-xl border border-border shadow-md">
          <svg className="animate-spin w-5 h-5 text-primary" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-lg font-medium text-foreground min-w-[200px] text-left">
            {displayedText}
            <span className="animate-pulse text-primary">|</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoadingMessages;
