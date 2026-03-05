import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Calendar, Scissors, Users, Clock, Smartphone, Shield,
  ChevronRight, Star, Check, ArrowRight, Zap, MessageCircle,
  ChevronDown
} from 'lucide-react';
import heroImage from '@/assets/hero-barbershop.jpg';
import ThemeToggle from '@/components/ThemeToggle';
import { useState } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }
  })
};

const features = [
  { icon: Calendar, title: 'Agendamento Online', desc: 'Seus clientes agendam direto pelo celular, 24h por dia, sem ligações.' },
  { icon: Scissors, title: 'Gestão de Barbeiros', desc: 'Cadastre sua equipe, defina horários individuais e gerencie tudo em um só lugar.' },
  { icon: Clock, title: 'Horários Inteligentes', desc: 'Configure expediente, intervalos e bloqueios por barbeiro automaticamente.' },
  { icon: Smartphone, title: 'Página Pública', desc: 'Sua barbearia ganha uma página profissional para compartilhar com clientes.' },
  { icon: Users, title: 'Multi-usuários', desc: 'Convide administradores e barbeiros com permissões diferentes.' },
  { icon: Shield, title: 'Controle Total', desc: 'Dashboard completo com métricas, gráficos e visão geral do negócio.' },
];

const steps = [
  { num: '01', title: 'Crie sua conta', desc: 'Cadastre-se em menos de 2 minutos e configure sua barbearia.' },
  { num: '02', title: 'Configure serviços e equipe', desc: 'Adicione seus serviços, preços e barbeiros com horários de trabalho.' },
  { num: '03', title: 'Compartilhe seu link', desc: 'Envie o link da sua página pública para seus clientes via WhatsApp ou redes sociais.' },
  { num: '04', title: 'Receba agendamentos', desc: 'Clientes agendam online e você gerencia tudo pelo painel.' },
];

const plans = [
  {
    name: 'Grátis',
    price: 'R$ 0',
    period: '/14 dias',
    desc: 'Teste tudo sem compromisso',
    features: ['1 barbeiro', 'Agendamentos ilimitados', 'Página pública', 'Gestão básica'],
    cta: 'Começar grátis',
    highlighted: false,
  },
  {
    name: 'Profissional',
    price: 'R$ 49',
    period: '/mês',
    desc: 'Para barbearias em crescimento',
    features: ['Até 5 barbeiros', 'Agendamentos ilimitados', 'Página personalizada', 'Lembretes WhatsApp', 'Relatórios e métricas'],
    cta: 'Assinar agora',
    highlighted: true,
  },
  {
    name: 'Premium',
    price: 'R$ 99',
    period: '/mês',
    desc: 'Para barbearias consolidadas',
    features: ['Barbeiros ilimitados', 'Agendamentos ilimitados', 'Tudo do Profissional', 'Suporte prioritário', 'Multi-unidades'],
    cta: 'Falar com vendas',
    highlighted: false,
  },
];

const testimonials = [
  { name: 'Carlos Silva', role: 'Dono da Barbearia Silva', text: 'O BarberFlow transformou minha barbearia. Antes eu perdia clientes por não atender o telefone, agora eles agendam sozinhos!', rating: 5 },
  { name: 'André Santos', role: 'Barbeiro autônomo', text: 'Super fácil de usar. Em 5 minutos já tinha minha página pronta e compartilhando com meus clientes.', rating: 5 },
  { name: 'Roberto Lima', role: 'Dono da RL Barber', text: 'Minha equipe de 4 barbeiros usa todo dia. A organização melhorou 100% e não temos mais conflitos de horário.', rating: 5 },
];

const faqs = [
  { q: 'Preciso de cartão de crédito para testar?', a: 'Não! O período de teste de 14 dias é totalmente gratuito, sem necessidade de cartão.' },
  { q: 'Meus clientes precisam baixar algum app?', a: 'Não. Eles agendam direto pelo navegador do celular, sem baixar nada. É só clicar no link.' },
  { q: 'Posso cancelar a qualquer momento?', a: 'Sim, você pode cancelar sua assinatura quando quiser, sem multa ou fidelidade.' },
  { q: 'Funciona para barbeiro autônomo?', a: 'Com certeza! O plano gratuito é perfeito para quem trabalha sozinho.' },
  { q: 'Como meus clientes vão agendar?', a: 'Você recebe um link exclusivo da sua barbearia (ex: barberflow.app/s/sua-barbearia) para compartilhar no WhatsApp, Instagram, etc.' },
];

