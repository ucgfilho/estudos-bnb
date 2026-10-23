# Dashboard Pessoal de Estudos — Concurso BNB
## Cargo: Analista de Sistemas — Desenvolvimento de Sistemas

Aplicação web completa, responsiva, offline-first e persistente para gerenciamento avançado e mensurável dos estudos para o concurso do Banco do Nordeste do Brasil (BNB).

Projetada com base nas especificações do `prompt.md`, garantindo rigor conceitual, integridade de dados (IndexedDB local), conformidade visual profissional sem emojis e acessibilidade completa.

---

### Visão Geral da Arquitetura

- **Frontend & UI**: React 19, TypeScript, Vite, Tailwind CSS v4.
- **Ícones & Gráficos**: Lucide React (sem emojis na interface), Recharts para visualizações analíticas de desempenho.
- **Persistência Local (Offline-first)**: Dexie 4 (IndexedDB) com reatividade via `dexie-react-hooks`.
- **Validação & Schemas**: Zod para validação rigorosa de backups JSON e formulários.
- **Testes & Qualidade**: Vitest, `@testing-library/react`, `fake-indexeddb`, ESLint, TypeScript Strict.
- **Fuso Horário & Localização**: `America/Bahia` (UTC-03:00) e `pt-BR`.

---

### Módulos e Telas Implementadas

1. **Visão Geral (`/`)**:
   - KPIs em tempo real (tempo estudado hoje vs meta de 120m, tempo semanal vs meta de 840m, taxa de acerto global, sequência de dias estudados, progresso de tópicos e revisões pendentes).
   - Card com banner da próxima sessão planejada e acesso rápido para iniciar o estudo.
   - Gráficos analíticos de distribuição de tempo por disciplina e precisão por matéria.

2. **Calendário (`/calendario`)**:
   - Visões Mensal, Semanal e Diária.
   - Planejamento, movimentação e reagendamento de sessões com preservação do histórico de execução original (`recoveredFromId`).
   - Disparo direto do cronômetro a partir do card da sessão.

3. **Cronograma de 24 Semanas (`/cronograma`)**:
   - Navegador horizontal pelas 24 semanas do plano.
   - Editor livre da matriz de distribuição semanal (sugerida inicialmente em 600 min técnicas e 240 min gerais / 14h semanais).
   - Detecção visual e discreta de sobrecarga diária/semanal.
   - Recuperação assistida de sessões atrasadas/não cumpridas sem perda de métricas prévias.

4. **Estudar Agora (`/estudar-agora`)**:
   - Cronômetro atômico baseado em timestamps persistidos (não atrasa por suspensão de aba ou recarregamento).
   - Controles de Iniciar, Pausar, Retomar, Finalizar e Descartar (com confirmação).
   - Anotações rápidas durante o estudo e prompt automático ao finalizar para registro de questões e erros associados.

5. **Banco de Questões (`/questoes`)**:
   - Registro detalhado por data, disciplina, tópico, fonte/banca, total, acertos, erros e em branco.
   - Cálculo automático do total informado caso preenchidos apenas acertos e erros.
   - Alerta visual para questões não classificadas e detecção preventiva de duplicidades acidentais.
   - Fórmula rigorosa de precisão: `acertos / (acertos + erros) * 100` (questões em branco não afetam o denominador).

6. **Caderno de Erros (`/erros`)**:
   - Classificação taxonômica do erro: *Falta de conteúdo*, *Interpretação*, *Desatenção*, *Confusão entre alternativas* e *Outro*.
   - Ciclo de evolução do aprendizado: *Revisar* -> *Revisado* -> *Dominado*.
   - Geração automática de tarefas de repetição espaçada vinculadas ao erro.

7. **Revisões Espaçadas (`/revisoes`)**:
   - Organização em abas: *Vencidas*, *Hoje*, *Próximas* e *Concluídas*.
   - Intervalos padrão configuráveis (1, 7 e 30 dias).
   - Ações de concluir, adiar (1 a 14 dias) e reabrir.

8. **Disciplinas e Conteúdos (`/disciplinas`)**:
   - 8 disciplinas obrigatórias do cargo semeadas na inicialização:
     1. Língua Portuguesa
     2. Raciocínio Lógico e Quantitativo
     3. Lógica de Programação
     4. Arquitetura de Software
     5. Engenharia de Software
     6. Linguagens e Tecnologias de Programação
     7. Banco de Dados
     8. Computação em Nuvem
   - CRUD hierárquico de tópicos e subtópicos com reordenação manual por botões e drag-and-drop.
   - Importação de checklist em texto/markdown com tela de prévia e validação antes da gravação.

