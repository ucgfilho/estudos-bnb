import type { DateKey } from '../lib/dates';
import { addDays, weekdayIndex, startOfWeek } from '../lib/dates';
import { createId, nowIso } from '../lib/utils';
import type { Discipline, Settings, StudySession, Topic, WeeklyPlan } from '../db/types';
import { SIMULADO_DISCIPLINE_ID } from '../domain/schedule';

export const BNB_TI_DISCIPLINES = [
  'arquitetura',
  'engenharia',
  'linguagens',
  'banco-dados',
  'logica-programacao',
  'nuvem',
] as const;

export const BNB_BASIC_DISCIPLINES = ['portugues', 'raciocinio'] as const;

export interface AiScheduleOptions {
  apiKey?: string;
  provider?: 'builtin' | 'gemini';
  customInstructions?: string;
}

export interface AiSessionTemplate {
  disciplineId: string;
  plannedMinutes: number;
  objective: string;
  topicKeyword?: string;
}

export interface AiDayTemplate {
  /** 0..6: deslocamento em dias a partir de weekStart (ou índice quando weekStart é segunda) */
  dayOffset: number;
  sessions: AiSessionTemplate[];
}

export interface AiWeekTemplate {
  weekIndex: number;
  phase: string;
  objectives: string;
  plannedContent: string;
  days: AiDayTemplate[];
}

export interface AiScheduleResult {
  weeklyPlans: WeeklyPlan[];
  sessions: StudySession[];
  providerUsed: 'builtin' | 'gemini';
}

/**
 * Matriz Pedagógica de 24 Semanas Especialista no Edital BNB — Analista de Sistemas (TI).
 * Regras Estritas:
 * 1. Dias de estudo com rigoroso limite de 2 horas (120 minutos).
 * 2. Sábados: exclusivamente de resolução de questões ou simulados (120 min).
 * 3. Domingos: dia livre / descanso semanal para sustentabilidade de longo prazo (0 min).
 * 4. Segunda a Sexta: Foco predominante nos Conhecimentos Específicos de TI (~80%),
 *    com Conhecimentos Básicos intercalados (~20%), refletindo o peso máximo da prova do BNB.
 */
