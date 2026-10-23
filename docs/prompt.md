# PROMPT DE ENGENHARIA DE SOFTWARE — DASHBOARD DE ESTUDOS BNB

<!-- Otimizado para Claude Opus 5.5 | Implementação full-stack/frontend | Execução autônoma -->

<project_specification version="1.0" language="pt-BR">
<role>
Você é um engenheiro de software sênior, arquiteto de aplicações e
especialista em UX/UI para produtos SaaS. Sua responsabilidade é projetar,
implementar, testar e entregar uma aplicação funcional de gerenciamento de
estudos, com qualidade de produto comercial.
</role>

  <mission>
    <primary_goal>
      Construir um dashboard pessoal de estudos para o concurso do Banco do
      Nordeste do Brasil (BNB), com foco exclusivo no cargo Analista de Sistemas
      — Desenvolvimento de Sistemas.
    </primary_goal>
    <expected_product>
      Uma aplicação funcional, responsiva, visualmente refinada, persistente e
      interativa. Não entregar somente um protótipo, landing page, wireframe ou
      demonstração estática.
    </expected_product>
    <execution_mode>
      Inspecione o repositório existente, planeje a implementação, desenvolva as
      funcionalidades, execute os testes e corrija os problemas encontrados.
      Continue até entregar uma versão utilizável.
    </execution_mode>
  </mission>

<user_context>
<exam>Concurso do Banco do Nordeste do Brasil (BNB)</exam>
<target_position >Analista de Sistemas — Desenvolvimento de Sistemas</target_position >
<daily_study_availability>120 minutos</daily_study_availability>
<weekly_study_availability>840 minutos</weekly_study_availability>
<initial_planning_horizon>24 semanas</initial_planning_horizon>
<primary_goal >Buscar a primeira colocação por meio de preparação disciplinada,
mensurável e orientada a desempenho.</primary_goal >
<interface_language>Português brasileiro</interface_language>
<date_locale>pt-BR</date_locale>
<timezone>America/Bahia</timezone>
<important_constraint>
Não garantir aprovação, não presumir uma data de prova e não confundir o
conteúdo do cargo pretendido com o de Analista Bancário 1.
</important_constraint>
</user_context>

  <disciplines>
    <discipline id="portugues">Língua Portuguesa</discipline>
    <discipline id="raciocinio">Raciocínio Lógico e Quantitativo</discipline>
    <discipline id="logica-programacao">Lógica de Programação</discipline>
    <discipline id="arquitetura">Arquitetura de Software</discipline>
    <discipline id="engenharia">Engenharia de Software</discipline>
    <discipline id="linguagens"
      >Linguagens e Tecnologias de Programação</discipline
    >
    <discipline id="banco-dados">Banco de Dados</discipline>
    <discipline id="nuvem">Computação em Nuvem</discipline>
  </disciplines>

<content_integrity>
<rule
      >As oito disciplinas acima devem existir desde a primeira
inicialização.</rule
    >
<rule
      >Permitir cadastrar, editar, excluir, reorganizar e desativar tópicos e
subtópicos.</rule
    >
<rule
      >Não inventar conteúdos específicos do edital nem afirmar cobertura
integral sem conferência.</rule
    >
<rule
      >Se houver checklist ou edital disponível no repositório, inspecioná-lo e
utilizá-lo como fonte principal do conteúdo programático.</rule
    >
<rule
      >Se não houver arquivo acessível, iniciar com as oito disciplinas e
permitir a inclusão manual dos tópicos.</rule
    >
<rule
      >Se for implementada importação de checklist, apresentar uma prévia para
validação antes de salvar.</rule
    >
</content_integrity>

<product_design>
<product_type >Dashboard pessoal de produtividade e preparação para
concurso.</product_type >
<visual_direction>
Desenvolva uma interface SaaS moderna, profissional, minimalista e
funcional. A aparência deve transmitir organização, concentração e
clareza, sem parecer um template genérico.
</visual_direction>
<layout>
<item>Sidebar para navegação principal.</item>
<item
        >Cabeçalho compacto com data atual, busca e acesso às
configurações.</item
      >
<item>Área central organizada por hierarquia visual.</item>
<item
        >Cards de métricas compactos e gráficos com finalidade prática.</item
      >
<item>Layout responsivo para desktop, tablet e celular.</item>
</layout>
<design_system>
<item
        >Paleta neutra, com uma cor primária e cores semânticas discretas.</item
      >
<item>Suporte a tema claro e escuro.</item>
<item
        >Tipografia legível, espaçamento consistente e componentes
reutilizáveis.</item
      >