const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium hover:text-primary transition-colors"
        onClick={() => setOpen(!open)}
      >
        {q}
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>}
    </div>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold font-['Space_Grotesk'] text-primary">
            BarberFlow
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#funcionalidades" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Funcionalidades</a>
            <a href="#como-funciona" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Como funciona</a>
            <a href="#planos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Planos</a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="gap-1">
                Criar conta <ChevronRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-16 min-h-[90vh] flex items-center">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Interior de barbearia profissional" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-20">
          <motion.div
            className="max-w-xl space-y-6"
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">Agendamento online para barbearias</span>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-6xl font-bold font-['Space_Grotesk'] leading-[1.1] tracking-tight">
              Sua barbearia no <span className="text-primary">piloto automático</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground leading-relaxed max-w-md">
              Seus clientes agendam online, você gerencia tudo em um painel simples. Sem ligações, sem confusão.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-3">
              <Link to="/signup">
                <Button size="lg" className="h-13 px-8 text-base gap-2 w-full sm:w-auto">
                  Começar grátis <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#como-funciona">
                <Button variant="outline" size="lg" className="h-13 px-8 text-base w-full sm:w-auto">
                  Como funciona
                </Button>
              </a>
            </motion.div>
            <motion.p variants={fadeUp} custom={4} className="text-xs text-muted-foreground">
              ✓ 14 dias grátis &nbsp; ✓ Sem cartão de crédito &nbsp; ✓ Agendamentos ilimitados
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="funcionalidades" className="py-24 bg-card/50">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.p variants={fadeUp} custom={0} className="text-sm font-medium text-primary mb-2">FUNCIONALIDADES</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold font-['Space_Grotesk']">
              Tudo que sua barbearia precisa
            </motion.h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}>
                <Card className="h-full border-border/50 hover:border-primary/30 transition-colors group">
                  <CardContent className="p-6 space-y-3">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold font-['Space_Grotesk']">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-24">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.p variants={fadeUp} custom={0} className="text-sm font-medium text-primary mb-2">COMO FUNCIONA</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold font-['Space_Grotesk']">
              4 passos para começar
            </motion.h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <motion.div key={s.num} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp} className="text-center space-y-3">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary font-['Space_Grotesk']">{s.num}</span>
                </div>
                <h3 className="font-semibold font-['Space_Grotesk']">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="depoimentos" className="py-24 bg-card/50">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.p variants={fadeUp} custom={0} className="text-sm font-medium text-primary mb-2">DEPOIMENTOS</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold font-['Space_Grotesk']">
              Quem usa, recomenda
            </motion.h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}>
                <Card className="h-full border-border/50">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">"{t.text}"</p>
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="planos" className="py-24">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.p variants={fadeUp} custom={0} className="text-sm font-medium text-primary mb-2">PLANOS</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold font-['Space_Grotesk']">
              Escolha o plano ideal
            </motion.h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans.map((p, i) => (
              <motion.div key={p.name} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}>
                <Card className={`h-full relative ${p.highlighted ? 'border-primary shadow-lg shadow-primary/10' : 'border-border/50'}`}>
                  {p.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                      Mais popular
                    </div>
                  )}
                  <CardContent className="p-6 space-y-5">
                    <div>
                      <h3 className="text-lg font-semibold font-['Space_Grotesk']">{p.name}</h3>
                      <p className="text-xs text-muted-foreground">{p.desc}</p>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold font-['Space_Grotesk']">{p.price}</span>
                      <span className="text-sm text-muted-foreground">{p.period}</span>
                    </div>
                    <ul className="space-y-2.5">
                      {p.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link to="/signup" className="block">
                      <Button className="w-full" variant={p.highlighted ? 'default' : 'outline'}>
                        {p.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-card/50">
        <div className="mx-auto max-w-2xl px-4">
          <motion.div className="text-center mb-12" initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.p variants={fadeUp} custom={0} className="text-sm font-medium text-primary mb-2">FAQ</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold font-['Space_Grotesk']">
              Perguntas frequentes
            </motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <Card className="border-border/50">
              <CardContent className="p-6">
                {faqs.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            className="relative rounded-2xl overflow-hidden"
            initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            <div className="absolute inset-0">
              <img src={heroImage} alt="" className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
            </div>
            <div className="relative text-center py-16 px-6 space-y-6">
              <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-bold font-['Space_Grotesk']">
                Pronto para modernizar sua barbearia?
              </motion.h2>
              <motion.p variants={fadeUp} custom={1} className="text-muted-foreground max-w-md mx-auto">
                Crie sua conta em menos de 2 minutos e comece a receber agendamentos online hoje.
              </motion.p>
              <motion.div variants={fadeUp} custom={2}>
                <Link to="/signup">
                  <Button size="lg" className="h-13 px-10 text-base gap-2">
                    Criar minha conta grátis <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="space-y-3">
              <p className="text-xl font-bold font-['Space_Grotesk'] text-primary">BarberFlow</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sistema de agendamento online feito para barbearias que querem crescer.
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold">Produto</p>
              <div className="flex flex-col gap-2">
                <a href="#funcionalidades" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Funcionalidades</a>
                <a href="#planos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Planos</a>
                <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold">Conta</p>
              <div className="flex flex-col gap-2">
                <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Entrar</Link>
                <Link to="/signup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Criar conta</Link>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} BarberFlow. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;