export const BNB_24_WEEKS_CURRICULUM: AiWeekTemplate[] = [
  // FASE 1: FUNDAMENTOS & BASE TI BNB (Semanas 1 a 6)
  {
    weekIndex: 1,
    phase: 'Fase 1: Fundamentos & Nivelamento',
    objectives: 'Semana 1: Nivelamento em Lógica de Programação, Estruturas de Dados e Interpretação de Textos Cebraspe',
    plannedContent: 'Lógica booleana, tipos primitivos, estruturas condicionais e de repetição. Compreensão textual e tipologia Cebraspe.',
    days: [
      {
        dayOffset: 0,
        sessions: [
          { disciplineId: 'logica-programacao', plannedMinutes: 60, objective: 'Lógica de Programação: Estruturas Condicionais e de Repetição' },
          { disciplineId: 'linguagens', plannedMinutes: 60, objective: 'Linguagens: Tipos de Dados Primitivos e Declaração de Variáveis' },
        ],
      },
      {
        dayOffset: 1,
        sessions: [
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Arquitetura de Software: Conceitos Fundamentais e Modularidade' },
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Engenharia de Software: Ciclo de Vida do Software e Processos' },
        ],
      },
      {
        dayOffset: 2,
        sessions: [
          { disciplineId: 'banco-dados', plannedMinutes: 60, objective: 'Banco de Dados: Modelo Relacional e Conceito de Tabelas e Chaves' },
          { disciplineId: 'nuvem', plannedMinutes: 60, objective: 'Computação em Nuvem: Modelos de Serviço (IaaS, PaaS, SaaS)' },
        ],
      },
      {
        dayOffset: 3,
        sessions: [
          { disciplineId: 'logica-programacao', plannedMinutes: 60, objective: 'Lógica: Funções, Parâmetros e Passagem por Valor/Referência' },
          { disciplineId: 'linguagens', plannedMinutes: 60, objective: 'POO: Classes, Objetos e Métodos' },
        ],
      },
      {
        dayOffset: 4,
        sessions: [
          { disciplineId: 'portugues', plannedMinutes: 60, objective: 'Língua Portuguesa: Compreensão e Interpretação de Texto Cebraspe' },
          { disciplineId: 'raciocinio', plannedMinutes: 60, objective: 'Raciocínio Lógico: Proposições Simples e Compostas e Conectivos' },
        ],
      },
      {
        dayOffset: 5,
        sessions: [
          {
            disciplineId: SIMULADO_DISCIPLINE_ID,
            plannedMinutes: 120,
            objective: 'Sábado de Questões: 40 questões Cebraspe sobre Lógica de Programação e Língua Portuguesa',
          },
        ],
      },
    ],
  },
  {
    weekIndex: 2,
    phase: 'Fase 1: Fundamentos & Nivelamento',
    objectives: 'Semana 2: Estruturas de Dados Lineares (Pilhas, Filas, Listas) e Tabela-Verdade BNB',
    plannedContent: 'Pilhas, filas e listas encadeadas. Pilares da POO (Encapsulamento e Herança). Tabela-verdade de proposições.',
    days: [
      {
        dayOffset: 0,
        sessions: [
          { disciplineId: 'logica-programacao', plannedMinutes: 60, objective: 'Estruturas de Dados: Listas Lineares e Alocação Estática/Dinâmica' },
          { disciplineId: 'linguagens', plannedMinutes: 60, objective: 'POO Avançada: Encapsulamento, Modificadores de Acesso e Herança' },
        ],
      },
      {
        dayOffset: 1,
        sessions: [
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Arquitetura: Acoplamento, Coesão e Separação de Preocupações' },
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Engenharia: Requisitos Funcionais, Não-Funcionais e Regras de Negócio' },
        ],
      },
      {
        dayOffset: 2,
        sessions: [
          { disciplineId: 'banco-dados', plannedMinutes: 60, objective: 'Banco de Dados: Modelo Conceitual e Diagrama Entidade-Relacionamento (DER)' },
          { disciplineId: 'nuvem', plannedMinutes: 60, objective: 'Nuvem: Modelos de Implantação (Pública, Privada, Híbrida e Multicloud)' },
        ],
      },
      {
        dayOffset: 3,
        sessions: [
          { disciplineId: 'logica-programacao', plannedMinutes: 60, objective: 'Estruturas de Dados: Pilhas (LIFO) e Filas (FIFO) e Aplicações' },
          { disciplineId: 'linguagens', plannedMinutes: 60, objective: 'POO: Polimorfismo, Sobrecarga e Sobrescrita de Métodos' },
        ],
      },
      {
        dayOffset: 4,
        sessions: [
          { disciplineId: 'raciocinio', plannedMinutes: 60, objective: 'Raciocínio Lógico: Construção de Tabela-Verdade e Tautologias' },
          { disciplineId: 'portugues', plannedMinutes: 60, objective: 'Português: Coesão Textual, Referenciação e Conectivos Cebraspe' },
        ],
      },
      {
        dayOffset: 5,
        sessions: [
          {
            disciplineId: SIMULADO_DISCIPLINE_ID,
            plannedMinutes: 120,
            objective: 'Sábado de Questões: 45 questões Cebraspe sobre Estruturas de Dados e POO',
          },
        ],
      },
    ],
  },
  {
    weekIndex: 3,
    phase: 'Fase 1: Fundamentos & Nivelamento',
    objectives: 'Semana 3: Algoritmos de Busca/Ordenação, SQL Básico (DDL/DML) e Equivalências Lógicas',
    plannedContent: 'Busca linear, busca binária, Bubble Sort, Merge Sort. Comandos SQL DDL e DML. Equivalências de condicionais.',
    days: [
      {
        dayOffset: 0,
        sessions: [
          { disciplineId: 'logica-programacao', plannedMinutes: 60, objective: 'Algoritmos: Busca Linear, Busca Binária e Análise Assintótica O(n)' },
          { disciplineId: 'banco-dados', plannedMinutes: 60, objective: 'SQL: Comandos DDL (CREATE, ALTER, DROP TABLE) e Tipos de Dados' },
        ],
      },
      {
        dayOffset: 1,
        sessions: [
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Arquitetura: Padrão Camadas (Layered Architecture) e Padrão MVC' },
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Engenharia de Software: Metodologias Clássicas vs Ágeis' },
        ],
      },
      {
        dayOffset: 2,
        sessions: [
          { disciplineId: 'banco-dados', plannedMinutes: 60, objective: 'SQL: Comandos DML (SELECT, INSERT, UPDATE, DELETE e WHERE)' },
          { disciplineId: 'linguagens', plannedMinutes: 60, objective: 'Linguagens: Tratamento de Exceções e Coleções (Lists, Sets, Maps)' },
        ],
      },
      {
        dayOffset: 3,
        sessions: [
          { disciplineId: 'logica-programacao', plannedMinutes: 60, objective: 'Algoritmos: Ordenação Bubble Sort, Insertion Sort e Quick Sort' },
          { disciplineId: 'nuvem', plannedMinutes: 60, objective: 'Nuvem: Virtualização vs Containers e Hipervisores Tipo 1 e 2' },
        ],
      },
      {
        dayOffset: 4,
        sessions: [
          { disciplineId: 'raciocinio', plannedMinutes: 60, objective: 'Raciocínio Lógico: Equivalências Lógicas e Leis de De Morgan' },
          { disciplineId: 'portugues', plannedMinutes: 60, objective: 'Português: Ortografia, Acentuação e Emprego do Vocabulário Cebraspe' },
        ],
      },
      {
        dayOffset: 5,
        sessions: [
          {
            disciplineId: SIMULADO_DISCIPLINE_ID,
            plannedMinutes: 120,
            objective: 'Sábado de Questões: 45 questões Cebraspe sobre SQL e Algoritmos de Ordenação',
          },
        ],
      },
    ],
  },
  {
    weekIndex: 4,
    phase: 'Fase 1: Fundamentos & Nivelamento',
    objectives: 'Semana 4: Clean Code, Princípios SOLID (S, O, L) e Modelagem Entidade-Relacionamento',
    plannedContent: 'Boas práticas de Clean Code. SOLID: Single Responsibility, Open/Closed, Liskov Substitution. DER e cardinalidade.',
    days: [
      {
        dayOffset: 0,
        sessions: [
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Clean Code: Nomes Significativos, Funções Pequenas e Comentários' },
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'SOLID: Princípio da Responsabilidade Única (SRP) e Aberto/Fechado (OCP)' },
        ],
      },
      {
        dayOffset: 1,
        sessions: [
          { disciplineId: 'banco-dados', plannedMinutes: 60, objective: 'Banco de Dados: Cardinalidade (1:1, 1:N, N:N) e Mapeamento para Tabelas' },
          { disciplineId: 'linguagens', plannedMinutes: 60, objective: 'Linguagens: Interfaces, Classes Abstratas e Polimorfismo Prático' },
        ],
      },
      {
        dayOffset: 2,
        sessions: [
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'SOLID: Princípio de Substituição de Liskov (LSP) e Exemplos Cebraspe' },
          { disciplineId: 'logica-programacao', plannedMinutes: 60, objective: 'Estruturas de Dados: Árvores Binárias (Conceitos, Travessias In, Pre, Post)' },
        ],
      },
      {
        dayOffset: 3,
        sessions: [
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Engenharia: Controle de Versão com Git (Init, Commit, Branch, Merge)' },
          { disciplineId: 'nuvem', plannedMinutes: 60, objective: 'Nuvem: Armazenamento em Nuvem (Object, Block e File Storage)' },
        ],
      },
      {
        dayOffset: 4,
        sessions: [
          { disciplineId: 'portugues', plannedMinutes: 60, objective: 'Português: Pontuação (Uso da Vírgula entre Orações e Termos)' },
          { disciplineId: 'raciocinio', plannedMinutes: 60, objective: 'Raciocínio Lógico: Negação de Proposições Compostas e Condicionais' },
        ],
      },
      {
        dayOffset: 5,
        sessions: [
          {
            disciplineId: SIMULADO_DISCIPLINE_ID,
            plannedMinutes: 120,
            objective: 'Sábado de Questões: 45 questões Cebraspe sobre SOLID (S,O,L) e Modelagem de Dados',
          },
        ],
      },
    ],
  },
  {
    weekIndex: 5,
    phase: 'Fase 1: Fundamentos & Nivelamento',
    objectives: 'Semana 5: SOLID (I, D), Normalização de Dados (1FN, 2FN, 3FN) e Concordância Cebraspe',
    plannedContent: 'SOLID: Interface Segregation e Dependency Inversion. Normalização de dados e integridade referencial. Concordância verbal/nominal.',
    days: [
      {
        dayOffset: 0,
        sessions: [
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'SOLID: Segregação de Interfaces (ISP) e Inversão de Dependência (DIP)' },
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Engenharia: Padrões de Refatoração de Código e Débito Técnico' },
        ],
      },
      {
        dayOffset: 1,
        sessions: [
          { disciplineId: 'banco-dados', plannedMinutes: 60, objective: 'Banco de Dados: Normalização — 1ª, 2ª e 3ª Formas Normais (FNs)' },
          { disciplineId: 'banco-dados', plannedMinutes: 60, objective: 'SQL: Junções de Tabelas (INNER JOIN, LEFT/RIGHT/FULL OUTER JOIN)' },
        ],
      },
      {
        dayOffset: 2,
        sessions: [
          { disciplineId: 'linguagens', plannedMinutes: 60, objective: 'Linguagens: Generics, Expressões Lambda e Programação Funcional' },
          { disciplineId: 'logica-programacao', plannedMinutes: 60, objective: 'Estruturas de Dados: Tabelas Hash e Tratamento de Colisões' },
        ],
      },
      {
        dayOffset: 3,
        sessions: [
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Arquitetura: Inversão de Controle (IoC) e Injeção de Dependências' },
          { disciplineId: 'nuvem', plannedMinutes: 60, objective: 'Nuvem: Redes Básicas (VPC, Subredes Públicas/Privadas e Security Groups)' },
        ],
      },
      {
        dayOffset: 4,
        sessions: [
          { disciplineId: 'portugues', plannedMinutes: 60, objective: 'Português: Concordância Verbal e Nominal nos Padrões Cebraspe' },
          { disciplineId: 'raciocinio', plannedMinutes: 60, objective: 'Raciocínio Lógico: Diagramas Lógicos e Operações com Conjuntos' },
        ],
      },
      {
        dayOffset: 5,
        sessions: [
          {
            disciplineId: SIMULADO_DISCIPLINE_ID,
            plannedMinutes: 120,
            objective: 'Sábado de Questões: 45 questões Cebraspe sobre Normalização e Princípios SOLID',
          },
        ],
      },
    ],
  },
  {
    weekIndex: 6,
    phase: 'Fase 1: Fundamentos & Nivelamento',
    objectives: 'Semana 6: Fechamento da Fase 1, GitFlow, SQL Agrupamentos e Simulado Diagnóstico BNB 1',
    plannedContent: 'Consolidação da base. GitFlow e pull requests. GROUP BY, HAVING. Simulado Diagnóstico Geral de 2h.',
    days: [
      {
        dayOffset: 0,
        sessions: [
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Engenharia: GitFlow, Estratégias de Branching e Resolução de Conflitos' },
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Arquitetura: Revisão Geral dos 5 Princípios SOLID com Questões de Prova' },
        ],
      },
      {
        dayOffset: 1,
        sessions: [
          { disciplineId: 'banco-dados', plannedMinutes: 60, objective: 'SQL: Agregações (COUNT, SUM, AVG), GROUP BY e Cláusula HAVING' },
          { disciplineId: 'linguagens', plannedMinutes: 60, objective: 'Linguagens: Manipulação de Arquivos, I/O e Serialização JSON' },
        ],
      },
      {
        dayOffset: 2,
        sessions: [
          { disciplineId: 'logica-programacao', plannedMinutes: 60, objective: 'Lógica: Grafos (Conceitos, Matriz de Adjacência e Travessias BFS/DFS)' },
          { disciplineId: 'nuvem', plannedMinutes: 60, objective: 'Nuvem: Alta Disponibilidade, Escalabilidade Horizontal e Load Balancers' },
        ],
      },
      {
        dayOffset: 3,
        sessions: [
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Engenharia: Code Review, Análise Estática de Código e SonarQube' },
          { disciplineId: 'banco-dados', plannedMinutes: 60, objective: 'Banco de Dados: Subconsultas e Operadores IN, EXISTS, ANY/ALL' },
        ],
      },
      {
        dayOffset: 4,
        sessions: [
          { disciplineId: 'portugues', plannedMinutes: 60, objective: 'Português: Regência Verbal, Regência Nominal e Emprego do Sinal de Crase' },
          { disciplineId: 'raciocinio', plannedMinutes: 60, objective: 'Raciocínio Lógico: Argumentação Lógica, Silogismos e Validade' },
        ],
      },
      {
        dayOffset: 5,
        sessions: [
          {
            disciplineId: SIMULADO_DISCIPLINE_ID,
            plannedMinutes: 120,
            objective: 'Sábado de Simulado BNB 1: Simulado Diagnóstico Cronometrado de 60 itens Cebraspe (TI + Básicos)',
          },
        ],
      },
    ],
  },

  // FASE 2: APROFUNDAMENTO EM CONHECIMENTOS ESPECÍFICOS DE TI BNB (Semanas 7 a 14)
  {
    weekIndex: 7,
    phase: 'Fase 2: Aprofundamento TI BNB',
    objectives: 'Semana 7: Clean Architecture, Camadas de Domínio e Padrões GoF Criacionais',
    plannedContent: 'Clean Architecture (Entities, Use Cases, Adapters). Design Patterns GoF: Factory Method, Abstract Factory, Builder, Singleton.',
    days: [
      {
        dayOffset: 0,
        sessions: [
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Clean Architecture: Regra da Dependência e Separação de Camadas' },
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Design Patterns GoF: Factory Method e Abstract Factory' },
        ],
      },
      {
        dayOffset: 1,
        sessions: [
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Design Patterns GoF: Singleton e Builder (Implementações e Cuidados)' },
          { disciplineId: 'linguagens', plannedMinutes: 60, objective: 'Linguagens: Implementação de Padrões Criacionais em Java e TypeScript' },
        ],
      },
      {
        dayOffset: 2,
        sessions: [
          { disciplineId: 'banco-dados', plannedMinutes: 60, objective: 'Banco de Dados: Views, Triggers e Stored Procedures em SGBDs Relacionais' },
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Engenharia: Pirâmide de Testes e Diferença entre Unit, Integration e E2E' },
        ],
      },
      {
        dayOffset: 3,
        sessions: [
          { disciplineId: 'nuvem', plannedMinutes: 60, objective: 'Nuvem: Docker — Arquitetura do Docker, Imagens e Dockerfile' },
          { disciplineId: 'logica-programacao', plannedMinutes: 60, objective: 'Algoritmos: Programação Dinâmica e Memorização (Conceitos Básicos)' },
        ],
      },
      {
        dayOffset: 4,
        sessions: [
          { disciplineId: 'portugues', plannedMinutes: 60, objective: 'Português: Semântica e Relações de Sentido (Sinonímia, Antonímia, Paronímia)' },
          { disciplineId: 'raciocinio', plannedMinutes: 60, objective: 'Raciocínio Lógico: Problemas de Associação Lógica e Correlacionamento' },
        ],
      },
      {
        dayOffset: 5,
        sessions: [
          {
            disciplineId: SIMULADO_DISCIPLINE_ID,
            plannedMinutes: 120,
            objective: 'Sábado de Questões: 50 questões Cebraspe sobre Clean Architecture e Padrões Criacionais GoF',
          },
        ],
      },
    ],
  },
  {
    weekIndex: 8,
    phase: 'Fase 2: Aprofundamento TI BNB',
    objectives: 'Semana 8: Padrões GoF Estruturais e Comportamentais (Strategy, Observer, Adapter) BNB',
    plannedContent: 'Design Patterns GoF: Adapter, Decorator, Facade, Strategy, Observer. Docker Volumes e Redes.',
    days: [
      {
        dayOffset: 0,
        sessions: [
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Design Patterns GoF: Adapter, Facade e Proxy' },
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Design Patterns GoF: Decorator e Composite' },
        ],
      },
      {
        dayOffset: 1,
        sessions: [
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Design Patterns GoF: Strategy, Observer e Template Method' },
          { disciplineId: 'linguagens', plannedMinutes: 60, objective: 'Linguagens: Frameworks de Injeção de Dependências e Spring IoC' },
        ],
      },
      {
        dayOffset: 2,
        sessions: [
          { disciplineId: 'nuvem', plannedMinutes: 60, objective: 'Nuvem: Docker Volumes, Redes Bridge/Host e Docker Compose Multi-container' },
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Engenharia: Testes Unitários com Mocks e Stubs (Mockito/Jest)' },
        ],
      },
      {
        dayOffset: 3,
        sessions: [
          { disciplineId: 'banco-dados', plannedMinutes: 60, objective: 'Banco de Dados: Índices (B-Tree, Hash), Clustered vs Non-Clustered' },
          { disciplineId: 'logica-programacao', plannedMinutes: 60, objective: 'Algoritmos: Árvores AVL e Balanceamento de Árvores' },
        ],
      },
      {
        dayOffset: 4,
        sessions: [
          { disciplineId: 'portugues', plannedMinutes: 60, objective: 'Português: Reescrita de Frases e Substituição de Termos Cebraspe' },
          { disciplineId: 'raciocinio', plannedMinutes: 60, objective: 'Raciocínio Quantitativo: Princípio Fundamental da Contagem e Arranjos' },
        ],
      },
      {
        dayOffset: 5,
        sessions: [
          {
            disciplineId: SIMULADO_DISCIPLINE_ID,
            plannedMinutes: 120,
            objective: 'Sábado de Questões: 50 questões Cebraspe sobre Padrões GoF Estruturais e Comportamentais',
          },
        ],
      },
    ],
  },
  {
    weekIndex: 9,
    phase: 'Fase 2: Aprofundamento TI BNB',
    objectives: 'Semana 9: Arquitetura de Microsserviços, APIs RESTful e Protocolo HTTP',
    plannedContent: 'Microsserviços vs Monólitos, API Gateway, Service Discovery. REST: verbos HTTP, idempotência, status codes e HATEOAS.',
    days: [
      {
        dayOffset: 0,
        sessions: [
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Microsserviços: Decomposição por Domínio, API Gateway e BFF' },
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'APIs RESTful: Princípios REST, Verbos HTTP e Idempotência' },
        ],
      },
      {
        dayOffset: 1,
        sessions: [
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'APIs RESTful: Códigos de Status HTTP (2xx, 3xx, 4xx, 5xx) e Swagger/OpenAPI' },
          { disciplineId: 'linguagens', plannedMinutes: 60, objective: 'Linguagens: Construção de Endpoints REST com Spring Boot ou Express' },
        ],
      },
      {
        dayOffset: 2,
        sessions: [
          { disciplineId: 'banco-dados', plannedMinutes: 60, objective: 'Banco de Dados: Transações e Propriedades ACID (Atomicidade, Consistência, Isolamento, Durabilidade)' },
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Engenharia: Desenvolvimento Guiado por Testes (TDD: Red, Green, Refactor)' },
        ],
      },
      {
        dayOffset: 3,
        sessions: [
          { disciplineId: 'nuvem', plannedMinutes: 60, objective: 'Nuvem: Kubernetes — Arquitetura de Cluster (Control Plane vs Worker Nodes)' },
          { disciplineId: 'nuvem', plannedMinutes: 60, objective: 'Nuvem: Kubernetes — Pods, Deployments e ReplicaSets' },
        ],
      },
      {
        dayOffset: 4,
        sessions: [
          { disciplineId: 'raciocinio', plannedMinutes: 60, objective: 'Raciocínio Quantitativo: Combinações Simples e Permutações' },
          { disciplineId: 'portugues', plannedMinutes: 60, objective: 'Português: Funções das Palavras Que e Se na Sintaxe Cebraspe' },
        ],
      },
      {
        dayOffset: 5,
        sessions: [
          {
            disciplineId: SIMULADO_DISCIPLINE_ID,
            plannedMinutes: 120,
            objective: 'Sábado de Questões: 50 questões Cebraspe sobre Microsserviços, REST e Códigos HTTP',
          },
        ],
      },
    ],
  },
  {
    weekIndex: 10,
    phase: 'Fase 2: Aprofundamento TI BNB',
    objectives: 'Semana 10: Bancos NoSQL (Documento, Chave-Valor), Teorema CAP e Kubernetes Services',
    plannedContent: 'NoSQL: MongoDB, Redis, Cassandra. Teorema CAP (Consistência, Disponibilidade, Partição) e BASE. Kubernetes Services e Ingress.',
    days: [
      {
        dayOffset: 0,
        sessions: [
          { disciplineId: 'banco-dados', plannedMinutes: 60, objective: 'Bancos NoSQL: Modelos de Dados (Documento, Chave-Valor, Família de Colunas, Grafos)' },
          { disciplineId: 'banco-dados', plannedMinutes: 60, objective: 'NoSQL: Teorema CAP, Modelo BASE e Consistência Eventual' },
        ],
      },
      {
        dayOffset: 1,
        sessions: [
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Microsserviços: Resiliência com Circuit Breaker, Retry e Fallback (Resilience4j)' },
          { disciplineId: 'nuvem', plannedMinutes: 60, objective: 'Kubernetes: Services (ClusterIP, NodePort, LoadBalancer) e Ingress Controllers' },
        ],
      },
      {
        dayOffset: 2,
        sessions: [
          { disciplineId: 'banco-dados', plannedMinutes: 60, objective: 'Bancos NoSQL: MongoDB (Collections, BSON, Sharding e Replicação)' },
          { disciplineId: 'banco-dados', plannedMinutes: 60, objective: 'Bancos NoSQL: Redis (Cache em Memória e Estruturas de Dados)' },
        ],
      },
      {
        dayOffset: 3,
        sessions: [
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Engenharia: Integração Contínua (CI) e Entrega Contínua (CD) com Pipelines' },
          { disciplineId: 'linguagens', plannedMinutes: 60, objective: 'Linguagens: Mapeamento Objeto-Relacional (ORM / JPA / Hibernate)' },
        ],
      },
      {
        dayOffset: 4,
        sessions: [
          { disciplineId: 'portugues', plannedMinutes: 60, objective: 'Português: Orações Subordinadas e Coordenadas e Nexos Oracionais' },
          { disciplineId: 'raciocinio', plannedMinutes: 60, objective: 'Raciocínio Quantitativo: Noções de Probabilidade e Eventos Independentes' },
        ],
      },
      {
        dayOffset: 5,
        sessions: [
          {
            disciplineId: SIMULADO_DISCIPLINE_ID,
            plannedMinutes: 120,
            objective: 'Sábado de Questões: 50 questões Cebraspe sobre NoSQL, Teorema CAP e Kubernetes',
          },
        ],
      },
    ],
  },
  {
    weekIndex: 11,
    phase: 'Fase 2: Aprofundamento TI BNB',
    objectives: 'Semana 11: Mensageria (Kafka e RabbitMQ), Event-Driven Architecture e Níveis de Isolamento ACID',
    plannedContent: 'Arquitetura Orientada a Eventos. Apache Kafka (Topics, Partições, Consumer Groups). RabbitMQ. Níveis de isolamento SQL.',
    days: [
      {
        dayOffset: 0,
        sessions: [
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Arquitetura Orientada a Eventos (EDA): Produtores, Consumidores e Event Sourcing' },
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Mensageria: Apache Kafka (Tópicos, Partições, Offset e Consumer Groups)' },
        ],
      },
      {
        dayOffset: 1,
        sessions: [
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Mensageria: RabbitMQ (Exchanges, Queues, Bindings e Padrões AMQP)' },
          { disciplineId: 'linguagens', plannedMinutes: 60, objective: 'Linguagens: Concorrência, Threads e Programação Assíncrona' },
        ],
      },
      {
        dayOffset: 2,
        sessions: [
          { disciplineId: 'banco-dados', plannedMinutes: 60, objective: 'Banco de Dados: Níveis de Isolamento (Read Uncommitted, Read Committed, Repeatable Read, Serializable)' },
          { disciplineId: 'banco-dados', plannedMinutes: 60, objective: 'Banco de Dados: Concorrência, Dirty Read, Non-repeatable Read e Phantom Read' },
        ],
      },
      {
        dayOffset: 3,
        sessions: [
          { disciplineId: 'nuvem', plannedMinutes: 60, objective: 'Kubernetes: ConfigMaps, Secrets, Volumes Persistentes (PV e PVC)' },
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Engenharia: Testes de Carga e Performance (JMeter e K6)' },
        ],
      },
      {
        dayOffset: 4,
        sessions: [
          { disciplineId: 'raciocinio', plannedMinutes: 60, objective: 'Raciocínio Lógico: Lógica de Primeira Ordem (Predicados e Quantificadores)' },
          { disciplineId: 'portugues', plannedMinutes: 60, objective: 'Português: Emprego dos Pronomes Relativos e Colocação Pronominal' },
        ],
      },
      {
        dayOffset: 5,
        sessions: [
          {
            disciplineId: SIMULADO_DISCIPLINE_ID,
            plannedMinutes: 120,
            objective: 'Sábado de Questões: 50 questões Cebraspe sobre Mensageria (Kafka/RabbitMQ) e Transações ACID',
          },
        ],
      },
    ],
  },
  {
    weekIndex: 12,
    phase: 'Fase 2: Aprofundamento TI BNB',
    objectives: 'Semana 12: Simulado de Meio de Curso BNB 2 e Segurança em Aplicações (OWASP Top 10)',
    plannedContent: 'OWASP Top 10: SQL Injection, XSS, CSRF, Broken Auth. Simulado Geral de 2h cobrindo metade do edital.',
    days: [
      {
        dayOffset: 0,
        sessions: [
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Segurança em Software: OWASP Top 10 — Injeção de SQL e Comandos' },
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Segurança em Software: OWASP Top 10 — XSS (Cross-Site Scripting) e CSRF' },
        ],
      },
      {
        dayOffset: 1,
        sessions: [
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Autenticação e Autorização: JWT (JSON Web Token), OAuth2 e OpenID Connect' },
          { disciplineId: 'linguagens', plannedMinutes: 60, objective: 'Linguagens: Sanitização de Entradas, Hashing Seguro (Bcrypt/Argon2)' },
        ],
      },
      {
        dayOffset: 2,
        sessions: [
          { disciplineId: 'nuvem', plannedMinutes: 60, objective: 'Nuvem: Segurança Cloud — IAM, Políticas de Menor Privilégio e Criptografia em Trânsito/Repouso' },
          { disciplineId: 'banco-dados', plannedMinutes: 60, objective: 'Banco de Dados: Permissões de Usuários (GRANT/REVOKE) e Segurança em Dados' },
        ],
      },
      {
        dayOffset: 3,
        sessions: [
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Revisão: Arquitetura Hexagonal (Ports and Adapters) e DDD (Domínio Rico)' },
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Engenharia: DevSecOps e Escaneamento de Vulnerabilidades em Dependências' },
        ],
      },
      {
        dayOffset: 4,
        sessions: [
          { disciplineId: 'portugues', plannedMinutes: 60, objective: 'Português: Redação Oficial e Manual de Redação da Presidência da República Cebraspe' },
          { disciplineId: 'raciocinio', plannedMinutes: 60, objective: 'Raciocínio Lógico: Revisão Geral de Proposições e Negações' },
        ],
      },
      {
        dayOffset: 5,
        sessions: [
          {
            disciplineId: SIMULADO_DISCIPLINE_ID,
            plannedMinutes: 120,
            objective: 'Sábado de Simulado BNB 2: Simulado de Meio de Curso (70 itens Cebraspe focados em TI)',
          },
        ],
      },
    ],
  },
  {
    weekIndex: 13,
    phase: 'Fase 2: Aprofundamento TI BNB',
    objectives: 'Semana 13: Computação em Nuvem AWS/Azure Core Services e Metodologias Ágeis (Scrum)',
    plannedContent: 'Serviços de Computação (EC2, Lambda, VMs), Armazenamento (S3, Blob), Redes. Framework Scrum completo.',
    days: [
      {
        dayOffset: 0,
        sessions: [
          { disciplineId: 'nuvem', plannedMinutes: 60, objective: 'Nuvem AWS: Computação (EC2, Auto Scaling, Elastic Beanstalk)' },
          { disciplineId: 'nuvem', plannedMinutes: 60, objective: 'Nuvem AWS: Armazenamento (S3 Classes, Glacier, EBS, EFS)' },
        ],
      },
      {
        dayOffset: 1,
        sessions: [
          { disciplineId: 'nuvem', plannedMinutes: 60, objective: 'Nuvem Serverless: AWS Lambda e Azure Functions (Gatilhos e Execução)' },
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Metodologias Ágeis: Scrum — Papéis (Product Owner, Scrum Master, Dev Team)' },
        ],
      },
      {
        dayOffset: 2,
        sessions: [
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Metodologias Ágeis: Scrum — Cerimônias (Sprint Planning, Daily, Review, Retrospective)' },
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Metodologias Ágeis: Scrum — Artefatos (Product Backlog, Sprint Backlog, Increment)' },
        ],
      },
      {
        dayOffset: 3,
        sessions: [
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Arquitetura: CQRS (Command Query Responsibility Segregation) e Sagas Distribuídas' },
          { disciplineId: 'banco-dados', plannedMinutes: 60, objective: 'Banco de Dados: Replicação Master-Slave, Sharding e Particionamento' },
        ],
      },
      {
        dayOffset: 4,
        sessions: [
          { disciplineId: 'portugues', plannedMinutes: 60, objective: 'Português: Paralelismo Sintático e Semântico em Questões Cebraspe' },
          { disciplineId: 'raciocinio', plannedMinutes: 60, objective: 'Raciocínio Quantitativo: Médias (Aritmética, Ponderada) e Noções Estatísticas' },
        ],
      },
      {
        dayOffset: 5,
        sessions: [
          {
            disciplineId: SIMULADO_DISCIPLINE_ID,
            plannedMinutes: 120,
            objective: 'Sábado de Questões: 50 questões Cebraspe sobre Nuvem (AWS/Azure) e Framework Scrum',
          },
        ],
      },
    ],
  },
  {
    weekIndex: 14,
    phase: 'Fase 2: Aprofundamento TI BNB',
    objectives: 'Semana 14: Kanban, Métricas de Fluxo, Otimização SQL e Observabilidade',
    plannedContent: 'Kanban (WIP, Lead Time, Cycle Time). Explain Plan e otimização de queries SQL. Logs estruturados, APM e tracing.',
    days: [
      {
        dayOffset: 0,
        sessions: [
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Metodologias Ágeis: Kanban — Limite de WIP, Visualização de Fluxo e Bloqueios' },
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Métricas Ágeis: Lead Time, Cycle Time, Throughput e CFD' },
        ],
      },
      {
        dayOffset: 1,
        sessions: [
          { disciplineId: 'banco-dados', plannedMinutes: 60, objective: 'Otimização de Banco de Dados: Análise de Planos de Execução (EXPLAIN / EXPLAIN ANALYZE)' },
          { disciplineId: 'banco-dados', plannedMinutes: 60, objective: 'Otimização: Criação Eficiente de Índices e Evitando Full Table Scans' },
        ],
      },
      {
        dayOffset: 2,
        sessions: [
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Observabilidade em Microsserviços: Três Pilares (Métricas, Logs e Traces Distribuídos)' },
          { disciplineId: 'nuvem', plannedMinutes: 60, objective: 'Nuvem e Observabilidade: Prometheus, Grafana, OpenTelemetry e ELK Stack' },
        ],
      },
      {
        dayOffset: 3,
        sessions: [
          { disciplineId: 'linguagens', plannedMinutes: 60, objective: 'Linguagens: Programação Reativa, Streams Reativos e WebFlux' },
          { disciplineId: 'logica-programacao', plannedMinutes: 60, objective: 'Algoritmos: Complexidade de Algoritmos (P vs NP noções teóricas)' },
        ],
      },
      {
        dayOffset: 4,
        sessions: [
          { disciplineId: 'portugues', plannedMinutes: 60, objective: 'Português: Interpretação de Textos Técnico-Científicos Cebraspe' },
          { disciplineId: 'raciocinio', plannedMinutes: 60, objective: 'Raciocínio Lógico: Problemas Matriciais e Sequências Numéricas e Lógicas' },
        ],
      },
      {
        dayOffset: 5,
        sessions: [
          {
            disciplineId: SIMULADO_DISCIPLINE_ID,
            plannedMinutes: 120,
            objective: 'Sábado de Questões: 50 questões Cebraspe sobre Kanban, Otimização SQL e Observabilidade',
          },
        ],
      },
    ],
  },

  // FASE 3: CONSOLIDAÇÃO & ARQUITETURAS AVANÇADAS BNB (Semanas 15 a 19)
  {
    weekIndex: 15,
    phase: 'Fase 3: Consolidação & Tópicos Avançados',
    objectives: 'Semana 15: Domain-Driven Design (DDD), Modelagem Estratégica e Banco de Dados Distribuído',
    plannedContent: 'DDD: Bounded Context, Ubiquitous Language, Aggregates, Value Objects, Domain Events. Bancos distribuídos e NewSQL.',
    days: [
      {
        dayOffset: 0,
        sessions: [
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'DDD Estratégico: Bounded Context, Context Mapping e Linguagem Ubíqua' },
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'DDD Tático: Entities, Value Objects, Aggregates e Repositories' },
        ],
      },
      {
        dayOffset: 1,
        sessions: [
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'DDD Tático: Domain Services, Application Services e Domain Events' },
          { disciplineId: 'linguagens', plannedMinutes: 60, objective: 'Linguagens: Estruturação de Pastas e Módulos segundo DDD' },
        ],
      },
      {
        dayOffset: 2,
        sessions: [
          { disciplineId: 'banco-dados', plannedMinutes: 60, objective: 'Bancos de Dados Distribuídos: Duas Fases de Commit (2PC) e Consistência Global' },
          { disciplineId: 'nuvem', plannedMinutes: 60, objective: 'Nuvem: Banco de Dados Gerenciado (AWS RDS, Aurora, DynamoDB)' },
        ],
      },
      {
        dayOffset: 3,
        sessions: [
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Engenharia: Gerência de Configuração e Infraestrutura como Código (IaC / Terraform)' },
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Engenharia: Estratégias de Deploy (Blue-Green, Canary, Rolling Update)' },
        ],
      },
      {
        dayOffset: 4,
        sessions: [
          { disciplineId: 'portugues', plannedMinutes: 60, objective: 'Português: Emprego dos Modos e Tempos Verbais nos Textos Cebraspe' },
          { disciplineId: 'raciocinio', plannedMinutes: 60, objective: 'Raciocínio Lógico: Negação de Quantificadores Todo, Algum e Nenhum' },
        ],
      },
      {
        dayOffset: 5,
        sessions: [
          {
            disciplineId: SIMULADO_DISCIPLINE_ID,
            plannedMinutes: 120,
            objective: 'Sábado de Questões: 50 questões Cebraspe sobre Domain-Driven Design e Deploys Ágeis',
          },
        ],
      },
    ],
  },
  {
    weekIndex: 16,
    phase: 'Fase 3: Consolidação & Tópicos Avançados',
    objectives: 'Semana 16: Frameworks Modernos (Spring, React/Angular), TypeScript e APIs GraphQL',
    plannedContent: 'Ecossistema Spring (Security, Data, Cloud). Frontend moderno (React, componentes, estado). GraphQL vs REST.',
    days: [
      {
        dayOffset: 0,
        sessions: [
          { disciplineId: 'linguagens', plannedMinutes: 60, objective: 'Linguagens: Spring Data JPA (Repositories, Queries Customizadas e Paginação)' },
          { disciplineId: 'linguagens', plannedMinutes: 60, objective: 'Linguagens: Spring Security (Filtros, Autenticação de Tokens e Proteção de Rotas)' },
        ],
      },
      {
        dayOffset: 1,
        sessions: [
          { disciplineId: 'linguagens', plannedMinutes: 60, objective: 'Frontend: Fundamentos de TypeScript (Interfaces, Types, Union e Generics)' },
          { disciplineId: 'linguagens', plannedMinutes: 60, objective: 'Frontend: Arquitetura SPA (Single Page Application) e Gerenciamento de Estado' },
        ],
      },
      {
        dayOffset: 2,
        sessions: [
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Arquitetura de APIs: GraphQL (Schema, Query, Mutation e Resolver) vs REST' },
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Arquitetura: gRPC e Protocol Buffers para Comunicação entre Microsserviços' },
        ],
      },
      {
        dayOffset: 3,
        sessions: [
          { disciplineId: 'banco-dados', plannedMinutes: 60, objective: 'Banco de Dados: Common Table Expressions (WITH CTE) e Window Functions em SQL' },
          { disciplineId: 'nuvem', plannedMinutes: 60, objective: 'Nuvem: Service Mesh (Istio/Linkerd) — Controle de Tráfego e mTLS' },
        ],
      },
      {
        dayOffset: 4,
        sessions: [
          { disciplineId: 'portugues', plannedMinutes: 60, objective: 'Português: Tipos de Discurso (Direto, Indireto e Indireto Livre)' },
          { disciplineId: 'raciocinio', plannedMinutes: 60, objective: 'Raciocínio Quantitativo: Resolução de Problemas Práticos com Equações e Razões' },
        ],
      },
      {
        dayOffset: 5,
        sessions: [
          {
            disciplineId: SIMULADO_DISCIPLINE_ID,
            plannedMinutes: 120,
            objective: 'Sábado de Questões: 50 questões Cebraspe sobre Frameworks Web, TypeScript e GraphQL',
          },
        ],
      },
    ],
  },
  {
    weekIndex: 17,
    phase: 'Fase 3: Consolidação & Tópicos Avançados',
    objectives: 'Semana 17: Governança de TI (ITIL v4 e noções COBIT) e Engenharia de Requisitos Avançada',
    plannedContent: 'ITIL v4: Sistema de Valor de Serviço, 4 Dimensões, Práticas principais. Histórias de usuário, épicos e aceitação.',
    days: [
      {
        dayOffset: 0,
        sessions: [
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Governança de TI: ITIL v4 — Sistema de Valor de Serviço (SVS) e 4 Dimensões' },
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Governança de TI: ITIL v4 — Práticas de Gerenciamento de Incidentes, Mudanças e Problemas' },
        ],
      },
      {
        dayOffset: 1,
        sessions: [
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Governança de TI: Noções de COBIT 2019 — Governança vs Gerenciamento e Princípios' },
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Engenharia de Requisitos: Prototipação, Matriz de Rastreabilidade e Critérios INVEST' },
        ],
      },
      {
        dayOffset: 2,
        sessions: [
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Arquitetura Corporativa: Integração de Sistemas Legados e Padrões EAI' },
          { disciplineId: 'nuvem', plannedMinutes: 60, objective: 'Nuvem: Arquiteturas Cloud Native e Well-Architected Framework (Pilares)' },
        ],
      },
      {
        dayOffset: 3,
        sessions: [
          { disciplineId: 'banco-dados', plannedMinutes: 60, objective: 'Banco de Dados: Data Warehouse, OLAP vs OLTP e Modelagem Dimensional (Star/Snowflake)' },
          { disciplineId: 'logica-programacao', plannedMinutes: 60, objective: 'Lógica: Revisão de Algoritmos Gulosos (Greedy) e Backtracking' },
        ],
      },
      {
        dayOffset: 4,
        sessions: [
          { disciplineId: 'portugues', plannedMinutes: 60, objective: 'Português: Figuras de Linguagem e Vícios de Linguagem Cebraspe' },
          { disciplineId: 'raciocinio', plannedMinutes: 60, objective: 'Raciocínio Lógico: Verdades e Mentiras em Problemas de Concurso' },
        ],
      },
      {
        dayOffset: 5,
        sessions: [
          {
            disciplineId: SIMULADO_DISCIPLINE_ID,
            plannedMinutes: 120,
            objective: 'Sábado de Questões: 50 questões Cebraspe sobre Governança (ITIL), Requisitos e Cloud Native',
          },
        ],
      },
    ],
  },
  {
    weekIndex: 18,
    phase: 'Fase 3: Consolidação & Tópicos Avançados',
    objectives: 'Semana 18: Simulado Temático de TI BNB 3 e Testes Automatizados Avançados',
    plannedContent: 'Testes de mutação, BDD com Cucumber, testes de contrato (Pact). Simulado focado exclusivamente nas 6 disciplinas de TI.',
    days: [
      {
        dayOffset: 0,
        sessions: [
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Testes Avançados: BDD (Behavior Driven Development) com Gherkin e Cucumber' },
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Testes Avançados: Testes de Contrato para Microsserviços com Pact' },
        ],
      },
      {
        dayOffset: 1,
        sessions: [
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Arquitetura: Padrão Strangler Fig para Migração de Monólitos' },
          { disciplineId: 'nuvem', plannedMinutes: 60, objective: 'Nuvem: Disaster Recovery (RPO, RTO) e Estratégias Multi-Region' },
        ],
      },
      {
        dayOffset: 2,
        sessions: [
          { disciplineId: 'banco-dados', plannedMinutes: 60, objective: 'Banco de Dados: Isolamento Snapshot e Concorrência Multiversão (MVCC)' },
          { disciplineId: 'linguagens', plannedMinutes: 60, objective: 'Linguagens: Profiling de Memória, Garbage Collection e Otimização JVM' },
        ],
      },
      {
        dayOffset: 3,
        sessions: [
          { disciplineId: 'logica-programacao', plannedMinutes: 60, objective: 'Lógica: Revisão de Grafos Ponderados (Dijkstra) e Árvore Geradora Mínima' },
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'DevOps: GitOps e Implantação Contínua com ArgoCD' },
        ],
      },
      {
        dayOffset: 4,
        sessions: [
          { disciplineId: 'raciocinio', plannedMinutes: 60, objective: 'Raciocínio Lógico: Princípio da Casa dos Pombos e Lógica Dedutiva' },
          { disciplineId: 'portugues', plannedMinutes: 60, objective: 'Português: Interpretação de Textos de Atualidades e Economia do BNB' },
        ],
      },
      {
        dayOffset: 5,
        sessions: [
          {
            disciplineId: SIMULADO_DISCIPLINE_ID,
            plannedMinutes: 120,
            objective: 'Sábado de Simulado BNB 3: Simulado Temático Exclusivo de Conhecimentos Específicos de TI (70 itens)',
          },
        ],
      },
    ],
  },
  {
    weekIndex: 19,
    phase: 'Fase 3: Consolidação & Tópicos Avançados',
    objectives: 'Semana 19: Segurança Criptográfica, Certificação Digital e Proteção de Dados (LGPD em TI)',
    plannedContent: 'Criptografia simétrica vs assimétrica (RSA, AES), Hashing, Certificados Digitais ICP-Brasil. Impactos da LGPD em sistemas.',
    days: [
      {
        dayOffset: 0,
        sessions: [
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Criptografia: Algoritmos Simétricos (AES, DES) e Assimétricos (RSA, Curvas Elípticas)' },
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Segurança: Funções Hash Criptográficas (SHA-256, MD5) e Assinatura Digital' },
        ],
      },
      {
        dayOffset: 1,
        sessions: [
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Certificados Digitais: ICP-Brasil, PKI e Protocolo TLS/SSL Handshake' },
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Legislação e TI: LGPD (Privacy by Design, Anonimização e Pseudoanonimização)' },
        ],
      },
      {
        dayOffset: 2,
        sessions: [
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Arquitetura: Zero Trust Security em Redes e Microsserviços' },
          { disciplineId: 'banco-dados', plannedMinutes: 60, objective: 'Banco de Dados: Mascaramento de Dados e Criptografia Transparente (TDE)' },
        ],
      },
      {
        dayOffset: 3,
        sessions: [
          { disciplineId: 'nuvem', plannedMinutes: 60, objective: 'Nuvem: Gestão de Chaves Criptográficas (AWS KMS / Azure Key Vault)' },
          { disciplineId: 'linguagens', plannedMinutes: 60, objective: 'Linguagens: Implementação de Hashing e Validação de Assinaturas' },
        ],
      },
      {
        dayOffset: 4,
        sessions: [
          { disciplineId: 'portugues', plannedMinutes: 60, objective: 'Português: Revisão das Regras Críticas de Crase e Regência da Banca' },
          { disciplineId: 'raciocinio', plannedMinutes: 60, objective: 'Raciocínio Lógico: Revisão dos Conectivos Lógicos e Negações Rápidas' },
        ],
      },
      {
        dayOffset: 5,
        sessions: [
          {
            disciplineId: SIMULADO_DISCIPLINE_ID,
            plannedMinutes: 120,
            objective: 'Sábado de Questões: 50 questões Cebraspe sobre Criptografia, Segurança e LGPD em TI',
          },
        ],
      },
    ],
  },

  // FASE 4: RETA FINAL BNB — ALTO DESEMPENHO & SIMULAÇÕES (Semanas 20 a 24)
  {
    weekIndex: 20,
    phase: 'Fase 4: Reta Final BNB',
    objectives: 'Semana 20: Revisão Espaçada Integrada 1 — Arquitetura de Software e Banco de Dados + Caderno de Erros',
    plannedContent: 'Revisão intensiva dos itens mais cobrados pelo Cebraspe em Arquitetura e Banco de Dados. Limpeza do caderno de erros.',
    days: [
      {
        dayOffset: 0,
        sessions: [
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Revisão BNB: Padrões GoF Criacionais, Estruturais e Comportamentais' },
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Revisão BNB: Clean Architecture, SOLID e Microsserviços' },
        ],
      },
      {
        dayOffset: 1,
        sessions: [
          { disciplineId: 'banco-dados', plannedMinutes: 60, objective: 'Revisão BNB: Normalização (1FN, 2FN, 3FN), DER e Cardinalidade' },
          { disciplineId: 'banco-dados', plannedMinutes: 60, objective: 'Revisão BNB: Consultas SQL Complexas, Joins e Otimização' },
        ],
      },
      {
        dayOffset: 2,
        sessions: [
          { disciplineId: 'banco-dados', plannedMinutes: 60, objective: 'Revisão BNB: Bancos NoSQL, Teorema CAP e Transações ACID' },
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Revisão BNB: Mensageria Kafka/RabbitMQ e APIs RESTful' },
        ],
      },
      {
        dayOffset: 3,
        sessions: [
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Caderno de Erros: Análise dos Erros Acumulados em Arquitetura e Dados' },
          { disciplineId: 'linguagens', plannedMinutes: 60, objective: 'Revisão Rápida: POO e Estruturas em Linguagens de Programação' },
        ],
      },
      {
        dayOffset: 4,
        sessions: [
          { disciplineId: 'portugues', plannedMinutes: 60, objective: 'Português: Treino de Interpretação com 20 Itens Inéditos Cebraspe' },
          { disciplineId: 'raciocinio', plannedMinutes: 60, objective: 'Raciocínio Lógico: Treino de Velocidade em Proposições e Negações' },
        ],
      },
      {
        dayOffset: 5,
        sessions: [
          {
            disciplineId: SIMULADO_DISCIPLINE_ID,
            plannedMinutes: 120,
            objective: 'Sábado de Simulado BNB 4: Simulado Completo de Arquitetura e Banco de Dados (60 itens Cebraspe)',
          },
        ],
      },
    ],
  },
  {
    weekIndex: 21,
    phase: 'Fase 4: Reta Final BNB',
    objectives: 'Semana 21: Revisão Espaçada Integrada 2 — Engenharia de Software, Nuvem e Lógica',
    plannedContent: 'Revisão intensiva de Engenharia de Software, DevOps, Computação em Nuvem e Lógica de Programação.',
    days: [
      {
        dayOffset: 0,
        sessions: [
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Revisão BNB: Metodologias Ágeis (Scrum, Kanban) e Engenharia de Requisitos' },
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Revisão BNB: Testes de Software (Unitários, TDD, Pirâmide) e Clean Code' },
        ],
      },
      {
        dayOffset: 1,
        sessions: [
          { disciplineId: 'nuvem', plannedMinutes: 60, objective: 'Revisão BNB: Docker (Imagens, Compose) e Kubernetes (Deployments, Services)' },
          { disciplineId: 'nuvem', plannedMinutes: 60, objective: 'Revisão BNB: Serviços Cloud AWS/Azure, Serverless e Segurança IAM' },
        ],
      },
      {
        dayOffset: 2,
        sessions: [
          { disciplineId: 'logica-programacao', plannedMinutes: 60, objective: 'Revisão BNB: Estruturas de Dados (Pilhas, Filas, Listas, Árvores e Grafos)' },
          { disciplineId: 'logica-programacao', plannedMinutes: 60, objective: 'Revisão BNB: Algoritmos de Busca, Ordenação e Complexidade Big-O' },
        ],
      },
      {
        dayOffset: 3,
        sessions: [
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Revisão BNB: Git/GitFlow, CI/CD, Observabilidade e Governança ITIL' },
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Caderno de Erros: Resolução dos Itens com Menor Percentual de Acerto' },
        ],
      },
      {
        dayOffset: 4,
        sessions: [
          { disciplineId: 'portugues', plannedMinutes: 60, objective: 'Português: Revisão Express de Concordância, Regência e Pontuação' },
          { disciplineId: 'raciocinio', plannedMinutes: 60, objective: 'Raciocínio Quantitativo: Fórmulas de Análise Combinatória e Probabilidade' },
        ],
      },
      {
        dayOffset: 5,
        sessions: [
          {
            disciplineId: SIMULADO_DISCIPLINE_ID,
            plannedMinutes: 120,
            objective: 'Sábado de Simulado BNB 5: Simulado Focado em Engenharia de Software, Nuvem e Lógica (60 itens)',
          },
        ],
      },
    ],
  },
  {
    weekIndex: 22,
    phase: 'Fase 4: Reta Final BNB',
    objectives: 'Semana 22: Maratona Cespe BNB — Provas Anteriores de TI e Gestão de Tempo de Prova',
    plannedContent: 'Resolução das últimas provas de TI aplicadas pelo Cebraspe (BNB, Caixa TI, Serpro, Dataprev). Estratégia de resolução.',
    days: [
      {
        dayOffset: 0,
        sessions: [
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Maratona Cebraspe: Questões Reais de Arquitetura de Provas Recentes' },
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Maratona Cebraspe: Questões Reais de Engenharia de Software de Provas Recentes' },
        ],
      },
      {
        dayOffset: 1,
        sessions: [
          { disciplineId: 'banco-dados', plannedMinutes: 60, objective: 'Maratona Cebraspe: Questões Reais de Banco de Dados Relacional e NoSQL' },
          { disciplineId: 'nuvem', plannedMinutes: 60, objective: 'Maratona Cebraspe: Questões Reais de Nuvem e Containers' },
        ],
      },
      {
        dayOffset: 2,
        sessions: [
          { disciplineId: 'linguagens', plannedMinutes: 60, objective: 'Maratona Cebraspe: Questões de Código Java, Python e JavaScript/TypeScript' },
          { disciplineId: 'logica-programacao', plannedMinutes: 60, objective: 'Maratona Cebraspe: Questões de Algoritmos e Complexidade' },
        ],
      },
      {
        dayOffset: 3,
        sessions: [
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Análise de Pegadinhas Clássicas da Banca Cebraspe em TI' },
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Revisão Rápida de Conceitos de Alto Rendimento (Cheatsheet TI)' },
        ],
      },
      {
        dayOffset: 4,
        sessions: [
          { disciplineId: 'portugues', plannedMinutes: 60, objective: 'Português: Simulado Relâmpago de 25 Questões Cebraspe (Treino de Ritmo)' },
          { disciplineId: 'raciocinio', plannedMinutes: 60, objective: 'Raciocínio Lógico: Simulado Relâmpago de 15 Questões Cebraspe' },
        ],
      },
      {
        dayOffset: 5,
        sessions: [
          {
            disciplineId: SIMULADO_DISCIPLINE_ID,
            plannedMinutes: 120,
            objective: 'Sábado de Simulado BNB 6: Simulado Geral Cronometrado 120 Itens (Estilo Prova Completa Cebraspe)',
          },
        ],
      },
    ],
  },
  {
    weekIndex: 23,
    phase: 'Fase 4: Reta Final BNB',
    objectives: 'Semana 23: Diagnóstico Final de Lacunas, Caderno de Erros e Polimento Técnico',
    plannedContent: 'Revisão direcionada exclusivamente para os tópicos com acerto inferior a 80%. Polimento dos conceitos de TI.',
    days: [
      {
        dayOffset: 0,
        sessions: [
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Reforço de Lacunas: Tópicos de Arquitetura com Mais Dúvidas' },
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Reforço de Lacunas: Revisão de Métricas Ágeis e Modelos de Processo' },
        ],
      },
      {
        dayOffset: 1,
        sessions: [
          { disciplineId: 'banco-dados', plannedMinutes: 60, objective: 'Reforço de Lacunas: Formas Normais e Teorema CAP (Garantia de 100% de Acerto)' },
          { disciplineId: 'nuvem', plannedMinutes: 60, objective: 'Reforço de Lacunas: Kubernetes Comandos e Objetos Principais' },
        ],
      },
      {
        dayOffset: 2,
        sessions: [
          { disciplineId: 'linguagens', plannedMinutes: 60, objective: 'Reforço de Lacunas: Spring Boot Anotações (@Autowired, @Service, @Bean, etc.)' },
          { disciplineId: 'logica-programacao', plannedMinutes: 60, objective: 'Reforço de Lacunas: Identificação de Complexidade Big-O em Loops' },
        ],
      },
      {
        dayOffset: 3,
        sessions: [
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Fechamento do Caderno de Erros: Releitura e Reexecução dos Itens Errados' },
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Fechamento de Padrões GoF: Tabela Resumo com Propósitos e Estrutura' },
        ],
      },
      {
        dayOffset: 4,
        sessions: [
          { disciplineId: 'portugues', plannedMinutes: 60, objective: 'Português: Revisão das 10 Regras Mais Frequentes de Gramática Cebraspe' },
          { disciplineId: 'raciocinio', plannedMinutes: 60, objective: 'Raciocínio: Fórmulas de Probabilidade e Tabela Verdade Instantânea' },
        ],
      },
      {
        dayOffset: 5,
        sessions: [
          {
            disciplineId: SIMULADO_DISCIPLINE_ID,
            plannedMinutes: 120,
            objective: 'Sábado de Simulado BNB 7: Simulado Final de Consolidação e Calibração de Confiança',
          },
        ],
      },
    ],
  },
  {
    weekIndex: 24,
    phase: 'Fase 4: Reta Final BNB',
    objectives: 'Semana 24: Consolidação Definitiva, Revisão Express dos Pontos Críticos e Técnicas de Prova Cebraspe',
    plannedContent: 'Checklist final de TI. Técnica de prova Cespe (deixar em branco vs chutar). Revisão leve e controle mental.',
    days: [
      {
        dayOffset: 0,
        sessions: [
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Checklist Final TI: Arquitetura, SOLID e Padrões GoF em Flash Review' },
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Checklist Final TI: Scrum, Engenharia de Requisitos e Testes' },
        ],
      },
      {
        dayOffset: 1,
        sessions: [
          { disciplineId: 'banco-dados', plannedMinutes: 60, objective: 'Checklist Final TI: Normalização, ACID, NoSQL e SQL em Flash Review' },
          { disciplineId: 'nuvem', plannedMinutes: 60, objective: 'Checklist Final TI: Docker, Kubernetes e Nuvem AWS/Azure' },
        ],
      },
      {
        dayOffset: 2,
        sessions: [
          { disciplineId: 'logica-programacao', plannedMinutes: 60, objective: 'Checklist Final TI: Estruturas de Dados e Algoritmos Resumo' },
          { disciplineId: 'linguagens', plannedMinutes: 60, objective: 'Checklist Final TI: POO e Conceitos Fundamentais de Linguagens' },
        ],
      },
      {
        dayOffset: 3,
        sessions: [
          { disciplineId: 'engenharia', plannedMinutes: 60, objective: 'Técnicas de Prova Cebraspe: Estratégia de Itens Duvidosos, Gestão de Tempo e Chute Seguro' },
          { disciplineId: 'arquitetura', plannedMinutes: 60, objective: 'Revisão Visual: Diagramas de Arquitetura e Fluxos de Microsserviços' },
        ],
      },
      {
        dayOffset: 4,
        sessions: [
          { disciplineId: 'portugues', plannedMinutes: 60, objective: 'Português: Revisão Tranquila de Dicas Finais Cebraspe' },
          { disciplineId: 'raciocinio', plannedMinutes: 60, objective: 'Raciocínio Lógico: Revisão Leve dos Principais Gatilhos de Questões' },
        ],
      },
      {
        dayOffset: 5,
        sessions: [
          {
            disciplineId: SIMULADO_DISCIPLINE_ID,
            plannedMinutes: 120,
            objective: 'Sábado de Fechamento BNB: Bateria Express de 40 Questões Selecionadas + Alinhamento Final',
          },
        ],
      },
    ],
  },
];

