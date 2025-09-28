const form = document.getElementById('transaction-form');
const transactionsBody = document.getElementById('transactions-body');
const transactionsTable = document.getElementById('transactions-table');

const incomeStatementTable = document.getElementById('income-statement-table');
const balanceSheetTable = document.getElementById('balance-sheet-table');
const cashFlowTable = document.getElementById('cash-flow-table');
const downloadBtn = document.getElementById('download-btn');

let transactions = [];

// Utility for formatting Peso
function formatPeso(amount) {
  return `₱${amount.toFixed(2)}`;
}

// Update the transactions table
function updateTransactionsTable() {
  if (transactions.length === 0) {
    transactionsTable.hidden = true;
    return;
  }
  transactionsTable.hidden = false;
  transactionsBody.innerHTML = '';
  transactions.forEach((t, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${t.date}</td>
      <td>${t.description}</td>
      <td>${capitalize(t.category)}</td>
      <td>${formatPeso(t.amount)}</td>
      <td><button aria-label="Remove transaction ${index + 1}" data-index="${index}">✖</button></td>
    `;
    transactionsBody.appendChild(row);
  });
}

// Capitalize first letter
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Calculate and update financial statements
function updateStatements() {
  let revenue = 0,
      expenses = 0,
      assets = 0,
      liabilities = 0,
      equity = 0,
      cashInflow = 0,
      cashOutflow = 0;

  transactions.forEach(t => {
    switch(t.category) {
      case 'revenue': revenue += t.amount; break;
      case 'expense': expenses += t.amount; break;
      case 'asset': assets += t.amount; break;
      case 'liability': liabilities += t.amount; break;
      case 'equity': equity += t.amount; break;
      case 'cash-inflow': cashInflow += t.amount; break;
      case 'cash-outflow': cashOutflow += t.amount; break;
    }
  });

  const netIncome = revenue - expenses;
  const netCashFlow = cashInflow - cashOutflow;

  // Income statement
  incomeStatementTable.rows[0].cells[1].textContent = formatPeso(revenue);
  incomeStatementTable.rows[1].cells[1].textContent = formatPeso(expenses);
  incomeStatementTable.rows[2].cells[1].textContent = formatPeso(netIncome);

  // Balance sheet
  balanceSheetTable.rows[0].cells[1].textContent = formatPeso(assets);
  balanceSheetTable.rows[1].cells[1].textContent = formatPeso(liabilities);
  balanceSheetTable.rows[2].cells[1].textContent = formatPeso(equity);

  // Cash flow
  cashFlowTable.rows[0].cells[1].textContent = formatPeso(cashInflow);
  cashFlowTable.rows[1].cells[1].textContent = formatPeso(cashOutflow);
  cashFlowTable.rows[2].cells[1].textContent = formatPeso(netCashFlow);
}

// Add new transaction
form.addEventListener('submit', e => {
  e.preventDefault();

  const date = form.date.value;
  const description = form.description.value.trim();
  const category = form.category.value;
  const amount = parseFloat(form.amount.value);

  if (!date || !description || !category || isNaN(amount) || amount <= 0) {
    alert('Please fill out all fields with valid data.');
    return;
  }

  transactions.push({ date, description, category, amount });

  form.reset();
  updateTransactionsTable();
  updateStatements();
});

// Remove transaction (event delegation)
transactionsBody.addEventListener('click', e => {
  if (e.target.tagName === 'BUTTON') {
    const idx = parseInt(e.target.dataset.index);
    transactions.splice(idx, 1);
    updateTransactionsTable();
    updateStatements();
  }
});

// Download Excel
downloadBtn.addEventListener('click', () => {
  if (transactions.length === 0) {
    alert('Please add some transactions before downloading.');
    return;
  }

  const wb = XLSX.utils.book_new();

  // Transactions sheet
  const transData = [
    ['Date', 'Description', 'Category', 'Amount (₱)'],
    ...transactions.map(t => [t.date, t.description, capitalize(t.category), t.amount])
  ];
  const wsTrans = XLSX.utils.aoa_to_sheet(transData);
  XLSX.utils.book_append_sheet(wb, wsTrans, 'Transactions');

  // Income Statement sheet
  const incomeData = [
    ['Income Statement', 'Amount (₱)'],
    ['Revenue', incomeStatementTable.rows[0].cells[1].textContent],
    ['Expenses', incomeStatementTable.rows[1].cells[1].textContent],
    ['Net Income', incomeStatementTable.rows[2].cells[1].textContent]
  ];
  const wsIncome = XLSX.utils.aoa_to_sheet(incomeData);
  XLSX.utils.book_append_sheet(wb, wsIncome, 'Income Statement');

  // Balance Sheet sheet
  const balanceData = [
    ['Balance Sheet', 'Amount (₱)'],
    ['Assets', balanceSheetTable.rows[0].cells[1].textContent],
    ['Liabilities', balanceSheetTable.rows[1].cells[1].textContent],
    ['Equity', balanceSheetTable.rows[2].cells[1].textContent]
  ];
  const wsBalance = XLSX.utils.aoa_to_sheet(balanceData);
  XLSX.utils.book_append_sheet(wb, wsBalance, 'Balance Sheet');

  // Cash Flow sheet
  const cashFlowData = [
    ['Cash Flow Statement', 'Amount (₱)'],
    ['Cash Inflows', cashFlowTable.rows[0].cells[1].textContent],
    ['Cash Outflows', cashFlowTable.rows[1].cells[1].textContent],
    ['Net Cash Flow', cashFlowTable.rows[2].cells[1].textContent]
  ];
  const wsCashFlow = XLSX.utils.aoa_to_sheet(cashFlowData);
  XLSX.utils.book_append_sheet(wb, wsCashFlow, 'Cash Flow Statement');

  XLSX.writeFile(wb, 'Financial_Statements.xlsx');
});
