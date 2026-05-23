const SHEETS = {
  orders: "Orders",
  products: "Products",
  expenses: "Expenses",
};

const ORDER_HEADERS = [
  "order_id",
  "order_date",
  "customer_name",
  "phone",
  "whatsapp",
  "address",
  "city",
  "state",
  "pincode",
  "product",
  "quantity",
  "amount",
  "payment_method",
  "payment_status",
  "order_source",
  "order_status",
  "courier_partner",
  "tracking_id",
  "tracking_link",
  "packed_date",
  "shipped_date",
  "delivered_date",
  "notes",
  "created_by",
  "updated_by",
  "last_updated",
  "order_type",
  "instagram_handle",
  "influencer_name",
  "follower_count",
  "platform",
  "collaboration_type",
  "expected_deliverables",
  "content_received",
  "content_link",
  "performance_notes",
  "coupon_code",
];

const PRODUCT_HEADERS = ["product_name", "sku", "price", "active"];
const EXPENSE_HEADERS = [
  "expense_id",
  "expense_date",
  "expense_type",
  "amount",
  "paid_by",
  "paid_to",
  "payment_method",
  "related_order_id",
  "notes",
  "created_by",
  "last_updated",
];

function doGet(e) {
  const action = e.parameter.action || "bootstrap";
  if (action === "bootstrap") {
    return jsonResponse({
      orders: readSheet(SHEETS.orders, ORDER_HEADERS),
      products: readSheet(SHEETS.products, PRODUCT_HEADERS),
      expenses: readSheet(SHEETS.expenses, EXPENSE_HEADERS),
    });
  }
  if (action === "listOrders") return jsonResponse({ orders: readSheet(SHEETS.orders, ORDER_HEADERS) });
  if (action === "listProducts") return jsonResponse({ products: readSheet(SHEETS.products, PRODUCT_HEADERS) });
  if (action === "listExpenses") return jsonResponse({ expenses: readSheet(SHEETS.expenses, EXPENSE_HEADERS) });
  return jsonResponse({ error: "Unknown action" });
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents || "{}");
  if (body.action === "addOrder") {
    appendRow(SHEETS.orders, ORDER_HEADERS, body.order);
    return jsonResponse({ ok: true });
  }
  if (body.action === "updateOrder") {
    upsertRow(SHEETS.orders, ORDER_HEADERS, "order_id", body.order);
    return jsonResponse({ ok: true });
  }
  if (body.action === "deleteOrder") {
    deleteRow(SHEETS.orders, ORDER_HEADERS, "order_id", body.order_id);
    return jsonResponse({ ok: true });
  }
  if (body.action === "addProduct") {
    appendRow(SHEETS.products, PRODUCT_HEADERS, body.product);
    return jsonResponse({ ok: true });
  }
  if (body.action === "updateProduct") {
    upsertRow(SHEETS.products, PRODUCT_HEADERS, "product_name", body.product);
    return jsonResponse({ ok: true });
  }
  if (body.action === "addExpense") {
    appendRow(SHEETS.expenses, EXPENSE_HEADERS, body.expense);
    return jsonResponse({ ok: true });
  }
  if (body.action === "updateExpense") {
    upsertRow(SHEETS.expenses, EXPENSE_HEADERS, "expense_id", body.expense);
    return jsonResponse({ ok: true });
  }
  return jsonResponse({ error: "Unknown action" });
}

function readSheet(sheetName, headers) {
  const sheet = getSheet(sheetName, headers);
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  const sheetHeaders = values[0].map(String);
  return values.slice(1).filter(rowHasData).map((row) => rowToObject(sheetHeaders, row));
}

function appendRow(sheetName, headers, item) {
  const sheet = getSheet(sheetName, headers);
  sheet.appendRow(headers.map((header) => item && item[header] !== undefined ? item[header] : ""));
}

function upsertRow(sheetName, headers, key, item) {
  const sheet = getSheet(sheetName, headers);
  const values = sheet.getDataRange().getValues();
  const sheetHeaders = values[0].map(String);
  const keyIndex = sheetHeaders.indexOf(key);
  const target = String(item[key] || "");
  for (let i = 1; i < values.length; i += 1) {
    if (String(values[i][keyIndex]) === target) {
      sheet.getRange(i + 1, 1, 1, headers.length).setValues([headers.map((header) => item[header] || "")]);
      return;
    }
  }
  appendRow(sheetName, headers, item);
}

function deleteRow(sheetName, headers, key, value) {
  const sheet = getSheet(sheetName, headers);
  const values = sheet.getDataRange().getValues();
  const sheetHeaders = values[0].map(String);
  const keyIndex = sheetHeaders.indexOf(key);
  for (let i = values.length - 1; i >= 1; i -= 1) {
    if (String(values[i][keyIndex]) === String(value)) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
}

function getSheet(sheetName, headers) {
  const spreadsheet = SpreadsheetApp.getActive();
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) sheet = spreadsheet.insertSheet(sheetName);
  const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  if (!rowHasData(firstRow)) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  return sheet;
}

function rowToObject(headers, row) {
  return headers.reduce((obj, header, index) => {
    obj[header] = row[index] instanceof Date ? formatDate(row[index]) : row[index];
    return obj;
  }, {});
}

function rowHasData(row) {
  return row.some((cell) => String(cell).trim() !== "");
}

function formatDate(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd");
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
