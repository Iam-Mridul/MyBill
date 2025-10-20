let billItems = [];
let billNo = Date.now();

function addItem() {
  const productSelect = document.getElementById("productSelect");
  const productName = productSelect.value;
  const rate = parseFloat(productSelect.selectedOptions[0].dataset.price || 0);
  const qty = parseInt(document.getElementById("quantity").value);

  if (!productName || qty <= 0) {
    alert("Select product and quantity!");
    return;
  }

  const total = rate * qty;
  billItems.push({ productName, rate, qty, total });
  updateTable();
}

function updateTable() {
  const tbody = document.querySelector("#billTable tbody");
  tbody.innerHTML = "";
  let grandTotal = 0;

  billItems.forEach((item, index) => {
    grandTotal += item.total;
    tbody.innerHTML += `
      <tr>
        <td>${item.productName}</td>
        <td>${item.rate}</td>
        <td>${item.qty}</td>
        <td>${item.total}</td>
        <td><button onclick="removeItem(${index})">❌</button></td>
      </tr>`;
  });

  document.getElementById("grandTotal").textContent = grandTotal;
}

function removeItem(index) {
  billItems.splice(index, 1);
  updateTable();
}

function saveBill() {
  if (billItems.length === 0) return alert("Add items first!");

  const name = document.getElementById("customerName").value || "Unknown";
  const phone = document.getElementById("customerPhone").value || "-";
  const total = document.getElementById("grandTotal").textContent;

  // Generate PDF
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Billing Receipt", 80, 10);
  doc.text(`Bill No: ${billNo}`, 10, 20);
  doc.text(`Customer: ${name}`, 10, 30);
  doc.text(`Phone: ${phone}`, 10, 40);

  let y = 60;
  billItems.forEach((item) => {
    doc.text(`${item.productName} x ${item.qty} = ₹${item.total}`, 10, y);
    y += 10;
  });

  doc.text(`Grand Total: ₹${total}`, 10, y + 10);
  doc.save(`Bill_${billNo}.pdf`);

  // Save locally
  const bills = JSON.parse(localStorage.getItem("bills") || "[]");
  bills.push({
    billNo,
    name,
    phone,
    total,
    date: new Date().toLocaleString(),
    items: billItems
  });
  localStorage.setItem("bills", JSON.stringify(bills));

  // Clear for next bill
  alert("Bill saved!");
  billItems = [];
  updateTable();
  billNo = Date.now();
}

function viewHistory() {
  const section = document.getElementById("historySection");
  const list = document.getElementById("historyList");
  list.innerHTML = "";
  section.style.display = "block";

  const bills = JSON.parse(localStorage.getItem("bills") || "[]");
  if (bills.length === 0) {
    list.innerHTML = "<li>No saved bills.</li>";
    return;
  }

  bills.forEach(b => {
    list.innerHTML += `<li><strong>${b.name}</strong> - ₹${b.total} - ${b.date}</li>`;
  });
}
