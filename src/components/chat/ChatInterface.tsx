
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, MessageSquare, Plus, User, Bot, Copy } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

const SAMPLE_QUERIES = [
  "Analiza la optimización del cliente 653025",
  "¿Qué clientes tienen eficiencia baja?",
  "Explica el ahorro estimado para el cliente X",
  "Muestra clientes con median ticket < 80€"
];

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "¡Hola! Soy tu asistente de optimización Pascual. ¿Sobre qué cliente o métrica te gustaría consultar? Puedo ayudarte con análisis de efficiency, median ticket, frequency, costos y más.",
      sender: "ai",
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (messageContent?: string) => {
    const content = messageContent || currentMessage.trim();
    if (!content) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `Analizando "${content}"...\n\nBasado en los datos de optimización Pascual:\n\n• **Efficiency**: Ratio pedidos/contactos actual\n• **Median Ticket**: €85.50 promedio\n• **Frequency**: 2.3 pedidos/semana\n• **Net Income**: Ingresos totales del cliente\n• **Costos**: 10€/pedido + 15€/visita\n\n¿Te gustaría profundizar en algún aspecto específico?`,
        sender: "ai",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 2000);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Mensaje copiado al portapapeles");
  };

  return (
    <div className="flex-1 flex flex-col bg-white border-r">
      {/* Chat Header */}
      <div className="border-b bg-pascual-blue text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold">Pascual Route Optimizer</h2>
              <p className="text-sm text-blue-100">Asistente IA para optimización</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-white/20"
            onClick={() => {
              setMessages([{
                id: "1",
                content: "¡Hola! Soy tu asistente de optimización Pascual. ¿Sobre qué cliente o métrica te gustaría consultar?",
                sender: "ai",
                timestamp: new Date()
              }]);
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Nueva Consulta
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b bg-gray-50">
        <p className="text-sm text-gray-600 mb-3">Consultas frecuentes:</p>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_QUERIES.map((query, index) => (
            <Badge
              key={index}
              variant="outline"
              className="cursor-pointer hover:bg-pascual-blue hover:text-white hover:border-pascual-blue transition-colors"
              onClick={() => handleSendMessage(query)}
            >
              {query}
            </Badge>
          ))}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 custom-scrollbar">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender === "user" ? "bg-pascual-blue text-white" : "bg-gray-200 text-gray-600"
                }`}>
                  {message.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                
                <Card className={`${message.sender === "user" ? "bg-pascual-blue text-white" : "bg-white border"}`}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <p className="text-sm whitespace-pre-line flex-1">{message.content}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`ml-2 h-6 w-6 p-0 ${message.sender === "user" ? "text-white/70 hover:text-white hover:bg-white/20" : "text-gray-400 hover:text-gray-600"}`}
                        onClick={() => handleCopy(message.content)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className={`text-xs mt-2 ${message.sender === "user" ? "text-blue-100" : "text-gray-500"}`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-gray-600" />
                </div>
                <Card className="bg-white border">
                  <CardContent className="p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t p-4 bg-white">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex space-x-2"
        >
          <Input
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Pregunta sobre un cliente, métrica o análisis..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon"
            className="bg-pascual-blue hover:bg-pascual-blue-dark"
            disabled={isLoading || !currentMessage.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