<item
        >Evitar sombras exageradas, excesso de gradientes, decoração
desnecessária e poluição visual.</item
      >
<item>Não utilizar emojis na interface.</item>
<item>Utilizar ícones consistentes e acessíveis.</item>
</design_system>
<accessibility>
Garantir contraste adequado, foco visível, navegação por teclado, rótulos
claros, mensagens de validação compreensíveis e controles acessíveis. Não
utilizar apenas cores para comunicar estados.
</accessibility>
</product_design>

  <navigation>
    <item>Visão geral</item>
    <item>Calendário</item>
    <item>Cronograma</item>
    <item>Estudar agora</item>
    <item>Questões</item>
    <item>Caderno de erros</item>
    <item>Revisões</item>
    <item>Disciplinas e conteúdos</item>
    <item>Relatórios</item>
    <item>Configurações</item>
  </navigation>

  <dashboard>
    <purpose>
      Mostrar rapidamente o estado real da preparação e ajudar o usuário a
      decidir o que estudar em seguida.
    </purpose>
    <metrics>
      <metric>Tempo estudado hoje versus meta diária de 120 minutos.</metric>
      <metric>Tempo estudado na semana versus meta de 840 minutos.</metric>
      <metric>Total de questões respondidas.</metric>
      <metric>Total de acertos e erros.</metric>
      <metric>Percentual de acerto geral.</metric>
      <metric>Percentual de acerto por disciplina.</metric>
      <metric>Sequência de dias estudados.</metric>
      <metric>Progresso dos tópicos cadastrados.</metric>
      <metric>Próxima sessão planejada.</metric>
      <metric>Revisões pendentes ou vencidas.</metric>
    </metrics>
    <charts>
      <chart>Tempo de estudo por dia e semana.</chart>
      <chart>Percentual de acerto por disciplina.</chart>
      <chart>Evolução do desempenho ao longo do tempo.</chart>
      <chart>Tempo planejado versus tempo realizado.</chart>
    </charts>
    <data_rules>
      Todos os indicadores devem ser calculados a partir dos dados persistidos.
      Em estado vazio, mostrar instruções e estados vazios adequados. Nunca
      apresentar dados fictícios como resultados reais.
    </data_rules>
  </dashboard>

  <calendar>
    <views>
      <view>Mensal</view>
      <view>Semanal</view>
      <view>Diária</view>
    </views>
    <features>
      <feature
        >Criar, editar, mover, reagendar e excluir sessões de estudo.</feature
      >
      <feature>Navegar entre períodos e retornar à data atual.</feature>
      <feature
        >Vincular sessões a uma disciplina e, opcionalmente, a um tópico ou
        subtópico.</feature
      >
      <feature>Definir data, horário previsto, duração e observações.</feature>
      <feature>Marcar sessões como planejadas, concluídas ou perdidas.</feature>
      <feature
        >Exibir visualmente os dias estudados e as metas diárias.</feature
      >
      <feature
        >Abrir os detalhes da sessão e iniciar o cronômetro diretamente pelo
        calendário.</feature
      >
      <feature
        >Reagendar uma sessão sem apagar seu histórico de execução.</feature
      >
    </features>
    <exam_date>
      A data da prova deve ser opcional e configurável. Não presumir que exista
      uma data oficial definida.
    </exam_date>
  </calendar>

<study_schedule>
<duration>24 semanas</duration>
<weekly_goal_minutes>840</weekly_goal_minutes>
<initial_distribution>
<technical_disciplines_minutes>600</technical_disciplines_minutes>
<general_disciplines_minutes>240</general_disciplines_minutes>
</initial_distribution>
<requirements>
<item>Apresentar o cronograma por semana, dia e disciplina.</item>
<item>Permitir editar livremente a distribuição dos estudos.</item>
<item
        >Definir objetivos semanais, conteúdos planejados, status e
observações.</item
      >
<item
        >Mostrar horas planejadas, horas realizadas e percentual de
cumprimento.</item
      >
<item
        >Permitir reorganizar sessões por arrastar e soltar ou por controles
acessíveis.</item
      >
<item
        >Identificar sessões atrasadas e excesso de carga com avisos
discretos.</item
      >
<item
        >Permitir recuperar sessões não concluídas sem apagar o histórico.</item
      >
</requirements>
<initial_strategy>
Distribuição inicial sugerida de 10 horas semanais para disciplinas
técnicas e 4 horas para Língua Portuguesa e Raciocínio Lógico e
Quantitativo. Essa distribuição deve ser editável e ajustável conforme o
desempenho.
</initial_strategy>
<constraint>
O cronograma de 24 semanas é um ponto de partida editável, não uma
afirmação de que todos os tópicos do edital estão cobertos.
</constraint>
</study_schedule>

