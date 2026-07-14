
# 🎓 AcademiaIA - Aula Diária de Estudos
**Objetivo Geral:** Passar no cargo de Analista de Desenvolvimento de Sistemas no concurso da FUNDATEC
**Plano do Dia:** Consolidar conhecimentos em matemática financeira e leis administrativas essenciais para o cargo.
**Tema:** Matemática Financeira e Introdução à Lei de Improbidade Administrativa

---

## 📅 Roteiro de Estudos Planejado pelo Diretor
* **Data:** 2026-07-15
* **Tópicos a Estudar:**
    - Matemática financeira: porcentagem, juros simples e compostos
  - Lei de Improbidade Administrativa (Lei Federal nº 8.429/1992)
* **Justificativa da Escolha:**
  O aluno completou todo o conteúdo técnico de TI e a base de Português. Para manter o ritmo competitivo, é necessário avançar nas matérias de 'peso' como Raciocínio Lógico/Matemática e Legislação, que são decisivas nas provas de nível superior da banca FUNDATEC.
* **Professor Responsável:** Professor de Matemática

---

## 🔍 Análise Estratégica da Banca (FUNDATEC)
* **Recorrência do Assunto:** `Alta`
* **Foco da Banca nas Provas:**
  A FUNDATEC possui um perfil pragmático e direto. Em porcentagem, foca em cálculos de descontos sucessivos, aumentos e variações percentuais. Em juros, a banca prefere exercícios de aplicação direta de fórmulas (J = C.i.t ou M = C(1+i)^n), raramente exigindo demonstrações complexas. Valoriza a capacidade de interpretação de enunciados que envolvem períodos de capitalização (mensal vs anual) e o uso de tabelas de valores futuros ou potências simplificadas fornecidas na prova.
* **Pegadinhas Clássicas Mapeadas:**
    - Armadilha 1: Confusão entre taxas. A banca frequentemente fornece a taxa ao ano e pede o juro para um período mensal, esperando que o candidato esqueça de realizar a conversão da taxa antes de aplicar a fórmula.
  - Armadilha 2: Descontos sucessivos. Em questões de aumentos ou reduções, a banca induz o erro ao somar as porcentagens (ex: 20% + 10% = 30%) em vez de aplicar o efeito multiplicativo (1,20 * 0,90 = 1,08).
  - Armadilha 3: Juros compostos vs simples. A banca utiliza enunciados longos que descrevem situações complexas de financiamento para que o candidato aplique a fórmula de juros simples quando, na prática de mercado ou no enunciado, a capitalização composta é a exigida.
* **Atualizações Importantes:**
  Não há atualizações legislativas em matemática financeira, mas há uma tendência técnica da FUNDATEC em modernizar as questões, utilizando cenários de 'educação financeira' ou 'investimentos bancários' em detrimento de problemas puramente matemáticos, exigindo maior atenção à interpretação do fluxo de caixa.

---

### 📝 Questões Reais de Concursos Anteriores (Referência)

#### Questão de Referência 1 (2023 | Prefeitura de Bagé | Analista de Sistemas)
Um capital de R$ 10.000,00 foi aplicado a juros compostos a uma taxa de 2% ao mês durante 3 meses. Qual o valor do montante ao final desse período?

* **Gabarito Oficial:** **Opção (C (R$ 10.612,08))**


---
#### Questão de Referência 2 (2022 | Prefeitura de Canoas | Auditor Fiscal)
Um produto que custava R$ 200,00 sofreu um aumento de 10% em janeiro e, em fevereiro, um desconto de 10% sobre o novo valor. Qual o valor final do produto?

* **Gabarito Oficial:** **Opção (B (R$ 198,00))**


---

## 📚 Conteúdo Expositivo da Aula: Matemática Financeira e Introdução à Lei de Improbidade Administrativa

