// import 'core-js/stable';
import 'regenerator-runtime/runtime';
import './assets/css/estilo-geral.css';
import './assets/css/estilo-DataBase.css';
import './assets/css/estilo-impressao.css';
import * as Middleware from './modules/middleware.js';
import * as ShowInPage from './modules/showinpage.js';
import * as ModelDB from './modules/ModelDB.js';
import * as DTHR from './modules/DTHR.js';

const location = window.location.pathname
console.log(location)
const inputNumeroOS = document.querySelector('.codigo') //Input NumeroOS
const iconTheme = document.getElementById('theme')
const elementTable = document.querySelector('#tableBody') //Seleciona toda a tabela 
const logoSafra = document.getElementById('logoSafra')

iconTheme.addEventListener('click', ShowInPage.changeTheme) //Altera cores temas.
Middleware.setTheme()
Middleware.getLocalStorageSize()
console.log("Tamanho ocupado no localStorage: " + Middleware.getLocalStorageSize() + " MB"); //Armarzenamento do localstorage ocupado

if (location.includes('index')) {
  const inputUploadFile = document.getElementById('upload_costum')
  const selectElementoTecnicos = document.querySelector('.nomeTecnico') //Select tecnicos
  const checkbox = document.querySelector('#ireverterOS')

  //Evento de captura do arquivo .xlsx e converter para array em JS:
  inputUploadFile.addEventListener('change', (event) => {
    // Excel to Array:
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }, { raw: false, });
      
      console.log(sheetData)
      Middleware.pendenteLocalStorage(sheetData);
    };
    reader.readAsBinaryString(file);

  }, false)

  Middleware.criaBaseDados() //Verifica/Cria uma base de dados.

  const tecnicosEmAtendimento = Middleware.searchThingsInPendente('allTecnicos') //Pesquisa por Tecnicos em atendimento\  
  ShowInPage.mostraNomesTecnicos(tecnicosEmAtendimento, selectElementoTecnicos) //Mostra nome dos tecnicos no select

  //Evento de escolha do tecnico (input Select)
  selectElementoTecnicos.addEventListener('change', (e) => {
    Middleware.mostraReversa(e); //Mostra todos os chamados do tecnico
    (e.target.value !== ' ') ? document.querySelector('.box-input-upload').style.display = 'none' : document.querySelector('.box-input-upload').style.display = 'block';
    inputNumeroOS.focus()
  })

  //Evento ao bipar OS:
  inputNumeroOS.addEventListener('keyup', mostraAtendimentos) 
  function mostraAtendimentos(e) {

    if (e.keyCode == 13 && !checkbox.checked) {
      const lineFound = Middleware.searchOS(inputNumeroOS.value.toUpperCase().trim(), selectElementoTecnicos.value, true);
      ShowInPage.preBaixaInputOS(lineFound, inputNumeroOS);
      (lineFound) ? ShowInPage.markLine(lineFound) : '';
      inputNumeroOS.value = ''
    }else if(e.keyCode == 13 && checkbox.checked){
      const lineFound = Middleware.searchOS(inputNumeroOS.value.toUpperCase().trim(), selectElementoTecnicos.value, false);
      (lineFound) ? ShowInPage.markLine(lineFound) : '';
      inputNumeroOS.value = ''
    }
  }

  //Evento Imprimir Pagina:
  const btnPrint = document.querySelector('.imprimir')
  btnPrint.addEventListener('click', () => {
    Middleware.saveChamado(selectElementoTecnicos.value)
    ShowInPage.markLine(0)
    window.print()
  })

  //###############################################################
  // Sessao de eventos referente as Mensagens de Erros:
  document.getElementById('btn_close_error').addEventListener('click', (e) => {
    e.target.parentElement.style.display = 'none'
    inputNumeroOS.focus()
  })

  const preBaixa = document.querySelectorAll('#baixa');
  preBaixa.forEach( element => {
    element.addEventListener('click', e => {
      if(e.target.textContent == 'Pré-Cancelamento'){
        ShowInPage.atualizaContador('Cancelado')
      } else if(e.target.textContent == 'Pré-Agendamento'){
        ShowInPage.atualizaContador('Agendado')
      } else{
        ShowInPage.atualizaContador('Encerrado')
      }
    })
  })

} else if (location.includes('database')) {
  Middleware.criaBaseDados() //Cria ou recebe banco de dados.
  document.querySelector('.data').innerHTML = `${DTHR.dataAtual()[0]}/${DTHR.dataAtual()[1]}/${DTHR.dataAtual()[2]}`;
  const baseDados = ModelDB.getDataBase()
  const btnDeleteOS = document.getElementById('deleteOS')

  logoSafra.addEventListener('click', e => {
    console.log(JSON.stringify(baseDados))
  })

  btnDeleteOS.addEventListener('click', (e) => {
    Middleware.removeOS(elementTable)
  })

  // for(let i = 0; i < 1000; i++){
  //   const dados = []
  //   const data = DTHR.dataAtual()
  //   dados[0] = '21432432' //Numero OS
  //   dados[1] = 'DESINSTALACAO DIGITAL' //Tipo de Serviço
  //   dados[2] = '21/12/30' //DTHR Saida a Campo
  //   dados[3] = 'PRE-ENCERRAMENTO' //Pre-Baixa
  //   dados[4] = `${data[0]}/${data[1]}/${data[2]}`
  //   dados[5] = 'TCEXPRESS - MARCO AURELIO DA SILVA SANTOS'
  //   baseDados.push(dados)
  // }
  // ModelDB.setDataBase(baseDados)
  
  Middleware.mostrarTudoBaseDeDados(elementTable, baseDados)
  
  inputNumeroOS.addEventListener('keyup', e => Middleware.pesquisaBancoDeDados(e.target.value, elementTable))
}
