import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Calendar, Lightbulb, Users, FileText, ExternalLink, Building2 } from "lucide-react";

const services = [
  { icon: GraduationCap, label: "Portal do Aluno", desc: "Notas, faltas e boletim", url: "https://unimestre.avantis.edu.br/projetos/portal_online", color: "bg-primary/15 text-primary" },
  { icon: BookOpen, label: "Biblioteca", desc: "Acervo e reservas online", url: "https://uniavan.edu.br/biblioteca", color: "bg-secondary/15 text-secondary" },
  { icon: FileText, label: "Secretaria / RA", desc: "Documentos e requerimentos", url: "https://uniavan.edu.br/central", color: "bg-primary/15 text-primary" },
  { icon: Calendar, label: "Calendário Acadêmico", desc: "Datas importantes e provas", url: "https://uniavan.edu.br/central", color: "bg-secondary/15 text-secondary" },
  { icon: Users, label: "Eventos", desc: "Palestras, workshops e festas", url: "https://blog.uniavan.edu.br/", color: "bg-primary/15 text-primary" },
  { icon: Lightbulb, label: "Extensão", desc: "Projetos de extensão e pesquisa", url: "https://uniavan.edu.br/extensao_", color: "bg-secondary/15 text-secondary" },
  { icon: Building2, label: "Unidades", desc: "Campus e polos da Uniavan", url: "https://uniavan.edu.br/unidades", color: "bg-primary/15 text-primary" },
];

const Services = () => {
  return (
    <div className="min-h-screen bg-background dark px-4 pt-4 pb-24">
      <h1 className="text-2xl font-bold font-display text-gradient-uniavan mb-1">Serviços Uniavan</h1>
      <p className="text-sm text-muted-foreground mb-6">Tudo que você precisa em um só lugar</p>

      <div className="space-y-2">
        {services.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.a
              key={item.label}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">{item.label}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground/50" />
            </motion.a>
          );
        })}
      </div>
    </div>
  );
};

export default Services;
