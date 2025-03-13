document.addEventListener("DOMContentLoaded", () => {
  initializeFileUploadHandlers();
  initializeReportButtons();
});

function initializeFileUploadHandlers() {
  const uploadConfigs = [
    {
      dropArea: "drop-area-forward",
      fileInput: "file-input-forward",
      loading: "loading-forward",
      resultsTable: "results-table-forward",
      resultsBody: "#results-table-forward tbody",
      titulo: "titulo-forward",
    },
    {
      dropArea: "drop-area-return",
      fileInput: "file-input-return",
      loading: "loading-return",
      resultsTable: "results-table-return",
      resultsBody: "#results-table-return tbody",
      titulo: "titulo-return",
    },
    {
      dropArea: "drop-area-pickup",
      fileInput: "file-input-pickup",
      loading: "loading-pickup",
      resultsTable: "results-table-pickup",
      resultsBody: "#results-table-pickup tbody",
      titulo: "titulo-pickup",
    },
    {
      dropArea: "drop-area-br-assignment",
      fileInput: "file-input-br-assignment",
      loading: "loading-br-assignment",
      resultsTable: "results-table-br-assignment",
      resultsBody: "#results-table-br-assignment tbody",
      titulo: "titulo-br-assignment",
    },
  ];

  uploadConfigs.forEach((config) => setupFileUploadHandlers(config));
}

function setupFileUploadHandlers({
  dropArea,
  fileInput,
  loading,
  resultsTable,
  resultsBody,
  titulo,
}) {
  const elements = {
    dropArea: document.getElementById(dropArea),
    fileInput: document.getElementById(fileInput),
    loading: document.getElementById(loading),
    resultsTable: document.getElementById(resultsTable),
    resultsBody: document.querySelector(resultsBody),
    titulo: document.getElementById(titulo),
  };

  elements.dropArea.addEventListener("click", () => elements.fileInput.click());
  elements.dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    elements.dropArea.classList.add("dragover");
  });
  elements.dropArea.addEventListener("dragleave", () =>
    elements.dropArea.classList.remove("dragover")
  );
  elements.dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    elements.dropArea.classList.remove("dragover");
    processFiles(event.dataTransfer.files, elements);
  });
  elements.fileInput.addEventListener("change", () =>
    processFiles(elements.fileInput.files, elements)
  );
}

function processFiles(files, elements) {
  if (files.length === 0) return;

  elements.loading.style.display = "block";
  elements.resultsBody.innerHTML = "";

  let mergedData = [];
  let processedFiles = 0;

  Array.from(files).forEach((file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        mergedData = mergedData.concat(results.data);
        processedFiles++;

        if (processedFiles === files.length) {
          elements.titulo.style.display = "block";
          elements.resultsTable.style.marginBottom = "2%";
          analyzeData(mergedData, elements);
        }
      },
    });
  });
}

/**
 * Inverte o formato de uma string de data de "DD-MM-YYYY" para "YYYY-MM-DD".
 *
 * @param {string} dateString - A string de data em formato "DD-MM-YYYY".
 * @returns {string|null} - A string de data em formato "YYYY-MM-DD", ou null se o formato de entrada for inválido.
 */
function invertDateFormat(dateString) {
  // Verifica se a data está no formato esperado
  const parts = dateString.split("-");
  if (parts.length !== 3) {
    console.error("Formato de data inválido: ", dateString);
    return null; // Retorna null se o formato não for válido
  }

  const [day, month, year] = parts;

  // Retorna a data no formato "YYYY-MM-DD"
  return `${year}-${month}-${day}`;
}

/**
 * Converte uma string de data em formato "DD/MM/YYYY" para "YYYY-MM-DD"
 *
 * @param {string} dateString - A string de data em formato "DD/MM/YYYY"
 * @returns {string|null} - A string de data em formato "YYYY-MM-DD", ou null
 *                         se o formato de entrada for inválido.
 */
function convertDateFormat(dateString) {
  // Verifica se a data está no formato esperado
  const parts = dateString.split("/");
  if (parts.length !== 3) {
    console.error("Formato de data inválido: ", dateString);
    return null; // Retorna null se o formato não for válido
  }

  const [day, month, year] = parts;

  // Retorna a data no formato "YYYY-MM-DD"
  return `${year}-${month}-${day}`;
}

