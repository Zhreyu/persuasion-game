import { useState, useEffect } from 'react';
import { ChatMessage, Character } from '@/types/game';
import { CHARACTERS } from '@/data/characters';
import { 
  getGameProgress, 
  completeLevel, 
  incrementAttempts, 
  getLeaderboard, 
  addToLeaderboard,
  resetGame 
} from '@/utils/gameLogic';
import { sendMessageToAI, checkPersuasionSuccess } from '@/services/groqService';
import LevelHeader from '@/components/LevelHeader';
import ChatInterface from '@/components/ChatInterface';
import SuccessAnimation from '@/components/SuccessAnimation';
import Leaderboard from '@/components/Leaderboard';
import GameProgress from '@/components/GameProgress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Trophy, RotateCcw, DoorOpen, Crown } from 'lucide-react';

const Index = () => {
  const [progress, setProgress] = useState(getGameProgress());
  const [currentCharacter, setCurrentCharacter] = useState<Character>(CHARACTERS[progress.currentLevel - 1]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(Date.now());
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const { toast } = useToast();

  // Update theme based on current level
  useEffect(() => {
    document.body.className = `level-${progress.currentLevel}`;
    document.title = `Persuasion Game - Level ${progress.currentLevel}: ${currentCharacter.name}`;
  }, [progress.currentLevel, currentCharacter.name]);

  const resetLevel = () => {
    setMessages([]);
    setConversationHistory([]);
    setIsLevelComplete(false);
    setShowHint(false);
    setIsLoading(false);
  };

  const startLevel = (level: number) => {
    const character = CHARACTERS[level - 1];
    setCurrentCharacter(character);
    resetLevel();
    
    // Add initial AI message
    const initialMessage: ChatMessage = {
      id: Date.now().toString(),
      text: getInitialMessage(character),
      isUser: false,
      timestamp: new Date()
    };
    setMessages([initialMessage]);
    setConversationHistory([{ role: 'assistant', content: initialMessage.text }]);
  };

  const getInitialMessage = (character: Character): string => {
    const greetings = {
      1: "Who's there? It's quite late!",
      2: "Hold! Who dares approach the sacred halls at this ungodly hour?",
      3: "I can see you on my security cam. State your business - and make it quick, I'm tracking a potential breach.",
      4: "Do you have any idea what hour it is? I'm in the middle of capturing lightning in paint!",
      5: "It's 1 AM. Normal people are asleep. What's your story, and don't even think about lying to me."
    };
    return greetings[character.id as keyof typeof greetings] || "Who's there?";
  };

  const handleSendMessage = async (userMessage: string) => {
    if (isLevelComplete) return;

    setIsLoading(true);
    incrementAttempts(progress.currentLevel);

    // Add user message
    const userChatMessage: ChatMessage = {
      id: Date.now().toString(),
      text: userMessage,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userChatMessage]);

    try {
      // Get AI response
      const aiResponse = await sendMessageToAI(
        userMessage, 
        currentCharacter.prompt, 
        conversationHistory
      );

      // Add AI message
      const aiChatMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiChatMessage]);

      // Update conversation history
      const newHistory = [
        ...conversationHistory,
        { role: 'user' as const, content: userMessage },
        { role: 'assistant' as const, content: aiResponse }
      ];
      setConversationHistory(newHistory);

      // Check for success
      const isSuccess = await checkPersuasionSuccess(newHistory, currentCharacter.name);
      
      if (isSuccess) {
        setIsLevelComplete(true);
        const newProgress = completeLevel(progress.currentLevel);
        setProgress(newProgress);
        
        toast({
          title: "Success! 🎉",
          description: `${currentCharacter.name} lets you in!`,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleNextLevel = () => {
    if (progress.isGameComplete) {
      setShowNameInput(true);
      setShowLeaderboard(true);
    } else {
      startLevel(progress.currentLevel);
    }
  };

  const handleRetryLevel = () => {
    startLevel(currentCharacter.id);
  };

  const loadLeaderboard = async () => {
    setIsLoadingLeaderboard(true);
    try {
      const entries = await getLeaderboard();
      setLeaderboardEntries(entries);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      toast({
        title: "Error",
        description: "Failed to load leaderboard. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  const handleAddToLeaderboard = async (name: string) => {
    const totalAttempts = progress.attempts.reduce((sum, attempts) => sum + attempts, 0);
    const completionTime = Math.floor((Date.now() - gameStartTime) / 1000);
    
    try {
      await addToLeaderboard({
        name,
        totalAttempts,
        completionTime,
        completedAt: new Date()
      });
      
      setShowNameInput(false);
      toast({
        title: "Welcome to the Hall of Fame! 🏆",
        description: `${name} has been added to the leaderboard!`,
      });
      
      // Refresh leaderboard entries
      await loadLeaderboard();
    } catch (error) {
      console.error('Failed to add to leaderboard:', error);
      toast({
        title: "Error",
        description: "Failed to add to leaderboard. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleResetGame = () => {
    resetGame();
    setProgress({
      currentLevel: 1,
      completedLevels: [false, false, false, false, false],
      attempts: [0, 0, 0, 0, 0],
      isGameComplete: false
    });
    setGameStartTime(Date.now());
    setShowLeaderboard(false);
    setShowNameInput(false);
    startLevel(1);
  };

  // Initialize first level
  useEffect(() => {
    if (messages.length === 0) {
      startLevel(progress.currentLevel);
    }
  }, []);

  // Load leaderboard when showing leaderboard
  useEffect(() => {
    if (showLeaderboard) {
      loadLeaderboard();
    }
  }, [showLeaderboard]);

  if (showLeaderboard) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <Leaderboard
            entries={leaderboardEntries}
            onAddEntry={handleAddToLeaderboard}
            onBackToGame={() => setShowLeaderboard(false)}
            showNameInput={showNameInput}
            isLoading={isLoadingLeaderboard}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="level-header-bg p-6 text-center border-2 border-primary/30">
          <div className="flex items-center justify-center gap-3 mb-3">
            <DoorOpen className="w-10 h-10 text-primary animate-pulse" />
            <h1 className="text-4xl font-bold text-primary">Persuasion Game</h1>
            <DoorOpen className="w-10 h-10 text-primary animate-pulse scale-x-[-1]" />
          </div>
          <p className="text-muted-foreground text-lg">
            Convince AI characters to let you into their homes. Can you unlock all 5 doors?
          </p>
          {progress.isGameComplete && (
            <div className="mt-3 flex items-center justify-center gap-2">
              <Crown className="w-6 h-6 text-accent animate-bounce" />
              <span className="text-accent font-bold">MASTER PERSUADER!</span>
              <Crown className="w-6 h-6 text-accent animate-bounce" />
            </div>
          )}
        </Card>

        {/* Game Progress */}
        <Card className="p-4">
          <GameProgress progress={progress} />
        </Card>

        {/* Game Controls */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => setShowLeaderboard(true)}
            variant="outline"
            className="bg-secondary hover:bg-secondary/80 border-primary/20 shadow-lg"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Leaderboard
          </Button>
          <Button
            onClick={handleResetGame}
            variant="outline"
            className="bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/30"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Game
          </Button>
        </div>

        {/* Main Game Area */}
        {isLevelComplete ? (
          <SuccessAnimation
            character={currentCharacter.name}
            level={currentCharacter.id}
            attempts={progress.attempts[currentCharacter.id - 1]}
            onNextLevel={handleNextLevel}
            onRetry={handleRetryLevel}
            isGameComplete={progress.isGameComplete}
          />
        ) : (
          <div className="space-y-6">
            <LevelHeader
              character={currentCharacter}
              level={currentCharacter.id}
              attempts={progress.attempts[currentCharacter.id - 1]}
              showHint={showHint}
              onToggleHint={() => setShowHint(!showHint)}
            />
            
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              disabled={isLevelComplete}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;