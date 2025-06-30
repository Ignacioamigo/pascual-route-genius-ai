
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, BarChart3, Users, TrendingUp, Clock } from "lucide-react";
import { AuthModal } from "@/components/auth/AuthModal";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { MetricsPanel } from "@/components/metrics/MetricsPanel";

const Index = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowAuth(false);
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="flex h-screen">
          <ChatInterface />
          <MetricsPanel />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/e4c51655-b9bc-40f1-a5a3-e82d3081c0c2.png" 
              alt="Pascual Logo" 
              className="h-8 w-auto"
            />
            <h1 className="text-2xl font-bold text-pascual-blue">Route Optimizer</h1>
          </div>
          <Button 
            onClick={() => setShowAuth(true)}
            className="bg-pascual-blue hover:bg-pascual-blue-dark"
          >
            Acceder al Sistema
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-6 bg-pascual-blue/10 text-pascual-blue border-pascual-blue/20" variant="outline">
            Sistema de Optimización Inteligente
          </Badge>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Pascual Route
            <span className="text-pascual-blue"> Optimizer</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Sistema AI para optimizar contactos, frecuencias y rentabilidad en canales HR y HH.
            Maximiza la eficiencia de tus rutas comerciales con inteligencia artificial avanzada.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-pascual-blue hover:bg-pascual-blue-dark text-lg px-8 py-3"
              onClick={() => setShowAuth(true)}
            >
              <MessageSquare className="mr-2 w-5 h-5" />
              Comenzar Optimización
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-pascual-blue text-pascual-blue hover:bg-pascual-blue hover:text-white text-lg px-8 py-3"
            >
              <BarChart3 className="mr-2 w-5 h-5" />
              Ver Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Optimización Inteligente de Rutas
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Analiza y optimiza cada aspecto de tus operaciones comerciales con métricas clave y algoritmos avanzados
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="glass-card hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-pascual-blue/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-pascual-blue/20 transition-colors">
                <Users className="w-6 h-6 text-pascual-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Análisis de Clientes</h3>
              <p className="text-gray-600 mb-4">
                Evalúa efficiency, median ticket y frequency de cada cliente para optimizar contactos
              </p>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                HR & HH Channels
              </Badge>
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-pascual-blue/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-pascual-blue/20 transition-colors">
                <TrendingUp className="w-6 h-6 text-pascual-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Optimización de Costos</h3>
              <p className="text-gray-600 mb-4">
                Reduce costos logísticos (10€/pedido) y de visitas (15€/visita) maximizando ROI
              </p>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                AI Powered
              </Badge>
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-pascual-blue/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-pascual-blue/20 transition-colors">
                <Clock className="w-6 h-6 text-pascual-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Consultas en Tiempo Real</h3>
              <p className="text-gray-600 mb-4">
                Chat AI especializado para consultas instantáneas sobre clientes y métricas
              </p>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Real-time
              </Badge>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-pascual-blue text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para optimizar tus rutas?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Accede al sistema y comienza a maximizar la eficiencia de tus operaciones comerciales
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="bg-white text-pascual-blue hover:bg-gray-100 text-lg px-8 py-3"
            onClick={() => setShowAuth(true)}
          >
            Acceder Ahora
          </Button>
        </div>
      </section>

      <AuthModal 
        open={showAuth} 
        onOpenChange={setShowAuth}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default Index;
