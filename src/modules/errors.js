import * as ShowInPage from './showinpage.js';

export const verificaDivergencia = (OS, Pendente) => {
  for (let element of Pendente) {
    if (element[1] == OS && (element[8] && (element[21] == 'PRE-AGENDAMENTO' || element[21] == 'PRE-CANCELAMENTO'))) {
      (element[21] == 'PRE-CANCELAMENTO') ? ShowInPage.baixaDivergente('C/E', OS) : ShowInPage.baixaDivergente('A/E', OS);
    }

    if((element[1] == OS && element[23] == 'POS' && element[21] == 'PRE-ENCERRAMENTO' && !element[20]) && ((element[3].includes('INSTALAÇÃO') && !element[3].includes('DES')) || element[3].includes('MANUTENÇÃO'))){
      ShowInPage.terminalNaoAtivado(OS)
    }
  };
}