/**
 * Converte um template pedagógico de sessão gerado por IA para uma StudySession persistível.
 */
export function createAiStudySession(
  date: DateKey,
  disciplineId: string,
  plannedMinutes: number,
  objective: string,
  order: number,
  matchingTopicId: string | null = null,
): StudySession {
  const now = nowIso();
  const isSimulado = disciplineId === SIMULADO_DISCIPLINE_ID;
  return {
    id: createId(),
    date,
    disciplineId,
    topicId: matchingTopicId,
    plannedStart: isSimulado ? '08:00' : null,
    plannedMinutes,
    actualSeconds: 0,
    status: 'planejada',
    objective,
    notes: isSimulado
      ? 'Sábado exclusivo de resolução de questões ou simulados da banca Cebraspe/BNB.'
      : 'Sessão gerada exclusivamente por IA especialista nas diretrizes do BNB.',
    origin: 'planejada',
    startedAt: null,
    endedAt: null,
    recoveredFromId: null,
    order,
    history: [
      {
        at: now,
        type: 'criada',
        description: isSimulado
          ? 'Sábado de questões/simulado (2h) gerado pelo cronograma IA.'
          : 'Sessão de 2h diárias gerada pelo cronograma IA com foco em TI.',
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Encontra tópico cadastrado no banco que tenha correspondência de palavra-chave com o objetivo gerado.
 */
function findMatchingTopic(objective: string, disciplineId: string, topics: Topic[]): Topic | null {
  const discTopics = topics.filter((t) => t.disciplineId === disciplineId && t.active);
  if (discTopics.length === 0) return null;

  const lowerObj = objective.toLowerCase();
  for (const t of discTopics) {
    const titleLower = t.title.toLowerCase();
    if (lowerObj.includes(titleLower) || titleLower.includes(lowerObj)) {
      return t;
    }
  }
  return null;
}

/**
 * Monta o plano de 24 semanas utilizando o motor de IA especializado BNB (Builtin).
 * Alinha os templates da semana com os dias reais do calendário (segunda a sexta = estudo,
 * sábado = questões/simulado, domingo = dia livre), independentemente do dia da semana de startDate.
 */
export function buildBuiltinAiSchedule(
  startDate: DateKey,
  disciplines: Discipline[],
  topics: Topic[],
  customInstructions?: string,
): { weeklyPlans: WeeklyPlan[]; sessions: StudySession[] } {
  const activeDisciplineIds = new Set(disciplines.filter((d) => d.active).map((d) => d.id));
  activeDisciplineIds.add(SIMULADO_DISCIPLINE_ID);

  const weeklyPlans: WeeklyPlan[] = [];
  const sessions: StudySession[] = [];

  const firstWeekStart = startOfWeek(startDate);

  for (const weekTpl of BNB_24_WEEKS_CURRICULUM) {
    const weekStart = addDays(firstWeekStart, (weekTpl.weekIndex - 1) * 7);
    let totalWeeklyMinutes = 0;

    const weekSessions: StudySession[] = [];
    const weekdayDayTemplates = weekTpl.days.filter((d) => d.dayOffset !== 5);
    const saturdayTemplate = weekTpl.days.find((d) => d.dayOffset === 5);

    for (let offset = 0; offset < 7; offset++) {
      const sessionDate = addDays(weekStart, offset);
      const wIdx = weekdayIndex(sessionDate); // 0 = Dom, 1 = Seg, ..., 5 = Sex, 6 = Sáb

      // Domingo (0) é sempre dia livre / descanso semanal (0 min)
      if (wIdx === 0) continue;

      // Não agenda sessões em datas anteriores à data de início estipulada
      if (sessionDate < startDate) continue;

      // Sábado (6) recebe o template exclusivo de questões/simulado; Seg..Sex (1..5) recebem os templates de dias úteis
      const day = wIdx === 6 ? saturdayTemplate : weekdayDayTemplates[wIdx - 1];
      if (!day) continue;

      let dayMinutes = 0;

      day.sessions.forEach((sTpl, idx) => {
        // Garante que o dia respeita estritamente o limite de 2h (120 min)
        if (dayMinutes >= 120) return;
        const allocatedMinutes = Math.min(sTpl.plannedMinutes, 120 - dayMinutes);
        if (allocatedMinutes <= 0) return;

        const discId = activeDisciplineIds.has(sTpl.disciplineId) ? sTpl.disciplineId : 'engenharia';
        const matchedTopic = findMatchingTopic(sTpl.objective, discId, topics);

        const session = createAiStudySession(
          sessionDate,
          discId,
          allocatedMinutes,
          sTpl.objective,
          idx,
          matchedTopic?.id ?? null,
        );

        weekSessions.push(session);
        dayMinutes += allocatedMinutes;
        totalWeeklyMinutes += allocatedMinutes;
      });
    }

    const weeklyPlan: WeeklyPlan = {
      id: createId(),
      weekIndex: weekTpl.weekIndex,
      weekStart,
      objectives: weekTpl.objectives + (customInstructions ? ` (Foco personalizado: ${customInstructions.slice(0, 50)})` : ''),
      plannedContent: weekTpl.plannedContent,
      plannedMinutes: totalWeeklyMinutes || (weekSessions.length === 0 ? 0 : 720),
      status: 'pendente',
      notes: `${weekTpl.phase} — 2h diárias e sábado exclusivo de simulados/questões.`,
    };

    weeklyPlans.push(weeklyPlan);
    sessions.push(...weekSessions);
  }

  return { weeklyPlans, sessions };
}

/**
 * Extrai texto JSON limpo de resposta que possa conter marcação Markdown (```json ... ```) ou texto ao redor.
 */
function extractJsonFromText(rawText: string): string {
  const trimmed = rawText.trim();
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }
  return trimmed;
}

const GEMINI_MODELS = ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-2.5-flash'];

/** Chama generateContent (tentando modelos em ordem) e devolve o array "weeks" já interpretado. */
async function requestGeminiWeeks(apiKey: string, systemInstruction: string, userPrompt: string): Promise<AiWeekTemplate[]> {
  let lastError = 'sem resposta';
  for (const model of GEMINI_MODELS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 120_000);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          signal: controller.signal,
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 32000,
              responseMimeType: 'application/json',
            },
          }),
        },
      );
      if (!response.ok) {
        lastError = `Erro na API do Gemini (${response.status}, ${model}): ${(await response.text()).slice(0, 300)}`;
        // Chave inválida/permissão: não adianta tentar outros modelos.
        if (response.status === 400 || response.status === 401 || response.status === 403) {
          if (!/model|not found|unsupported/i.test(lastError)) throw new Error(lastError);
        }
        continue;
      }
      const json = await response.json();
      const text: string | undefined = (json?.candidates?.[0]?.content?.parts ?? [])
        .map((p: { text?: string }) => p.text ?? '')
        .join('');
      if (!text) {
        lastError = `Resposta vazia do modelo ${model}.`;
        continue;
      }
      const parsedJson = JSON.parse(extractJsonFromText(text)) as { weeks?: AiWeekTemplate[] };
      if (!Array.isArray(parsedJson.weeks) || parsedJson.weeks.length === 0) {
        lastError = `Modelo ${model} não retornou semanas.`;
        continue;
      }
      return parsedJson.weeks;
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('Erro na API do Gemini')) throw err;
      lastError = err instanceof Error ? err.message : String(err);
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error(`Falha ao gerar cronograma com o Gemini: ${lastError}`);
}

