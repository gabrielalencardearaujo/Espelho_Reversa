import * as ModelDB from './ModelDB.js';
import * as ModelPendente from './ModelPendente.js';

export const mostraNomesTecnicos = (tecnicos, selectElementoTecnicos) => {
  tecnicos.forEach(tec => {
    selectElementoTecnicos.innerHTML += `
    <option value="${tec}">${tec}</option>
    `
  })
}

// ######################################################################################
//Mostra todos os chamados do tecnico na tabela:
export const mostrarAtendimentosTecnico = (infoAtendimentos, divTable, DataBase) => {
  divTable.innerHTML = '';
  const chamadosQueSeraoMostradosNaTela = []
  
  infoAtendimentos.forEach(value => {
    let numeroEND;
    let complementoEND;
    let servico;
    let baixa;

    const chamadoBipadoAnteriormente = DataBase.find(valueDB => valueDB[0] == value[1] && value[5] == valueDB[2]);
    
    if (!chamadoBipadoAnteriormente) {
      
      chamadosQueSeraoMostradosNaTela.push(value);

      (value[13]) ? numeroEND = ', ' + value[13] : numeroEND = '';
      (value[14]) ? complementoEND = ' - ' + value[14] : complementoEND = '';
      (value[14] == "-") ? complementoEND = '' : '';

      if (value[3].includes("PEDIDO DE SUPRIMENTOS")) servico = ``;
      if (value[3].includes("TROCA DE SIMCARD")) servico = ``;

      if (value[3].includes("DESINSTALAÇÃO")) {
        servico = `
        <span class="tooltiptext w-300">
          Retirar: ${value[19]}
        </span>
      `
      } else if (value[3].includes("INSTALAÇÃO")) {
        servico = `
        <span class="tooltiptext w-300">
          Instalar: ${value[17]}
        </span
      `
      }

      if (value[3].includes("MANUTENÇÃO")) {
        servico = `
        <span class="tooltiptext w-300">
          Instalar: ${value[17]}<br>Retirar: ${value[19]}
        </span>
      `
      }

      if (value[3].includes("TROCA DE TECNOLOGIA")) {
        servico = `
        <span class="tooltiptext w-300">
          Instalar: ${value[17]}<br>Retirar: ${value[19]}
        </span>
      `
      }

      if (value[21] == "PRE-CANCELAMENTO") {
        baixa = `
      <div class="pre_baixa cancelamento ttp">CANCELAMENTO
        <span class="tooltiptext w-400">
          DTHR: ${value[20]} <br>
          Motivo: ${value[6]}
        </span></div>
      `
      } else if (value[21] == "PRE-AGENDAMENTO") {
        baixa = `
      <div class="pre_baixa agendamento ttp">AGENDAMENTO
        <span class="tooltiptext w-300">
          DTHR: ${value[20]} <br>
          Motivo: ${value[7]}
        </span></div>
      `
      } else if (value[21] == "PRE-ENCERRAMENTO") {
        baixa = `
      <div class="pre_baixa encerramento ttp">ENCERRAMENTO
        <span class="tooltiptext w-200">
          DTHR: ${value[20]} <br>
        </span></div>
      `
      } else {
        baixa = `
      <div class="pre_baixa nao_atendida ttp">SEM BAIXA
        <span class="tooltiptext w-200">
          DTHR: ${value[20]} <br>
        </span></div>
      `
      };

      (!(value[8] == null)) ? value[8] = `<i class="fa-solid fa-check"></i>` : value[8] = `<i class="fa-solid fa-xmark"></i>`;
      (value[22]) ? value[22] = `<span class="tooltiptext w-200">${value[22]}</span>` : value[22] = '';
      (value[25]) ? value[25] = 'DEVOLVIDO' : value[25] = '';

      divTable.innerHTML += `
        <tr class="text-center chamado" id="${value[1]}">
                <td></td>
                <td id="number_OS">
                  <div class="ttp">${value[1]}
                    <span class="tooltiptext w-200">
                      EC: ${value[10]} <br>
                      OS. Referência: ${value[18]}
                    </span>
                  </div>
                </td>
                <td id="data_saida_campo">
                  <div class="ttp">${value[5]}
                    <span class="tooltiptext w-300">
                      DTHR VENCIMENTO: ${value[2]}
                    </span>
                  </div>
                </td>
                <td id="number_saida_campo">${value[23]}</td>
                <td id="razao_social">
                  <div class="ttp">${value[11]}
                    <span class="tooltiptext w-400">
                      ${value[12]}${numeroEND}${complementoEND}<br>
                      BAIRRO: ${value[15]} <br>
                      CEP: ${value[9]}
                    </span>
                  </div>
                </td>
                <td id="tipo_servico">
                  <div class="ttp">${value[3]}
                  ${servico}
                  </div>
                </td>
                <td>
                  ${baixa}
                </td>
                <td>
                  <div class="ttp">${value[8]}
                    ${value[22]}
                  </div>
                </td>
                <td style="min-width:160px;"><span class="fs-6" id="devolucao">${value[25]}</span></td>
              </tr>
        `
    }
  })
}
// ######################################################################################

export const statusDevolvido = (OS, value) => {
  const rowChamado = document.getElementById(`${OS}`);
  const status = rowChamado.querySelector('#devolucao');
  const total = document.getElementById('number_total')
  const pendencias = document.getElementById('number_pendentes');

  if(value && status.textContent == '') {
    pendencias.textContent = Number(pendencias.textContent) - 1;
    status.textContent = 'DEVOLVIDO';
  } 
  
  if(!value && status.textContent == 'DEVOLVIDO'){
    pendencias.textContent = Number(pendencias.textContent) + 1
    status.textContent = '';
  }
}

