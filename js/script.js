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

  uploadConfigs.forEach(config => setupFileUploadHandlers(config));
}

function setupFileUploadHandlers({ dropArea, fileInput, loading, resultsTable, resultsBody, titulo }) {
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
  elements.dropArea.addEventListener("dragleave", () => elements.dropArea.classList.remove("dragover"));
  elements.dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    elements.dropArea.classList.remove("dragover");
    processFiles(event.dataTransfer.files, elements);
  });
  elements.fileInput.addEventListener("change", () => processFiles(elements.fileInput.files, elements));
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

// Modifique a função analyzeData para considerar o número de colunas corretas
function analyzeData(data, elements) {
  let counts = {};

  const formattedToday = getFormattedDate(new Date());
  const isForwardOrder = elements.resultsTable.id === "results-table-forward";
  const isReturnOrder = elements.resultsTable.id === "results-table-return";
  const isPickupOrder = elements.resultsTable.id === "results-table-pickup";
  const isBrAssignment = elements.resultsTable.id === "results-table-br-assignment";

  switch(elements.resultsTable.id) {
    case "results-table-forward":
      counts = { totalCol1: 0, totalCol2: 0 };
      break;
    case "results-table-return":
      counts = { totalCol1: 0 };
      break;
    case "results-table-pickup":
      counts = { totalCol1: 0, totalCol2: 0, totalCol3: 0 };
      break;
    case "results-table-br-assignment":
      counts = { totalCol1: 0, totalCol2: 0, totalCol3: 0 };
      break;
    default:
      counts = { totalCol1: 0 };
  }

  data.forEach((row) => {
    const deliveringTime = normalizeDate(row["Delivering Time"]);
    const deliveredTime = normalizeDate(row["Delivered Time"]);
    const onHoldTime = normalizeDate(row["OnHold Time"]);
    const status = row["Status"]?.trim();

    switch(elements.resultsTable.id) {
      case "results-table-forward":
        if (deliveringTime === formattedToday) {
          counts.totalCol1++;
          if (deliveredTime === formattedToday) counts.totalCol2++;
        }
        break;
      case "results-table-return":
        if (status === "Return_Hub_Received") {
          counts.totalCol1++;
        }
        break;
      case "results-table-pickup":
        if (deliveringTime === formattedToday) {
          counts.totalCol1++;
          if (deliveredTime === formattedToday) counts.totalCol2++;
          if (onHoldTime === formattedToday) counts.totalCol3++;
        }
        break;
      case "results-table-br-assignment":
        if (deliveringTime === formattedToday) {
          counts.totalCol1++;
          if (status === "Return_Hub_Received") counts.totalCol2++;
          // Adicione mais condições conforme necessário
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
  
  switch(elements.resultsTable.id) {
    case "results-table-forward":
      rowHTML += `<td>${counts.totalCol1}</td>`;
      rowHTML += `<td>${counts.totalCol2}</td>`;
      break;
    case "results-table-return":
      rowHTML += `<td>${counts.totalCol1}</td>`;
      break;
    case "results-table-pickup":
      rowHTML += `<td>${counts.totalCol1}</td>`;
      rowHTML += `<td>${counts.totalCol2}</td>`;
      rowHTML += `<td>${counts.totalCol3}</td>`;
      break;
    case "results-table-br-assignment":
      rowHTML += `<td>${counts.totalCol1}</td>`;
      rowHTML += `<td>${counts.totalCol2}</td>`;
      rowHTML += `<td>${counts.totalCol3}</td>`;
      break;
  }
  
  rowHTML += "</tr>";
  elements.resultsBody.innerHTML = rowHTML;
  elements.resultsTable.style.display = "table";
}

function getFormattedDate(date) {
  return `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getFullYear()}`;
}

function normalizeDate(dateStr) {
  return dateStr ? dateStr.slice(0, 10) : "";
}

function initializeReportButtons() {
  document.getElementById("generate-report").addEventListener("click", generateReport);
  document.getElementById("capture-report").addEventListener("click", captureReport);
}

function generateReport() {
  const reportBody = document.getElementById("report-body");
  reportBody.innerHTML = ""; // Limpa antes de gerar um novo relatório

  // Exibe o loading
  document.getElementById("loading").style.display = "block";
  document.getElementById("report-container").style.display = "none";

  setTimeout(() => {
    const forwardValues = getTableValues("results-table-forward", ["Entregue", "OnHold"]);
    const returnValues = getTableValues("results-table-return", ["Total Revamp Piso"]);
    const pickupValues = getTableValues("results-table-pickup", ["Total Pickup", "Entregue", "Cancelado"]);
    const brAssignmentValues = getTableValues("results-table-br-assignment", ["Total BRs", "Atribuído", "Não Atribuído"]);

    const reportData = [
      // ["Total LM Expedido", forwardValues["Total LM Expedido"]],
      ["Entregue", forwardValues["Entregue"] || "-"],
      ["OnHold", forwardValues["OnHold"] || "-"],
      ["Total Revamp Piso", returnValues["Total Revamp Piso"] || "-"],
      ["Total Pickup", pickupValues["Total Pickup"] || "-"],
      ["Entregue (Pickup)", pickupValues["Entregue"] || "-"],
      ["Cancelado", pickupValues["Cancelado"] || "-"],
      ["Total BRs", brAssignmentValues["Total BRs"] || "-"],
      ["Atribuído", brAssignmentValues["Atribuído"] || "-"],
      ["Não Atribuído", brAssignmentValues["Não Atribuído"] || "-"],
    ];

    reportData.forEach(rowData => {
      const tr = document.createElement("tr");
      rowData.forEach(col => {
        const td = document.createElement("td");
        td.textContent = col;
        tr.appendChild(td);
      });
      reportBody.appendChild(tr);
    });

    const now = new Date();
    const formattedDateTime = now.toLocaleDateString("pt-BR") + " " + now.toLocaleTimeString("pt-BR");
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

  html2canvas(reportDiv, { scale: 2 }).then(canvas => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");

    const now = new Date();
    const formattedDate = now.toLocaleDateString("pt-BR").replace(/\//g, "-");
    const formattedTime = now.toLocaleTimeString("pt-BR").split(":").slice(0, 2).join("-");

    link.download = `relatorio_${formattedDate}_${formattedTime}.png`;
    link.click();
  });
}