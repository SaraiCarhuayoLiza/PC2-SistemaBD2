const API = {
  productos: "/api/productos",
  movimientos: "/api/movimientos",
  categorias: "/api/categorias",
  usuarios: "/api/usuarios",
};

const state = {
  productos: [],
  movimientos: [],
  categorias: [],
  usuarios: [],
  view: "inicio",
};

const numberFormat = new Intl.NumberFormat("es-PE");
const currencyFormat = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  maximumFractionDigits: 2,
});

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return escapeHtml(value);
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function productName(id) {
  const product = state.productos.find((item) => Number(item.id) === Number(id));
  return product ? product.nombre : `Producto #${id ?? "—"}`;
}

function categoryName(id) {
  const category = state.categorias.find((item) => Number(item.id) === Number(id));
  return category ? category.nombre : `Categoría #${id ?? "—"}`;
}

function userName(id) {
  const user = state.usuarios.find((item) => Number(item.id) === Number(id));
  return user ? user.nombre : `Usuario #${id ?? "—"}`;
}

function stockStatus(stock) {
  const quantity = Number(stock) || 0;
  if (quantity <= 0) return '<span class="status-badge status-out">Agotado</span>';
  if (quantity <= 5) return '<span class="status-badge status-low">Stock bajo</span>';
  return '<span class="status-badge status-ok">Disponible</span>';
}

function productRow(product) {
  return `
    <tr>
      <td>
        <div class="product-name">
          <span class="product-symbol" aria-hidden="true">▦</span>
          <span>${escapeHtml(product.nombre || "Sin nombre")}</span>
        </div>
      </td>
      <td>${escapeHtml(categoryName(product.idCategoria))}</td>
      <td>${currencyFormat.format(Number(product.precio) || 0)}</td>
      <td>${numberFormat.format(Number(product.stock) || 0)} uds.</td>
      <td>${stockStatus(product.stock)}</td>
    </tr>`;
}

function movementRow(movement) {
  const isEntry = String(movement.tipo).toUpperCase() === "ENTRADA";
  const type = isEntry ? "ENTRADA" : "SALIDA";
  const direction = isEntry ? "in" : "out";
  const prefix = isEntry ? "+" : "−";
  return `
    <tr>
      <td><span class="movement-badge movement-${direction}">${type}</span></td>
      <td>${escapeHtml(productName(movement.idProducto))}</td>
      <td>${formatDate(movement.fecha)}</td>
      <td><span class="movement-quantity ${direction}">${prefix}${numberFormat.format(Number(movement.cantidad) || 0)} uds.</span></td>
      <td>${escapeHtml(userName(movement.idUsuario))}</td>
    </tr>`;
}

function setTableContent(tableId, emptyId, rows) {
  const table = document.getElementById(tableId);
  const empty = document.getElementById(emptyId);
  table.innerHTML = rows;
  empty.classList.toggle("hidden", Boolean(rows));
}

function renderProducts() {
  const sorted = [...state.productos].sort((a, b) =>
    String(a.nombre || "").localeCompare(String(b.nombre || ""), "es"),
  );
  const recent = sorted.slice(0, 5);
  setTableContent("overview-products", "overview-empty", recent.map((item) => productRow(item)).join(""));

  const query = document.getElementById("product-search").value.trim().toLocaleLowerCase("es");
  const filtered = sorted.filter((item) =>
    [item.nombre, categoryName(item.idCategoria)]
      .some((value) => String(value ?? "").toLocaleLowerCase("es").includes(query)),
  );
  setTableContent(
    "products-table",
    "products-empty",
    filtered.map((item) => productRow(item)).join(""),
  );
  document.getElementById("product-count-label").textContent =
    `${numberFormat.format(state.productos.length)} producto${state.productos.length === 1 ? "" : "s"} registrados`;

  const selector = document.getElementById("movement-product");
  const selected = selector.value;
  selector.innerHTML =
    '<option value="">Selecciona un producto</option>' +
    sorted
      .map(
        (item) =>
          `<option value="${escapeHtml(item.id)}">${escapeHtml(item.nombre)} · ${numberFormat.format(Number(item.stock) || 0)} uds.</option>`,
      )
      .join("");
  if (sorted.some((item) => String(item.id) === selected)) selector.value = selected;

  const categorySelect = document.getElementById("product-category");
  const selectedCategory = categorySelect.value;
  categorySelect.innerHTML =
    '<option value="">Selecciona una categoría</option>' +
    state.categorias
      .map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.nombre)}</option>`)
      .join("");
  if (state.categorias.some((item) => String(item.id) === selectedCategory)) {
    categorySelect.value = selectedCategory;
  }

  const userSelect = document.getElementById("movement-user");
  const selectedUser = userSelect.value;
  userSelect.innerHTML =
    '<option value="">Selecciona un usuario</option>' +
    state.usuarios
      .map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.nombre)} · ${escapeHtml(item.rol)}</option>`)
      .join("");
  if (state.usuarios.some((item) => String(item.id) === selectedUser)) {
    userSelect.value = selectedUser;
  }
}

function renderMovements() {
  const filter = document.getElementById("movement-filter").value;
  const movements = [...state.movimientos]
    .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0))
    .filter((item) => filter === "todos" || String(item.tipo).toUpperCase() === filter);
  const recent = [...state.movimientos]
    .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0))
    .slice(0, 5);
  setTableContent("overview-movements", "overview-movements-empty", recent.map(movementRow).join(""));
  setTableContent("movements-table", "movements-empty", movements.map(movementRow).join(""));
  document.getElementById("movement-count-label").textContent =
    `${numberFormat.format(movements.length)} movimiento${movements.length === 1 ? "" : "s"}${filter === "todos" ? " en total" : filter === "ENTRADA" ? " de entrada" : " de salida"}`;
}

