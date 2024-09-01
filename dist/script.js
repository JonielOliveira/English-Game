"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
//------------------------------------------------------------------
// Constantes para criar vínculo com os elementos HTML da página
//------------------------------------------------------------------
var buttonsSend;
var buttonsAudio;
var textInputWord;
var textInputTranslation;
var roundIndicator;
//------------------------------------------------------------------
// Variáveis da aplicação
//------------------------------------------------------------------
let usedNumbers = [];
let allWords = [];
let words = [];
let allTranslations = [];
let translations = [];
let responses = [];
let acertos = [];
let rodadas = [];
let rodadasExtends = [];
let round = 0;
let qtdRound = 0;
let maxRound = 0;
//------------------------------------------------------------------
// Função para INICIAR a aplicação.
// Aguarda o carregamento do DOM antes dos procedimentos iniciais
//------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => __awaiter(void 0, void 0, void 0, function* () {
    allWords = yield loadFileTxt("words");
    allTranslations = yield loadFileTxt("translations");
    maxRound = Math.floor(allWords.length / 3);
    createStartScreen(1, maxRound);
    // inserirQuestoes(qtdRound);
    // ocultarTodasQuestoes();
    // assignButtonEvents(rodadasExtends);
    // shiftRound(1);
}));
function startGame() {
    responses = iniciarResponses(qtdRound);
    rodadas = getRandomNumbersInRange(0, maxRound - 1);
    rodadas.splice(qtdRound, maxRound - qtdRound);
    rodadasExtends = expandirLista(rodadas, 3);
    console.log(qtdRound);
    removeStartScreen();
    inserirQuestoes(qtdRound);
    ocultarTodasQuestoes();
    assignButtonEvents(rodadasExtends);
    shiftRound(1);
}
//------------------------------------------------------------------
// Função para carregar os dados de entrada via .txt
// Caso não consiga carregar o arquivo, lê os dados via JSON
// inserido na página HTML
//------------------------------------------------------------------
function loadFileTxt(fileName) {
    return __awaiter(this, void 0, void 0, function* () {
        let matriz = [];
        try {
            const response = yield fetch(`./assets/data/texts/${fileName}.txt`);
            if (response.ok) {
                const content = yield response.text();
                let linhas = content.split('\n').map(linha => linha.trim());
                let elementosLinha = [];
                linhas.forEach((linha, index) => {
                    elementosLinha = linha.split(',').map(e => e.trim());
                    matriz.push(elementosLinha);
                });
                console.log('Arquivo carregado com sucesso!');
            }
        }
        catch (error) {
            const dataElement = document.getElementById('data');
            if (dataElement && dataElement.textContent) {
                const dataInput = JSON.parse(dataElement.textContent);
                if (fileName == "words") {
                    matriz = dataInput.words;
                }
                else if (fileName == "translations") {
                    matriz = dataInput.translations;
                }
            }
            console.error('Erro ao carregar o arquivo! Usando dados da página HTML.');
        }
        return matriz;
    });
}
//------------------------------------------------------------------
// Função para associar eventos aos botões.
//------------------------------------------------------------------
function assignButtonEvents(rodadasExtends) {
    buttonsSend = document.querySelectorAll(".send-button");
    buttonsAudio = document.querySelectorAll(".audio-button");
    textInputWord = document.querySelectorAll(".text-input-w");
    textInputTranslation = document.querySelectorAll(".text-input-t");
    roundIndicator = document.getElementById('round-indicator');
    buttonsAudio.forEach((button, index) => {
        button.addEventListener("click", () => playAudio(allWords[rodadasExtends[index]][0]));
    });
    buttonsSend.forEach((button, index) => {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            checkAnswer(textInputWord[index], allWords[rodadasExtends[index]], textInputTranslation[index], allTranslations[rodadasExtends[index]], button, index);
        });
    });
}
//------------------------------------------------------------------
// Função que executa o áudio da palavra
//------------------------------------------------------------------
function playAudio(word) {
    const audio = new Audio(`./assets/data/audios/gtts/${word}.mp3`);
    audio.play();
}
//------------------------------------------------------------------
// Função que executa o áudio do sistema
//------------------------------------------------------------------
function playAudioSys(word) {
    const audio = new Audio(`./assets/data/audios/system/${word}.mp3`);
    audio.play();
}
//------------------------------------------------------------------
// Função que executa os áudios das palavras em sequência 
//------------------------------------------------------------------
function playWordsSequentially(words) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const word of words) {
            playAudio(word[0]);
            yield new Promise(resolve => setTimeout(resolve, 1000));
        }
    });
}
//------------------------------------------------------------------
// Função que verifica se as palavras digitas estão corretas
//------------------------------------------------------------------
function checkAnswer(textInputWord, correctWord, textInputTranslation, correctTranslation, button, index) {
    let userWord = textInputWord.value;
    let userTranslation = textInputTranslation.value;
    let question1 = correctWord.indexOf(userWord.toLowerCase()) !== -1;
    let question2 = correctTranslation.indexOf(userTranslation.toLowerCase()) !== -1;
    let group = Math.floor(index / 3);
    let i = index % 3;
    if (question1 && question2) {
        responses[group][i] = true;
        console.log(`${group} - ${i}: true, Index: ${index}, qtdRound: ${qtdRound}`);
        button.textContent = correctWord[0];
        button.classList.remove('correct-btn', 'incorrect-btn');
        button.classList.add('correct-btn');
        textInputWord.classList.remove('correct-txt', 'incorrect-txt');
        textInputWord.classList.add('correct-txt');
        textInputTranslation.classList.remove('correct-txt', 'incorrect-txt');
        textInputTranslation.classList.add('correct-txt');
        playAudioSys("correct");
        if (responses[group].every(r => r === true)) {
            playWordsSequentially(words);
            if (round < qtdRound) {
                setTimeout(() => nextRound(), 2000);
            }
            else {
                showCongratulations();
            }
        }
    }
    else if (question1) {
        responses[group][i] = false;
        button.textContent = "";
        button.classList.remove('correct-btn', 'incorrect-btn');
        button.classList.add('incorrect-btn');
        textInputWord.classList.remove('correct-txt', 'incorrect-txt');
        textInputWord.classList.add('correct-txt');
        textInputTranslation.classList.remove('correct-txt', 'incorrect-txt');
        textInputTranslation.classList.add('incorrect-txt');
        playAudioSys("error");
    }
    else if (question2) {
        responses[group][i] = false;
        button.textContent = "";
        button.classList.remove('correct-btn', 'incorrect-btn');
        button.classList.add('incorrect-btn');
        textInputWord.classList.remove('correct-txt', 'incorrect-txt');
        textInputWord.classList.add('incorrect-txt');
        textInputTranslation.classList.remove('correct-txt', 'incorrect-txt');
        textInputTranslation.classList.add('correct-txt');
        playAudioSys("error");
    }
    else {
        responses[group][i] = false;
        button.textContent = "";
        button.classList.remove('correct-btn', 'incorrect-btn');
        button.classList.add('incorrect-btn');
        textInputWord.classList.remove('correct-txt', 'incorrect-txt');
        textInputWord.classList.add('incorrect-txt');
        textInputTranslation.classList.remove('correct-txt', 'incorrect-txt');
        textInputTranslation.classList.add('incorrect-txt');
        playAudioSys("error");
    }
}
//------------------------------------------------------------------
// Função que gera uma lista de números aleatórios dentro do
// intervalo definido
//------------------------------------------------------------------
function getRandomNumbersInRange(minNumber, maxNumber) {
    let numerosSorteados = [];
    let min = minNumber;
    let max = maxNumber;
    if (minNumber == maxNumber) {
        numerosSorteados.push(minNumber);
        return numerosSorteados;
    }
    else if (minNumber > maxNumber) {
        min = maxNumber;
        max = minNumber;
    }
    let numerosNaoSorteados = [];
    for (let i = min; i <= max; i++) {
        numerosNaoSorteados.push(i);
    }
    let n = max - min;
    let index;
    let sorteado;
    for (let i = min; i <= max; i++) {
        index = getRandomNumberInRange(0, n - i);
        sorteado = numerosNaoSorteados[index];
        numerosSorteados.push(sorteado);
        numerosNaoSorteados.splice(index, 1);
    }
    return numerosSorteados;
}
//------------------------------------------------------------------
// Função que gera um número aleatório dentro de um intervalo
//------------------------------------------------------------------
function getRandomNumberInRange(minNumber, maxNumber) {
    let min = minNumber;
    let max = maxNumber;
    if (minNumber == maxNumber) {
        return minNumber;
    }
    else if (minNumber > maxNumber) {
        min = maxNumber;
        max = minNumber;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
//------------------------------------------------------------------
// Função para carregar uma nova rodada
//------------------------------------------------------------------
function shiftRound(step) {
    if (1 <= (round + step) && (round + step) <= qtdRound) {
        if (!((round == 1 && step < 0) || (round == qtdRound && step > 0))) {
            ocultarQuestao(1 + (round - 1) * 3);
            ocultarQuestao(2 + (round - 1) * 3);
            ocultarQuestao(3 + (round - 1) * 3);
        }
        round = round + step;
        let n = rodadas[round - 1];
        words = [allWords[0 + n * 3], allWords[1 + n * 3], allWords[2 + n * 3]];
        translations = [allTranslations[0 + n * 3], allTranslations[1 + n * 3], allTranslations[2 + n * 3]];
        exibirQuestao(1 + (round - 1) * 3);
        exibirQuestao(2 + (round - 1) * 3);
        exibirQuestao(3 + (round - 1) * 3);
        for (let i = 0; i < words.length; i++) {
            if (i == 0) {
                buttonsAudio[i].focus();
            }
            // buttonsSend[i].textContent= "";
            // responses[i] = false;
            // textInputWord[i].value = "";
            // textInputTranslation[i].value = "";
            // textInputWord[i].classList.remove('correct-txt', 'incorrect-txt');
            // textInputTranslation[i].classList.remove('correct-txt', 'incorrect-txt');
            // buttonsSend[i].classList.remove('correct-btn', 'incorrect-btn');
        }
        roundIndicator.textContent = `Rodada: ${round} / ${qtdRound}`;
    }
}
// Função para exibir a mensagem de parabéns ao usuário
function showCongratulations() {
    // Remover os elementos de entrada e botões da página
    const formElements = document.querySelectorAll('.container');
    formElements.forEach(element => {
        element.remove();
    });
    const congratsMessage = document.createElement('div');
    congratsMessage.className = 'container';
    congratsMessage.innerHTML = `
    <h1 class="title">Parabéns!</h2>
    <p>Você completou todas as rodadas!</p>
    <button class="send-button" id="restart-btn">Recomeçar</button>
  `;
    // Localizar o contêiner onde a mensagem será inserida
    const container = document.querySelector('.container-row');
    // Adicionar a mensagem de parabéns à página
    if (container) {
        container.appendChild(congratsMessage);
    }
    // Adicionar evento ao botão de recomeço
    const restartBtn = document.getElementById('restart-btn');
    restartBtn === null || restartBtn === void 0 ? void 0 : restartBtn.addEventListener('click', () => {
        location.reload(); // Recarregar a página para reiniciar o jogo
    });
}
function inserirQuestoes(quantidade) {
    let container = document.querySelector('.container-row');
    if (container) {
        for (let i = 0; i < quantidade; i++) {
            let titulos = ["Infinitive", "Past Simple", "Past Participle"];
            for (let j = 1; j <= 3; j++) {
                let question = document.createElement('div');
                question.className = 'container';
                question.id = `cont${i * 3 + j}`;
                question.innerHTML = `
          <h2 class="title">${titulos[j - 1]}</h2>
          <button class="audio-button" id="button-a-${i * 3 + j}"><img src="./assets/data/icons/audio.svg" alt="Icon Audio" class="icon-svg"></button>
          <form id="form${i * 3 + j}" autocomplete="off">
            <input class="text-input-w" type="text" id="word${i * 3 + j}" placeholder="word" required>
            <input class="text-input-t" type="text" id="translation${i * 3 + j}" placeholder="translation" required>
            <button class="send-button" id="button-s-${i * 3 + j}"></button>
          </form>
        `;
                container.appendChild(question);
            }
        }
    }
}
function expandirLista(rodadas, fator) {
    let lista = [];
    rodadas.forEach((n) => {
        for (let i = 0; i < fator; i++) {
            lista.push(n * fator + i);
        }
    });
    return lista;
}
// Ocultar o elemento
function ocultarTodasQuestoes() {
    const containers = document.querySelectorAll(".container");
    containers.forEach((c) => {
        if (c) {
            c.style.display = 'none';
        }
    });
}
function exibirQuestao(n) {
    let questao = document.getElementById(`cont${n}`);
    if (questao) {
        questao.style.display = 'block';
    }
}
function ocultarQuestao(n) {
    let questao = document.getElementById(`cont${n}`);
    if (questao) {
        questao.style.display = 'none';
    }
}
function iniciarResponses(quantidade) {
    let matriz = [];
    for (let i = 0; i < quantidade; i++) {
        matriz.push([false, false, false]);
    }
    return matriz;
}
function nextRound() {
    shiftRound(1);
}
function previousRound() {
    shiftRound(-1);
}
function createStartScreen(min, max) {
    let container = document.querySelector('.container-row');
    let startScreen = document.createElement('div');
    startScreen.className = 'container';
    startScreen.id = 'initial-screen';
    startScreen.innerHTML = `
    <h1 class="title">Escolha o número de rodadas</h1>
    <form id="start-form" autocomplete="off">
      <label for="num-rounds">Número de Rodadas:</label>
      <input type="number" id="num-rounds" name="num-rounds" min="${min}" max="${max}" required>
      <button class="send-button" id="start-button">Iniciar</button>
    </form>
  `;
    if (container) {
        container.appendChild(startScreen);
    }
    const startButton = document.getElementById('start-button');
    const numRoundsInput = document.getElementById('num-rounds');
    startButton.addEventListener('click', (event) => __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        let numRounds = parseInt(numRoundsInput.value);
        let num = 0;
        if (isNaN(numRounds)) {
            num = max;
        }
        else if (numRounds > max) {
            num = max;
        }
        else if (numRounds < min) {
            num = min;
        }
        else {
            num = numRounds;
        }
        qtdRound = num;
        startGame();
    }));
}
function removeStartScreen() {
    let startScreen = document.getElementById('initial-screen');
    if (startScreen) {
        startScreen.remove();
    }
}
