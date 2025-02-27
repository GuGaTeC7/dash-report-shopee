document.addEventListener("DOMContentLoaded", function () {
    const dropArea = document.getElementById("drop-area");
    const fileInput = document.getElementById("file-input");
    const loading = document.getElementById("loading");
    const resultsTable = document.getElementById("results-table");
    const resultsBody = resultsTable.querySelector("tbody");

    dropArea.addEventListener("click", () => fileInput.click());

    dropArea.addEventListener("dragover", (event) => {
      event.preventDefault();
      dropArea.classList.add("dragover");
    });

    dropArea.addEventListener("dragleave", () =>
      dropArea.classList.remove("dragover")
    );

    dropArea.addEventListener("drop", (event) => {
      event.preventDefault();
      dropArea.classList.remove("dragover");
      processFiles(event.dataTransfer.files);
    });

    fileInput.addEventListener("change", () =>
      processFiles(fileInput.files)
    );

    function processFiles(files) {
      if (files.length === 0) return;

      loading.style.display = "block";
      resultsBody.innerHTML = "";

      let mergedData = [];
      let processedFiles = 0;

      console.log("📂 Iniciando processamento dos arquivos...");

      Array.from(files).forEach((file) => {
        console.log(`📁 Lendo arquivo: ${file.name}`);

        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: function (results) {
            mergedData = mergedData.concat(results.data);
            processedFiles++;

            console.log(
              `✅ Arquivo ${file.name} processado! (${results.data.length} linhas)`
            );

            if (processedFiles === files.length) {
              console.log(
                "📊 Todos os arquivos foram processados. Iniciando análise..."
              );
              analyzeData(mergedData);
            }
          },
        });
      });
    }

    function analyzeData(data) {
      let totalDelivering = 0;
      let totalDelivered = 0;
      let totalOnHold = 0;

      const today = new Date();
      const formattedToday = `${today
        .getDate()
        .toString()
        .padStart(2, "0")}-${(today.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${today.getFullYear()}`;

      // Variável para testes de dia
      // const formattedToday = "26-02-2025"

      console.log("📅 Data de hoje:", formattedToday);

      data.forEach((row) => {
        let deliveringTime = row["Delivering Time"]
          ? row["Delivering Time"].slice(0, 10)
          : "";
        let deliveredTime = row["Delivered Time"]
          ? row["Delivered Time"].slice(0, 10)
          : "";
        let onHoldTime = row["OnHold Time"]
          ? row["OnHold Time"].slice(0, 10)
          : "";

        console.log(`${deliveringTime} === ${formattedToday}`);

        if (deliveringTime === formattedToday) {
          totalDelivering++;
          console.log(
            `✅ Delivering Time encontrado: ${row["Delivering Time"]} → Normalizado: ${deliveringTime}`
          );

          if (deliveredTime === formattedToday) {
            totalDelivered++;
            console.log(
              `✅ Delivered Time encontrado: ${row["Delivered Time"]} → Normalizado: ${deliveredTime}`
            );
          }

          if (onHoldTime === formattedToday) {
            totalOnHold++;
            console.log(
              `✅ OnHold Time encontrado: ${row["OnHold Time"]} → Normalizado: ${onHoldTime}`
            );
          }
        }
      });

      console.log("📊 Resultados finais:", {
        totalDelivering,
        totalDelivered,
        totalOnHold,
      });

      // Garante que os logs sejam visíveis antes de atualizar a tabela
      setTimeout(() => {
        updateTable(totalDelivering, totalDelivered, totalOnHold);
        loading.style.display = "none";
      }, 100);
    }

    function normalizeDate(dateStr) {
      if (!dateStr) return null;

      // Tentativa direta
      let date = new Date(dateStr);
      if (!isNaN(date)) {
        return date.toISOString().split("T")[0]; // Retorna YYYY-MM-DD
      }

      // Se a conversão direta falhar, tenta outras abordagens
      let parts = dateStr.match(/\d+/g);
      if (!parts) return null;

      if (parts.length === 3) {
        let [d, m, y] = parts.map(Number);

        if (y < 100) y += 2000; // Ajuste para anos curtos
        if (d > 31) [y, d] = [d, y]; // Ajuste se o ano vier primeiro

        let normalizedDate = new Date(y, m - 1, d);
        if (!isNaN(normalizedDate)) {
          return normalizedDate.toISOString().split("T")[0];
        }
      }

      return null;
    }

    function updateTable(delivering, delivered, onHold) {
      resultsBody.innerHTML = `
                <tr>
                    <td>${delivering}</td>
                    <td>${delivered}</td>
                    <td>${onHold}</td>
                </tr>
            `;
      resultsTable.style.display = "table";
    }
  });