// Primeiro, definimos a gramática inicial
let grammar = {
  S: [["A"], ["A", "B", "a"], ["A", "b", "A"]],
  A: [["A", "a"], ["λ"]],
  B: [
    ["B", "b"],
    ["B", "C"],
  ],
  C: [
    ["C", "B"],
    ["C", "A"],
    ["b", "B"],
  ],
};

// Função para encontrar produções nulas
function findNullProductions(grammar) {
  let nullProductions = [];
  for (let nonTerminal in grammar) {
    grammar[nonTerminal].forEach((production) => {
      if (production.includes("λ")) {
        nullProductions.push(nonTerminal);
      }
    });
  }
  return nullProductions;
}

// Função para remover produções nulas
function removeNullProductions(grammar, nullProductions) {
  let newGrammar = { ...grammar };
  for (let nonTerminal in newGrammar) {
    let newProductions = [];
    newGrammar[nonTerminal].forEach((production) => {
      if (production.length === 1 && production[0] === "λ") {
        if (nonTerminal !== "S") {
          return;
        }
      }

      // Lidar com produções que contêm variáveis não-terminais que têm produções nulas
      nullProductions.forEach((nullProd) => {
        if (production.includes(nullProd)) {
          let newProduction = [...production];
          newProduction.splice(newProduction.indexOf(nullProd), 1);
          newProductions.push(newProduction);
        }
      });

      newProductions.push(production);
    });
    newGrammar[nonTerminal] = newProductions;
  }
  return newGrammar;
}

// Função para remover produções unitárias
function removeUnitProductions(grammar) {
  let newGrammar = { ...grammar };

  for (let nonTerminal in newGrammar) {
    let newProductions = [];

    newGrammar[nonTerminal].forEach((production) => {
      // Se a produção for unitária, adicione todas as produções do não-terminal à direita
      if (
        production.length === 1 &&
        typeof newGrammar[production[0]] !== "undefined"
      ) {
        newGrammar[production[0]].forEach((prod) => {
          // Evitar loops infinitos adicionando uma produção unitária que já estava sendo processada
          if (prod.length !== 1 || prod[0] !== nonTerminal) {
            newProductions.push(prod);
          }
        });
      } else {
        // Se a produção não for unitária, apenas a adicione
        newProductions.push(production);
      }
    });

    newGrammar[nonTerminal] = newProductions;
  }

  return newGrammar;
}

// Função para quebrar produções longas
// Função para quebrar produções longas
function breakLongProductions(grammar) {
  let newGrammar = { ...grammar };
  let newVariableIndex = 0;

  for (let nonTerminal in newGrammar) {
    let newProductions = [];

    newGrammar[nonTerminal].forEach((production) => {
      if (production.length > 2) {
        // Produção longa encontrada, precisamos quebrá-la
        let tempVariable = nonTerminal + newVariableIndex++;
        newProductions.push([production[0], tempVariable]);

        // Adicionar novas produções ao final da lista
        for (let i = 1; i < production.length - 1; i++) {
          let nextTempVariable = nonTerminal + newVariableIndex++;
          newGrammar[tempVariable] = [[production[i], nextTempVariable]];
          tempVariable = nextTempVariable;
        }

        // Adicionar a última produção
        newGrammar[tempVariable] = [
          [
            production[production.length - 2],
            production[production.length - 1],
          ],
        ];
      } else {
        // Produção não é longa, apenas adicioná-la
        newProductions.push(production);
      }
    });

    newGrammar[nonTerminal] = newProductions;
  }

  return newGrammar;
}

// Função para substituir terminais em produções mistas
function replaceTerminalsInMixedProductions(grammar) {
  let newGrammar = { ...grammar };
  let newVariableIndex = 0;

  for (let nonTerminal in newGrammar) {
    let newProductions = [];

    newGrammar[nonTerminal].forEach((production) => {
      let newProduction = [...production];

      // Verificar se a produção é mista
      for (let i = 0; i < newProduction.length; i++) {
        // Se o símbolo não é um não-terminal (ou seja, é um terminal), substituí-lo
        if (typeof newGrammar[newProduction[i]] === "undefined") {
          let tempVariable = "T" + newVariableIndex++; // Criar uma nova variável não-terminal
          newGrammar[tempVariable] = [[newProduction[i]]]; // Adicionar a nova produção
          newProduction[i] = tempVariable; // Substituir o terminal pela nova variável na produção
        }
      }

      newProductions.push(newProduction);
    });

    newGrammar[nonTerminal] = newProductions;
  }

  return newGrammar;
}

// Função para converter a gramática para a forma normal de Chomsky
function convertToChomsky(grammar) {
  let nullProductions = findNullProductions(grammar);
  let grammarWithoutNulls = removeNullProductions(grammar, nullProductions);
  let grammarWithoutUnits = removeUnitProductions(grammarWithoutNulls);
  let grammarWithoutLongs = breakLongProductions(grammarWithoutUnits);
  let chomskyGrammar = replaceTerminalsInMixedProductions(grammarWithoutLongs);
  return chomskyGrammar;
}

// Função para converter para a Forma Normal de Greibach
function convert_to_gnf(grammar) {
  let newGrammar = { ...grammar };
  let keys = Object.keys(grammar);

  for (let i = 0; i < keys.length; i++) {
    let currentKey = keys[i];
    let currentRules = newGrammar[currentKey];

    for (let j = 0; j < i; j++) {
      let otherKey = keys[j];
      let otherRules = newGrammar[otherKey];
      let newRules = [];

      for (let rule of currentRules) {
        if (rule[0] === otherKey) {
          for (let otherRule of otherRules) {
            newRules.push([...otherRule, ...rule.slice(1)]);
          }
        } else {
          newRules.push(rule);
        }
      }

      newGrammar[currentKey] = newRules;
    }

    let newRules = [];
    for (let rule of newGrammar[currentKey]) {
      if (rule[0] === currentKey) {
        let newNonTerminal = `T${i}`;
        newGrammar[newNonTerminal] = [rule.slice(1)];
        newRules.push([newNonTerminal]);
      } else {
        newRules.push(rule);
      }
    }

    newGrammar[currentKey] = newRules;
  }

  return newGrammar;
}

const chomskyGrammar = convertToChomsky(grammar);

console.log(convert_to_gnf(chomskyGrammar));