<study_session>
<purpose>
Permitir selecionar um conteúdo e começar a estudar imediatamente, sem
depender de uma sessão previamente planejada.
</purpose>
<fields>
<field>Disciplina</field>
<field>Tópico e subtópico</field>
<field>Objetivo da sessão</field>
<field>Duração pretendida</field>
<field>Notas rápidas</field>
</fields>
<actions>
<action>Iniciar sessão planejada.</action>
<action>Iniciar sessão avulsa.</action>
<action>Registrar notas durante o estudo.</action>
<action>Finalizar e salvar a sessão.</action>
<action>Registrar questões respondidas após a sessão.</action>
<action>Registrar acertos, erros e conteúdos para revisar.</action>
</actions>
<empty_topics>
Caso não existam tópicos cadastrados, permitir selecionar a disciplina e
criar um tópico rapidamente.
</empty_topics>
</study_session>

  <timer>
    <controls>
      <control>Iniciar</control>
      <control>Pausar</control>
      <control>Continuar</control>
      <control>Finalizar</control>
      <control>Descartar</control>
    </controls>
    <requirements>
      <item>Exibir tempo decorrido e duração planejada.</item>
      <item>Mostrar o progresso em relação à duração pretendida.</item>
      <item
        >Persistir o estado do cronômetro durante recarregamentos
        acidentais.</item
      >
      <item>Não contar o tempo durante pausas.</item>
      <item
        >Permitir continuar estudando após atingir a duração planejada.</item
      >
      <item>Mostrar aviso visual ao atingir a meta da sessão.</item>
      <item>Salvar o tempo efetivamente estudado ao finalizar.</item>
      <item>Evitar duplicação de sessões por cliques repetidos.</item>
      <item
        >Solicitar confirmação antes de descartar uma sessão em andamento.</item
      >
    </requirements>
    <technical_constraint>
      Calcular o tempo com base em timestamps persistidos e no tempo acumulado.
      Não depender exclusivamente de um contador incrementado a cada segundo,
      pois a aba pode ficar inativa ou o navegador pode suspender a execução.
    </technical_constraint>
  </timer>

<question_tracking>
<purpose>
Registrar o desempenho diário em questões, individualmente por disciplina
e opcionalmente por tópico.
</purpose>
<fields>
<field name="date">Data de resolução</field>
<field name="discipline">Disciplina</field>
<field name="topic">Tópico ou subtópico opcional</field>
<field name="source">Banca ou fonte opcional</field>
<field name="total">Total de questões</field>
<field name="correct">Acertos</field>
<field name="incorrect">Erros</field>
<field name="blank">Questões em branco, opcional</field>
<field name="duration">Tempo gasto, opcional</field>
<field name="notes">Observações</field>
</fields>
<validation>
<rule
        >Todos os valores quantitativos devem ser inteiros não negativos.</rule
      >
<rule
        >Acertos, erros e questões em branco devem ser consistentes com o total
informado.</rule
      >
<rule
        >Se o usuário informar somente acertos e erros, calcular o total
automaticamente.</rule
      >
<rule
        >Se o total for maior que a quantidade classificada, informar quantas
questões ainda não foram classificadas.</rule
      >
<rule>Permitir editar e excluir lançamentos.</rule>
<rule>Não criar lançamentos duplicados silenciosamente.</rule>
</validation>
<metrics>
<metric>Total de questões respondidas.</metric>
<metric>Total de acertos.</metric>
<metric>Total de erros.</metric>
<metric>Total de questões em branco.</metric>
<metric>Percentual de acerto por disciplina.</metric>
<metric>Percentual de acerto por tópico.</metric>
<metric>Evolução do desempenho ao longo do tempo.</metric>
</metrics>
<accuracy_formula>
Percentual de acerto = acertos / (acertos + erros) \* 100. Questões em
branco não entram no denominador. Se não houver questões corrigidas,
exibir “—”.
</accuracy_formula>
<filters>
<filter>Intervalo de datas</filter>
<filter>Disciplina</filter>
<filter>Tópico</filter>
<filter>Banca ou fonte</filter>
</filters>
</question_tracking>

<error_notebook>
<purpose
      >Transformar erros recorrentes em conteúdos específicos de
revisão.</purpose
    >
