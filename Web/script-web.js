/* ---------- Utilitários DOM e storage ---------- */
const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const load = (k, f = []) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : f;
  } catch {
    return f;
  }
};
const toast = (m) => alert(m);

/* ---------- Base da API (ajustar quando o back subir) ---------- */
const API_BASE = "https://api.h2opurificadores.com";

/* ---------- Seed de demonstração (1ª execução) ---------- */
(function seed() {
  if (!load("users").length) {
    save("users", [
      {
        id: 1,
        name: "Administrador",
        email: "admin@h2o.com",
        password: "123",
        role: "admin",
      },
      {
        id: 2,
        name: "Usuário Demo",
        email: "demo@h2o.com",
        password: "123",
        role: "user",
      },
    ]);
  }
  if (!load("tickets").length) {
    save("tickets", [
      {
        id: 1,
        title: "Computador não liga",
        category: "hardware",
        priority: "alta",
        status: "aberto",
        ownerId: 2,
        createdAt: new Date().toISOString(),
        description: "Sem energia ao ligar.",
        comments: [
          {
            author: "Suporte",
            text: "Verificar fonte.",
            date: new Date().toISOString(),
          },
        ],
      },
      {
        id: 2,
        title: "Erro no ERP",
        category: "software",
        priority: "media",
        status: "andamento",
        ownerId: 2,
        createdAt: new Date().toISOString(),
        description: "Tela trava no login.",
        comments: [],
      },
    ]);
  }
})();

/* ---------- Navegação e sessão ---------- */
function go(url) {
  window.location.href = url;
}
function logout() {
  localStorage.removeItem("user");
  go("login-web.html");
}

/* ========================================
   LOGIN — valida local e aponta para API
   ======================================== */
function initLogin() {
  const form = $("#login-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("#email").value.trim().toLowerCase();
    const password = $("#password").value.trim();
    if (!email || !password) return toast("Preencha e-mail e senha.");

    // Ponto de integração: autenticação real
    // fetch(`${API_BASE}/auth/login`, { ... })

    // Simulação local (demo acadêmica)
    const users = load("users");
    const u = users.find((x) => x.email === email && x.password === password);
    if (!u) return toast("Credenciais inválidas.");
    save("user", u);
    go(
      u.role === "admin"
        ? "admin-dashboard-web.html"
        : "user-dashboard-web.html"
    );
  });
}

/* =================================================
   CADASTRO — grava local e aponta para API futura
   ================================================= */
function initRegister() {
  const form = $("#register-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#r-name").value.trim();
    const email = $("#r-email").value.trim().toLowerCase();
    const pass = $("#r-pass").value.trim();
    const pass2 = $("#r-pass2").value.trim();

    if (!name || !email || !pass || !pass2)
      return toast("Preencha todos os campos.");
    if (pass !== pass2) return toast("As senhas não coincidem.");

    // Ponto de integração: criação real de usuário
    // fetch(`${API_BASE}/users/register`, { ... })

    // Simulação local
    const users = load("users");
    if (users.some((u) => u.email === email))
      return toast("E-mail já cadastrado.");
    users.push({ id: Date.now(), name, email, password: pass, role: "user" });
    save("users", users);
    toast("Conta criada com sucesso! Faça login.");
    go("login-web.html");
  });
}

/* ==========================================================
   DASHBOARD DO USUÁRIO — lista, filtros e busca no front
   ========================================================== */
function initUserDashboard() {
  const tbody = $("#tickets-body");
  if (!tbody) return;

  const user = load("user", null);
  const all = load("tickets");
  const mine = all.filter(
    (t) => user && (t.ownerId === user.id || user.role === "admin")
  );

  renderTicketsTable(mine, tbody);

  $("#btn-novo")?.addEventListener("click", () => go("novo-ticket-web.html"));
  $("#flt-status")?.addEventListener("change", (e) => {
    const v = e.target.value;
    renderTicketsTable(v ? mine.filter((t) => t.status === v) : mine, tbody);
  });
  $("#flt-prio")?.addEventListener("change", (e) => {
    const v = e.target.value;
    renderTicketsTable(v ? mine.filter((t) => t.priority === v) : mine, tbody);
  });
  $("#flt-search")?.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    renderTicketsTable(
      mine.filter((t) =>
        `${t.id} ${t.title} ${t.category}`.toLowerCase().includes(q)
      ),
      tbody
    );
  });
}