/**
 * Chamada à API Google Gemini para gerar o cronograma de 24 semanas caso o usuário opte por Gemini.
 * Suporta o endpoint moderno de Interactions API e fallback compatível com generateContent.
 */
export async function callGeminiScheduleApi(
  apiKey: string,
  startDate: DateKey,
  disciplines: Discipline[],
  topics: Topic[],
  customInstructions?: string,
): Promise<{ weeklyPlans: WeeklyPlan[]; sessions: StudySession[] }> {
  const activeDiscs = disciplines
    .filter((d) => d.active)
    .map((d) => `${d.id} (${d.name} - ${d.kind === 'technical' ? 'Conhecimentos Específicos TI' : 'Conhecimentos Básicos'})`)
    .join(', ');

  const systemInstruction = `Você é um mentor especialista em preparação para concursos públicos de Tecnologia da Informação, com ênfase no Banco do Nordeste do Brasil (BNB) para o cargo de Analista de Sistemas — Desenvolvimento de Sistemas (banca Cebraspe).
Você DEVE estruturar um cronograma de exatamente 24 semanas a partir da data de início ${startDate}.
Regras Obrigatórias e Inegociáveis:
1. Dias de estudo com RIGOROSAMENTE 2 horas (120 minutos) de estudo.
2. Sábados: EXCLUSIVAMENTE dedicados à resolução de questões ou simulados da banca Cebraspe/BNB (120 minutos).
3. Domingos: Dia de descanso semanal (0 minutos de estudo planejado).
4. Segunda a Sexta: Foco predominante nos Conhecimentos Específicos de TI (Arquitetura de Software, Engenharia de Software, Linguagens e Tecnologias de Programação, Banco de Dados, Lógica de Programação, Computação em Nuvem), que têm maior peso na prova do BNB. Conhecimentos Básicos (Língua Portuguesa e Raciocínio Lógico) devem ter menor carga (~20% do tempo dos dias úteis).
5. Progressão em 4 Fases ao longo das 24 semanas:
   - Semanas 1 a 6: Fundamentos & Nivelamento TI + Base
   - Semanas 7 a 14: Aprofundamento Específico TI (Clean Architecture, SOLID, Design Patterns, Microsserviços, NoSQL, ACID, Docker, Kubernetes, Testes, Segurança)
   - Semanas 15 a 19: Consolidação & Arquiteturas Avançadas (DDD, Cloud Native AWS/Azure, DevOps, CI/CD, Observabilidade)
   - Semanas 20 a 24: Reta Final BNB (Revisões espaçadas intensivas, Caderno de Erros, Provas Anteriores Cebraspe e Simulados)
6. Disciplinas cadastradas no sistema: ${activeDiscs}.

Retorne ESTRITAMENTE um objeto JSON válido contendo a chave "weeks" com array apenas das semanas solicitadas na mensagem do usuário (cada uma com seu weekIndex correto, de 1 a 24).
Cada semana deve ter:
- "weekIndex": número de 1 a 24
- "objectives": resumo pedagógico do objetivo da semana
- "plannedContent": conteúdo programático da semana
- "days": array de 6 dias (dia 0 a 5, onde 0=segunda e 5=sábado)
  Cada dia tem:
  - "dayOffset": 0 a 5
  - "sessions": array de sessões que somam exatamente 120 minutos (ex: duas de 60m ou uma de 120m no sábado)
    Cada sessão tem:
    - "disciplineId": ID válido de disciplina ou "simulado" (no sábado deve ser "simulado")
    - "plannedMinutes": 60 ou 120
    - "objective": descrição clara do conteúdo estudado`;

  const extra = customInstructions ? ` Instruções adicionais do usuário: ${customInstructions}` : '';
  const buildUserPrompt = (from: number, to: number) =>
    `Gere SOMENTE as semanas ${from} a ${to} (do total de 24) do cronograma para o BNB Analista de Sistemas, com data de início do cronograma em ${startDate}. Responda apenas com o JSON {"weeks":[...]} contendo ${to - from + 1} semanas.${extra}`;

  // Cronograma gerado em blocos menores: uma única resposta de 24 semanas estourava o limite
  // de tokens/tempo e vinha truncada (JSON inválido), fazendo a geração falhar silenciosamente.
  const CHUNK_SIZE = 6;
  const chunks: Array<[number, number]> = [];
  for (let from = 1; from <= 24; from += CHUNK_SIZE) chunks.push([from, from + CHUNK_SIZE - 1]);

  const chunkResults = await Promise.all(
    chunks.map(([from, to]) =>
      requestGeminiWeeks(apiKey, systemInstruction, buildUserPrompt(from, to)).catch((err: unknown) => err),
    ),
  );

  const weeksByIndex = new Map<number, AiWeekTemplate>();
  let firstError: unknown = null;
  chunkResults.forEach((r, ci) => {
    if (r instanceof Error || !Array.isArray(r)) {
      firstError ??= r;
      return;
    }
    const [from] = chunks[ci];
    r.forEach((w, i) => {
      const idx = Number.isInteger(w?.weekIndex) && w.weekIndex >= from && w.weekIndex < from + CHUNK_SIZE ? w.weekIndex : from + i;
      if (idx >= 1 && idx <= 24 && !weeksByIndex.has(idx)) weeksByIndex.set(idx, w);
    });
  });

  if (weeksByIndex.size === 0) {
    throw firstError instanceof Error ? firstError : new Error('A API do Gemini não retornou nenhuma semana válida.');
  }

  // Semanas ausentes/inválidas são completadas pela matriz pedagógica integrada.
  const parsed: { weeks: AiWeekTemplate[] } = {
    weeks: Array.from({ length: 24 }, (_, i) => weeksByIndex.get(i + 1) ?? BNB_24_WEEKS_CURRICULUM[i]),
  };

  const weeklyPlans: WeeklyPlan[] = [];
  const sessions: StudySession[] = [];
  const activeDisciplineIds = new Set(disciplines.filter((d) => d.active).map((d) => d.id));
  activeDisciplineIds.add(SIMULADO_DISCIPLINE_ID);

  const firstWeekStart = startOfWeek(startDate);

  for (let i = 0; i < 24; i++) {
    const weekData = parsed.weeks[i];
    const weekStart = addDays(firstWeekStart, i * 7);
    let totalWeeklyMinutes = 0;

    const rawDays = weekData.days || [];
    const saturdayDay =
      rawDays.find((d) => d.sessions?.some((s) => s.disciplineId === SIMULADO_DISCIPLINE_ID)) ??
      rawDays.find((d) => d.dayOffset === 5);
    const weekdayDays = rawDays.filter((d) => d !== saturdayDay);

    for (let offset = 0; offset < 7; offset++) {
      const sessionDate = addDays(weekStart, offset);
      const wIdx = weekdayIndex(sessionDate); // 0 = Dom, 1 = Seg, ..., 5 = Sex, 6 = Sáb

      // Domingo (0) é sempre dia livre (0 min)
      if (wIdx === 0) continue;

      // Não agenda sessões em datas anteriores à data de início estipulada
      if (sessionDate < startDate) continue;

      const isSaturday = wIdx === 6;
      const day = isSaturday ? saturdayDay : weekdayDays[wIdx - 1];
      if (!day) continue;

      let dayMinutes = 0;

      for (let sIdx = 0; sIdx < (day.sessions || []).length; sIdx++) {
        const s = day.sessions[sIdx];
        if (dayMinutes >= 120) break;
        const allocatedMinutes = Math.min(s.plannedMinutes || 60, 120 - dayMinutes);
        if (allocatedMinutes <= 0) continue;

        const isSaturday = wIdx === 5;
        const discId = isSaturday
          ? SIMULADO_DISCIPLINE_ID
          : activeDisciplineIds.has(s.disciplineId)
          ? s.disciplineId
          : 'engenharia';

        const matchedTopic = findMatchingTopic(s.objective, discId, topics);

        sessions.push(
          createAiStudySession(
            sessionDate,
            discId,
            allocatedMinutes,
            s.objective || (isSaturday ? 'Sábado de Questões/Simulado BNB' : 'Estudo orientado por IA'),
            sIdx,
            matchedTopic?.id ?? null,
          ),
        );

        dayMinutes += allocatedMinutes;
        totalWeeklyMinutes += allocatedMinutes;
      }
    }

    weeklyPlans.push({
      id: createId(),
      weekIndex: i + 1,
      weekStart,
      objectives: weekData.objectives || `Semana ${i + 1}: Foco em Conhecimentos Específicos TI BNB`,
      plannedContent: weekData.plannedContent || 'Tópicos avançados de TI e resolução de questões aos sábados.',
      plannedMinutes: totalWeeklyMinutes || 720,
      status: 'pendente',
      notes: 'Cronograma gerado via Google Gemini AI — Analista de Sistemas BNB.',
    });
  }

  return { weeklyPlans, sessions };
}

