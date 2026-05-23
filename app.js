const STORAGE_KEY = "orderflow-pwa-state-v1";
const config = window.ORDERFLOW_CONFIG || {};
const API_URL = (config.apiUrl || "").trim();
const today = new Date().toISOString().slice(0, 10);

const statuses = ["New", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled", "Returned"];
const paymentStatuses = ["Paid", "Pending", "Partial", "COD"];
const paymentMethods = ["UPI", "COD", "Bank Transfer", "Other"];
const sources = ["Instagram", "WhatsApp", "Website", "Referral", "Other"];
const orderTypes = ["Customer", "Influencer PR", "Collaboration", "Gifted", "Internal Sample"];
const platforms = ["Instagram", "YouTube", "TikTok", "Other"];
const collabTypes = ["Gifted", "Paid collaboration", "Affiliate", "Barter"];
const deliverables = ["Reel", "Story", "Post", "Review", "UGC content"];
const expenseTypes = ["Raw Material", "Shipping", "Ad Marketing", "Packaging", "Tools", "Other"];
const pages = ["Dashboard", "Orders", "Add Order", "Customers", "Metrics", "Expenses", "Export"];

let state = loadState();
let pendingFilterRender = null;
let restoreFilterFocus = null;
let isSyncing = false;

function seedOrders() {
  return [
    {
      order_id: "ORD-260523-001",
      order_date: today,
      customer_name: "Aarohi Mehta",
      phone: "9876543210",
      whatsapp: "9876543210",
      address: "14 Lake View Road",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400050",
      product: "Rose Silk Scrunchie Set",
      quantity: 2,
      amount: 1298,
      payment_method: "UPI",
      payment_status: "Paid",
      order_source: "Instagram",
      order_status: "Packed",
      courier_partner: "",
      tracking_id: "",
      tracking_link: "",
      packed_date: today,
      shipped_date: "",
      delivered_date: "",
      notes: "Gift wrap requested",
      created_by: "Admin",
      updated_by: "Admin",
      last_updated: today,
      order_type: "Customer",
      instagram_handle: "",
      influencer_name: "",
      follower_count: "",
      platform: "",
      collaboration_type: "",
      expected_deliverables: "",
      content_received: "No",
      content_link: "",
      performance_notes: "",
      coupon_code: "",
    },
    {
      order_id: "ORD-260522-014",
      order_date: "2026-05-22",
      customer_name: "Nisha Rao",
      phone: "9988776655",
      whatsapp: "",
      address: "88 Green Park",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560001",
      product: "Linen Tote",
      quantity: 1,
      amount: 1899,
      payment_method: "COD",
      payment_status: "COD",
      order_source: "Website",
      order_status: "Shipped",
      courier_partner: "Blue Dart",
      tracking_id: "BD123459",
      tracking_link: "https://example.com/track/BD123459",
      packed_date: "2026-05-22",
      shipped_date: today,
      delivered_date: "",
      notes: "",
      created_by: "Admin",
      updated_by: "Team",
      last_updated: today,
      order_type: "Customer",
      instagram_handle: "",
      influencer_name: "",
      follower_count: "",
      platform: "",
      collaboration_type: "",
      expected_deliverables: "",
      content_received: "No",
      content_link: "",
      performance_notes: "",
      coupon_code: "",
    },
    {
      order_id: "PR-260521-003",
      order_date: "2026-05-21",
      customer_name: "Maya Creates",
      phone: "9123456789",
      whatsapp: "9123456789",
      address: "Creator Studio, Sector 18",
      city: "Delhi",
      state: "Delhi",
      pincode: "110001",
      product: "Launch PR Box",
      quantity: 1,
      amount: 2200,
      payment_method: "Other",
      payment_status: "Pending",
      order_source: "Instagram",
      order_status: "Delivered",
      courier_partner: "Delhivery",
      tracking_id: "DLV9988",
      tracking_link: "https://example.com/track/DLV9988",
      packed_date: "2026-05-21",
      shipped_date: "2026-05-22",
      delivered_date: today,
      notes: "Awaiting reel",
      created_by: "Admin",
      updated_by: "Admin",
      last_updated: today,
      order_type: "Influencer PR",
      instagram_handle: "@maya.creates",
      influencer_name: "Maya Kapoor",
      follower_count: 68000,
      platform: "Instagram",
      collaboration_type: "Gifted",
      expected_deliverables: "Reel, Story",
      content_received: "No",
      content_link: "",
      performance_notes: "",
      coupon_code: "MAYA10",
    },
  ];
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return { products: seedProducts(), expenses: seedExpenses(), syncStatus: "Local cache", ...JSON.parse(saved) };
  return {
    user: null,
    page: "Dashboard",
    filters: {},
    selectedOrderId: null,
    orders: seedOrders(),
    products: seedProducts(),
    expenses: seedExpenses(),
    syncStatus: API_URL ? "Ready to sync" : "Local demo mode",
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function seedProducts() {
  return [
    { product_name: "Rose Silk Scrunchie Set", sku: "SCR-ROSE", price: 649, active: "Yes" },
    { product_name: "Linen Tote", sku: "TOTE-LINEN", price: 1899, active: "Yes" },
    { product_name: "Launch PR Box", sku: "PR-BOX", price: 2200, active: "Yes" },
  ];
}

function seedExpenses() {
  return [
    {
      expense_id: "EXP-260523-001",
      expense_date: today,
      expense_type: "Shipping",
      amount: 180,
      paid_by: "Swathi",
      paid_to: "Courier pickup",
      payment_method: "UPI",
      related_order_id: "ORD-260523-001",
      notes: "Local delivery charge",
      created_by: "Admin",
      last_updated: today,
    },
    {
      expense_id: "EXP-260522-001",
      expense_date: "2026-05-22",
      expense_type: "Ad Marketing",
      amount: 1200,
      paid_by: "Swathi",
      paid_to: "Instagram ads",
      payment_method: "Bank Transfer",
      related_order_id: "",
      notes: "Weekend campaign",
      created_by: "Admin",
      last_updated: "2026-05-22",
    },
  ];
}

function backendEnabled() {
  return Boolean(API_URL);
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function dateValue(value) {
  return value ? new Date(value + "T00:00:00") : null;
}

function isRevenueOrder(order) {
  return order.order_type === "Customer" && !["Cancelled", "Returned"].includes(order.order_status);
}

function className(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function badge(value, extra = "") {
  return `<span class="badge ${className(value)} ${extra}">${value}</span>`;
}

function setPage(page) {
  state.page = page;
  state.selectedOrderId = null;
  saveState();
  render();
}

function toast(message) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2400);
}

function render() {
  const app = document.getElementById("app");
  if (!state.user) {
    app.innerHTML = loginView();
    bindLogin();
    return;
  }

  app.innerHTML = `
    <div class="shell">
      ${sidebarView()}
      <main class="content">
        ${topbarView()}
        ${pageView()}
      </main>
      ${mobileNavView()}
    </div>
  `;
  bindGlobal();
  bindPage();
  restoreFocusedFilter();
}

function loginView() {
  return `
    <main class="login-screen">
      <section class="panel login-card">
        <div class="brand" style="margin-bottom: 18px">
          <span class="brand-mark">OF</span>
          <span>OrderFlow</span>
        </div>
        <p class="eyebrow">Internal PWA</p>
        <h1>Small business order desk</h1>
        <p class="muted">Sign in as an admin or team member to manage orders, PR shipments, customers, and exports.</p>
        <form id="loginForm" class="grid" style="margin-top: 18px">
          <div class="field">
            <label for="name">Name</label>
            <input id="name" name="name" required value="Swathi" />
          </div>
          <div class="field">
            <label for="role">Role</label>
            <select id="role" name="role">
              <option>Admin</option>
              <option>Team</option>
            </select>
          </div>
          <div class="field">
            <label for="pin">Role PIN</label>
            <input id="pin" name="pin" type="password" inputmode="numeric" required placeholder="Enter PIN" />
          </div>
          <p class="muted">Default demo PINs are Admin 1234 and Team 5678. Change them in config.js before sharing.</p>
          <button class="btn primary" type="submit">Sign in</button>
        </form>
      </section>
    </main>
  `;
}

function sidebarView() {
  return `
    <aside class="sidebar">
      <div class="brand"><span class="brand-mark">OF</span><span>OrderFlow</span></div>
      <nav class="nav">
        ${pages.map((page) => navButton(page)).join("")}
      </nav>
      <div class="role-card">
        <strong>${state.user.name}</strong>
        <small>${state.user.role} access</small>
        <button class="btn" data-action="logout" type="button">Sign out</button>
      </div>
    </aside>
  `;
}

function navButton(page) {
  const icon = {
    Dashboard: "⌂",
    Orders: "☷",
    "Add Order": "+",
    Customers: "◎",
    Metrics: "◫",
    Expenses: "₹",
    Export: "⇩",
  }[page];
  return `<button class="${state.page === page ? "active" : ""}" data-page="${page}" type="button"><span>${icon}</span>${page}</button>`;
}

function mobileNavView() {
  const mobilePages = ["Dashboard", "Orders", "Add Order", "Expenses", "Export"];
  return `<nav class="mobile-tabs">${mobilePages.map((page) => navButton(page)).join("")}</nav>`;
}

function topbarView() {
  return `
    <header class="topbar">
      <div>
        <p class="eyebrow">${state.user.role} workspace</p>
        <h1>${state.page}</h1>
        <p class="sync-line">${backendEnabled() ? state.syncStatus || "Connected to Google Sheets" : "Local demo mode. Add Apps Script URL in config.js to sync."}</p>
      </div>
      <div class="actions">
        <button class="btn" data-action="sync" type="button" ${backendEnabled() ? "" : "disabled"}>${isSyncing ? "Syncing" : "Sync"}</button>
        <button class="btn" data-action="install" type="button">Install</button>
        <button class="btn primary" data-page="Add Order" type="button">New order</button>
      </div>
    </header>
  `;
}

function pageView() {
  if (state.page === "Dashboard") return dashboardView();
  if (state.page === "Orders") return ordersView();
  if (state.page === "Add Order") return addOrderView();
  if (state.page === "Customers") return customersView();
  if (state.page === "Metrics") return metricsView();
  if (state.page === "Expenses") return expensesView();
  if (state.page === "Export") return exportView();
  return dashboardView();
}

function dashboardView() {
  const metrics = businessMetrics();
  const pr = prMetrics();
  return `
    <section class="grid stats">
      ${metricCard("Total orders", state.orders.length, "All shipments")}
      ${metricCard("Pending", countStatus("New") + countStatus("Confirmed"), "Needs action")}
      ${metricCard("Packed", countStatus("Packed"), "Ready to ship")}
      ${metricCard("Shipped", countStatus("Shipped"), "In transit")}
      ${metricCard("Delivered", countStatus("Delivered"), "Completed")}
      ${metricCard("Cancelled", countStatus("Cancelled"), "Stopped")}
      ${metricCard("Revenue", money(metrics.totalSales), "Customer sales only")}
      ${metricCard("Expenses", money(totalExpenses()), "Recorded costs")}
      ${metricCard("Today's orders", metrics.todayOrders, today)}
      ${metricCard("This week", metrics.weekOrders, "Last 7 days")}
      ${metricCard("PR sent", pr.totalPr, "Influencer packages")}
    </section>
    <section class="layout-2" style="margin-top: 16px">
      <div class="panel">
        <div class="panel-head"><h2>Top-selling products</h2><button class="btn" data-page="Orders" type="button">View orders</button></div>
        <div class="panel-body chart">${barChart(groupBy(state.orders.filter(isRevenueOrder), "product", "quantity"))}</div>
      </div>
      <div class="panel">
        <div class="panel-head"><h2>PR workflow</h2></div>
        <div class="panel-body grid">
          ${metricCard("Pending content", pr.pendingContent, "Follow up")}
          ${metricCard("Influencers posted", pr.posted, "Content received")}
          ${metricCard("Estimated reach", Number(pr.reach).toLocaleString("en-IN"), "Followers")}
          ${metricCard("Cost of PR sent", money(pr.cost), "Inventory value")}
        </div>
      </div>
    </section>
  `;
}

function metricCard(label, value, hint) {
  return `<article class="panel metric-card"><span>${label}</span><strong>${value}</strong><small>${hint || ""}</small></article>`;
}

function businessMetrics() {
  const revenueOrders = state.orders.filter(isRevenueOrder);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  return {
    totalSales: revenueOrders.reduce((sum, order) => sum + Number(order.amount || 0), 0),
    todayOrders: state.orders.filter((order) => order.order_date === today).length,
    weekOrders: state.orders.filter((order) => dateValue(order.order_date) >= weekAgo).length,
    averageOrderValue:
      revenueOrders.length === 0
        ? 0
        : revenueOrders.reduce((sum, order) => sum + Number(order.amount || 0), 0) / revenueOrders.length,
  };
}

function totalExpenses() {
  return (state.expenses || []).reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
}

function prMetrics() {
  const prOrders = state.orders.filter((order) => order.order_type !== "Customer");
  return {
    totalPr: prOrders.length,
    pendingContent: prOrders.filter((order) => order.content_received !== "Yes").length,
    posted: prOrders.filter((order) => order.content_received === "Yes").length,
    reach: prOrders.reduce((sum, order) => sum + Number(order.follower_count || 0), 0),
    cost: prOrders.reduce((sum, order) => sum + Number(order.amount || 0), 0),
  };
}

function countStatus(status) {
  return state.orders.filter((order) => order.order_status === status).length;
}

function groupBy(rows, field, valueField = "amount") {
  return rows.reduce((acc, row) => {
    const key = row[field] || "Unknown";
    acc[key] = (acc[key] || 0) + Number(row[valueField] || 0);
    return acc;
  }, {});
}

function barChart(data) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const max = Math.max(1, ...entries.map((entry) => entry[1]));
  if (!entries.length) return `<p class="muted">No data yet.</p>`;
  return entries
    .map(
      ([label, value]) => `
      <div class="bar-row">
        <span>${label}</span>
        <span class="bar-track"><span class="bar-fill" style="--w: ${(value / max) * 100}%"></span></span>
        <strong>${Number(value).toLocaleString("en-IN")}</strong>
      </div>`
    )
    .join("");
}

function ordersView() {
  const filtered = filteredOrders();
  const selected = state.orders.find((order) => order.order_id === state.selectedOrderId) || filtered[0];
  return `
    <section class="panel">
      <div class="panel-head">
        <h2>Filters and search</h2>
        <button class="btn" data-action="clearFilters" type="button">Clear</button>
      </div>
      <div class="panel-body filters">
        ${inputField("search", "Search", "Name, phone, order ID")}
        ${selectField("status", "Status", ["", ...statuses])}
        ${selectField("payment", "Payment", ["", ...paymentStatuses])}
        ${inputField("product", "Product", "Product name")}
        ${inputField("city", "City or state", "Location")}
        ${selectField("source", "Source", ["", ...sources])}
        ${selectField("type", "Order type", ["", ...orderTypes])}
        ${selectField("content", "Content received", ["", "Yes", "No"])}
        ${selectField("collab", "Collaboration", ["", ...collabTypes])}
        ${selectField("platform", "Platform", ["", ...platforms])}
        ${inputField("from", "From", "", "date")}
        ${inputField("to", "To", "", "date")}
      </div>
    </section>
    <section class="layout-2" style="margin-top: 16px">
      <div class="panel">
        <div class="panel-head"><h2>${filtered.length} orders</h2></div>
        <div class="table-wrap">${ordersTable(filtered)}</div>
        <div class="order-cards">${filtered.map(orderCard).join("")}</div>
      </div>
      <div class="panel">
        <div class="panel-head"><h2>Quick update</h2></div>
        <div class="panel-body">${selected ? updateForm(selected) : `<p class="muted">Select an order to update.</p>`}</div>
      </div>
    </section>
  `;
}

function inputField(name, labelText, placeholder = "", type = "text") {
  const value = state.filters[name] || "";
  return `
    <div class="field">
      <label for="${name}">${labelText}</label>
      <input id="${name}" name="${name}" type="${type}" placeholder="${placeholder}" value="${value}" data-filter="${name}" />
    </div>
  `;
}

function selectField(name, labelText, options, current = state.filters[name] || "") {
  return `
    <div class="field">
      <label for="${name}">${labelText}</label>
      <select id="${name}" name="${name}" data-filter="${name}">
        ${options.map((option) => `<option ${option === current ? "selected" : ""}>${option}</option>`).join("")}
      </select>
    </div>
  `;
}

function filteredOrders() {
  const f = state.filters;
  return state.orders.filter((order) => {
    const search = (f.search || "").toLowerCase();
    const searchHit = [order.customer_name, order.phone, order.order_id]
      .join(" ")
      .toLowerCase()
      .includes(search);
    const location = [order.city, order.state].join(" ").toLowerCase();
    return (
      (!search || searchHit) &&
      (!f.status || order.order_status === f.status) &&
      (!f.payment || order.payment_status === f.payment) &&
      (!f.product || String(order.product).toLowerCase().includes(f.product.toLowerCase())) &&
      (!f.city || location.includes(f.city.toLowerCase())) &&
      (!f.source || order.order_source === f.source) &&
      (!f.type || order.order_type === f.type) &&
      (!f.content || order.content_received === f.content) &&
      (!f.collab || order.collaboration_type === f.collab) &&
      (!f.platform || order.platform === f.platform) &&
      (!f.from || order.order_date >= f.from) &&
      (!f.to || order.order_date <= f.to)
    );
  });
}

function ordersTable(orders) {
  return `
    <table>
      <thead>
        <tr>
          <th>Order</th><th>Customer</th><th>Product</th><th>Amount</th><th>Payment</th><th>Status</th><th>Date</th><th>City</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>${orders.map(orderRow).join("")}</tbody>
    </table>
  `;
}

function orderRow(order) {
  const pending = order.payment_status === "Pending" ? `<div class="warning">Payment pending</div>` : "";
  return `
    <tr>
      <td><strong>${order.order_id}</strong><div class="badge-row">${typeBadges(order)}</div></td>
      <td>${order.customer_name}<div class="muted"><a href="tel:${order.phone}">${order.phone}</a></div></td>
      <td>${order.product}<div class="muted">Qty ${order.quantity}</div></td>
      <td>${order.order_type === "Customer" ? money(order.amount) : "No revenue"}</td>
      <td>${badge(order.payment_status)}${pending}</td>
      <td>${badge(order.order_status)}</td>
      <td>${order.order_date}</td>
      <td>${order.city}</td>
      <td><button class="btn" data-select="${order.order_id}" type="button">Update</button></td>
    </tr>
  `;
}

function orderCard(order) {
  return `
    <article class="order-card">
      <div class="split-line"><strong>${order.order_id}</strong>${badge(order.order_status)}</div>
      <div>${order.customer_name} · ${order.product}</div>
      <div class="badge-row">${typeBadges(order)}${badge(order.payment_status)}</div>
      <div class="split-line muted"><span>${order.city}</span><span>${order.order_date}</span></div>
      <button class="btn" data-select="${order.order_id}" type="button">Update</button>
    </article>
  `;
}

function typeBadges(order) {
  const badges = [];
  if (order.order_type !== "Customer") badges.push(badge(order.order_type.includes("PR") ? "PR" : order.order_type));
  if (order.collaboration_type) badges.push(badge(order.collaboration_type));
  if (order.order_type !== "Customer") badges.push(badge(order.content_received === "Yes" ? "Posted" : "Pending Post"));
  return badges.join("");
}

function updateForm(order) {
  const teamOnly = state.user.role === "Team";
  return `
    <form id="updateForm" class="grid">
      <input type="hidden" name="order_id" value="${order.order_id}" />
      <div>
        <strong>${order.order_id}</strong>
        <p class="muted">${order.customer_name} · ${order.product}</p>
        <div class="badge-row">${typeBadges(order)}${badge(order.order_status)}${badge(order.payment_status)}</div>
      </div>
      ${selectFieldRaw("order_status", "Order status", statuses, order.order_status)}
      <div class="form-grid quick-grid">
        ${dateFieldRaw("packed_date", "Packed date", order.packed_date)}
        ${dateFieldRaw("shipped_date", "Shipped date", order.shipped_date)}
        ${dateFieldRaw("delivered_date", "Delivered date", order.delivered_date)}
      </div>
      <div class="form-grid quick-grid">
        ${textFieldRaw("courier_partner", "Courier partner", order.courier_partner)}
        ${textFieldRaw("tracking_id", "Tracking ID", order.tracking_id)}
        ${textFieldRaw("tracking_link", "Tracking link", order.tracking_link)}
      </div>
      <div class="actions">
        <button class="btn" data-action="markShipped" type="button">Mark as Shipped</button>
        ${order.tracking_link ? `<a class="btn" href="${order.tracking_link}" target="_blank" rel="noreferrer">Open tracking</a>` : ""}
      </div>
      ${
        order.order_type !== "Customer"
          ? `<div class="form-grid quick-grid">
              ${selectFieldRaw("content_received", "Content received", ["Yes", "No"], order.content_received)}
              ${textFieldRaw("content_link", "Content URL", order.content_link)}
              ${textFieldRaw("performance_notes", "Performance notes", order.performance_notes)}
            </div>`
          : ""
      }
      <div class="field">
        <label for="notes">Internal notes</label>
        <textarea id="notes" name="notes">${order.notes || ""}</textarea>
      </div>
      <div class="actions">
        ${state.user.role === "Admin" ? `<button class="btn danger" data-action="deleteOrder" type="button">Delete</button>` : ""}
        <button class="btn primary" type="submit">${teamOnly ? "Save status" : "Save changes"}</button>
      </div>
    </form>
  `;
}

function textFieldRaw(name, labelText, value = "", required = false, readonly = false) {
  return `
    <div class="field">
      <label for="${name}">${labelText}</label>
      <input id="${name}" name="${name}" value="${value || ""}" ${required ? "required" : ""} ${readonly ? "readonly" : ""} />
    </div>
  `;
}

function dateFieldRaw(name, labelText, value = "") {
  return `
    <div class="field">
      <label for="${name}">${labelText}</label>
      <input id="${name}" name="${name}" type="date" value="${value || ""}" />
    </div>
  `;
}

function selectFieldRaw(name, labelText, options, current, required = false) {
  return `
    <div class="field">
      <label for="${name}">${labelText}</label>
      <select id="${name}" name="${name}" ${required ? "required" : ""}>
        ${options.map((option) => `<option ${option === current ? "selected" : ""}>${option}</option>`).join("")}
      </select>
    </div>
  `;
}

function addOrderView() {
  const nextId = nextOrderId();
  return `
    <section class="panel">
      <div class="panel-head"><h2>Order details</h2></div>
      <div class="panel-body">
        <form id="orderForm" class="form-grid">
          ${textFieldRaw("order_id", "Order ID", nextId, true, true)}
          ${dateFieldRaw("order_date", "Order date", today)}
          ${selectFieldRaw("order_type", "Order type", orderTypes, "Customer")}
          ${textFieldRaw("customer_name", "Customer name", "", true)}
          ${textFieldRaw("phone", "Phone number", "", true)}
          ${textFieldRaw("whatsapp", "WhatsApp number")}
          <div class="field full"><label for="address">Full address</label><textarea id="address" name="address" required></textarea></div>
          ${textFieldRaw("city", "City", "", true)}
          ${textFieldRaw("state", "State", "", true)}
          ${textFieldRaw("pincode", "Pincode", "", true)}
          ${multiProductFieldRaw()}
          ${selectFieldRaw("payment_method", "Payment method", paymentMethods, "UPI")}
          ${selectFieldRaw("payment_status", "Payment status", paymentStatuses, "Paid")}
          ${selectFieldRaw("order_source", "Order source", sources, "Instagram")}
          ${selectFieldRaw("order_status", "Order status", statuses, "New")}
          <div class="field full"><label for="notes">Notes</label><textarea id="notes" name="notes"></textarea></div>
          <div class="panel full" style="box-shadow:none">
            <div class="panel-head"><h2>Influencer / PR fields</h2></div>
            <div class="panel-body form-grid">
              ${textFieldRaw("instagram_handle", "Instagram handle")}
              ${textFieldRaw("influencer_name", "Influencer name")}
              ${textFieldRaw("follower_count", "Follower count")}
              ${selectFieldRaw("platform", "Platform", ["", ...platforms], "")}
              ${selectFieldRaw("collaboration_type", "Collaboration type", ["", ...collabTypes], "")}
              ${selectFieldRaw("expected_deliverables", "Expected deliverable", ["", ...deliverables], "")}
              ${selectFieldRaw("content_received", "Content received", ["No", "Yes"], "No")}
              ${textFieldRaw("content_link", "Posted content URL")}
              ${textFieldRaw("coupon_code", "Coupon/referral code")}
              <div class="field full"><label for="performance_notes">Performance notes</label><textarea id="performance_notes" name="performance_notes"></textarea></div>
            </div>
          </div>
          <div class="actions full">
            <button class="btn primary" type="submit">Save order</button>
          </div>
        </form>
      </div>
    </section>
  `;
}

function multiProductFieldRaw() {
  return `
    <div class="panel full product-picker" style="box-shadow:none">
      <div class="panel-head"><h2>Products ordered</h2></div>
      <div class="panel-body grid">
        <div class="product-add-row">
          ${productFieldRaw()}
          <div class="field">
            <label for="productQty">Qty</label>
            <input id="productQty" type="number" min="1" step="1" value="1" />
          </div>
          <button class="btn" data-action="addProductLine" type="button">Add product</button>
        </div>
        <div id="selectedProducts" class="selected-products">
          <p class="muted">No products selected yet.</p>
        </div>
        <input id="product" name="product" type="hidden" required />
        <input id="quantity" name="quantity" type="hidden" value="0" required />
        <div class="field">
          <label for="amount">Order amount</label>
          <input id="amount" name="amount" value="0" required />
        </div>
      </div>
    </div>
  `;
}

function productFieldRaw(current = "") {
  const products = productOptions();
  return `
    <div class="field">
      <label for="productPicker">Product ordered</label>
      <select id="productPicker">
        <option value="">Select product</option>
        ${products
          .map(
            (product) =>
              `<option value="${escapeHtml(product.name)}" data-price="${escapeHtml(product.price)}" ${product.name === current ? "selected" : ""}>${escapeHtml(product.name)}</option>`
          )
          .join("")}
      </select>
    </div>
  `;
}

function productNames() {
  return productOptions().map((product) => product.name);
}

function productOptions() {
  const sourceProducts = (state.products || []).length ? state.products : seedProducts();
  const fromProducts = sourceProducts
    .filter((product) => String(product.active || "Yes").toLowerCase() !== "no")
    .map((product) => ({
      name: product.product_name || product.name || product.product,
      price: product.price || product.amount || "",
    }))
    .filter((product) => product.name);
  const fromOrders = state.orders
    .map((order) => ({ name: order.product, price: "" }))
    .filter((product) => product.name);
  const byName = new Map();
  [...fromProducts, ...fromOrders].forEach((product) => {
    if (!byName.has(product.name)) byName.set(product.name, product);
  });
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function nextOrderId() {
  const prefix = "ORD-" + today.replaceAll("-", "").slice(2);
  const count = state.orders.filter((order) => order.order_id.startsWith(prefix)).length + 1;
  return `${prefix}-${String(count).padStart(3, "0")}`;
}

function customersView() {
  const customers = customerRows();
  const query = (state.filters.customer || "").toLowerCase();
  const filtered = customers.filter((customer) =>
    [customer.customer_name, customer.phone].join(" ").toLowerCase().includes(query)
  );
  return `
    <section class="panel">
      <div class="panel-head"><h2>Customer database</h2></div>
      <div class="panel-body">
        <div class="field"><label for="customerSearch">Search name or phone</label><input id="customerSearch" data-filter="customer" value="${state.filters.customer || ""}" /></div>
      </div>
    </section>
    <section class="customer-grid" style="margin-top: 16px">
      ${filtered.map(customerCard).join("") || `<p class="muted">No customers found.</p>`}
    </section>
  `;
}

function customerRows() {
  const map = new Map();
  state.orders.forEach((order) => {
    const key = order.phone || order.customer_name;
    const existing =
      map.get(key) ||
      {
        customer_name: order.customer_name,
        phone: order.phone,
        address: order.address,
        city: order.city,
        state: order.state,
        pincode: order.pincode,
        total_orders: 0,
        total_spent: 0,
        last_order_date: order.order_date,
        products_purchased: new Set(),
      };
    existing.total_orders += 1;
    if (isRevenueOrder(order)) existing.total_spent += Number(order.amount || 0);
    if (order.order_date > existing.last_order_date) existing.last_order_date = order.order_date;
    existing.products_purchased.add(order.product);
    map.set(key, existing);
  });
  return [...map.values()].map((customer) => ({
    ...customer,
    products_purchased: [...customer.products_purchased].join(", "),
  }));
}

function customerCard(customer) {
  const whatsapp = `https://wa.me/91${customer.phone}`;
  return `
    <article class="panel customer-card">
      <div class="split-line"><strong>${customer.customer_name}</strong><span>${money(customer.total_spent)}</span></div>
      <div class="muted">${customer.address}, ${customer.city}, ${customer.state} ${customer.pincode}</div>
      <div class="badge-row">${badge(`${customer.total_orders} orders`)}${badge(customer.last_order_date)}</div>
      <div class="muted">${customer.products_purchased}</div>
      <div class="actions">
        <a class="btn" href="tel:${customer.phone}">Call</a>
        <a class="btn" href="${whatsapp}" target="_blank" rel="noreferrer">WhatsApp</a>
        <button class="btn" data-copy="${customer.address}, ${customer.city}, ${customer.state} ${customer.pincode}" type="button">Copy address</button>
      </div>
    </article>
  `;
}

function metricsView() {
  const metrics = businessMetrics();
  const revenueOrders = state.orders.filter(isRevenueOrder);
  const prepaid = revenueOrders.filter((order) => order.payment_method !== "COD").length;
  const cod = revenueOrders.filter((order) => order.payment_method === "COD").length;
  return `
    <section class="grid stats">
      ${metricCard("Total sales", money(metrics.totalSales), "PR excluded")}
      ${metricCard("Average order value", money(metrics.averageOrderValue), "Customer sales")}
      ${metricCard("Repeat customers", repeatCustomers(), "2+ orders")}
      ${metricCard("Prepaid orders", prepaid, "UPI, bank, other")}
      ${metricCard("COD orders", cod, "Cash on delivery")}
    </section>
    <section class="layout-2" style="margin-top: 16px">
      <div class="panel"><div class="panel-head"><h2>Sales by product</h2></div><div class="panel-body chart">${barChart(groupBy(revenueOrders, "product"))}</div></div>
      <div class="panel"><div class="panel-head"><h2>Sales by source</h2></div><div class="panel-body chart">${barChart(groupBy(revenueOrders, "order_source"))}</div></div>
      <div class="panel"><div class="panel-head"><h2>Orders by status</h2></div><div class="panel-body chart">${barChart(groupBy(state.orders, "order_status", "quantity"))}</div></div>
      <div class="panel"><div class="panel-head"><h2>Monthly sales trend</h2></div><div class="panel-body chart">${barChart(monthlySales(revenueOrders))}</div></div>
    </section>
  `;
}

function repeatCustomers() {
  return customerRows().filter((customer) => customer.total_orders > 1).length;
}

function monthlySales(rows) {
  return rows.reduce((acc, order) => {
    const month = order.order_date.slice(0, 7);
    acc[month] = (acc[month] || 0) + Number(order.amount || 0);
    return acc;
  }, {});
}

function expensesView() {
  const expenses = state.expenses || [];
  const byType = groupBy(expenses, "expense_type");
  return `
    <section class="grid stats">
      ${metricCard("Total expenses", money(totalExpenses()), "All recorded costs")}
      ${metricCard("Shipping", money(sumExpenses("Shipping")), "Courier and freight")}
      ${metricCard("Raw material", money(sumExpenses("Raw Material")), "Materials bought")}
      ${metricCard("Ad marketing", money(sumExpenses("Ad Marketing")), "Campaign spend")}
      ${metricCard("Entries", expenses.length, "Expense rows")}
    </section>
    <section class="layout-2" style="margin-top: 16px">
      <div class="panel">
        <div class="panel-head"><h2>Add expense</h2></div>
        <div class="panel-body">
          <form id="expenseForm" class="form-grid">
            ${textFieldRaw("expense_id", "Expense ID", nextExpenseId(), true, true)}
            ${dateFieldRaw("expense_date", "Date", today)}
            ${selectFieldRaw("expense_type", "Type", expenseTypes, "Shipping", true)}
            ${textFieldRaw("amount", "Amount paid", "", true)}
            ${textFieldRaw("paid_by", "Who paid", state.user.name, true)}
            ${textFieldRaw("paid_to", "Paid to / vendor", "", true)}
            ${selectFieldRaw("payment_method", "Payment method", paymentMethods, "UPI")}
            ${textFieldRaw("related_order_id", "Related order ID")}
            <div class="field full"><label for="notes">Notes</label><textarea id="notes" name="notes"></textarea></div>
            <div class="actions full"><button class="btn primary" type="submit">Save expense</button></div>
          </form>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><h2>Expense by type</h2></div>
        <div class="panel-body chart">${barChart(byType)}</div>
      </div>
    </section>
    <section class="panel" style="margin-top: 16px">
      <div class="panel-head"><h2>Recent expenses</h2></div>
      <div class="table-wrap">${expensesTable(expenses)}</div>
      <div class="order-cards">${expenses.map(expenseCard).join("")}</div>
    </section>
  `;
}

function sumExpenses(type) {
  return (state.expenses || [])
    .filter((expense) => expense.expense_type === type)
    .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
}

function nextExpenseId() {
  const prefix = "EXP-" + today.replaceAll("-", "").slice(2);
  const count = (state.expenses || []).filter((expense) => expense.expense_id.startsWith(prefix)).length + 1;
  return `${prefix}-${String(count).padStart(3, "0")}`;
}

function expensesTable(expenses) {
  return `
    <table>
      <thead>
        <tr><th>Date</th><th>Type</th><th>Amount</th><th>Paid by</th><th>Paid to</th><th>Mode</th><th>Order</th><th>Notes</th></tr>
      </thead>
      <tbody>${expenses.map(expenseRow).join("")}</tbody>
    </table>
  `;
}

function expenseRow(expense) {
  return `
    <tr>
      <td><strong>${expense.expense_date}</strong><div class="muted">${expense.expense_id}</div></td>
      <td>${badge(expense.expense_type)}</td>
      <td>${money(expense.amount)}</td>
      <td>${expense.paid_by}</td>
      <td>${expense.paid_to}</td>
      <td>${expense.payment_method}</td>
      <td>${expense.related_order_id || "-"}</td>
      <td>${expense.notes || ""}</td>
    </tr>
  `;
}

function expenseCard(expense) {
  return `
    <article class="order-card">
      <div class="split-line"><strong>${money(expense.amount)}</strong>${badge(expense.expense_type)}</div>
      <div>${expense.paid_to}</div>
      <div class="muted">${expense.expense_date} · paid by ${expense.paid_by}</div>
      <div class="muted">${expense.related_order_id || ""} ${expense.notes || ""}</div>
    </article>
  `;
}

function exportView() {
  const admin = state.user.role === "Admin";
  return `
    <section class="panel" style="margin-bottom: 16px">
      <div class="panel-head"><h2>Google Sheets backend</h2></div>
      <div class="panel-body grid">
        <p class="muted">${backendEnabled() ? "Connected through the Apps Script URL in config.js." : "Not connected yet. Add your Apps Script Web App URL to config.js."}</p>
        <div class="badge-row">
          ${badge(backendEnabled() ? "Sheet sync ready" : "Local mode")}
          ${badge(`${(state.products || []).length} products`)}
          ${badge(`${state.orders.length} orders`)}
          ${badge(`${customerRows().length} customers`)}
          ${badge(`${(state.expenses || []).length} expenses`)}
        </div>
        <p class="muted">Customers are generated from the Orders sheet. If Orders sync as 0 rows, Customers will also be empty.</p>
        <div class="actions" style="justify-content:flex-start">
          <button class="btn" data-action="sync" ${backendEnabled() ? "" : "disabled"} type="button">Sync now</button>
        </div>
      </div>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>CSV exports</h2></div>
      <div class="panel-body grid">
        <p class="muted">Exports follow the spreadsheet columns from the brief. Filtered orders use the current Orders page filters.</p>
        <div class="actions" style="justify-content:flex-start">
          <button class="btn primary" data-export="all" ${admin ? "" : "disabled"} type="button">All orders CSV</button>
          <button class="btn" data-export="filtered" ${admin ? "" : "disabled"} type="button">Filtered orders CSV</button>
          <button class="btn" data-export="customers" ${admin ? "" : "disabled"} type="button">Customers CSV</button>
          <button class="btn" data-export="expenses" ${admin ? "" : "disabled"} type="button">Expenses CSV</button>
        </div>
        ${admin ? "" : `<p class="warning">Team users cannot export data.</p>`}
      </div>
    </section>
  `;
}

function bindLogin() {
  document.getElementById("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const role = form.get("role");
    const expectedPin = role === "Admin" ? config.adminPin : config.teamPin;
    if (String(form.get("pin")) !== String(expectedPin)) {
      toast("Incorrect PIN for selected role.");
      return;
    }
    state.user = { name: form.get("name"), role };
    saveState();
    render();
    syncFromBackend();
  });
}

function bindGlobal() {
  document.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => setPage(button.dataset.page));
  });
  document.querySelector('[data-action="logout"]')?.addEventListener("click", () => {
    state.user = null;
    saveState();
    render();
  });
  document.querySelector('[data-action="install"]')?.addEventListener("click", () => {
    toast("Use your browser menu to install this PWA.");
  });
  document.querySelectorAll('[data-action="sync"]').forEach((button) => {
    button.addEventListener("click", syncFromBackend);
  });
}

