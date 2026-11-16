### 15. ROADMAP DE DESENVOLVIMENTO — IMPLEMENTAÇÃO PROGRESSIVA OBRIGATÓRIA

O desenvolvimento deverá seguir uma estratégia incremental, priorizando funcionalidades reais antes de recursos avançados.

Não tente construir toda a plataforma simultaneamente.

#### FASE 1 — FUNDAÇÃO ANGULAR

- Configuração do Angular.
- Verificação das versões e dependências.
- Arquitetura de componentes.
- Design System Kalixto.
- Dashboard.
- Navegação.
- Estrutura da biblioteca de efeitos.

Critério de conclusão: aplicação executável, arquitetura organizada e navegação funcional.

#### FASE 2 — MVP FUNCIONAL

Prioridade máxima: construir três laboratórios funcionais.

**Laboratório 01 — CSS Playground**
- Transitions.
- Keyframes.
- Transform.
- Hover.
- Floating.
- Perspective.
- Clip-path.
- Microinterações.

**Laboratório 02 — GSAP Studio**
- gsap.to().
- gsap.from().
- gsap.fromTo().
- Timeline.
- Stagger.
- Easing.
- Controles de reprodução.

**Laboratório 03 — Scroll Lab**
- ScrollTrigger.
- Scrub.
- Pin.
- Parallax.
- Horizontal Scroll.
- Scroll Progress.
- Scroll Storytelling.

Complementar o MVP com:

- Code Viewer.
- Documentação dos efeitos.
- Controles interativos.
- Botões de execução e reinicialização.
- Responsividade.
- Testes funcionais.

**REGRA: não avançar para Three.js enquanto os três primeiros laboratórios não estiverem funcionais e validados.**

#### FASE 3 — ORGANIZAÇÃO EDUCACIONAL

- Biblioteca de efeitos.
- SVG Lab.
- Comparador de tecnologias.
- Trilha de aprendizagem.
- Exercícios.
- Desafios.
- Presets.
- Persistência local do progresso.

Critério de conclusão: o usuário consegue estudar, consultar, comparar e experimentar os efeitos já implementados.

#### FASE 4 — THREE.JS E EXPERIÊNCIAS 3D

Somente após validar o MVP e sua estrutura:

- Three.js.
- Objetos geométricos.
- Câmeras.
- Iluminação.
- Materiais.
- Texturas.
- Animações 3D.
- Interação por mouse.
- Raycasting.
- Importação de modelos GLTF/GLB.

Critério de conclusão: laboratório 3D funcional, com controles e demonstrações documentadas.

#### FASE 5 — WEBGL E GLSL

Expandir para:

- Vertex Shaders.
- Fragment Shaders.
- GLSL.
- Noise.
- Distortion.
- Efeitos procedurais.
- Transições com shaders.
- Integração com Three.js.

Critério de conclusão: demonstrações gráficas avançadas com documentação e código funcional.

#### FASE 6 — OTIMIZAÇÃO E CONSOLIDAÇÃO

- QA completo.
- Testes de responsividade.
- Testes de acessibilidade.
- Otimização de performance.
- Revisão da arquitetura.
- Documentação final.
- Correção de problemas.
- Preparação para deploy.

### 16. CRITÉRIOS DE PASSAGEM ENTRE FASES

Cada fase deverá ser validada antes do início da próxima.

Utilize os seguintes critérios:

1. Funcionalidade implementada.
2. Demonstração executável.
3. Código-fonte disponível.
4. Explicação didática.
5. Controles funcionando.
6. Responsividade validada.
7. Ausência de erros críticos.
8. Performance aceitável.
9. Documentação atualizada.

Não considere uma fase concluída apenas porque sua interface foi construída.

Se houver falhas, corrija-as antes de avançar.

### 17. PRIORIZAÇÃO TÉCNICA

Adote a seguinte ordem de importância:

1. Funcionalidade.
2. Organização arquitetural.
3. Aprendizagem.
4. Qualidade do código.
5. Acessibilidade.
6. Performance.
7. Recursos avançados.
8. Refinamento visual.

Não sacrifique a estabilidade para adicionar funcionalidades visualmente impressionantes.

### 18. ESTRATÉGIA DE ENTREGA DO MVP

A primeira versão utilizável deverá conter:

- Dashboard.
- CSS Playground.
- GSAP Studio.
- Scroll Lab.
- Code Viewer.
- Biblioteca inicial de efeitos.
- Documentação integrada.
- Controles interativos.
- Responsividade.

Não incluir Three.js ou WebGL no MVP inicial.

Essas tecnologias serão incorporadas posteriormente, utilizando a arquitetura validada nas fases anteriores.

### 19. DOCUMENTAÇÃO E VERSIONAMENTO

Registrar a evolução por fases.

Manter:

- README atualizado.
- CHANGELOG.
- Registro das dependências.
- Documentação de componentes.
- Registro dos efeitos implementados.
- Critérios de conclusão.
- Problemas conhecidos.
- Próximas etapas.

Sempre que possível, utilizar Git para versionar cada etapa funcional.

Não misturar funcionalidades incompletas com versões estáveis sem identificação.

### 20. DIRETRIZ FINAL — VISÃO DO PRODUTO

O KALIXTO CREATIVE LAB é um laboratório independente de aprendizagem e experimentação de Creative Development.

Seu propósito é transformar conceitos técnicos em experiências visuais que possam ser exploradas, modificadas e compreendidas.

Não é portfólio.
Não é currículo.
Não é site institucional.
Não é vitrine de serviços.

É uma plataforma de aprendizagem e prototipagem.

**Estratégia obrigatória de construção:**

1. Primeiro, construir a base Angular.
2. Depois, entregar o CSS Playground.
3. Em seguida, desenvolver o GSAP Studio.
4. Depois, implementar o Scroll Lab.
5. Validar os três laboratórios.
6. Organizar a biblioteca e os recursos educacionais.
7. Somente então avançar para Three.js.
8. Posteriormente, implementar WebGL e GLSL.
9. Finalizar com otimização, QA e documentação.

Não antecipar tecnologias avançadas antes de consolidar os fundamentos.

O sucesso do projeto será medido pela qualidade das demonstrações, pelo funcionamento dos controles, pela clareza da documentação e pela capacidade de ensinar.

**Aprender. Experimentar. Construir.**