/**
 * Função principal que coordena a geração do cronograma de 24 semanas por Inteligência Artificial.
 */
export async function generateAiSchedulePlan(params: {
  startDate: DateKey;
  disciplines: Discipline[];
  topics: Topic[];
  settings: Settings;
  options?: AiScheduleOptions;
}): Promise<AiScheduleResult> {
  const { startDate, disciplines, topics, settings, options } = params;
  const effectiveProvider = options?.provider ?? settings.aiProvider ?? (options?.apiKey || settings.geminiApiKey ? 'gemini' : 'builtin');
  const apiKey = options?.apiKey || settings.geminiApiKey;

  if (effectiveProvider === 'gemini' && apiKey?.trim()) {
    try {
      const result = await callGeminiScheduleApi(
        apiKey.trim(),
        startDate,
        disciplines,
        topics,
        options?.customInstructions,
      );
      return {
        weeklyPlans: result.weeklyPlans,
        sessions: result.sessions,
        providerUsed: 'gemini',
      };
    } catch (err) {
      console.warn('Falha na chamada ao Gemini API, acionando motor IA Especialista Integrado:', err);
      // Se o usuário passou chave inválida ou falhou a rede, reporta se requisitado ou usa builtin
      if (options?.provider === 'gemini') {
        throw err;
      }
    }
  }

  // Motor Especialista Integrado (Builtin)
  const result = buildBuiltinAiSchedule(startDate, disciplines, topics, options?.customInstructions);
  return {
    weeklyPlans: result.weeklyPlans,
    sessions: result.sessions,
    providerUsed: 'builtin',
  };
}