function bindPage() {
  document.querySelectorAll("[data-filter]").forEach((input) => {
    input.addEventListener("input", () => {
      state.filters[input.dataset.filter] = input.value;
      saveState();
      restoreFilterFocus = input.dataset.filter;
      clearTimeout(pendingFilterRender);
      pendingFilterRender = setTimeout(render, 220);
    });
  });
  document.querySelectorAll("[data-select]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedOrderId = button.dataset.select;
      saveState();
      render();
    });
  });
  document.querySelector('[data-action="clearFilters"]')?.addEventListener("click", () => {
    state.filters = {};
    saveState();
    render();
  });
  document.getElementById("orderForm")?.addEventListener("submit", createOrder);
  document.querySelector('[data-action="addProductLine"]')?.addEventListener("click", addProductLine);
  document.getElementById("selectedProducts")?.addEventListener("click", removeProductLine);
  document.getElementById("expenseForm")?.addEventListener("submit", createExpense);
  document.getElementById("updateForm")?.addEventListener("submit", updateOrder);
  document.querySelector('[data-action="markShipped"]')?.addEventListener("click", markShipped);
  document.querySelector('[data-action="deleteOrder"]')?.addEventListener("click", deleteOrder);
  document.querySelectorAll("[data-export]").forEach((button) => {
    button.addEventListener("click", () => exportCsv(button.dataset.export));
  });
  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      await navigator.clipboard.writeText(button.dataset.copy);
      toast("Address copied");
    });
  });
}

