import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, X, Bot, User, Minimize2, Maximize2 } from "lucide-react";
import TrustCenterRAGService from "@/services/trustCenterRAGService"; // 1. IMPORT THE SERVICE

const TrustCenterChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Hello! I'm your Trust Center assistant. I can help you with compliance questions, security policies, and document inquiries. How can I assist you today?",
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // 2. ADD USEEFFECT TO INITIALIZE THE SERVICE ONCE THE CHATBOT OPENS
  useEffect(() => {
    if (isOpen) {
      const initialize = async () => {
        try {
          console.log("Initializing Trust Center...");
          const result = await TrustCenterRAGService.initializeTrustCenter();
          console.log(result.message);
        } catch (error) {
          console.error("Failed to initialize RAG Service:", error);
          // Optionally, add a message to the chat indicating a connection issue.
          setMessages(prev => [...prev, {
            id: 'init-error',
            text: "I'm having trouble connecting to my knowledge base at the moment. My responses may be limited.",
            sender: "bot",
            timestamp: new Date(),
          }]);
        }
      };
      initialize();
    }
  }, [isOpen]); // This effect will only run when `isOpen` changes from false to true.

  // 3. REMOVE THE OLD MOCK FUNCTION
  // const simulateBotResponse = (userMessage) => { ... };

  // 4. UPDATE handleSendMessage TO USE THE LIVE API
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage; // Capture input before clearing
    setInputMessage("");
    setIsTyping(true);

    try {
      // Use the queryWithFallback method from your service for a robust experience
      const response = await TrustCenterRAGService.queryWithFallback(currentInput);

      const botResponse = {
        id: (Date.now() + 1).toString(),
        text: response.answer,
        sender: "bot",
        timestamp: new Date(),
        // Add sources to the message object if they exist
        sources: response.source === 'rag' ? response.sources : []
      };
      
      setMessages(prev => [...prev, botResponse]);

    } catch (error) {
      console.error("Error fetching bot response:", error);
      const errorResponse = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, but I encountered an error trying to connect to the knowledge base. Please try again in a moment.",
        sender: "bot",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        <div className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">!</span>
        </div>
      </div>
    );
  }

  // THE JSX REMAINS IDENTICAL TO YOUR ORIGINAL CODE
  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isMinimized ? "h-16" : "h-[600px]"
    } w-96`}>
      <Card className="h-full flex flex-col shadow-2xl border-0 bg-background/95 backdrop-blur-sm">
        <CardHeader className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-medium">Trust Center Assistant</CardTitle>
                <p className="text-xs text-blue-100">Online • Ready to help</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="overflow-auto flex flex-1 flex-col p-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      message.sender === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center ${
                      message.sender === "user" 
                        ? "bg-blue-500 text-white" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {message.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={`max-w-[75%] ${
                      message.sender === "user" ? "text-right" : "text-left"
                    }`}>
                      <div className={`p-3 rounded-lg ${
                        message.sender === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-muted text-foreground"
                      }`}>
                        <p className="text-sm break-words">{message.text}</p>
                        {/* 5. ADDED LOGIC TO DISPLAY SOURCES IF THEY EXIST */}
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-white/20 text-left">
                            <h4 className="text-xs font-bold mb-1 opacity-80">Sources:</h4>
                            <ul className="list-none text-xs space-y-1">
                              {message.sources.map((source, index) => (
                                <li key={index} className="truncate opacity-70" title={source}>{source.split('/').pop()}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 shrink-0 bg-muted rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about policies, compliance, or security..."
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  size="icon"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  AI Assistant
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Powered by Trust Center Knowledge
                </span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default TrustCenterChatbot;