/* Tabela de chamados (compartilhada entre páginas) */
function renderTicketsTable(arr, tbody) {
  tbody.innerHTML = "";
  if (!arr.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#64748b">Nenhum chamado</td></tr>`;
    return;
  }
  arr.forEach((t) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>#${t.id}</td>
      <td>${t.title}</td>
      <td><span class="badge ${statusClass(t.status)}">${t.status}</span></td>
      <td><span class="badge ${prioClass(t.priority)}">${t.priority}</span></td>
      <td>${t.category}</td>
      <td><button class="btn btn-outline btn-sm" data-id="${
        t.id
      }">Abrir</button></td>
    `;
    tbody.appendChild(tr);
  });

  $$("button[data-id]").forEach((b) => {
    b.addEventListener("click", () => {
      const id = Number(b.getAttribute("data-id"));
      const t = load("tickets").find((x) => x.id === id);
      localStorage.setItem("currentTicket", JSON.stringify(t));
      go("ticket-detalhes-web.html");
    });
  });
}

const statusClass = (s) =>
  ({
    aberto: "status-aberto",
    pendente: "status-pendente",
    andamento: "status-andamento",
    resolvido: "status-resolvido",
  }[s] || "status-aberto");

const prioClass = (p) =>
  ({
    alta: "prio-alta",
    media: "prio-media",
    baixa: "prio-baixa",
  }[p] || "prio-media");

/* ==========================================
   NOVO CHAMADO — cria no localStorage (demo)
   ========================================== */
function initNewTicket() {
  const form = $("#new-ticket-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = $("#title").value.trim();
    const category = $("#category").value;
    const priority = $("#priority").value;
    const description = $("#description").value.trim();

    if (!title || !category || !priority || !description)
      return toast("Preencha todos os campos.");

    const user = load("user", null);
    const newTicket = {
      id: Date.now(),
      title,
      category,
      priority,
      description,
      status: "aberto",
      ownerId: user ? user.id : null,
      createdAt: new Date().toISOString(),
      comments: [],
    };

    // Ponto de integração: POST /tickets
    // fetch(`${API_BASE}/tickets`, { ... })

    const all = load("tickets");
    all.push(newTicket);
    save("tickets", all);
    toast("Chamado criado!");
    go("user-dashboard-web.html");
  });
}

/* ==================================================================
   DETALHES DO CHAMADO — resumo, descrição, status, comentários (demo)
   ================================================================== */
function initTicketDetails() {
  const wrap = $("#ticket-view");
  if (!wrap) return;

  let t = load("currentTicket", null);
  if (!t) {
    toast("Chamado não encontrado");
    return go("user-dashboard-web.html");
  }

  $("#t-id").textContent = "#" + t.id;
  $("#t-title").textContent = t.title;
  $("#t-status").innerHTML = `<span class="badge ${statusClass(t.status)}">${
    t.status
  }</span>`;
  $("#t-priority").innerHTML = `<span class="badge ${prioClass(t.priority)}">${
    t.priority
  }</span>`;
  $("#t-category").textContent = t.category;
  $("#t-created").textContent = new Date(t.createdAt).toLocaleString();
  $("#t-desc").textContent = t.description || "-";

  renderComments(t, $("#comments"));

  // Alterar status (simulação local)
  $("#change-status")?.addEventListener("change", (e) => {
    const v = e.target.value;
    if (!v) return;
    t.status = v;
    $("#t-status").innerHTML = `<span class="badge ${statusClass(t.status)}">${
      t.status
    }</span>`;
    persistTicket(t);
  });

  // Novo comentário (simulação local)
  $("#comment-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const txt = $("#comment-text").value.trim();
    if (!txt) return;
    t.comments.push({
      author: "Você",
      text: txt,
      date: new Date().toISOString(),
    });
    $("#comment-text").value = "";
    renderComments(t, $("#comments"));
    persistTicket(t);
  });

  setupNavLogout();
}

/* Lista de comentários (itens de atividade) */
function renderComments(t, list) {
  list.innerHTML = "";
  if (!t.comments?.length) {
    list.innerHTML = `<li class="help">Sem atividades.</li>`;
    return;
  }
  t.comments.forEach((c) => {
    const li = document.createElement("li");
    li.className = "card";
    li.innerHTML = `<strong>${c.author}</strong> — ${new Date(
      c.date
    ).toLocaleString()}<br>${c.text}`;
    list.appendChild(li);
  });
}

/* Atualiza o ticket no storage local (simulação) */
function persistTicket(t) {
  const all = load("tickets");
  const i = all.findIndex((x) => x.id === t.id);
  if (i > -1) all[i] = t;
  save("tickets", all);
  localStorage.setItem("currentTicket", JSON.stringify(t));
}

/* ===========================================
   CONFIGURAÇÕES — sair da conta (e futuros)
   =========================================== */
function initConfig() {
  const btn = $("#logout-btn");
  if (btn)
    btn.addEventListener("click", () => {
      if (confirm("Sair do sistema?")) logout();
    });
  setupNavLogout();
}

/* =========================================
   ADMIN — visão geral e listagem (simulação)
   ========================================= */
function initAdmin() {
  const tbody = $("#tickets-body-admin");
  if (!tbody) return;

  const all = load("tickets");
  renderTicketsTable(all, tbody);

  // KPIs (se existirem na página)
  const k = {
    total: all.length,
    aberto: all.filter((t) => t.status === "aberto").length,
    pendente: all.filter((t) => t.status === "pendente").length,
    andamento: all.filter((t) => t.status === "andamento").length,
    resolvido: all.filter((t) => t.status === "resolvido").length,
  };
  $("#kpi-total") && ($("#kpi-total").textContent = k.total);
  $("#kpi-aberto") && ($("#kpi-aberto").textContent = k.aberto);
  $("#kpi-pendente") && ($("#kpi-pendente").textContent = k.pendente);
  $("#kpi-andamento") && ($("#kpi-andamento").textContent = k.andamento);
  $("#kpi-resolvido") && ($("#kpi-resolvido").textContent = k.resolvido);

  setupNavLogout();
}

/* -------------------------------------------
   Sair pelo menu principal (link "Sair")
-------------------------------------------- */
function setupNavLogout() {
  $("#nav-logout")?.addEventListener("click", (e) => {
    e.preventDefault();
    if (confirm("Deseja realmente sair?")) logout();
  });
}

/* -------------------------------------------
   Mostrar/ocultar senha (acessível + visual)
-------------------------------------------- */
function initPasswordToggles() {
  document.querySelectorAll(".toggle-btn").forEach((btn) => {
    btn.setAttribute("aria-pressed", "false");
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-target");
      const input = document.getElementById(id);
      if (!input) return;
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      const svg = btn.querySelector("svg");
      if (svg) svg.style.fill = show ? "#2563eb" : "#475569";
      btn.setAttribute("aria-pressed", show ? "true" : "false");
    });
  });
}

/* ---------- Inicialização global (auto) ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initLogin();
  initRegister();
  initUserDashboard();
  initNewTicket();
  initTicketDetails();
  initConfig();
  initAdmin();
  initPasswordToggles();
});
