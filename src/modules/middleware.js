import * as ModelPendente from './ModelPendente.js';
import * as ModelDB from './ModelDB.js';
import * as DTHR from './DTHR.js';
import * as ShowInPage from './showinpage.js';
import * as Errors from './errors.js'

const dataAtual = DTHR.dataAtual()
const horaAtual = DTHR.horaAtual()

//Verifica se o pendente geral existe, se nao exister ele cria um novo:
export const pendenteLocalStorage = (sheetData) => {
  if (sheetData) {
    const formataArrayPendente = ModelPendente.pesquisaAtendimentosDoTecnico(sheetData)
    ModelPendente.createPendenteJSON(formataArrayPendente, dataAtual)
    location.reload()
  }
}

//#######################################################################################
//Gerenciamento de Consultas no Pendente Geral:
export const searchThingsInPendente = (value, tecnico, booleanValue) => {
  switch (value) {
    case "allTecnicos":
      return removeDuplicates(ModelPendente.pesquisaTecnicos(ModelPendente.recebePendenteAtual()))?.sort()
      break;
    case "singleTecnico":
      return ModelPendente.buscarReversa(ModelPendente.recebePendenteAtual(), tecnico)
      break;
    case "atualizaStatus":
      return ModelPendente.atualizaStatus(ModelPendente.recebePendenteAtual(), tecnico, booleanValue)
  }
}
//#######################################################################################

//Gerencia chamados por tecnico:
export const mostraReversa = (e) => {
  const divTable = document.querySelector('#tableBody')
  const DataBase = ModelDB.getDataBase()
  const informacoesTecnicoReversa = searchThingsInPendente('singleTecnico', e.target.value) //Retorna todas as informacoes de cada Chamado em um array.

  const formataInformacoes = organizarArray(DTHR.formataData(informacoesTecnicoReversa))

  const contadores = ModelPendente.contadorPreBaixas(informacoesTecnicoReversa, DataBase)
  ShowInPage.mostrarContadores(contadores);

  ShowInPage.mostrarAtendimentosTecnico(formataInformacoes, divTable, DataBase) //Exibi as informacoes na tela
}


function organizarArray(arrays) {
  //Ordena o array pela ordem: agendamento, cancelamento, encerramento, vazio (sem baixa).
  arrays.sort((a, b) => {
    const order = {
      'PRE-AGENDAMENTO': 0,
      'PRE-CANCELAMENTO': 1,
      'PRE-ENCERRAMENTO': 2,
      null: 3
    };

    const valueA = a[21];
    const valueB = b[21];

    return order[valueA] - order[valueB];
  });
  return arrays;
}



//Remove nomes duplicados:
function removeDuplicates(array) {
  return array?.filter((item, index) => {
    return array.indexOf(item) === index;
  });
}

//FUNCAO REFERENTE AO EVENTO DE "BIPAR OS":
export const searchOS = (OS, tecnico, value) => {
  const pendente = ModelPendente.recebePendenteAtual()
  const chamadoEncontrado = ModelPendente.consultaReversa(pendente, OS, tecnico)

  if (chamadoEncontrado) {
    searchThingsInPendente("atualizaStatus", chamadoEncontrado, value)
    Errors.verificaDivergencia(OS, ModelPendente.recebePendenteAtual());
    ShowInPage.statusDevolvido(chamadoEncontrado[1], value);
    return chamadoEncontrado
  } else {
    ShowInPage.osNaoEncontrada(OS)//Erro OS nao encontrada.
  }
}

export const setTheme = () => {
  const baseDados = ModelDB.getDataBase()
  const iconTheme = document.querySelector('#theme')
  if (baseDados) {
    if (baseDados[0][0] == 'theme-dark') {
      iconTheme.classList.remove('fa-moon')
      iconTheme.classList.add('fa-sun')
      iconTheme.classList.remove('light')
      iconTheme.classList.add('dark')
      document.documentElement.style.setProperty('--color-chatGPT', '#181818')
      document.documentElement.style.setProperty('--color-light', '#eeeeee')
    } else if (baseDados[0][0] == 'theme-light') {
      iconTheme.classList.remove('fa-sun')
      iconTheme.classList.add('fa-moon')
      iconTheme.classList.remove('dark')
      iconTheme.classList.add('light')
      document.documentElement.style.setProperty('--color-chatGPT', '#eeeeee') //Altera o :root
      document.documentElement.style.setProperty('--color-light', '#181818') //Altera o :root
    }
  }
}

//Verifica tamanho ocupado no LocalStorage:
export const getLocalStorageSize = () => {
  let totalBytes = 0;
  // Verifica cada chave no localStorage:
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      // Obtém o tamanho do valor da chave atual:
      const bytes = localStorage[key].length * 2;
      totalBytes += bytes;
    }
  }
  // Converte bytes para megabytes:
  const totalMegabytes = (totalBytes / (1024 * 1024)).toFixed(2);
  return totalMegabytes;
}

//######################################################################################
//################################### BANCO DE DADOS ###################################
//######################################################################################
export const criaBaseDados = () => {
  let dataBase = ModelDB.getDataBase()
  if (dataBase) {
    return dataBase
  } else {
    dataBase = [['theme']];
    ModelDB.setDataBase(dataBase);
  }
}

export const mostrarTudoBaseDeDados = (elementTable, baseDados) => {
  if (baseDados) {
    for (let i = 1; i < baseDados.length; i++) {
      ShowInPage.mostraChamadosBancodeDados(baseDados[i], elementTable)
    }
  } else {
    ShowInPage.nenhumChamadoEncontrado(elementTable)
  }
}

export const pesquisaBancoDeDados = (OS, elementTable) => {
  ModelDB.pesquisaChamado(OS, elementTable)
}

//Salvar OS bipada no Banco de Dados:
export const saveChamado = (tecnico) => {
  let baseDados = ModelDB.getDataBase()
  const pendenteAtual = ModelPendente.recebePendenteAtual()
  const data = DTHR.dataAtual()

  pendenteAtual.forEach(value => {
    const dados = []
    if (value[4] == tecnico && value[25] == true) {
      dados[0] = value[1].toString() //Numero OS
      dados[1] = value[3] //Tipo de Serviço
      dados[2] = DTHR.decimalToDate(value[5]); //DTHR Saida a Campo
      (value[21]) ? dados[3] = value[21] : dados[3] = 'SEM BAIXA'; //Pre-Baixa
      dados[4] = `${data[0]}/${data[1]}/${data[2]}` //Data devolucao
      dados[5] = value[4] //Nome do tecnico

      const indexChamadoEncontradoDB = baseDados.find( chamado => value[1].toString() == chamado[0]);
      console.log(indexChamadoEncontradoDB)
  
      if (!indexChamadoEncontradoDB) baseDados.push(dados);
    }
  });

  baseDados = ModelDB.removerDuplicidades(baseDados)
  ModelDB.setDataBase(baseDados)
}

//Remove OS do banco de dados
export const removeOS = (elementTable) => { 
  const checkbox = elementTable.querySelectorAll('#icheckbox')
  const pendente = ModelPendente.recebePendenteAtual()
  let OS;

  for(let check of checkbox) {
    if(check.checked){
      ModelDB.deletarOS(check.parentElement.nextElementSibling.textContent)
      OS = check.parentElement.nextElementSibling.textContent
    }
  }

  pendente.forEach(value => {
    if(value[1] == OS) {
      value[25] = false;
    }
  })

  ModelPendente.createPendenteJSON(pendente)
  location.reload()
}