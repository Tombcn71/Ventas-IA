'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Sparkles, 
  TrendingUp, 
  MapPin, 
  Zap,
  Globe,
  Shield,
  ArrowRight,
  Check,
  BarChart3,
  Target,
  Route as RouteIcon,
  Search,
  Brain,
  Users,
  Clock,
  Award,
  MessageSquare
} from 'lucide-react'

export default function HomePage() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white border-b border-gray-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Ventas IA
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#soluciones" className="text-gray-600 hover:text-gray-900 transition">
                Soluciones
              </Link>
              <Link href="#casos-exito" className="text-gray-600 hover:text-gray-900 transition">
                Casos de Éxito
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition">
                Dashboard
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                Prueba Gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Vibrant AI gradient background with glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950">
          {/* Animated glowing orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen opacity-30 blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-screen opacity-30 blur-[120px] animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500 rounded-full mix-blend-screen opacity-20 blur-[150px] animate-pulse delay-500"></div>
          
          {/* Shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
          
          {/* Grid pattern with glow */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,black_70%,transparent_110%)]"></div>
          
          {/* Animated gradient mesh */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-600/40 via-transparent to-pink-600/40"></div>
            <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-blue-600/40 via-transparent to-indigo-600/40"></div>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30 backdrop-blur-xl border border-white/20 rounded-full text-white text-sm font-semibold mb-8 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              <Zap className="w-4 h-4 text-yellow-300 animate-pulse" />
              Copiloto de Ventas IA
            </div>
            <h1 className="text-5xl md:text-7xl mb-6 leading-tight">
              <span className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">Encuentra con IA clientes que</span>
              <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] drop-shadow-[0_0_40px_rgba(168,85,247,0.6)]">
                aún no venden tu producto
              </span>
            </h1>
            <p className="text-xl text-white/90 mb-10 leading-relaxed drop-shadow-lg">
              Recopilamos datos públicos de 30.000+ restaurantes y bares en España. Nuestra IA convierte datos desordenados en rutas inteligentes y oportunidades de venta reales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="group px-8 py-4 bg-gradient-to-r from-white to-white/90 text-purple-900 rounded-xl hover:shadow-[0_0_40px_rgba(255,255,255,0.6)] hover:scale-105 transition-all duration-300 font-bold text-lg flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                Prueba Gratis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#demo"
                className="px-8 py-4 bg-white/10 backdrop-blur-xl text-white border-2 border-white/40 rounded-xl hover:bg-white/20 hover:border-white/60 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300 font-semibold text-lg"
              >
                Solicitar Demo
              </Link>
            </div>
            </div>
          </div>
        </section>

        {/* Three Feature Cards */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white -mt-10 z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Card 1: Nosotros recopilamos */}
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Nosotros recopilamos</h3>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Datos públicos organizados inteligentemente
                </p>
                <p className="text-gray-700 leading-relaxed">
                  30.000+ restaurantes y bares en España. Datos públicos donde tu marca se menciona o no se menciona. 
                  Todos los productos y marcas detectados. Datos actualizados cada mes.
                </p>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-700 transition"
                  >
                    Saber más <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Card 2: IA encuentra */}
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">IA encuentra</h3>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed font-semibold">
                  Automáticamente locales sin tu producto
                </p>
                <p className="text-gray-700 leading-relaxed">
                  "Bares sin Heineken en Barcelona". "Restaurantes premium que sí venden Estrella". 
                  Priorizados por rating, tráfico y presencia de competidores. Listos para visitar.
                </p>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition"
                  >
                    Saber más <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Card 3: IA ayuda */}
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">IA ayuda</h3>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed font-semibold">
                  De lead a venta en menos tiempo
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Ruta óptima para 10 visitas al día. Briefing pre-visita por local: qué venden, 
                  quién es la competencia, sugerencias de pitch. 2x más ventas, 50% menos tiempo.
                </p>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-green-600 font-semibold hover:text-green-700 transition"
                  >
                    Saber más <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        

     

      

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            ¿Listo para transformar tus ventas?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Descubre oportunidades que nunca supiste que existían
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl hover:shadow-xl transition-all font-semibold text-lg"
            >
              Prueba Gratis
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#demo"
              className="inline-flex items-center gap-2 px-8 py-4 bg-transparent text-white border-2 border-white rounded-xl hover:bg-white/10 transition-all font-semibold text-lg"
            >
              Solicitar Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">DashLeads</span>
              </div>
              <p className="text-sm">
                Inteligencia de ubicación con IA para aumentar tus ventas en el mercado español.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#soluciones" className="hover:text-white transition">Soluciones</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
                <li><Link href="/prospects" className="hover:text-white transition">Prospects</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#casos-exito" className="hover:text-white transition">Casos de Éxito</Link></li>
                <li><Link href="#" className="hover:text-white transition">Sobre Nosotros</Link></li>
                <li><Link href="#" className="hover:text-white transition">Carreras</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#demo" className="hover:text-white transition">Solicitar Demo</Link></li>
                <li><Link href="#" className="hover:text-white transition">Contacto</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm">
              © 2024 DashLeads. Todos los derechos reservados.
            </div>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="text-sm hover:text-white transition">Términos y Condiciones</Link>
              <Link href="#" className="text-sm hover:text-white transition">Política de Privacidad</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function StatCard({ icon, value, label, color }: any) {
  const colors: any = {
    blue: 'from-blue-500 to-blue-600',
    red: 'from-red-500 to-red-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${colors[color]} text-white mb-4`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  )
}

function FeatureCard({ icon, title, description, stat }: any) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition">
      <div className="inline-flex p-3 rounded-xl bg-blue-100 text-blue-600 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="text-sm font-semibold text-blue-600">{stat}</div>
    </div>
  )
}

function TestimonialCard({ quote, author, role }: any) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Award key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
        ))}
      </div>
      <p className="text-gray-700 mb-6 italic">"{quote}"</p>
      <div>
        <div className="font-semibold text-gray-900">{author}</div>
        <div className="text-sm text-gray-600">{role}</div>
      </div>
    </div>
  )
}

function WhyCard({ icon, title, description }: any) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
      <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