<fields>
<field>Disciplina</field>
<field>Tópico ou subtópico</field>
<field>Referência ou link da questão</field>
<field>Motivo do erro</field>
<field>Explicação correta ou resumo do aprendizado</field>
<field>Data do erro</field>
<field>Status</field>
<field>Próxima data de revisão</field>
</fields>
<error_categories>
<category>Falta de conteúdo</category>
<category>Interpretação</category>
<category>Desatenção</category>
<category>Confusão entre alternativas</category>
<category>Outro</category>
</error_categories>
<statuses>
<status>Revisar</status>
<status>Revisado</status>
<status>Dominado</status>
</statuses>
</error_notebook>

<spaced_repetition>
<default_intervals_days>
<interval>1</interval>
<interval>7</interval>
<interval>30</interval>
</default_intervals_days>
<features>
<feature>Gerar revisões futuras associadas a tópicos ou erros.</feature>
<feature>Mostrar revisões vencidas, de hoje e próximas.</feature>
<feature>Marcar revisão como concluída.</feature>
<feature>Adiar revisão.</feature>
<feature>Permitir ajustar os intervalos nas configurações.</feature>
</features>
<constraint>
Os intervalos são valores iniciais editáveis, não uma regra universal.
</constraint>
</spaced_repetition>

  <goals>
    <daily_study_minutes default="120"
      >Meta diária de estudo.</daily_study_minutes
    >
    <weekly_study_minutes default="840"
      >Meta semanal de estudo.</weekly_study_minutes
    >
    <daily_question_goal configurable="true"
      >Meta diária de questões definida pelo usuário.</daily_question_goal
    >
    <accuracy_goal default="80"
      >Meta operacional inicial de 80% de acerto.</accuracy_goal
    >
    <topic_completion_goal configurable="true"
      >Meta de conclusão de tópicos.</topic_completion_goal
    >
    <rule>
      Comparar metas configuradas com resultados efetivamente registrados. Não
      confundir metas com resultados alcançados.
    </rule>
  </goals>

  <reports>
    <report>Tempo de estudo diário, semanal e mensal.</report>
    <report>Questões resolvidas por disciplina e período.</report>
    <report>Acertos, erros e percentual de acerto.</report>
    <report>Conteúdos com pior desempenho.</report>
    <report>Evolução do percentual de acerto.</report>
    <report>Tempo planejado versus tempo realizado.</report>
    <report>Revisões pendentes e tópicos dominados.</report>
    <report>Exportação de dados para análise.</report>
  </reports>

<persistence_and_privacy>
<requirements>
<item
        >Todos os registros devem permanecer disponíveis após fechar e reabrir a
aplicação.</item
      >
<item
        >Se não houver backend, usar IndexedDB ou outra solução local
robusta.</item
      >
<item>Não depender apenas do estado em memória.</item>
<item>Oferecer exportação e importação de backup JSON.</item>
<item
        >Validar o arquivo importado e solicitar confirmação antes de
sobrescrever informações.</item
      >
<item
        >Exibir mensagens claras em caso de falha de salvamento ou
importação.</item
      >
<item
        >Solicitar confirmação antes de apagar registros ou reiniciar o
sistema.</item
      >
<item
        >Não transmitir dados pessoais ou de estudo para serviços externos sem
consentimento explícito.</item
      >
<item>Não expor segredos ou credenciais no frontend.</item>
</requirements>
</persistence_and_privacy>

<technical_architecture>
<initial_inspection>
Antes de criar ou modificar arquivos, inspecione o repositório, a stack
existente, a estrutura de diretórios, as dependências e os comandos
disponíveis. Preserve convenções e componentes úteis.
</initial_inspection>
<fallback_stack>
Se o repositório estiver vazio, use React, TypeScript, Vite, Tailwind CSS,
componentes acessíveis, biblioteca consolidada de gráficos e IndexedDB
para persistência local.
</fallback_stack>
<engineering_rules>
<rule>Separar a aplicação por funcionalidades.</rule>
<rule>Usar tipos explícitos e validação consistente.</rule>
<rule>Implementar componentes reutilizáveis.</rule>
<rule
        >Centralizar cálculos de métricas para evitar resultados divergentes
entre telas.</rule
      >
<rule>Tratar datas e fusos horários consistentemente.</rule>
<rule>Implementar estados de carregamento, vazio, sucesso e erro.</rule>
<rule>Todos os botões e controles devem executar ações reais.</rule>
<rule
        >Não simular persistência nem indicar sucesso antes de salvar os
dados.</rule
      >
<rule
        >Não instalar dependências desnecessárias se o projeto já tiver
alternativas adequadas.</rule
      >
</engineering_rules>
</technical_architecture>

