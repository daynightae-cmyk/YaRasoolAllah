import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLanguage } from "../contexts/LanguageContext";
import { apiRequest } from "../lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: string[];
}

export default function AIAssistantPage() {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // AI Question Mutation
  const askQuestionMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest("POST", "/api/ai/ask", { question });
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.answer,
        timestamp: new Date(),
        sources: data.sources || []
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error: any) => {
      toast({
        title: t("ai_assistant.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Send to AI
    askQuestionMutation.mutate(inputValue.trim());
    
    // Clear input
    setInputValue("");
    
    // Focus back to input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    t("ai_assistant.quick_questions.prayer_times"),
    t("ai_assistant.quick_questions.ramadan_rules"),
    t("ai_assistant.quick_questions.zakat_calculation"),
    t("ai_assistant.quick_questions.marriage_islam"),
    t("ai_assistant.quick_questions.parent_rights"),
    t("ai_assistant.quick_questions.business_ethics")
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-emerald-50 dark:from-gray-800 dark:via-gray-900 dark:to-purple-900/20">
      {/* Background AI-themed elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-blue-400/10 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-2xl animate-pulse delay-1000"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 px-6 py-3 rounded-full mb-4">
            <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-lg">psychology</span>
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              {t("ai_assistant.powered_by_ai")}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-amiri font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            {t("ai_assistant.title")}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-inter max-w-2xl mx-auto">
            {t("ai_assistant.description")}
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Quick Questions Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-purple-200 dark:border-purple-700">
              <CardHeader>
                <CardTitle className="font-amiri text-purple-800 dark:text-purple-200 flex items-center">
                  <span className="material-symbols-outlined mr-2 rtl:ml-2">help</span>
                  {t("ai_assistant.quick_questions_title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setInputValue(question)}
                    className={`w-full text-left justify-start border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-inter text-xs ${isRTL ? 'text-right' : 'text-left'}`}
                  >
                    <span className="material-symbols-outlined mr-2 rtl:ml-2 text-sm">chat</span>
                    <span className="truncate">{question}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* AI Guidelines */}
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-700">
              <CardHeader>
                <CardTitle className="font-amiri text-emerald-800 dark:text-emerald-200 text-lg">
                  {t("ai_assistant.guidelines_title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-sm mt-1">check_circle</span>
                  <p className="text-emerald-700 dark:text-emerald-300 font-inter text-xs">
                    {t("ai_assistant.guideline_1")}
                  </p>
                </div>
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-sm mt-1">check_circle</span>
                  <p className="text-emerald-700 dark:text-emerald-300 font-inter text-xs">
                    {t("ai_assistant.guideline_2")}
                  </p>
                </div>
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-sm mt-1">check_circle</span>
                  <p className="text-emerald-700 dark:text-emerald-300 font-inter text-xs">
                    {t("ai_assistant.guideline_3")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-purple-200 dark:border-purple-700 shadow-2xl">
              <CardHeader className="border-b border-purple-100 dark:border-purple-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="bg-gradient-to-br from-purple-500 to-blue-500 w-10 h-10 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-white">psychology</span>
                    </div>
                    <div>
                      <h3 className="font-amiri font-bold text-purple-800 dark:text-purple-200">
                        {t("ai_assistant.assistant_name")}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-inter">
                        {t("ai_assistant.online_status")}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-0">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 rtl:ml-2 animate-pulse"></span>
                    {t("ai_assistant.online")}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Chat Messages */}
                <ScrollArea className="h-96 p-6" ref={scrollAreaRef}>
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-gradient-to-br from-purple-500 to-blue-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-white text-3xl">psychology</span>
                      </div>
                      <h3 className="text-xl font-amiri font-bold text-gray-600 dark:text-gray-400 mb-2">
                        {t("ai_assistant.welcome_title")}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 font-inter max-w-md mx-auto">
                        {t("ai_assistant.welcome_message")}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === "user" ? (isRTL ? "justify-start" : "justify-end") : (isRTL ? "justify-end" : "justify-start")}`}
                        >
                          <div className={`max-w-[80%] ${message.role === "user" ? "order-2" : "order-1"}`}>
                            <div
                              className={`p-4 rounded-2xl ${
                                message.role === "user"
                                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                              }`}
                            >
                              <p className="font-inter leading-relaxed whitespace-pre-wrap">
                                {message.content}
                              </p>
                              {message.sources && message.sources.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-white/20 dark:border-gray-600">
                                  <p className="text-xs font-medium mb-2 opacity-80">
                                    {t("ai_assistant.sources")}:
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {message.sources.map((source, index) => (
                                      <Badge key={index} className="bg-white/20 dark:bg-gray-600 text-xs border-0">
                                        {source}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <p className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
                              message.role === "user" ? (isRTL ? "text-left" : "text-right") : (isRTL ? "text-right" : "text-left")
                            }`}>
                              {formatTime(message.timestamp)}
                            </p>
                          </div>

                          {/* Avatar */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.role === "user" ? "order-1 mr-3 rtl:ml-3" : "order-2 ml-3 rtl:mr-3"
                          } ${
                            message.role === "user"
                              ? "bg-gradient-to-br from-gold-400 to-gold-600"
                              : "bg-gradient-to-br from-purple-500 to-blue-500"
                          }`}>
                            <span className="material-symbols-outlined text-white text-sm">
                              {message.role === "user" ? "person" : "psychology"}
                            </span>
                          </div>
                        </div>
                      ))}

                      {/* Loading indicator */}
                      {askQuestionMutation.isPending && (
                        <div className={`flex ${isRTL ? "justify-end" : "justify-start"}`}>
                          <div className="max-w-[80%] order-1">
                            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-2xl">
                              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <div className="flex space-x-1 rtl:space-x-reverse">
                                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200"></div>
                                </div>
                                <span className="text-gray-500 dark:text-gray-400 font-inter text-sm">
                                  {t("ai_assistant.thinking")}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 order-2 ml-3 rtl:mr-3">
                            <span className="material-symbols-outlined text-white text-sm">psychology</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>

                {/* Input Area */}
                <div className="border-t border-purple-100 dark:border-purple-700 p-4">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={t("ai_assistant.input_placeholder")}
                      className={`flex-1 ${isRTL ? 'text-right' : 'text-left'} border-purple-200 dark:border-purple-700 focus:ring-2 focus:ring-purple-500 font-inter`}
                      disabled={askQuestionMutation.isPending}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || askQuestionMutation.isPending}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 px-6"
                    >
                      {askQuestionMutation.isPending ? (
                        <span className="material-symbols-outlined animate-spin">refresh</span>
                      ) : (
                        <span className="material-symbols-outlined">send</span>
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-inter mt-2 text-center">
                    {t("ai_assistant.disclaimer")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Banner */}
        <Card className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white mt-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <span className="material-symbols-outlined text-3xl mb-2 block">verified</span>
                <h3 className="font-amiri font-bold mb-2">{t("ai_assistant.features.authentic_sources")}</h3>
                <p className="text-emerald-100 font-inter text-sm">
                  {t("ai_assistant.features.authentic_sources_desc")}
                </p>
              </div>
              <div className="text-center">
                <span className="material-symbols-outlined text-3xl mb-2 block">translate</span>
                <h3 className="font-amiri font-bold mb-2">{t("ai_assistant.features.multilingual")}</h3>
                <p className="text-emerald-100 font-inter text-sm">
                  {t("ai_assistant.features.multilingual_desc")}
                </p>
              </div>
              <div className="text-center">
                <span className="material-symbols-outlined text-3xl mb-2 block">support_agent</span>
                <h3 className="font-amiri font-bold mb-2">{t("ai_assistant.features.available_24_7")}</h3>
                <p className="text-emerald-100 font-inter text-sm">
                  {t("ai_assistant.features.available_24_7_desc")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
