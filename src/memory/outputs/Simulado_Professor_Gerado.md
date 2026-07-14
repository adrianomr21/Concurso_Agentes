
# 📝 Simulado de Fixação: Modelagem Relacional
**Sessão de Teste Isolado - Criador de Exercícios IA**

---

## ❓ Caderno de Questões (10 Questões de Múltipla Escolha)


### Questão 1
* **Nível:** `Fácil` | **Edital:** *Conceitos básicos de Banco de Dados*

No modelo relacional, qual é o termo utilizado para designar uma linha de uma tabela?

  - **(A)** Atributo
  - **(B)** Tupla
  - **(C)** Domínio
  - **(D)** Esquema
  - **(E)** Grau


---
### Questão 2
* **Nível:** `Fácil` | **Edital:** *Integridade de Dados e Relacionamentos*

Qual chave é utilizada para garantir a integridade referencial entre duas tabelas?

  - **(A)** Chave Primária
  - **(B)** Chave Candidata
  - **(C)** Chave Estrangeira
  - **(D)** Chave Substituta
  - **(E)** Chave Composta


---
### Questão 3
* **Nível:** `Médio` | **Edital:** *Normalização de Dados*

O que caracteriza a Primeira Forma Normal (1FN)?

  - **(A)** Não possuir dependências parciais.
  - **(B)** Eliminar atributos multivalorados e não atômicos.
  - **(C)** Estar em 2FN e não possuir dependências transitivas.
  - **(D)** Cada atributo depender apenas da chave primária.
  - **(E)** Não possuir redundância de dados.


---
### Questão 4
* **Nível:** `Médio` | **Edital:** *Normalização de Dados*

Uma dependência funcional onde um atributo não-chave depende apenas de uma parte de uma chave primária composta caracteriza a violação de qual forma normal?

  - **(A)** 1FN
  - **(B)** 2FN
  - **(C)** 3FN
  - **(D)** BCNF
  - **(E)** 4FN


---
### Questão 5
* **Nível:** `Médio` | **Edital:** *Integridade de Dados e Relacionamentos*

Sobre a integridade de entidade, é correto afirmar:

  - **(A)** A chave primária pode aceitar valores nulos.
  - **(B)** A chave estrangeira deve ser única em toda a tabela.
  - **(C)** Nenhum atributo da chave primária pode ser nulo.
  - **(D)** A chave candidata deve ser sempre numérica.
  - **(E)** A tabela não precisa possuir chave primária.


---
### Questão 6
* **Nível:** `Difícil` | **Edital:** *Normalização de Dados*

Qual das opções descreve corretamente uma dependência transitiva?

  - **(A)** X -> Y e Y -> Z, logo X -> Z.
  - **(B)** X -> Y onde Y é parte da chave primária.
  - **(C)** X -> Y onde X não é determinante.
  - **(D)** X -> Y e X -> Z, sendo Y e Z independentes.
  - **(E)** Atributos dependentes de mais de uma chave candidata.


---
### Questão 7
* **Nível:** `Fácil` | **Edital:** *Conceitos básicos de Banco de Dados*

No modelo relacional, o conceito de 'Grau' de uma relação refere-se a:

  - **(A)** Quantidade de linhas.
  - **(B)** Quantidade de colunas.
  - **(C)** Quantidade de chaves estrangeiras.
  - **(D)** Quantidade de tabelas no banco.
  - **(E)** Quantidade de relacionamentos.


---
### Questão 8
* **Nível:** `Difícil` | **Edital:** *Normalização de Dados*

Qual é a principal função da Forma Normal de Boyce-Codd (BCNF)?

  - **(A)** Tratar dependências multivaloradas.
  - **(B)** Eliminar dependências transitivas.
  - **(C)** Garantir que cada determinante seja uma chave candidata.
  - **(D)** Eliminar atributos atômicos.
  - **(E)** Reduzir o número de tabelas no banco.