### 🎯 Objetivos de Aprendizagem
* **Dominar o cálculo de porcentagem, evitando erros em descontos e aumentos sucessivos.**
* **Diferenciar a aplicação prática de Juros Simples e Compostos, atentando-se à conversão de taxas.**
* **Compreender os conceitos fundamentais da Lei de Improbidade Administrativa (LIA), identificando sujeitos e atos ímprobos.**

### 📝 Teoria Detalhada
A Matemática Financeira é a base da análise de investimentos e financiamentos. Em porcentagem, o erro mais comum na banca FUNDATEC é a soma linear de taxas. Lembre-se: aumentos sucessivos são multiplicativos. Para um aumento de 20% seguido de 10%, não temos 30%, mas sim 1,20 * 1,10 = 1,32 (ou seja, 32% de aumento). Nos Juros Simples (J = C.i.t), o cálculo é linear sobre o capital inicial. Nos Juros Compostos (M = C(1+i)^n), os juros rendem juros, gerando um crescimento exponencial. A armadilha crucial é a compatibilidade entre tempo e taxa: se o período é mensal e a taxa é anual, é obrigatório converter a taxa antes de aplicar a fórmula. Sobre a Lei de Improbidade (Lei 8.429/92), entenda que ela visa punir agentes públicos (ou terceiros) que atentam contra a administração pública. Classificam-se em atos que importam enriquecimento ilícito, prejuízo ao erário ou atentado aos princípios da administração. É fundamental notar que, após a reforma de 2021, o dolo (vontade livre e consciente) tornou-se requisito indispensável para a caracterização do ato ímprobo, sendo excluída a modalidade culposa.

### 💡 Exemplos Práticos

#### Exemplo 1: A armadilha dos descontos sucessivos
* **Descrição:** Um produto de R$ 100 sofre um desconto de 20% e depois outro de 10%. Qual o valor final?
* **Especificação Técnica:**
```sql
Errado: 100 - 30% = 70. Correto: 100 * 0,80 * 0,90 = 72. O fator final é 0,72.
```


#### Exemplo 2: Conversão de Taxas (Cuidado FUNDATEC)
* **Descrição:** Calcular juros simples sobre R$ 1000 a 24% ao ano durante 3 meses.
* **Especificação Técnica:**
```sql
i = 24%/12 = 2% ao mês (0,02). J = 1000 * 0,02 * 3 = 60.
```


### 📌 Resumo de Fixação
1. Porcentagem: Use fatores multiplicativos (1 ± i) para aumentos ou descontos sucessivos. 2. Juros Simples: J = C * i * t. O juro é constante. 3. Juros Compostos: M = C * (1 + i)^n. O capital aumenta exponencialmente. 4. Regra de ouro: Taxa e tempo devem estar na mesma unidade. 5. LIA: Foco no dolo; atos dividem-se em enriquecimento ilícito, prejuízo ao erário e violação de princípios.

---

## 🧠 Mapa Mental (Visualização Gráfica)
```mermaid
graph TD
  A[Matemática Financeira e LIA] --> B[Matemática Financeira]
  A --> C[Lei de Improbidade]
  B --> B1[Porcentagem]
  B --> B2[Juros Simples]
  B --> B3[Juros Compostos]
  B1 --> B1A[Fatores Multiplicativos]
  B2 --> B2A[C.i.t]
  B3 --> B3A[C(1+i)^n]
  C --> C1[Sujeitos: Agente Público/Terceiro]
  C --> C2[Atos: Enriquecimento, Prejuízo, Princípios]
  C --> C3[Requisito: Dolo (Indispensável)]
```

---

## 🗂️ Flashcards (Fixação Ativa)
| ❓ Pergunta | 💡 Resposta |
|---|---|
| **Como calcular um aumento sucessivo de 10% e 20%?** | Multiplicando o capital original pelos fatores 1,10 e 1,20. |
| **Qual a principal diferença entre juros simples e compostos?** | No simples, a base de cálculo é apenas o capital inicial; no composto, os juros incidem sobre o montante acumulado. |
| **A modalidade culposa de improbidade administrativa ainda existe?** | Não. Com a reforma de 2021, apenas o dolo (vontade consciente) caracteriza improbidade. |

