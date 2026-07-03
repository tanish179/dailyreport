const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const XLSX = require('xlsx');
const Groq = require('groq-sdk');
const { db } = require('../database');
require('dotenv').config();

const upload = multer({ dest: 'uploads/' });

// Initialize Groq client safely (don't crash if missing, but errors later)
let groq = null;
if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here') {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

// Ensure uploads dir exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

/**
 * Extracts text from a file based on its mime type or extension
 */
async function extractTextFromFile(file) {
  const filePath = file.path;
  const originalName = file.originalname.toLowerCase();
  let text = '';

  try {
    if (originalName.endsWith('.pdf')) {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      text = data.text;
    } else if (originalName.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else if (originalName.endsWith('.xlsx') || originalName.endsWith('.xls')) {
      const workbook = XLSX.readFile(filePath);
      let sheetText = '';
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        sheetText += `Sheet: ${sheetName}\n${csv}\n\n`;
      });
      text = sheetText;
    } else if (originalName.endsWith('.txt') || originalName.endsWith('.csv')) {
      text = fs.readFileSync(filePath, 'utf8');
    } else {
      throw new Error('Unsupported file type. Please upload PDF, DOCX, XLSX, XLS, TXT, or CSV.');
    }
  } finally {
    // Clean up uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  return text;
}

/**
 * Validates and sanitizes standard values for database enums
 */
function sanitizePaymentMethod(method) {
  const normalized = method?.trim()?.toLowerCase();
  
  if (normalized?.includes('upi') || normalized?.includes('gpay') || normalized?.includes('phonepe') || normalized?.includes('paytm')) return 'UPI';
  if (normalized === 'credit' || normalized?.includes('on credit') || normalized?.includes('due') || normalized?.includes('udhaar')) return 'Credit';
  if (normalized?.includes('credit')) return 'Credit';
  if (normalized?.includes('debit') || normalized?.includes('card') || normalized?.includes('bank') || normalized?.includes('neft') || normalized?.includes('rtgs') || normalized?.includes('imps')) return 'UPI';
  if (normalized?.includes('cash')) return 'Cash';
  
  return 'Cash'; // Default
}