/**
 * Filtra e ajusta sessões geradas por IA para respeitar sessões pré-existentes (manuais ou executadas).
 */
export function filterAndAdjustAiSessions(
  aiSessions: StudySession[],
  preservedSessions: StudySession[],
): StudySession[] {
  // Mapeia minutos e disciplinas já alocadas por data nas sessões preservadas
  const preservedDayMap = new Map<DateKey, { totalMinutes: number; disciplines: Set<string> }>();
  for (const s of preservedSessions) {
    const entry = preservedDayMap.get(s.date) ?? { totalMinutes: 0, disciplines: new Set<string>() };
    entry.totalMinutes += s.plannedMinutes;
    entry.disciplines.add(s.disciplineId);
    preservedDayMap.set(s.date, entry);
  }

  const finalSessions: StudySession[] = [];

  for (const session of aiSessions) {
    const existing = preservedDayMap.get(session.date);
    if (existing) {
      // Se o dia já estiver com a cota de 2h (120m) preenchida por manuais/executadas, não adiciona mais
      if (existing.totalMinutes >= 120) continue;

      // Se a mesma disciplina já foi criada manualmente no mesmo dia, evita duplicação
      if (existing.disciplines.has(session.disciplineId)) continue;

      // Ajusta minutos para nunca exceder o limite de 2h
      const remainingMinutes = 120 - existing.totalMinutes;
      if (remainingMinutes <= 0) continue;

      if (session.plannedMinutes > remainingMinutes) {
        session.plannedMinutes = remainingMinutes;
      }

      existing.totalMinutes += session.plannedMinutes;
      existing.disciplines.add(session.disciplineId);
    } else {
      preservedDayMap.set(session.date, {
        totalMinutes: session.plannedMinutes,
        disciplines: new Set([session.disciplineId]),
      });
    }

    finalSessions.push(session);
  }

  return finalSessions;
}