function restoreFocusedFilter() {
  if (!restoreFilterFocus) return;
  const input = document.querySelector(`[data-filter="${restoreFilterFocus}"]`);
  if (!input) return;
  input.focus();
  if (typeof input.selectionStart === "number") {
    const end = input.value.length;
    input.setSelectionRange(end, end);
  }
}

function formObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function selectedOrderItems() {
  const raw = document.getElementById("productItems")?.value || "[]";
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function setSelectedOrderItems(items) {
  const existing = document.getElementById("productItems");
  if (existing) {
    existing.value = JSON.stringify(items);
    return;
  }
  const input = document.createElement("input");
  input.type = "hidden";
  input.id = "productItems";
  input.value = JSON.stringify(items);
  document.getElementById("orderForm")?.appendChild(input);
}

function addProductLine() {
  const picker = document.getElementById("productPicker");
  const qtyInput = document.getElementById("productQty");
  if (!picker || !qtyInput) return;
  const option = picker.selectedOptions[0];
  const name = picker.value;
  const qty = Math.max(1, Number(qtyInput.value || 1));
  const price = Number(option?.dataset.price || 0);
  if (!name) {
    toast("Select a product first.");
    return;
  }
  const items = selectedOrderItems();
  const existing = items.find((item) => item.name === name);
  if (existing) {
    existing.qty += qty;
  } else {
    items.push({ name, qty, price });
  }
  setSelectedOrderItems(items);
  picker.value = "";
  qtyInput.value = "1";
  renderSelectedProducts();
}

function removeProductLine(event) {
  const button = event.target.closest("[data-remove-product]");
  if (!button) return;
  const items = selectedOrderItems().filter((item) => item.name !== button.dataset.removeProduct);
  setSelectedOrderItems(items);
  renderSelectedProducts();
}

function renderSelectedProducts() {
  const items = selectedOrderItems();
  const list = document.getElementById("selectedProducts");
  const productInput = document.getElementById("product");
  const quantityInput = document.getElementById("quantity");
  const amountInput = document.getElementById("amount");
  if (!list || !productInput || !quantityInput || !amountInput) return;
  const totalQty = items.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  const totalAmount = items.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.price || 0), 0);
  productInput.value = items.map((item) => `${item.name} x ${item.qty}`).join("; ");
  quantityInput.value = totalQty;
  amountInput.value = String(totalAmount);
  list.innerHTML = items.length
    ? items
        .map(
          (item) => `
            <div class="product-line">
              <span><strong>${escapeHtml(item.name)}</strong> x ${item.qty}</span>
              <span>${money(Number(item.qty || 0) * Number(item.price || 0))}</span>
              <button class="btn icon" data-remove-product="${escapeHtml(item.name)}" type="button" aria-label="Remove ${escapeHtml(item.name)}">×</button>
            </div>
          `
        )
        .join("")
    : `<p class="muted">No products selected yet.</p>`;
}