// Modifique a função analyzeData para considerar o número de colunas corretas
function analyzeData(data, elements) {
  let counts = {};

  // const formattedToday = getFormattedDate(new Date());
  const formattedToday = "2025-03-07";
  const isForwardOrder = elements.resultsTable.id === "results-table-forward";
  const isReturnOrder = elements.resultsTable.id === "results-table-return";
  const isPickupOrder = elements.resultsTable.id === "results-table-pickup";
  const isBrAssignment =
    elements.resultsTable.id === "results-table-br-assignment";

  switch (elements.resultsTable.id) {
    case "results-table-forward":
      counts = { totalCol1: 0, totalCol2: 0, totalCol3: 0, totalCol4: 0 };
      break;
    case "results-table-return":
      counts = { totalCol1: 0, totalCol2: 0, totalCol3: 0, totalCol4: 0 };
      break;
    case "results-table-pickup":
      counts = { totalCol1: 0, totalCol2: 0};
      break;
    case "results-table-br-assignment":
      counts = { totalCol1: 0, totalCol2: 0};
      break;
    default:
      counts = { totalCol1: 0 };
  }

  const taskIdsCounted = new Set(); // Declara o Set fora do loop para armazenar task IDs já contados

  data.forEach((row) => {
    const deliveringTime = normalizeDate(row["Delivering Time"]);
    const deliveredTime = normalizeDate(row["Delivered Time"]);
    const onHoldTime = normalizeDate(row["OnHold Time"]);
    const lmHubReceiveTime = normalizeDate(row["LM Hub Receive time"]);
    const receivedTime = normalizeDate(row["Received Time"]);
    const status = row["Status"]?.trim();
    const dcReceiveTime = normalizeDate(row["DC Receive Time"]);
    const driverName = row["Driver name"];
    const taskId = row["Task ID"];

    switch (elements.resultsTable.id) {
      case "results-table-forward":
        if (convertDateFormat(deliveringTime) === formattedToday) {
          console.log(convertDateFormat(deliveringTime));
          counts.totalCol1++; 
        // if (deliveredTime === formattedToday) counts.totalCol2++;
          if (convertDateFormat(onHoldTime) === formattedToday) {
            console.log(convertDateFormat(onHoldTime));
            counts.totalCol2++;
          }
        }
        if (status === "Hub_Received" && invertDateFormat(lmHubReceiveTime) < formattedToday) {
          counts.totalCol3++;
        }
        if (status === "Delivering") {
          counts.totalCol4++;
        }
        break;
      case "results-table-return":
        if (status === "Return_Hub_Received") {
          counts.totalCol1++;
          if (invertDateFormat(receivedTime) < formattedToday) {
            counts.totalCol2++;
          }
        }
        if (status === "Return_Hub_Returning") {
          counts.totalCol3++;
        }
        if (convertDateFormat(deliveringTime) === formattedToday) {
          if (convertDateFormat(onHoldTime) === formattedToday) {
            counts.totalCol4++;
          }
        }
        break;
      case "results-table-pickup":
        if (convertDateFormat(dcReceiveTime) === formattedToday) {
          counts.totalCol1++;
        }
        break;
      case "results-table-br-assignment":
        
        if (driverName) {
          counts.totalCol1++;
          if (!taskIdsCounted.has(taskId)) {
            // Verifica se o taskId não foi contado anteriormente
            counts.totalCol2++; // Incrementa totalCol2 apenas uma vez para cada taskId único
            taskIdsCounted.add(taskId); // Adiciona o taskId ao Set
          }
        }
        break;
    }
  });

  setTimeout(() => {
    updateTable(counts, elements);
    elements.loading.style.display = "none";
  }, 100);
}

// Modifique a função updateTable para aceitar apenas as colunas necessárias
function updateTable(counts, elements) {
  let rowHTML = "<tr>";

  switch (elements.resultsTable.id) {
    case "results-table-forward":
      rowHTML += `<td>${counts.totalCol1}</td>`;
      rowHTML += `<td>${counts.totalCol2}</td>`;
      rowHTML += `<td>${counts.totalCol3}</td>`;
      rowHTML += `<td>${counts.totalCol4}</td>`;
      break;
    case "results-table-return":
      rowHTML += `<td>${counts.totalCol1}</td>`;
      rowHTML += `<td>${counts.totalCol2}</td>`;
      rowHTML += `<td>${counts.totalCol3}</td>`;
      rowHTML += `<td>${counts.totalCol4}</td>`;
      break;
    case "results-table-pickup":
      rowHTML += `<td>${counts.totalCol1}</td>`;
      rowHTML += `<td>${counts.totalCol2}</td>`;
      break;
    case "results-table-br-assignment":
      rowHTML += `<td>${counts.totalCol1}</td>`;
      rowHTML += `<td>${counts.totalCol2}</td>`;
      break;
  }

  rowHTML += "</tr>";
  elements.resultsBody.innerHTML = rowHTML;
  elements.resultsTable.style.display = "table";
}

function getFormattedDate(date) {
  return `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getFullYear()}`;
}

function normalizeDate(dateStr) {
  return dateStr ? dateStr.slice(0, 10) : "";
}

function initializeReportButtons() {
  document
    .getElementById("generate-report")
    .addEventListener("click", generateReport);
  document
    .getElementById("capture-report")
    .addEventListener("click", captureReport);
}