function getTodayStr() {
  const tzOffset = (new Date()).getTimezoneOffset() * 60000;
  return (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
}

function getNowTimeStr() {
  return new Date().toLocaleTimeString('en-IN', { hour12: false });
}

function parseExcelDate(val) {
  if (!val) return getTodayStr();
  
  if (typeof val === 'number') {
    // Excel base date is 1899-12-30 (due to leap year bug in 1900)
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  
  const str = String(val).trim();
  if (!str) return getTodayStr();

  // Try parsing YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  
  // Try parsing DD-MM-YYYY or DD/MM/YYYY
  const dm = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dm) {
    const day = dm[1].padStart(2, '0');
    const month = dm[2].padStart(2, '0');
    const year = dm[3];
    return `${year}-${month}-${day}`;
  }

  // Try parsing YYYY/MM/DD
  const ym = str.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (ym) {
    const year = ym[1];
    const month = ym[2].padStart(2, '0');
    const day = ym[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
  } catch (e) {}

  return getTodayStr();
}

function detectHeaders(row) {
  const keys = Object.keys(row);
  const mapping = {};
  
  keys.forEach(key => {
    const norm = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (norm.includes('customer') || norm.includes('client') || norm.includes('buyer') || norm === 'name') {
      mapping.customer_name = key;
    } else if (norm.includes('product') || norm.includes('service') || norm.includes('item') || norm.includes('particulars') || norm.includes('desc')) {
      mapping.product_service = key;
      mapping.expense_title = key;
    } else if (norm.includes('vendor') || norm.includes('supplier') || norm.includes('merchant') || norm.includes('payee') || norm.includes('shop')) {
      mapping.vendor_name = key;
    } else if (norm.includes('amount') || norm.includes('price') || norm.includes('total') || norm.includes('value') || norm.includes('net') || norm.includes('cost')) {
      mapping.amount = key;
    } else if (norm.includes('payment') || norm.includes('method') || norm.includes('type') || norm.includes('paymode')) {
      mapping.payment_method = key;
    } else if (norm.includes('invoice') || norm.includes('inv') || norm.includes('bill')) {
      mapping.invoice_number = key;
    } else if (norm.includes('date')) {
      mapping.date = key;
    } else if (norm.includes('time')) {
      mapping.time = key;
    }
  });
  
  return mapping;
}

// POST /api/ai/upload
router.post('/upload', upload.single('file'), async (req, res) => {
  let filePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    filePath = req.file.path;
    const originalName = req.file.originalname.toLowerCase();
    const userPrompt = req.body.prompt ? String(req.body.prompt).trim() : '';

    // 1. Try Fast Programmatic Excel/CSV Parsing (ONLY if no custom prompt is requested)
    if (!userPrompt && (originalName.endsWith('.xlsx') || originalName.endsWith('.xls') || originalName.endsWith('.csv'))) {
      try {
        const workbook = XLSX.readFile(filePath);
        let hasValidSheet = false;
        const sheetDataList = [];

        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(worksheet);
          if (rows.length === 0) continue;

          const mapping = detectHeaders(rows[0]);
          if (mapping.amount) {
            hasValidSheet = true;
            sheetDataList.push({ rows, mapping });
          }
        }

        if (hasValidSheet) {
          let salesCount = 0;
          let expensesCount = 0;

          const transaction = db.transaction(() => {
            const insertSaleStmt = db.prepare(`
              INSERT INTO sales (customer_name, product_service, amount, payment_method, invoice_number, date, time)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `);
            
            const insertExpenseStmt = db.prepare(`
              INSERT INTO expenses (expense_title, vendor_name, amount, payment_method, date, time)
              VALUES (?, ?, ?, ?, ?, ?)
            `);

            for (const sheetData of sheetDataList) {
              const { rows, mapping } = sheetData;
              for (const row of rows) {
                const amtVal = row[mapping.amount];
                if (amtVal === undefined || amtVal === null) continue;
                const amt = Number(String(amtVal).replace(/[^0-9.]/g, ''));
                if (isNaN(amt) || amt <= 0) continue;

                const hasCustomer = mapping.customer_name && row[mapping.customer_name];
                const hasVendor = mapping.vendor_name && row[mapping.vendor_name];
                
                const isExpense = hasVendor || (!hasCustomer && (mapping.expense_title && !mapping.customer_name));

                if (isExpense) {
                  const title = row[mapping.expense_title] || row[mapping.vendor_name] || 'Expense';
                  const vendor = row[mapping.vendor_name] || null;
                  const method = sanitizePaymentMethod(row[mapping.payment_method]);
                  const date = parseExcelDate(row[mapping.date]);
                  const time = row[mapping.time] ? String(row[mapping.time]).trim() : getNowTimeStr();
                  
                  insertExpenseStmt.run(String(title), vendor, amt, method, date, time);
                  expensesCount++;
                } else {
                  const customer = row[mapping.customer_name] || 'Walk-in Customer';
                  const product = row[mapping.product_service] || 'Product/Service';
                  const method = sanitizePaymentMethod(row[mapping.payment_method]);
                  const inv = row[mapping.invoice_number] ? String(row[mapping.invoice_number]).trim() : null;
                  const date = parseExcelDate(row[mapping.date]);
                  const time = row[mapping.time] ? String(row[mapping.time]).trim() : getNowTimeStr();
                  
                  insertSaleStmt.run(String(customer), String(product), amt, method, inv, date, time);
                  salesCount++;
                }
              }
            }
          });

          transaction();

          // Clean up file
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }

          return res.json({
            success: true,
            message: `Imported ${salesCount} sales and ${expensesCount} expenses successfully.`,
            data: { salesAdded: salesCount, expensesAdded: expensesCount }
          });
        }
      } catch (excelErr) {
        console.warn("Direct Excel parsing failed, falling back to AI:", excelErr);
      }
    }

    // 2. AI Fallback (for unstructured text files, PDFs, etc.)
    if (!groq) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(401).json({ error: 'GROQ_API_KEY is not configured in the server .env file.' });
    }

    const text = await extractTextFromFile(req.file);

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from the file.' });
    }

    const truncatedText = text.substring(0, 60000);

    const prompt = `
You are a data extraction assistant for a local computer shop called "Mainframe Computers".
Your job is to read the following text extracted from a business report and identify all SALES and EXPENSES.

${userPrompt ? `USER CUSTOM INSTRUCTIONS/OPERATION:
"${userPrompt}"
Please apply this instruction when extracting the data (e.g. filtering, skipping, modifying values, dates, etc. as requested).` : ''}

CRITICAL INSTRUCTIONS:
1. Return ONLY a valid JSON object. No markdown formatting, no explanation, no \`\`\`json. Just the raw JSON.
2. The JSON MUST follow this exact schema:
{
  "sales": [
    {
      "customer_name": "Name (string)",
      "product_service": "Product name or service provided (string)",
      "amount": (number, MUST be greater than 0),
      "payment_method": "Must be one of: Cash, UPI, Credit Card, Debit Card, Bank Transfer",
      "invoice_number": "Invoice string if present, else null",
      "date": "YYYY-MM-DD (string, use today's date if not specified)"
    }
  ],
  "expenses": [
    {
      "expense_title": "Title of expense (string)",
      "vendor_name": "Vendor string if present, else null",
      "amount": (number, MUST be greater than 0),
      "payment_method": "Must be one of: Cash, UPI, Credit Card, Debit Card, Bank Transfer",
      "date": "YYYY-MM-DD (string, use today's date if not specified)"
    }
  ]
}

If no sales are found, return "sales": []. If no expenses are found, return "expenses": [].
Assume today's date is ${getTodayStr()} if the report doesn't specify a date for a transaction.
Ensure all amounts are numbers, not strings.

Here is the document text:
---
${truncatedText}
---
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "qwen/qwen3-32b",
      temperature: 0.6,
      max_completion_tokens: 4096,
      top_p: 0.95,
      response_format: { type: "json_object" }
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error("AI returned an empty response.");
    }

    let parsedData;
    try {
      parsedData = JSON.parse(aiResponse);
    } catch (e) {
      throw new Error("Failed to parse AI output as JSON.");
    }

    // Insert into DB in a transaction
    const insertSales = parsedData.sales || [];
    const insertExpenses = parsedData.expenses || [];
    let salesCount = 0;
    let expensesCount = 0;

    const transaction = db.transaction(() => {
      const insertSaleStmt = db.prepare(`
        INSERT INTO sales (customer_name, product_service, amount, payment_method, invoice_number, date, time)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const sale of insertSales) {
        if (!sale.customer_name || !sale.product_service || !sale.amount) continue;
        insertSaleStmt.run(
          sale.customer_name,
          sale.product_service,
          Number(sale.amount),
          sanitizePaymentMethod(sale.payment_method),
          sale.invoice_number || null,
          sale.date || getTodayStr(),
          getNowTimeStr()
        );
        salesCount++;
      }

      const insertExpenseStmt = db.prepare(`
        INSERT INTO expenses (expense_title, vendor_name, amount, payment_method, date, time)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      for (const expense of insertExpenses) {
        if (!expense.expense_title || !expense.amount) continue;
        insertExpenseStmt.run(
          expense.expense_title,
          expense.vendor_name || null,
          Number(expense.amount),
          sanitizePaymentMethod(expense.payment_method),
          expense.date || getTodayStr(),
          getNowTimeStr()
        );
        expensesCount++;
      }
    });

    transaction();

    res.json({
      success: true,
      message: `Imported ${salesCount} sales and ${expensesCount} expenses successfully.`,
      data: { salesAdded: salesCount, expensesAdded: expensesCount }
    });

  } catch (err) {
    console.error("AI Upload Error:", err);
    res.status(500).json({ error: err.message || 'An error occurred during AI processing.' });
  }
});

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  try {
    if (!groq) {
      return res.status(401).json({ error: 'GROQ_API_KEY is not configured in the server .env file.' });
    }

    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    // --- FETCH BUSINESS CONTEXT ---
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysStr = thirtyDaysAgo.toISOString().split('T')[0];

    const salesStats = db.prepare(`SELECT SUM(amount) as totalSales FROM sales WHERE date >= ?`).get(thirtyDaysStr);
    const expenseStats = db.prepare(`SELECT SUM(amount) as totalExpenses FROM expenses WHERE date >= ?`).get(thirtyDaysStr);
    
    const topProducts = db.prepare(`
      SELECT product_service, SUM(amount) as total
      FROM sales WHERE date >= ? GROUP BY product_service ORDER BY total DESC LIMIT 3
    `).all(thirtyDaysStr);

    const topExpenses = db.prepare(`
      SELECT expense_title, SUM(amount) as total
      FROM expenses WHERE date >= ? GROUP BY expense_title ORDER BY total DESC LIMIT 3
    `).all(thirtyDaysStr);

    // Fetch previous calendar month stats
    const now = new Date();
    now.setDate(1);
    now.setMonth(now.getMonth() - 1);
    const prevYear = now.getFullYear();
    const prevMonth = String(now.getMonth() + 1).padStart(2, '0');
    const prevMonthStr = `${prevYear}-${prevMonth}`; // "YYYY-MM"
    
    const prevMonthSales = db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM sales WHERE date LIKE ?`).get(`${prevMonthStr}%`).total;
    const prevMonthExpenses = db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date LIKE ?`).get(`${prevMonthStr}%`).total;

    let businessContext = `
