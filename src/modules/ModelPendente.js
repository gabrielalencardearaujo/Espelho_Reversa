import * as DTHR  from './DTHR.js';
import * as ModelDB from './ModelDB.js';

export function converteToJSON(arrayPendenteGeral) {
  const json = JSON.stringify(arrayPendenteGeral)
  return json
}

//Resgata o Pendente Geral do localstorage
export const recebePendenteAtual = () => {
  const pendenteAtual = localStorage.getItem(`Pendente_Geral`)
  return JSON.parse(pendenteAtual)
}

export const createPendenteJSON = (sheetData) => {
  const json = JSON.stringify(sheetData);
  localStorage.setItem(`Pendente_Geral`, json)
}

//Extrai os nomes de todos os tecnicos 'Em Atendimento':
export const pesquisaTecnicos = (pendenteGeralAtual) => {
  const arrayNomes = [];
  if(pendenteGeralAtual){
    for (let value of pendenteGeralAtual) {
      arrayNomes.push(value[4])
    }
    return arrayNomes
  }
}

//Extrai todas as informacoes dos atendimentos do tecnico selecionado:
export const pesquisaAtendimentosDoTecnico = (pendenteGeralAtual) => {
  const todosOsChamados = [];
  
  for (let tec of pendenteGeralAtual) {
    console.log(tec[35])
    if(tec[8] == "EM ATENDIMENTO"){
      const informacoesOS= [];
      informacoesOS[1] = tec[1]; //Numero OS
      informacoesOS[2] = tec[5]; //DTHR Vencimento
      informacoesOS[3] = tec[9]; //Serviço
      informacoesOS[4] = tec[13]; //Nome do Tecnico
      informacoesOS[5] = tec[19]; //DTHR Saída a campo
      informacoesOS[6] = tec[23]; //Motivo Cancelamento
      informacoesOS[7] = tec[28]; //Motivo Agendamento
      informacoesOS[8] = tec[32]; //Função 991
      informacoesOS[9] = tec[35]; //CEP
      informacoesOS[10] = tec[36]; //Código E.C.
      informacoesOS[11] = tec[38]; //Razão Social
      informacoesOS[12] = tec[39]; //Endereço
      informacoesOS[13] = tec[40]; //Número Endereço
      informacoesOS[14] = tec[41]; //Complemento do Endereço
      informacoesOS[15] = tec[42]; //Bairro
      informacoesOS[16] = tec[45]; //WORKDAY
      informacoesOS[17] = tec[46]; //Serial a Instalar
      informacoesOS[18] = tec[49]; //OS Referência
      informacoesOS[19] = tec[53]; //Serial a Retirar
      informacoesOS[20] = tec[57]; //DTHR Pré-Baixa 
      informacoesOS[21] = tec[58]; // Pre-Baixa Mobile
      informacoesOS[22] = tec[31]; //DTHR funcao 991
      informacoesOS[23] = tec[10]; //Tipo de Servico
      informacoesOS[24] = 0; //Dias em campo
      informacoesOS[25] = false; // Check se foi bipado no espelho.

      todosOsChamados.push(informacoesOS)
    }
  }

  return todosOsChamados
}

export const buscarReversa = (pendente, tecnico) => {
  const arrayReversa = [];
  for(let reversa of pendente){
    if(reversa[4] == tecnico) arrayReversa.push(reversa)
  }
  return arrayReversa
}

// CONSULTAR OS:
export const consultaReversa = (reversa, OS, tecnico) => {
  return reversa.find( value => {
    if(value[4] == tecnico) {
      (value[1]) ? value[1] = value[1].toString().trim() : '';
      (value[17]) ? value[17] = value[17].toString().trim() : '';
      (value[18]) ? value[18] = value[18].toString().trim() : '';
      (value[19]) ? value[19] = value[19].toString().trim() : '';

      return value[1] == OS || value[18] == OS || value[19] == OS || value[17] == OS;
    }
  })
}

export const atualizaStatus = (chamado, tecnico, booleanValue) => {
  chamado.forEach( value => {
    if(tecnico[1] == value[1]){
      value[25] = booleanValue;
    }
  })

 createPendenteJSON(chamado)
}

//Contador de Pre-Baixas:
export const contadorPreBaixas = (arrayReversa, DataBase) => {
  const arrayContabilizar = []
  
  arrayReversa.forEach(value => {
    const chamadoBipadoAnteriormente = DataBase.find(valueDB => valueDB[0] == value[1] && value[5] == valueDB[2]);
    (!chamadoBipadoAnteriormente) ? arrayContabilizar.push(value) : '';
  });

  const contador = [0, 0, 0, 0, 0, 0, 0, 0]//[agendamento, cancelamento, encerramento, sem baixa, pendente, func 991, uso LS, total]
  const func991 = [0, 0]
  const usoLS = [0, 0]
  const bancoDados = ModelDB.getDataBase()

  for (let value of arrayContabilizar) {
    const chamadoBipado = bancoDados.find(element => {
      /*Se a OS for encontrada no banco de dados e a data saida a campo for igual,
        nao sera contabilizado.*/
      return element[0] == value[1] && element[2] == value[5]
    })

    if (!chamadoBipado) {
      if (!((value[21] == 'PRE-AGENDAMENTO' || value[21] == 'PRE-CANCELAMENTO') && value[8])) {
        (value[21] == 'PRE-AGENDAMENTO') ? contador[0]++ : ''; //Contador agendamento
        (value[21] == 'PRE-CANCELAMENTO') ? contador[1]++ : ''; //Contador cancelamento
        (value[21] == 'PRE-ENCERRAMENTO' || value[8]) ? contador[2]++ : ''; //Contador encerramento
        (!value[21] && !value[8]) ? contador[3]++ : ''; //Contador Sem Baixa

        if(value[3] == "PEDIDO DE SUPRIMENTOS" && (value[21] == 'PRE-ENCERRAMENTO' || value[8])) {
          func991[1]++; //Contando total de suprimentos atendidos
          (value[8]) ? func991[0]++ : '';
        } 

        if(value[21] || value[8]){
          usoLS[1]++; //Contando total de chamados atendidos
          (value[21]) ? usoLS[0]++ : ''; //Contando o uso do LS
        }
      }
      (!value[25]) ? contador[4]++ : '';// Contador Pendente
      contador[7]++ //Contador Total
    }
  }

  if(func991[1]){
    const porcentagem991 = (func991[0]*100)/func991[1]
    contador[5] = porcentagem991.toFixed(1)
  }

  if(usoLS[1]){
    const porcentagemLS = (usoLS[0]*100)/usoLS[1]
    contador[6] = porcentagemLS.toFixed(1)
  }

  return contador
}
