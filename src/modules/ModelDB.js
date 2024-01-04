import * as ShowInPage from '../modules/showinpage.js'

export const getDataBase = () => {
  let dataBase = localStorage.getItem('Banco_de_Dados');
  (dataBase) ? dataBase = JSON.parse(dataBase) : dataBase = null;
  return dataBase
}

export const setDataBase = (array) => {
  const json = JSON.stringify(array)
  localStorage.setItem('Banco_de_Dados', json)
}

export const pesquisaChamado = (OS, elementTable) => {
  const baseDados = getDataBase()
  elementTable.innerHTML = ''

  if(OS != ''){
    for (let i = 1; i < baseDados.length; i++) {
      if (baseDados[i][0].includes(OS)){
        ShowInPage.mostraChamadosBancodeDados(baseDados[i], elementTable)
      }else if(baseDados[i][5].includes(OS.toUpperCase())){
        ShowInPage.mostraChamadosBancodeDados(baseDados[i], elementTable)
      } else if(baseDados[i][4].includes(OS)) {
        ShowInPage.mostraChamadosBancodeDados(baseDados[i], elementTable)
      }
    };
  }

  (!elementTable.innerHTML == '') ? ShowInPage.nenhumChamadoEncontrado(false) : ShowInPage.nenhumChamadoEncontrado(true)
}

//Remover Duplicidades:
export const removerDuplicidades = (array) => {
  const uniqueArray = [...new Set(array)];

  return uniqueArray;
}

//Deletar OS:
export const deletarOS = (OS) => {
  const baseDados = getDataBase()

  for(let index in baseDados){
    if(baseDados[index][0] == OS){
      baseDados.splice(index, 1)
      setDataBase(baseDados)
    }
  }
}