---

## 📝 Simulado de Fixação (Criador de Exercícios)

### ❓ Caderno de Questões

#### Questão 1
* **Dificuldade:** `Fácil` | **Edital:** *Porcentagem e Variações Percentuais*

Um produto teve um aumento de 20% seguido de um desconto de 20%. Qual foi a variação percentual final sobre o preço original?

  - **(A)** 0%
  - **(B)** Aumento de 4%
  - **(C)** Redução de 4%
  - **(D)** Redução de 2%
  - **(E)** Aumento de 2%


---
#### Questão 2
* **Dificuldade:** `Fácil` | **Edital:** *Juros Simples*

Um capital de R$ 5.000,00 foi aplicado a juros simples, à taxa de 2% ao mês, durante 1 ano. Qual o valor dos juros acumulados?

  - **(A)** R$ 1.000,00
  - **(B)** R$ 1.200,00
  - **(C)** R$ 1.500,00
  - **(D)** R$ 2.400,00
  - **(E)** R$ 600,00


---
#### Questão 3
* **Dificuldade:** `Médio` | **Edital:** *Juros Compostos*

Um investidor aplica R$ 10.000,00 a juros compostos, à taxa de 10% ao ano, por 2 anos. Qual será o montante ao final desse período?

  - **(A)** R$ 12.000,00
  - **(B)** R$ 12.100,00
  - **(C)** R$ 12.200,00
  - **(D)** R$ 11.000,00
  - **(E)** R$ 12.500,00


---
#### Questão 4
* **Dificuldade:** `Médio` | **Edital:** *Porcentagem e variações*

Uma loja oferece 10% de desconto para pagamento à vista. Se um cliente decide pagar parcelado, o preço sofre um acréscimo de 5%. Qual a diferença percentual entre o preço à vista e o preço parcelado?

  - **(A)** 15%
  - **(B)** 16,66%
  - **(C)** 15,5%
  - **(D)** 14,5%
  - **(E)** 17,2%


---
#### Questão 5
* **Dificuldade:** `Médio` | **Edital:** *Juros Simples e conversão de taxas*

Qual o valor dos juros produzidos por um capital de R$ 20.000,00, aplicado por 3 meses, a uma taxa de 36% ao ano, sob o regime de juros simples?

  - **(A)** R$ 1.800,00
  - **(B)** R$ 2.400,00
  - **(C)** R$ 3.600,00
  - **(D)** R$ 600,00
  - **(E)** R$ 7.200,00


---
#### Questão 6
* **Dificuldade:** `Difícil` | **Edital:** *Juros Compostos*

Um título de R$ 1.000,00 será pago em regime de juros compostos com taxa de 1% ao mês. Qual o valor dos juros após 3 meses?

  - **(A)** R$ 30,00
  - **(B)** R$ 30,30
  - **(C)** R$ 30,60
  - **(D)** R$ 31,00
  - **(E)** R$ 33,10


---
#### Questão 7
* **Dificuldade:** `Médio` | **Edital:** *Porcentagem*

Uma mercadoria teve um aumento de 25%. Qual o desconto necessário para que o preço retorne ao valor original?

  - **(A)** 25%
  - **(B)** 20%
  - **(C)** 15%
  - **(D)** 30%
  - **(E)** 22,5%


---
#### Questão 8
* **Dificuldade:** `Médio` | **Edital:** *Juros Simples*

Um investidor aplica R$ 5.000,00 a juros simples por 4 meses. Se o montante final foi de R$ 5.600,00, qual a taxa mensal?

  - **(A)** 2%
  - **(B)** 2,5%
  - **(C)** 3%
  - **(D)** 4%
  - **(E)** 5%