function renderStats() {
  const totalStock = state.productos.reduce((sum, product) => sum + (Number(product.stock) || 0), 0);
  const lowStock = state.productos.filter((product) => (Number(product.stock) || 0) <= 5).length;
  const inventoryValue = state.productos.reduce(
    (sum, product) => sum + (Number(product.precio) || 0) * (Number(product.stock) || 0),
    0,
  );

  document.getElementById("stat-products").textContent = numberFormat.format(state.productos.length);
  document.getElementById("stat-stock").textContent = numberFormat.format(totalStock);
  document.getElementById("stat-low-stock").textContent = numberFormat.format(lowStock);
  document.getElementById("stat-value").textContent = currencyFormat.format(inventoryValue);
}

function render() {
  renderStats();
  renderProducts();
  renderMovements();
}

function setConnection(online, label) {
  const dot = document.getElementById("connection-dot");
  dot.classList.toggle("online", online);
  dot.classList.toggle("offline", !online);
  document.getElementById("connection-label").textContent = label;
}

function showAlert(message, type = "error") {
  const alert = document.getElementById("global-alert");
  alert.textContent = message;
  alert.classList.toggle("success", type === "success");
  alert.classList.remove("hidden");
  window.clearTimeout(showAlert.timeout);
  showAlert.timeout = window.setTimeout(() => alert.classList.add("hidden"), 5000);
  alert.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

async function request(path, options) {
  let response;
  try {
    response = await fetch(path, {
      ...options,
      headers: {
        ...(options?.body ? { "Content-Type": "application/json" } : {}),
        ...options?.headers,
      },
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor. Verifica que el backend esté iniciado.");
  }

  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || `El servidor respondió con el estado ${response.status}.`);
  }
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function loadInventory() {
  setConnection(false, "Conectando...");
  try {
    const [products, movements, categories, users] = await Promise.all([
      request(API.productos),
      request(API.movimientos),
      request(API.categorias),
      request(API.usuarios),
    ]);
    if (
      !Array.isArray(products) ||
      !Array.isArray(movements) ||
      !Array.isArray(categories) ||
      !Array.isArray(users)
    ) {
      throw new Error("El API respondió con un formato inesperado.");
    }
    state.productos = products;
    state.movimientos = movements;
    state.categorias = categories;
    state.usuarios = users;
    setConnection(true, "API conectada");
    render();
  } catch (error) {
    setConnection(false, "API desconectada");
    render();
    showAlert(error.message);
  }
}

function switchView(view) {
  state.view = view;
  document.querySelectorAll(".page-view").forEach((page) => {
    page.classList.toggle("hidden", page.id !== `view-${view}`);
  });
  document.querySelectorAll(".nav-link").forEach((link) => {
    const active = link.dataset.view === view;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  const labels = { inicio: "Resumen", productos: "Productos", movimientos: "Movimientos" };
  document.getElementById("breadcrumb-current").textContent = labels[view];
}

function openDialog(id) {
  const dialog = document.getElementById(id);
  if (id === "movement-dialog" && !state.productos.length) {
    showAlert("Registra primero un producto para poder agregar un movimiento.");
    switchView("productos");
    return;
  }
  dialog.showModal();
}

function closeDialog(button) {
  button.closest("dialog").close();
}

function formValues(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function setSubmitting(form, submitting, label) {
  const button = form.querySelector('button[type="submit"]');
  button.disabled = submitting;
  button.textContent = submitting ? "Guardando..." : label;
}

document.querySelectorAll(".nav-link").forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.view));
});

document.querySelectorAll("[data-switch-view]").forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.switchView));
});

document.querySelectorAll("[data-open-dialog]").forEach((button) => {
  button.addEventListener("click", () => openDialog(button.dataset.openDialog));
});

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => closeDialog(button));
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

document.getElementById("product-search").addEventListener("input", renderProducts);
document.getElementById("movement-filter").addEventListener("change", renderMovements);

document.getElementById("product-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const values = formValues(form);
  const payload = {
    nombre: values.nombre.trim(),
    precio: Number(values.precio),
    stock: Number(values.stock),
    idCategoria: Number(values.idCategoria),
  };
  setSubmitting(form, true, "Guardar producto");
  try {
    await request(API.productos, { method: "POST", body: JSON.stringify(payload) });
    form.reset();
    document.getElementById("product-dialog").close();
    await loadInventory();
    showAlert("Producto registrado correctamente.", "success");
  } catch (error) {
    showAlert(error.message);
  } finally {
    setSubmitting(form, false, "Guardar producto");
  }
});

document.getElementById("movement-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const values = formValues(form);
  const payload = {
    idProducto: Number(values.idProducto),
    idUsuario: Number(values.idUsuario),
    tipo: values.tipo,
    cantidad: Number(values.cantidad),
  };
  setSubmitting(form, true, "Guardar movimiento");
  try {
    await request(API.movimientos, { method: "POST", body: JSON.stringify(payload) });
    form.reset();
    document.getElementById("movement-dialog").close();
    await loadInventory();
    showAlert("Movimiento registrado y stock actualizado correctamente.", "success");
  } catch (error) {
    showAlert(error.message);
  } finally {
    setSubmitting(form, false, "Guardar movimiento");
  }
});

document.getElementById("today-label").textContent = new Intl.DateTimeFormat("es-PE", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
}).format(new Date());

loadInventory();
