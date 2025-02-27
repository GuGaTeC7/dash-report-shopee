document.addEventListener("DOMContentLoaded", () => {
  // Configura eventos de upload para os setores "Forward Order" e "Return Order"
  setupFileUploadHandlers({
    dropArea: "drop-area-forward",
    fileInput: "file-input-forward",
    loading: "loading-forward",
    resultsTable: "results-table-forward",
    resultsBody: "#results-table-forward tbody",
    titulo: "titulo-forward",
  });

  setupFileUploadHandlers({
    dropArea: "drop-area-return",
    fileInput: "file-input-return",
    loading: "loading-return",
    resultsTable: "results-table-return",
    resultsBody: "#results-table-return tbody",
    titulo: "titulo-return",
  });

  /**
   * Configura os manipuladores de eventos para o upload de arquivos de cada setor.
   * @param {Object} config - Elementos HTML envolvidos no upload e exibição de dados.
   */
  function setupFileUploadHandlers({
    dropArea,
    fileInput,
    loading,
    resultsTable,
    resultsBody,
    titulo,
  }) {
    // Obtém referências aos elementos HTML
    const elements = {
      dropArea: document.getElementById(dropArea),
      fileInput: document.getElementById(fileInput),
      loading: document.getElementById(loading),
      resultsTable: document.getElementById(resultsTable),
      resultsBody: document.querySelector(resultsBody),
      titulo: document.getElementById(titulo),
    };

    // Clique na área de arrastar para abrir o seletor de arquivos
    elements.dropArea.addEventListener("click", () =>
      elements.fileInput.click()
    );

    // Efeito visual ao arrastar um arquivo sobre a área
    elements.dropArea.addEventListener("dragover", (event) => {
      event.preventDefault();
      elements.dropArea.classList.add("dragover");
    });

    // Remove efeito visual ao sair da área
    elements.dropArea.addEventListener("dragleave", () =>
      elements.dropArea.classList.remove("dragover")
    );

    // Lida com o evento de soltar arquivos na área
    elements.dropArea.addEventListener("drop", (event) => {
      event.preventDefault();
      elements.dropArea.classList.remove("dragover");
      processFiles(event.dataTransfer.files, elements);
    });

    // Lida com o evento de seleção de arquivos pelo input
    elements.fileInput.addEventListener("change", () =>
      processFiles(elements.fileInput.files, elements)
    );
  }

  /**
   * Processa os arquivos CSV enviados pelo usuário.
   * @param {FileList} files - Lista de arquivos enviados.
   * @param {Object} elements - Referências aos elementos da interface.
   */
  function processFiles(files, elements) {
    if (files.length === 0) return;

    // Exibe indicador de carregamento
    elements.loading.style.display = "block";
    elements.resultsBody.innerHTML = "";

    let mergedData = [];
    let processedFiles = 0;

    // Converte FileList para Array e processa cada arquivo
    Array.from(files).forEach((file) => {
      Papa.parse(file, {
        header: true, // Trata a primeira linha como cabeçalho
        skipEmptyLines: true, // Ignora linhas vazias
        complete: function (results) {
          mergedData = mergedData.concat(results.data);
          processedFiles++;

          // Quando todos os arquivos forem processados, analisa os dados
          if (processedFiles === files.length) {
            elements.titulo.style.display = "block";
            elements.resultsTable.style.marginBottom = "5%";
            analyzeData(mergedData, elements);
          }
        },
      });
    });
  }

  /**
   * Analisa os dados extraídos do CSV e conta ocorrências baseadas na data.
   * @param {Array} data - Dados extraídos do CSV.
   * @param {Object} elements - Referências aos elementos da interface.
   */
  function analyzeData(data, elements) {
    let counts = {
      totalCol1: 0, // Primeiro dado (varia dependendo da tabela)
      totalCol2: 0, // Segundo dado (varia dependendo da tabela)
    };

    // Obtém a data formatada do dia atual (DD-MM-YYYY)
    const formattedToday = getFormattedDate(new Date());

    // Identifica se estamos na tabela de Forward Order ou Return Order
    const isForwardOrder = elements.resultsTable.id === "results-table-forward";

    // Se for Forward Order, adicionamos totalCol3
    if (isForwardOrder) {
      counts.totalCol3 = 0; // Terceiro dado (somente para Forward Order)
    }

    // Percorre os dados do CSV e faz a contagem correta para cada tabela
    data.forEach((row) => {
      let deliveringTime = normalizeDate(row["Delivering Time"]);
      let deliveredTime = normalizeDate(row["Delivered Time"]);
      let onHoldTime = normalizeDate(row["OnHold Time"]);
      let status = row["Status"]?.trim(); // Remove espaços extras

      if (isForwardOrder) {
        // Tabela de **Forward Order**
        if (deliveringTime === formattedToday) {
          counts.totalCol1++; // Total LM Expedido (Delivering Time)

          if (deliveredTime === formattedToday) {
            counts.totalCol2++; // Entregue (Delivered Time)
          }
          if (onHoldTime === formattedToday) {
            counts.totalCol3++; // OnHold (OnHold Time)
          }
        }
      } else {
        // Tabela de **Return Order**
        if (deliveringTime === formattedToday) {
          counts.totalCol1++; // Total Revamp Expedido (Delivering Time)

        }
        if (status === "Return_Hub_Received") {
          counts.totalCol2++; // Total Revamp Piso (Delivering Time + Status)
        }
      }
    });

    // Se totalCol3 não foi incrementado, removemos a chave para manter como undefined
    if (!isForwardOrder) {
      delete counts.totalCol3;
    }

    // Atualiza a tabela após um pequeno delay para evitar travamentos
    setTimeout(() => {
      updateTable(counts, elements);
      elements.loading.style.display = "none";
    }, 100);
  }

  /**
   * Atualiza a tabela de resultados na interface.
   * @param {Object} counts - Contagem dos dados relevantes.
   * @param {Object} elements - Referências aos elementos da interface.
   */
  function updateTable({ totalCol1, totalCol2, totalCol3 }, elements) {
    console.log({ totalCol1, totalCol2, totalCol3 });

    let rowHTML = `
        <tr>
            <td>${totalCol1}</td>
            <td>${totalCol2}</td>
            ${totalCol3 !== undefined ? `<td>${totalCol3}</td>` : ""}
        </tr>
    `;

    elements.resultsBody.innerHTML = rowHTML;
    elements.resultsTable.style.display = "table";
  }

  /**
   * Retorna a data formatada no padrão DD-MM-YYYY.
   * @param {Date} date - Objeto Date a ser formatado.
   * @returns {string} Data formatada.
   */
  function getFormattedDate(date) {
    return `${date.getDate().toString().padStart(2, "0")}-${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${date.getFullYear()}`;
  }

  /**
   * Normaliza uma string de data, retornando apenas os primeiros 10 caracteres (YYYY-MM-DD).
   * @param {string} dateStr - String da data original.
   * @returns {string} Data formatada ou string vazia caso inválida.
   */
  function normalizeDate(dateStr) {
    return dateStr ? dateStr.slice(0, 10) : "";
  }
});
