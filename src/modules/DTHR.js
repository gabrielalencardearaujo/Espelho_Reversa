export function horaAtual() {
  let hora = new Date().getHours()
  let minutos = new Date().getMinutes()
  let segundos = new Date().getSeconds();

  (hora < 10) ? hora = `0${hora}` : '';
  (minutos < 10) ? minutos = `0${minutos}` : '';
  (segundos < 10) ? segundos = `0${segundos}` : '';

  return `${hora}:${minutos}:${segundos}`
}

export function dataAtual() {
  let dia = new Date().getDate();
  let mes = new Date().getMonth();
  let ano = new Date().getFullYear();

  (mes < 10) ? mes = `0${mes+1}` : mes;

  return [dia, mes, ano]
}

export const formataData = (arrayReversa) => {
  for(let chamado of arrayReversa){
    chamado[2] = decimalToDate(chamado[2])
    chamado[5] = decimalToDate(chamado[5])
    chamado[20] = decimalToDate(chamado[20])
    chamado[22] = decimalToDate(chamado[22])
    chamado[23] = contagemDiasEmCampo(chamado[5])
  }

  return arrayReversa
}

export const decimalToDate = (valor) => {
  if(typeof valor == 'number'){
    let dateValue = new Date((valor - 25569) * 86400 * 1000);

    let dia = dateValue.getDate();
    let mes = dateValue.getMonth() + 1; // Os meses são indexados a partir de zero
    let ano = dateValue.getFullYear();
    let hora = dateValue.getHours() + 3; //Ajustar o fuso horario internacional
    let minuto = dateValue.getMinutes();

    (dia < 10) ? dia = '0' + dia : dia;
    (mes < 10) ? mes = '0' + mes : mes;
    (hora < 10) ? hora = '0' + hora : hora;
    (minuto < 10) ? minuto = '0' + minuto : minuto;

    const dataFormatada = `${dia}/${mes}/${ano} - ${hora}:${minuto}`;

    return dataFormatada;
  }

  return valor
}

export const contagemDiasEmCampo = (data2) => {
  if(data2){
    let dataHoje = dataAtual()
    let data1 = `${dataHoje[0]}/${dataHoje[1]}/${dataHoje[2]}`

    let partesData1 = data1.split('/');
    let partesData2;

    (data2.includes('-')) ? partesData2 = data2.split('-') : partesData2 = data2.split(' ');

    partesData2.pop();

    partesData2 = partesData2.join().trim().split('/');
    
    let data1Obj = new Date(partesData1[2], partesData1[1] - 1, partesData1[0]);
    let data2Obj = new Date(partesData2[2], partesData2[1] - 1, partesData2[0]);

    let diferencaTempo = Math.abs(data2Obj - data1Obj);
    let diferencaDias = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));
    
    return diferencaDias;
  }
}