//Mostra as quantidades de agendados, cancelados, encerrados, etc...
export const mostrarContadores = (contadores) => {
  document.querySelector('#number_agendamentos').textContent = contadores[0];
  document.querySelector('#number_cancelamentos').textContent = contadores[1];
  document.querySelector('#number_encerramentos').textContent = contadores[2];
  document.querySelector('#number_NA').textContent = contadores[3];
  document.querySelector('#number_pendentes').textContent = contadores[4];
  document.querySelector('#number_total').textContent = contadores[7];
  document.getElementById('number_991').textContent = contadores[5] + '%';
  document.getElementById('number_LS').textContent = contadores[6] + '%';
}
//Destaca a ultima OS bipada
export const markLine = (lineFound) => {
  const allLines = document.querySelectorAll(`.chamado`)

  for (let line of allLines) {
    if (lineFound && line.id == `${lineFound[1]}`) {
      const lineSelect = document.getElementById(`${line.id}`)
      if (lineSelect.previousElementSibling) lineSelect.previousElementSibling.setAttribute('style', 'border-bottom: 2px solid orange;');
      lineSelect.setAttribute('style', 'border: 2px solid orange;')
    } else {
      const lineSelect = document.getElementById(`${line.id}`)
      lineSelect.setAttribute('style', 'border: none;')
    }
  }
}

export const atualizaContador = (valor) => {
  const contadorCancelado = document.getElementById('number_cancelamentos');
  const contadorAgendado = document.getElementById('number_agendamentos');
  const contadorEncerrado = document.getElementById('number_encerramentos');

  (valor == 'Cancelado') ? contadorCancelado.textContent = Number(contadorCancelado.textContent) + 1 : '';
  (valor == 'Agendado') ? contadorAgendado.textContent = Number(contadorAgendado.textContent) + 1 : '';
  (valor == 'Encerrado') ? contadorEncerrado.textContent = Number(contadorEncerrado.textContent) + 1 : '';
  document.querySelector('.errors').style.display = 'none'
}

export const preBaixaInputOS = (lineFound, inputNumeroOS) => { 
  (lineFound && lineFound[21]) ? inputNumeroOS.setAttribute('placeholder', `${lineFound[21]}`) : inputNumeroOS.setAttribute('placeholder', `Sem Baixa`)
}

//Altera o tema da Pagina
export const changeTheme = (e) => {
  const abbrTheme = document.querySelector('abbr')
  const baseDados = ModelDB.getDataBase()

  if (e.target.classList.contains('dark')) {
    e.target.classList.remove('fa-sun')
    e.target.classList.add('fa-moon')

    abbrTheme.setAttribute('title', 'Mudar para tema dark')

    e.target.classList.remove('dark')
    e.target.classList.add('light')
    document.documentElement.style.setProperty('--color-chatGPT', '#eeeeee') //Altera o :root
    document.documentElement.style.setProperty('--color-light', '#181818') //Altera o :root

    baseDados[0][0] = 'theme-light'
    ModelDB.setDataBase(baseDados)

  } else if (e.target.classList.contains('light')) {
    e.target.classList.remove('fa-moon')
    e.target.classList.add('fa-sun')

    abbrTheme.setAttribute('title', 'Mudar para tema light')

    e.target.classList.remove('light')
    e.target.classList.add('dark')
    document.documentElement.style.setProperty('--color-chatGPT', '#181818')
    document.documentElement.style.setProperty('--color-light', '#eeeeee')

    baseDados[0][0] = 'theme-dark'
    ModelDB.setDataBase(baseDados)
  }
}

// ########################### MOSTRA CHAMADOS NO BANCO DE DADOS #################################
export const mostraChamadosBancodeDados = (chamados, elementTable) => {
  if(chamados[4]){
    elementTable.innerHTML += `
    <tr class="text-center">
      <td><input type="checkbox" name="" id="icheckbox"></td>
      <td id="${chamados[0]}">${chamados[0]}</td>
      <td id="${chamados[5]}">${chamados[5]}</td>
      <td id="${chamados[1]}">${chamados[1]}</td>
      <td id="${chamados[3]}">${chamados[3]}</td>
      <td id="${chamados[4]}">${chamados[4]}</td>
  </tr>`
  }
}

export const nenhumChamadoEncontrado = (valor) => {
  const naoEncontrado = document.getElementById('id_notFound');
  (valor) ? naoEncontrado.textContent = 'Nenhuma OS encontrada' : naoEncontrado.textContent = '';
}


// ########################### MOSTRA ERROS #################################
export const osNaoEncontrada = (OS) => {
  document.querySelector('.btn-encerramento').style.display = 'none'
  document.querySelector('.btn-cancelamento').style.display = 'none'
  document.querySelector('.btn-agendamento').style.display = 'none'

  document.querySelector('.msg-error').textContent = `
  Nenhum chamado encontrado.
  Código bipado: ${OS}
  `
  document.querySelector('.errors').style.display = 'block';
}

export const baixaDivergente = (erro, OS) => {
  document.querySelector('.msg-error').innerHTML = `
  OS com Pré-Baixas Divergente. Verifique com o técnico!<br>
  Número da OS: ${OS}`;

  (erro == 'C/E') ? document.querySelector('.btn-cancelamento').style.display = 'inline-block' : document.querySelector('.btn-agendamento').style.display = 'inline-block';

  document.querySelector('.btn-encerramento').style.display = 'inline-block'
  document.querySelector('.errors').style.display = 'block';
}

export const terminalNaoAtivado= (OS) => {
  document.querySelector('.msg-error').innerHTML = `
  Terminal não ativado!
  Número da OS: ${OS}`;

  document.querySelector('.errors').style.display = 'block';
}