async function createOrder(event) {
  event.preventDefault();
  renderSelectedProducts();
  const order = {
    ...blankOrder(),
    ...formObject(event.currentTarget),
    created_by: state.user.name,
    updated_by: state.user.name,
    last_updated: today,
  };
  if (!order.product || Number(order.quantity || 0) <= 0) {
    toast("Add at least one product to the order.");
    return;
  }
  if (order.order_status === "Shipped" && (!order.tracking_id)) {
    toast("Tracking ID and link are required for shipped orders.");
    return;
  }
  state.orders.unshift(order);
  state.page = "Orders";
  state.selectedOrderId = order.order_id;
  saveState();
  render();
  await pushToBackend("addOrder", { order }, "Order saved");
}

async function createExpense(event) {
  event.preventDefault();
  const expense = {
    ...formObject(event.currentTarget),
    created_by: state.user.name,
    last_updated: today,
  };
  if (!expense.amount || Number(expense.amount) <= 0) {
    toast("Enter a valid expense amount.");
    return;
  }
  state.expenses = [expense, ...(state.expenses || [])];
  saveState();
  render();
  await pushToBackend("addExpense", { expense }, "Expense saved");
}

function blankOrder() {
  return {
    courier_partner: "",
    tracking_id: "",
    tracking_link: "",
    packed_date: "",
    shipped_date: "",
    delivered_date: "",
  };
}

