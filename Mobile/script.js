/* =========================================================
   SISTEMA DE CHAMADOS - FRONT MOBILE (Simulado + API Ready)
   ========================================================= */

/* ========================
   1️⃣ UTILITÁRIOS GERAIS
   ======================== */
function qs(sel) {
  return document.querySelector(sel);
}
function qsa(sel) {
  return document.querySelectorAll(sel);
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
function load(key, fallback = []) {
  const data = localStorage.getItem(key);
  try {
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}
function show(el) {
  if (el) el.hidden = false;
}
function hide(el) {
  if (el) el.hidden = true;
}
function toast(msg) {
  alert(msg);
} // simples por enquanto

/* URL base da API (alterar quando o back for publicado) */
const API_BASE = "https://api.h2opurificadores.com"; // 🔗 API: URL da API ASP.NET

/* Semeia dados de demonstração para 1ª execução */
function seedDemoData() {
  if (!load("users").length) {
    save("users", [
      { name: "Usuário Demo", email: "demo@h2o.com", password: "123" },
    ]);
  }
  if (!load("tickets").length) {
    save("tickets", [
      {
        id: 1,
        title: "Computador não liga",
        category: "hardware",
        priority: "alta",
        description: "Ao ligar, o PC faz 3 bipes e não dá vídeo.",
        status: "aberto",
        createdAt: new Date().toISOString(),
        comments: [
          {
            author: "Suporte",
            text: "Verificar fonte e memórias.",
            date: new Date().toISOString(),
          },
        ],
      },
    ]);
  }
}

/* ========================
   2️⃣ NAVEGAÇÃO E LOGOUT
   ======================== */
function goTo(page) {
  window.location.href = page;
}
function goBack() {
  window.history.back();
}
function logout() {
  localStorage.removeItem("user");
  goTo("login.html");
}

/* =========================================================
   3️⃣ LOGIN
   ========================================================= */
async function handleLogin() {
  const form = qs("#login-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = qs("#email").value.trim();
    const password = qs("#password").value.trim();
    if (!email || !password) return toast("Preencha todos os campos!");

    try {
      /* 🔗 API real (futuro)
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) { save("user", data.user); goTo("dashboard.html"); }
      else toast(data.message || "Erro no login");
      */

      // --- Simulação local ---
      const users = load("users");
      const user = users.find(
        (u) => u.email === email && u.password === password
      );
      if (!user) return toast("E-mail ou senha incorretos!");
      save("user", user);
      toast("Login realizado com sucesso!");
      goTo("dashboard.html");
    } catch (err) {
      console.error(err);
      toast("Falha de conexão com o servidor.");
    }
  });
}

/* =========================================================
   4️⃣ CADASTRO
   ========================================================= */
async function handleRegister() {
  const form = qs("#register-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = qs("#name").value.trim();
    const email = qs("#email").value.trim();
    const pass = qs("#password").value.trim();
    const confirm = qs("#confirm-password").value.trim();
    if (!name || !email || !pass || !confirm)
      return toast("Preencha todos os campos!");
    if (pass !== confirm) return toast("As senhas não coincidem!");

    try {
      /* 🔗 API real (futuro)
      const res = await fetch(`${API_BASE}/users/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password: pass })
      });
      const data = await res.json();
      if (res.ok) { toast("Conta criada com sucesso!"); goTo("login.html"); }
      else toast(data.message || "Erro ao criar conta");
      */

      // --- Simulação local ---
      const users = load("users");
      if (users.some((u) => u.email === email))
        return toast("E-mail já cadastrado!");
      users.push({ name, email, password: pass });
      save("users", users);
      toast("Conta criada com sucesso!");
      goTo("login.html");
    } catch {
      toast("Falha de conexão com o servidor.");
    }
  });
}

/* =========================================================
   5️⃣ DASHBOARD - LISTA DE CHAMADOS
   ========================================================= */
async function loadDashboard() {
  const container = qs("#tickets-container");
  if (!container) return;

  try {
    /* 🔗 API real (futuro)
    const res = await fetch(`${API_BASE}/tickets`);
    const tickets = await res.json();
    */

    // --- Simulação local ---
    const tickets = load("tickets");
    container.innerHTML = "";

    if (!tickets.length) {
      show(qs("#no-tickets"));
      return;
    }
    hide(qs("#no-tickets"));

    tickets.forEach((t) => {
      const div = document.createElement("div");
      div.className = "card ticket-item";
      div.innerHTML = `
        <strong>#${t.id}</strong> - ${t.title}<br/>
        <span class="status-badge status--${t.status}">${t.status}</span>
        <span class="priority-badge priority--${t.priority}">${t.priority}</span>
      `;
      div.addEventListener("click", () => {
        save("currentTicket", t);
        goTo("ticket-detalhes.html");
      });
      container.appendChild(div);
    });

    // FAB abrir novo chamado
    const fab = qs("#new-ticket-btn");
    if (fab) fab.addEventListener("click", () => goTo("novo-ticket.html"));
  } catch {
    toast("Erro ao carregar chamados.");
  }
}

/* =========================================================
   6️⃣ NOVO CHAMADO
   ========================================================= */