BUSINESS CONTEXT:
1. Last 30 Days:
   - Total Sales: ₹${salesStats?.totalSales || 0}
   - Total Expenses: ₹${expenseStats?.totalExpenses || 0}
   - Top Selling Products: ${topProducts.map(p => `${p.product_service} (₹${p.total})`).join(', ') || 'None'}
   - Top Expenses: ${topExpenses.map(e => `${e.expense_title} (₹${e.total})`).join(', ') || 'None'}
2. Previous Calendar Month (${prevMonthStr}):
   - Total Sales: ₹${prevMonthSales}
   - Total Expenses: ₹${prevMonthExpenses}
   - Net Profit: ₹${prevMonthSales - prevMonthExpenses}
    `;
    // ------------------------------

    const prompt = `
You are a helpful and intelligent AI Business Manager for the "Mainframe Computers" local shop dashboard.
The user is the shop owner. You have access to their real-time business data.

${businessContext}

CRITICAL INSTRUCTIONS:
Determine if the user's intent is to generate a report, PDF, or export data. 
If the user wants to generate a PDF, Excel file, or print a report (e.g. "generate a pdf for the sales"), you MUST return exactly the following JSON structure and nothing else:
{"action": "generate_pdf", "message": "I will open the Reports page for you where you can download the PDF or Excel."}

If the user is asking for business recommendations, insights, or asking a general question, you must analyze the BUSINESS CONTEXT provided above and provide helpful, data-driven advice.
Return a JSON structure like this:
{"action": "reply", "message": "Your helpful, personalized reply goes here. Format with markdown if needed."}

Respond ONLY with valid JSON.
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: message }
      ],
      model: "qwen/qwen3-32b",
      temperature: 0.6,
      max_completion_tokens: 4096,
      top_p: 0.95,
      response_format: { type: "json_object" }
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content;
    let parsed = { action: 'reply', message: "I'm not sure how to respond to that." };
    
    try {
      parsed = JSON.parse(aiResponse);
    } catch (e) {
      parsed.message = aiResponse;
    }

    res.json(parsed);

  } catch (err) {
    console.error("AI Chat Error:", err);
    res.status(500).json({ error: err.message || 'An error occurred during AI chat.' });
  }
});

module.exports = router;