async function updateOrder(event) {
  event.preventDefault();
  const data = formObject(event.currentTarget);
  if (data.order_status === "Shipped" && (!data.tracking_id) {
    toast("Tracking ID and link are required before marking shipped.");
    return;
  }
  state.orders = state.orders.map((order) => {
    if (order.order_id !== data.order_id) return order;
    return { ...order, ...data, updated_by: state.user.name, last_updated: today };
  });
  saveState();
  render();
  await pushToBackend("updateOrder", { order: state.orders.find((order) => order.order_id === data.order_id) }, "Order updated");
}

function markShipped() {
  const form = document.getElementById("updateForm");
  form.order_status.value = "Shipped";
  form.shipped_date.value = form.shipped_date.value || today;
  toast("Add tracking details, then save.");
}

async function deleteOrder() {
  if (state.user.role !== "Admin") return;
  const id = document.getElementById("updateForm").order_id.value;
  state.orders = state.orders.filter((order) => order.order_id !== id);
  state.selectedOrderId = null;
  saveState();
  render();
  await pushToBackend("deleteOrder", { order_id: id }, "Order deleted");
}

function exportCsv(kind) {
  if (state.user.role !== "Admin") return;
  const rows =
    kind === "customers"
      ? customerRows()
      : kind === "filtered"
        ? filteredOrders()
        : kind === "expenses"
          ? state.expenses || []
          : state.orders;
  const csv = toCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `orderflow-${kind}-${today}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function toCsv(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  return [headers.join(","), ...rows.map((row) => headers.map((header) => escape(row[header])).join(","))].join("\n");
}

async function syncFromBackend() {
  if (!backendEnabled() || isSyncing) return;
  isSyncing = true;
  state.syncStatus = "Syncing with Google Sheets...";
  saveState();
  render();
  try {
    const data = await apiGet("bootstrap");
    const backendOrders = Array.isArray(data.orders) ? data.orders : null;
    const backendProducts = Array.isArray(data.products) ? data.products : null;
    const backendExpenses = Array.isArray(data.expenses) ? data.expenses : null;
    if (backendOrders && (backendOrders.length || !state.orders.length)) state.orders = backendOrders;
    state.products = backendProducts ? backendProducts : state.products;
    state.expenses = backendExpenses ? backendExpenses : state.expenses;
    state.syncStatus = `Synced ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · ${backendOrders ? backendOrders.length : "?"} orders · ${backendProducts ? backendProducts.length : "?"} products · ${backendExpenses ? backendExpenses.length : "?"} expenses`;
    saveState();
    render();
  } catch (error) {
    state.syncStatus = "Sheet sync failed. Using local cache.";
    saveState();
    render();
    toast("Could not sync Google Sheets.");
  } finally {
    isSyncing = false;
  }
}

async function pushToBackend(action, payload, successMessage) {
  if (!backendEnabled()) {
    toast(`${successMessage} locally`);
    return;
  }
  try {
    await apiPost(action, payload);
    toast(`${successMessage} and synced`);
    await syncFromBackend();
  } catch (error) {
    state.syncStatus = "Save queued locally. Sync failed.";
    saveState();
    render();
    toast(`${successMessage} locally. Sheet sync failed.`);
  }
}

async function apiGet(action) {
  const response = await fetch(`${API_URL}?action=${encodeURIComponent(action)}`);
  if (!response.ok) throw new Error("Backend request failed");
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data;
}

async function apiPost(action, payload) {
  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ action, ...payload }),
  });
  if (!response.ok) throw new Error("Backend save failed");
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data;
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

render();