---
#### Questão 9
* **Dificuldade:** `Difícil` | **Edital:** *Juros Compostos*

Qual capital, aplicado a juros compostos de 20% ao ano, gera um montante de R$ 14.400,00 após 2 anos?

  - **(A)** R$ 10.000,00
  - **(B)** R$ 11.000,00
  - **(C)** R$ 12.000,00
  - **(D)** R$ 10.500,00
  - **(E)** R$ 9.000,00


---
#### Questão 10
* **Dificuldade:** `Fácil` | **Edital:** *Juros Compostos*

Uma dívida de R$ 1.000,00 sofreu um acréscimo de 10% no primeiro mês e 10% no segundo mês, sob regime de capitalização composta. Qual o valor após os 2 meses?

  - **(A)** R$ 1.200,00
  - **(B)** R$ 1.210,00
  - **(C)** R$ 1.220,00
  - **(D)** R$ 1.100,00
  - **(E)** R$ 1.150,00


---

### 🔑 Gabarito e Resoluções Comentadas

#### Questão 1
* **Gabarito:** **Opção (C)**
* **Resolução e Comentário:**
  A aplicação sucessiva de porcentagens deve ser multiplicativa: 1,20 * 0,80 = 0,96. O valor final é 96% do original, resultando em uma perda de 4%. Erro comum é somar 20% - 20% = 0%.


---
#### Questão 2
* **Gabarito:** **Opção (B)**
* **Resolução e Comentário:**
  Utilizando J = C * i * t, temos J = 5000 * 0,02 * 12 meses. O erro comum é usar o tempo em anos (1) sem converter a taxa mensal, ou esquecer a conversão do período.


---
#### Questão 3
* **Gabarito:** **Opção (B)**
* **Resolução e Comentário:**
  Montante em juros compostos é M = C(1 + i)^n. Assim, M = 10000 * (1,10)^2 = 10000 * 1,21 = 12100. A alternativa A é o resultado se fosse juros simples.


---
#### Questão 4
* **Gabarito:** **Opção (B)**
* **Resolução e Comentário:**
  Seja P o preço base. À vista = 0,9P. Parcelado = 1,05P. A variação é (1,05P - 0,9P) / 0,9P = 0,15 / 0,9 = 1/6 ≈ 16,66%. Erro comum é somar ou subtrair as taxas diretamente.


---
#### Questão 5
* **Gabarito:** **Opção (A)**
* **Resolução e Comentário:**
  Taxa de 36% ao ano equivale a 3% ao mês. J = 20000 * 0,03 * 3 = 1800. A armadilha é usar a taxa anual diretamente sem conversão mensal.


---
#### Questão 6
* **Gabarito:** **Opção (B)**
* **Resolução e Comentário:**
  M = 1000 * (1,01)^3 = 1000 * 1,030301 = 1030,30. Os juros são M - C = 30,30. A alternativa A é o resultado de juros simples.


---
#### Questão 7
* **Gabarito:** **Opção (B)**
* **Resolução e Comentário:**
  Preço final = 1,25 * P_inicial. Para voltar a P_inicial, dividimos por 1,25. 1 / 1,25 = 0,8. Logo, é necessário um desconto de 20% (100% - 80%).


---
#### Questão 8
* **Gabarito:** **Opção (C)**
* **Resolução e Comentário:**
  Juros = 600. J = C*i*t => 600 = 5000 * i * 4 => 600 = 20000 * i => i = 600 / 20000 = 0,03 ou 3%.


---
#### Questão 9
* **Gabarito:** **Opção (A)**
* **Resolução e Comentário:**
  14400 = C * (1,20)^2 => 14400 = C * 1,44 => C = 14400 / 1,44 = 10000.


---
#### Questão 10
* **Gabarito:** **Opção (B)**
* **Resolução e Comentário:**
  O valor é 1000 * 1,1 * 1,1 = 1210. A banca testa se o aluno entende o efeito dos juros sobre juros (capitalização composta).