---
### Questão 9
* **Nível:** `Médio` | **Edital:** *Transformação de Modelo Conceitual para Relacional*

Como representar um relacionamento de N:N (muitos-para-muitos) no modelo relacional?

  - **(A)** Adicionando a chave primária de um lado no outro.
  - **(B)** Criando uma nova tabela associativa com as chaves das entidades originais.
  - **(C)** Unindo as duas tabelas em uma única.
  - **(D)** Adicionando um campo multivalorado em uma das tabelas.
  - **(E)** Não é possível representar relacionamentos N:N.


---
### Questão 10
* **Nível:** `Médio` | **Edital:** *Conceitos básicos de Banco de Dados*

O que é uma chave candidata?

  - **(A)** A única chave possível para identificar a tabela.
  - **(B)** Um conjunto de atributos que identifica unicamente uma tupla.
  - **(C)** Uma chave que contém valores nulos.
  - **(D)** Uma chave que apenas referencia outra tabela.
  - **(E)** Uma chave definida apenas em visões (views).


---

## 🔑 Gabarito e Resoluções Comentadas


### Questão 1
* **Gabarito:** **Opção (B)**
* **Resolução Detalhada:**
  Uma tupla representa uma instância ou registro individual em uma relação (tabela). Os atributos são as colunas, o domínio é o conjunto de valores permitidos para um atributo e o grau é o número de colunas.


---
### Questão 2
* **Gabarito:** **Opção (C)**
* **Resolução Detalhada:**
  A chave estrangeira é o atributo em uma tabela que faz referência à chave primária de outra tabela, estabelecendo o relacionamento e garantindo que não existam registros órfãos.


---
### Questão 3
* **Gabarito:** **Opção (B)**
* **Resolução Detalhada:**
  A 1FN exige que todos os atributos sejam atômicos, ou seja, não podem conter conjuntos de valores ou grupos repetitivos. A atômica garante que cada célula da tabela contenha apenas um valor único.


---
### Questão 4
* **Gabarito:** **Opção (B)**
* **Resolução Detalhada:**
  A Segunda Forma Normal (2FN) exige que a tabela esteja na 1FN e que não existam dependências parciais, ou seja, atributos não-chave dependendo apenas de parte de uma chave composta.


---
### Questão 5
* **Gabarito:** **Opção (C)**
* **Resolução Detalhada:**
  A integridade de entidade garante que cada linha da tabela seja identificável de forma única, o que exige que a chave primária não possua valores nulos, pois um valor nulo impediria a identificação.


---
### Questão 6
* **Gabarito:** **Opção (A)**
* **Resolução Detalhada:**
  A dependência transitiva ocorre quando um atributo não-chave depende de outro atributo não-chave, que por sua vez depende da chave primária. Isso viola a Terceira Forma Normal (3FN).


---
### Questão 7
* **Gabarito:** **Opção (B)**
* **Resolução Detalhada:**
  O grau (ou aridade) de uma relação é o número de atributos (colunas) que ela possui. Já a cardinalidade refere-se ao número de tuplas (linhas).


---
### Questão 8
* **Gabarito:** **Opção (C)**
* **Resolução Detalhada:**
  A BCNF é uma versão mais rigorosa da 3FN. Ela exige que, para toda dependência funcional X -> Y, X deve ser uma superchave, eliminando anomalias causadas por chaves candidatas sobrepostas.


---
### Questão 9
* **Gabarito:** **Opção (B)**
* **Resolução Detalhada:**
  Para implementar uma relação de muitos-para-muitos, deve-se criar uma tabela intermediária (tabela associativa) que contenha as chaves primárias das duas entidades participantes como chaves estrangeiras.


---
### Questão 10
* **Gabarito:** **Opção (B)**
* **Resolução Detalhada:**
  Uma chave candidata é um atributo ou conjunto de atributos que identifica de forma única uma linha (tupla) em uma relação. A partir das chaves candidatas, escolhe-se uma para ser a chave primária.