9. **Relatórios e Desempenho (`/relatorios`)**:
   - Análise agregada com granularidade por Dia, Semana e Mês.
   - Ranking dos tópicos com pior desempenho (abaixo da meta de 80%).
   - Exportação direta de dados tabulares em formato CSV (Sessões e Questões).

10. **Configurações (`/configuracoes`)**:
    - Ajuste de metas (tempo diário/semanal, meta diária de questões, meta percentual de acerto).
    - Configuração de intervalos da repetição espaçada.
    - Data opcional da prova para acompanhamento de contagem regressiva.
    - Seleção de tema (Claro, Escuro ou Automático do Sistema).
    - Backup e Restauração JSON com validação Zod e tela de conferência de registros.
    - Reset total do banco com re-semeadura inicial.

---

### Scripts Disponíveis

Na raiz do projeto:

```bash
# Executar o servidor de desenvolvimento Vite
npm run dev

# Executar a verificação estática de tipos com TypeScript
npm run typecheck

# Executar a verificação de código com ESLint
npm run lint

# Executar a suíte de testes unitários e de integração com Vitest
npm run test

# Compilar a aplicação para distribuição em produção
npm run build
```

---

### Motivação, Foco e Neurociência da Aprendizagem (UX/UI Científica)

O dashboard incorpora práticas de UX/UI fundamentadas na literatura científica e alinhadas aos padrões de design de `ui-ux-pro-max`:

1. **Goal-Gradient Effect & Progress Principle (Hull, 1932; Kivetz et al., 2006; Amabile & Kramer, 2011)**:
   - Componente **Missão de Hoje** na Visão Geral com anel SVG e checklist dos blocos do cronograma. O esforço humano e o foco aceleram à medida que a distância visual até a meta encolhe.
   - Enquadramento dinâmico (*Small-Area Hypothesis*, Koo & Fishbach, 2012): abaixo de 50% destaca o tempo acumulado; após 50%, destaca o pouco que falta para a meta.

2. **Reward Prediction Error & Dopamina Variável (Schultz, 1997)**:
   - O sistema de recompensa dopaminérgico dispara intensamente mediante surpresas positivas (*positive prediction error*).
   - Camada global de comemoração (`CelebrationLayer`) com confete leve em Canvas e mensagens de reforço sorteadas entre pools contextuais (evita habituação cognitiva).
   - Marcos raros (recorde pessoal na disciplina, 100% de acerto em baterias com $\ge 5$ questões, finalização do cronograma diário) recebem ênfase visual de nível superior (*tier big*).

3. **Combate ao "Post-Reward Reset" & Fechamento de Loops (Zeigarnik; Kivetz et al.)**:
   - Ao finalizar uma sessão ou bateria, o sistema exibe imediatamente o resumo da vitória do dia e um botão de ação imediata (*"Iniciar próximo bloco"*), mantendo o fluxo e o momentum de estudo sem paralisia de decisão.

4. **Modo Foco (Carga Cognitiva e Vigilância)**:
   - Visão imersiva com tipografia tabular mono, objetivo do bloco e atalhos rápidos (`Espaço` pausa/retoma, `Esc` fecha).
   - Elimina estímulos visuais concorrentes e preserva a atenção executiva.

5. **Acessibilidade e Autonomia (WCAG & Self-Determination Theory)**:
   - Respeita rigorosamente `@media (prefers-reduced-motion: reduce)`.
   - Preferência controlável nas Configurações para ativar/desativar animações comutando confetes a qualquer momento.
   - Informações e contrastes nunca dependem exclusivamente da cor (rótulos ARIA, `role="progressbar"`, `role="status"` e live regions informacionais).

---

### Execução em Contêiner (Docker / Docker Compose)

Para acessar o dashboard a qualquer momento diretamente pelo navegador sem precisar rodar `npm run dev`:

- **Acesso direto**: [http://localhost:8080](http://localhost:8080)
- O contêiner já está configurado com `restart: unless-stopped`, iniciando automaticamente em segundo plano inclusive após reiniciar a máquina.

Comandos de gerenciamento:

```bash
# Subir ou atualizar o contêiner em segundo plano
docker compose up -d --build

# Ver status e logs
docker compose ps
docker compose logs -f

# Parar o contêiner
docker compose stop

# Reiniciar o contêiner
docker compose start
```

---

### Privacidade e Segurança de Dados

- **100% Local**: Todos os dados cadastrados, notas e métricas são armazenados exclusivamente no IndexedDB do navegador.
- **Zero Telemetria**: Nenhuma informação de estudo ou dados pessoais é enviada para servidores ou terceiros.
- **Segurança**: Sem credenciais ou segredos expostos no cliente.