async function handleNewTicket() {
  const form = qs("#new-ticket-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = qs("#ticket-title").value.trim();
    const category = qs("#ticket-category").value;
    const priority = qs("#ticket-priority").value;
    const desc = qs("#ticket-description").value.trim();
    if (!title || !category || !priority || !desc)
      return toast("Preencha todos os campos!");

    const newTicket = {
      title,
      category,
      priority,
      description: desc,
      status: "aberto",
      createdAt: new Date().toISOString(),
    };

    try {
      /* 🔗 API real (futuro)
      const res = await fetch(`${API_BASE}/tickets`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTicket)
      });
      if (!res.ok) throw new Error();
      */

      // --- Simulação local ---
      const tickets = load("tickets");
      newTicket.id = tickets.length
        ? Math.max(...tickets.map((t) => t.id)) + 1
        : 1;
      newTicket.comments = [];
      tickets.push(newTicket);
      save("tickets", tickets);

      toast("Chamado criado!");
      goTo("dashboard.html");
    } catch {
      toast("Erro ao enviar chamado.");
    }
  });
}

/* =========================================================
   7️⃣ DETALHES DO CHAMADO
   ========================================================= */
async function loadTicketDetails() {
  const ticket = load("currentTicket", null);
  if (!ticket) return;

  qs("#ticket-number") && (qs("#ticket-number").textContent = "#" + ticket.id);
  qs("#ticket-status") && (qs("#ticket-status").textContent = ticket.status);
  qs("#ticket-priority") &&
    (qs("#ticket-priority").textContent = ticket.priority);
  qs("#ticket-category") &&
    (qs("#ticket-category").textContent = ticket.category);

  const list = qs("#timeline-list");
  const empty = qs("#timeline-empty");
  if (!list) return;
  list.innerHTML = "";

  if (!ticket.comments || ticket.comments.length === 0) {
    show(empty);
  } else {
    hide(empty);
    ticket.comments.forEach((c) => {
      const li = document.createElement("li");
      li.className = "comment-item";
      li.innerHTML = `
        <p><strong>${c.author}</strong> - ${new Date(
        c.date
      ).toLocaleString()}</p>
        <p>${c.text}</p>
      `;
      list.appendChild(li);
    });
  }

  const form = qs("#new-comment-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = qs("#comment-text").value.trim();
      if (!text) return toast("Digite algo!");
      /* 🔗 API real (futuro)
      await fetch(`${API_BASE}/tickets/${ticket.id}/comments`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      */
      ticket.comments.push({
        author: "Você",
        text,
        date: new Date().toISOString(),
      });
      const all = load("tickets");
      const idx = all.findIndex((t) => t.id === ticket.id);
      if (idx >= 0) all[idx] = ticket;
      save("tickets", all);
      save("currentTicket", ticket);
      toast("Comentário adicionado!");
      loadTicketDetails();
    });
  }
}

/* =========================================================
   8️⃣ CONFIGURAÇÕES
   ========================================================= */
function loadConfig() {
  const themeSelect = qs("#theme-select");
  const notifToggle = qs("#notifications-toggle");
  const soundToggle = qs("#sound-toggle");

  if (themeSelect) {
    const theme = localStorage.getItem("theme") || "system";
    themeSelect.value = theme;
    themeSelect.addEventListener("change", () => {
      localStorage.setItem("theme", themeSelect.value);
      toast("Tema atualizado!");
    });
  }
  if (notifToggle) {
    notifToggle.addEventListener("change", () => {
      save("notificationsEnabled", notifToggle.checked);
      toast(
        notifToggle.checked
          ? "Notificações ativadas"
          : "Notificações desativadas"
      );
    });
  }
  if (soundToggle) {
    soundToggle.addEventListener("change", () => {
      save("soundEnabled", soundToggle.checked);
    });
  }
  const logoutBtn = qs("#logout-btn");
  if (logoutBtn)
    logoutBtn.addEventListener("click", () => {
      if (confirm("Deseja realmente sair?")) logout();
    });
}

/* =========================================================
   9️⃣ MOSTRAR / OCULTAR SENHA (login e cadastro)
   ========================================================= */
function togglePasswordVisibility(buttonId, inputId) {
  const btn = document.getElementById(buttonId);
  const input = document.getElementById(inputId);
  if (!btn || !input) return;

  const iconSpan = btn.querySelector("span");
  const setState = (show) => {
    input.type = show ? "text" : "password";
    if (iconSpan) iconSpan.className = show ? "icon-eye-off" : "icon-eye";
    btn.setAttribute("aria-pressed", String(show));
  };

  // estado inicial
  setState(false);

  btn.addEventListener("click", () => {
    const showing = input.type === "text";
    setState(!showing);
  });
}

/* =========================================================
   🔟 INICIALIZAÇÃO AUTOMÁTICA
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  seedDemoData(); // dados de exemplo

  handleLogin();
  handleRegister();
  loadDashboard();
  handleNewTicket();
  loadTicketDetails();
  loadConfig();

  // Ativa botões “olho” (login e cadastro)
  togglePasswordVisibility("password-toggle", "password"); // login
  togglePasswordVisibility("togglePassword", "password"); // cadastro
  togglePasswordVisibility("toggleConfirmPassword", "confirm-password"); // cadastro

  // ===== Menu -> Sair (logout) =====
  const navLogout = document.getElementById("nav-logout");
  if (navLogout) {
    navLogout.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("Deseja realmente sair?")) logout();
    });
  }
});

/* ===== Utilitário opcional para você: ver usuários no console ===== */
window.listarUsuarios = () => console.table(load("users"));
