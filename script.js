let billItems = [];
let billNo = Date.now();

const productData = {
  Local: [
    { name: "Tea", price: 10 },
    { name: "Coffee", price: 10 },
    { name: "Brue Coffee", price: 20 },
    { name: "Lemon-Tea", price: 12 },
    { name: "Buggies", price: 10 },
    { name: "Porota", price: 12 },
    { name: "Biryani", price: 140 },
    { name: "Kappa-Biryani", price: 100 }
  ],
  Kerala: [
    { name: "Tea", price: 12 },
    { name: "Coffee", price: 12 },
    { name: "Brue Coffee", price: 20 },
    { name: "Lemon-Tea", price: 12 },
    { name: "Buggies", price: 12 },
    { name: "Porota", price: 13 },
    { name: "Biryani", price: 140 },
    { name: "Kappa-Biryani", price: 180 }
  ],
  Other: [
    { name: "Tea", price: 15 },
    { name: "Coffee", price: 15 },
    { name: "Brue Coffee", price: 25 },
    { name: "Lemon-Tea", price: 15 },
    { name: "Buggies", price: 12 },
    { name: "Porota", price: 15 },
    { name: "Biryani", price: 180 },
    { name: "Kappa-Biryani", price: 180 }
  ]
};

function loadProducts() {
  const type = document.getElementById("customerType").value;
  const select = document.getElementById("productSelect");
  select.innerHTML = '<option value="">-- Select Product --</option>';
  productData[type].forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.name;
    opt.dataset.price = p.price;
    opt.textContent = `${p.name} - ₹${p.price}`;
    select.appendChild(opt);
  });
}

function addItem() {
  const select = document.getElementById("productSelect");
  const productName = select.value;
  const rate = parseFloat(select.selectedOptions[0]?.dataset.price || 0);
  const qty = parseInt(document.getElementById("quantity").value);
  if (!productName || qty <= 0) {
    alert("Select a product and quantity!");
    return;
  }
  const total = rate * qty;
  billItems.push({ productName, rate, qty, total });
  updateTable();
  select.selectedIndex = 0;
  document.getElementById("quantity").value = 1;
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
  const type = document.getElementById("customerType").value;
  const total = document.getElementById("grandTotal").textContent;

  const dateStr = new Date().toISOString().split("T")[0];

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Mridul’s Billing Receipt", 70, 10);
  doc.text(`Bill No: ${billNo}`, 10, 20);
  doc.text(`Customer: ${name}`, 10, 30);
  doc.text(`Type: ${type}`, 10, 40);
  doc.text(`Phone: ${phone}`, 10, 50);

  let y = 70;
  billItems.forEach((item) => {
    doc.text(`${item.productName} x ${item.qty} = ₹${item.total}`, 10, y);
    y += 10;
  });

  doc.text(`Grand Total: ₹${total}`, 10, y + 10);
  doc.save(`Bill_${billNo}.pdf`);

  const bills = JSON.parse(localStorage.getItem("bills") || "[]");
  bills.push({
    billNo,
    name,
    phone,
    type,
    total,
    date: dateStr,
    dateTime: new Date().toLocaleString(),
    items: billItems
  });
  localStorage.setItem("bills", JSON.stringify(bills));

  alert("Bill saved successfully!");
  billItems = [];
  updateTable();
  billNo = Date.now();
  loadProducts();
}

function showSection(id) {
  document.getElementById("billing").style.display = "none";
  document.getElementById("saved").style.display = "none";
  document.getElementById(id).style.display = "block";
  if (id === "saved") {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("filterDate").value = today;
    filterBillsByDate();
  }
}

function filterBillsByDate() {
  const date = document.getElementById("filterDate").value;
  const list = document.getElementById("historyList");
  list.innerHTML = "";
  const bills = JSON.parse(localStorage.getItem("bills") || "[]");
  const filtered = bills.filter(b => b.date === date);
  if (filtered.length === 0) {
    list.innerHTML = `<li>No bills found for ${date}</li>`;
    return;
  }
  filtered.forEach(b => {
    list.innerHTML += `<li><strong>${b.name}</strong> (${b.type}) — ₹${b.total} — ${b.dateTime}</li>`;
  });
}

function exportBills() {
  const date = document.getElementById("filterDate").value;
  const bills = JSON.parse(localStorage.getItem("bills") || "[]");
  const filtered = bills.filter(b => b.date === date);
  if (filtered.length === 0) {
    alert("No bills found for selected date!");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text(`Mridul’s Billing Summary - ${date}`, 60, 10);

  let y = 30;
  filtered.forEach((b, i) => {
    doc.text(`${i + 1}. ${b.name} (${b.type}) - ₹${b.total} [${b.dateTime}]`, 10, y);
    y += 10;
    if (y > 270) { doc.addPage(); y = 20; }
  });
  doc.save(`Bills_${date}.pdf`);

  // WhatsApp share (sample link)
  const message = encodeURIComponent(`Bills for ${date} are exported. Please check the attached PDF.`);
  window.open(`https://wa.me/919037811503?text=${message}`, "_blank");
}

window.onload = loadProducts;