function generateReport() {
  const reportBody = document.getElementById("report-body");
  reportBody.innerHTML = ""; // Limpa antes de gerar um novo relatório

  // Exibe o loading
  document.getElementById("loading").style.display = "block";
  document.getElementById("report-container").style.display = "none";

  setTimeout(() => {
    const forwardValues = getTableValues("results-table-forward", [
      "Entregue",
      "OnHold",
      "Hub Received",
      "Delivering",
    ]);
    const returnValues = getTableValues("results-table-return", [
      "Total Revamp Piso",
      "Return Hub Received",
      "Return Hub Returning",
      "OnHold",
    ]);
    const pickupValues = getTableValues("results-table-pickup", [
      "Recebidos FM",
      "Entregue",
      "Cancelado",
    ]);
    const brAssignmentValues = getTableValues("results-table-br-assignment", [
      "Total LM Expedido",
      "Total Veículo Exp.",
      "Não Atribuído",
    ]);

    const hubReceived = parseInt(forwardValues["Hub Received"]) || 0;
    const returnHubReceived =
      parseInt(returnValues["Return Hub Received"]) || 0;

    const recebidosFm = parseInt(pickupValues["Recebidos FM"]) || 0;

    const backlogDiaAnterior = hubReceived + returnHubReceived; 

    const totalPacotes = backlogDiaAnterior + recebidosFm;

    const delivering = parseInt(forwardValues["Delivering"]) || 0;
    const returnHubReturning = parseInt(returnValues["Return Hub Returning"]) || 0;

    const emRota = delivering + returnHubReturning;

    const onholdsDevolvidos = document.getElementById("onholdsDevolvidos").value;
    const totalRotasPiso = document.getElementById("totalRotasPiso").value;

    const totalLmExpedido = parseInt(brAssignmentValues["Total LM Expedido"]) || 0;
    const totalVeiculoExpedido = parseInt(brAssignmentValues["Total Veículo Exp."]) || 0;

    const sprMedio = totalLmExpedido / totalVeiculoExpedido;

    const onHoldForward = forwardValues["OnHold"];     
    const onHoldReturn = returnValues["OnHold"];     
    // const onHoldForward = parseInt(forwardValues["OnHold"]) || 20;     
    // const onHoldReturn = parseInt(returnValues["OnHold"]) || 20;     

    console.log(`${onHoldForward} + ${onHoldReturn}`);
    const onHoldTotal = parseInt(onHoldForward + onHoldReturn);
    console.log(`Result: ${onHoldTotal}`);


    const reportData = [
      ["Backlog do Dia Anterior", backlogDiaAnterior || "0"],
      ["Recebidos FM", pickupValues["Recebidos FM"] || "0"],
      ["Total de pacotes", totalPacotes || "0"],
      ["Total LM Expedido", brAssignmentValues["Total LM Expedido"] || "0"],
      ["Em Rota", emRota || "0"],
      ["Entregue", forwardValues["Entregue"] || "0"],
      ["OnHold", onHoldTotal || "0"],
      ["OnHold Devolvidos na Base", onholdsDevolvidos || "0"],
      ["Total Veículo Expedido", brAssignmentValues["Total Veículo Exp."] || "0"],
      ["SPR Médio", sprMedio || "0"],
      ["Total Revamp Piso", returnValues["Total Revamp Piso"] || "0"],
      ["Total de Rotas no Piso", totalRotasPiso || "0"], // ALTERAR PARA BAIXO
      // ["Entregue (Pickup)", pickupValues["Entregue"] || "-"],
      // ["Cancelado", pickupValues["Cancelado"] || "-"],
      // ["Não Atribuído", brAssignmentValues["Não Atribuído"] || "-"],
    ];

    reportData.forEach((rowData) => {
      const tr = document.createElement("tr");
      rowData.forEach((col) => {
        const td = document.createElement("td");
        td.textContent = col;
        tr.appendChild(td);
      });
      reportBody.appendChild(tr);
    });

    const now = new Date();
    const formattedDateTime =
      now.toLocaleDateString("pt-BR") + " " + now.toLocaleTimeString("pt-BR");
    document.getElementById("report-datetime").textContent = formattedDateTime;

    document.getElementById("loading").style.display = "none";
    document.getElementById("report-container").style.display = "flex";
    document.getElementById("print-report").style.display = "block";
  }, 1500); // Simula um tempo de carregamento
}

function getTableValues(tableId, keys) {
  const table = document.getElementById(tableId);
  const values = {};

  if (table.style.display !== "none") {
    const row = table.querySelector("tbody tr");
    if (row) {
      const cols = row.querySelectorAll("td");
      keys.forEach((key, index) => {
        values[key] = cols[index]?.textContent || "-";
      });
    }
  }

  return values;
}

function captureReport() {
  const reportDiv = document.getElementById("report-container");

  html2canvas(reportDiv, { scale: 2 }).then((canvas) => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");

    const now = new Date();
    const formattedDate = now.toLocaleDateString("pt-BR").replace(/\//g, "-");
    const formattedTime = now
      .toLocaleTimeString("pt-BR")
      .split(":")
      .slice(0, 2)
      .join("-");

    link.download = `relatorio_${formattedDate}_${formattedTime}.png`;
    link.click();
  });
}