<suggested_data_model>
<entity name="Discipline"> id, name, color, active </entity>
<entity name="Topic">
id, disciplineId, title, parentTopicId opcional, status, notes
</entity>
<entity name="StudySession">
id, date, disciplineId, topicId opcional, plannedStart, plannedMinutes,
actualSeconds, status, notes, startedAt, endedAt
</entity>
<entity name="TimerState">
sessionId, status, startedAt, accumulatedSeconds, plannedSeconds,
updatedAt
</entity>
<entity name="QuestionLog">
id, date, disciplineId, topicId opcional, source, total, correct,
incorrect, blank, durationMinutes, notes
</entity>
<entity name="ErrorNote">
id, questionLogId opcional, disciplineId, topicId opcional,
sourceReference, errorType, explanation, errorDate, status, nextReviewDate
</entity>
<entity name="ReviewTask">
id, disciplineId, topicId opcional, errorNoteId opcional, dueDate,
intervalDays, status, completedAt
</entity>
<entity name="WeeklyPlan">
id, weekStart, objectives, plannedMinutes, status, notes
</entity>
<entity name="Settings">
dailyGoalMinutes, weeklyGoalMinutes, dailyQuestionGoal, accuracyGoal,
reviewIntervals, theme, examDate opcional
</entity>
<constraint>
Ajuste o modelo se necessário e implemente versionamento do armazenamento
ou estratégia de migração.
</constraint>
</suggested_data_model>

<acceptance_criteria>
<criterion>As oito disciplinas estão cadastradas inicialmente.</criterion>
<criterion
      >O usuário consegue criar, editar e excluir tópicos e
subtópicos.</criterion
    >
<criterion
      >O calendário permite planejar, editar e reagendar sessões.</criterion
    >
<criterion>O cronograma de 24 semanas é editável.</criterion>
<criterion
      >O cronômetro funciona corretamente em iniciar, pausar, retomar, finalizar
e descartar.</criterion
    >
<criterion
      >O tempo real estudado é salvo e refletido no dashboard.</criterion
    >
<criterion
      >O usuário consegue registrar questões por data, disciplina e
tópico.</criterion
    >
<criterion
      >Acertos, erros, percentuais e gráficos são calculados a partir dos dados
reais.</criterion
    >
<criterion>O caderno de erros e as revisões funcionam.</criterion>
<criterion>Os dados persistem após reiniciar o navegador.</criterion>
<criterion>Backup e restauração funcionam e validam os dados.</criterion>
<criterion>A interface é responsiva e navegável por teclado.</criterion>
<criterion
      >Não existem botões inertes ou métricas fictícias apresentadas como
reais.</criterion
    >
<criterion
      >Lint, testes e build são executados e terminam sem erros.</criterion
    >
</acceptance_criteria>

<execution_plan>
<step order="1"
      >Inspecionar o repositório e resumir brevemente a stack e a estratégia de
implementação.</step
    >
<step order="2"
      >Definir o modelo de dados, a persistência e a arquitetura.</step
    >
<step order="3">Implementar layout, design system e navegação.</step>
<step order="4"
      >Implementar disciplinas, tópicos, calendário e cronograma.</step
    >
<step order="5">Implementar cronômetro e persistência das sessões.</step>
<step order="6"
      >Implementar registro de questões, métricas e caderno de erros.</step
    >
<step order="7"
      >Implementar revisões espaçadas, metas, dashboard e relatórios.</step
    >
<step order="8"
      >Implementar configurações, importação, exportação e acessibilidade.</step
    >
<step order="9"
      >Criar e executar testes; rodar lint e build; corrigir os problemas
encontrados.</step
    >
<step order="10"
      >Entregar resumo das funcionalidades, instruções para executar e
limitações remanescentes.</step
    >
</execution_plan>

<final_instructions>
<instruction
      >Não pare após criar um mockup, uma tela estática ou um plano de
implementação.</instruction
    >
<instruction
      >Implemente as funcionalidades no repositório atual.</instruction
    >
<instruction
      >Não remova funcionalidades existentes sem necessidade
justificada.</instruction
    >
<instruction
      >Não afirme que testes passaram sem realmente executá-los.</instruction
    >
<instruction
      >Se houver uma ambiguidade não crítica, escolha a alternativa mais
simples, segura e coerente, documentando a decisão.</instruction
    >
<instruction
      >Priorize primeiro os fluxos essenciais: persistência, cronômetro,
calendário e registro de questões.</instruction
    >
<instruction
      >Ao finalizar, informe claramente o que foi implementado, quais comandos
foram executados e quais limitações ainda existem.</instruction
    >
</final_instructions>
</project_specification>
