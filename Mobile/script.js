/* =======================================================
   FUNÇÕES GERAIS DE UI
   ======================================================= */

// Mostra efeito de carregamento no botão
function showLoading(buttonId) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.dataset.originalText = button.textContent;
    button.disabled = true;
    button.textContent = "Carregando...";
  }
}

// Remove efeito de carregamento do botão
function hideLoading(buttonId) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.disabled = false;
    button.textContent = button.dataset.originalText || "Enviar";
  }
}

// Mostra mensagem de erro
function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
    errorElement.classList.add("show");
  }
}

// Limpa todas as mensagens de erro
function clearErrors() {
  const errorElements = document.querySelectorAll(".error-message");
  errorElements.forEach((element) => {
    element.style.display = "none";
    element.textContent = "";
    element.classList.remove("show");
  });
}

// Validação de e-mail
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Navegação
function goBack() {
  window.history.back();
}

function goToTicketDetails(ticketId) {
  localStorage.setItem("currentTicketId", ticketId);
  window.location.href = "ticket-details.html";
}

/* =======================================================
   FUNÇÃO DE CHAMADA API (PREPARADA PARA BACKEND)
   ======================================================= */
function apiCall(endpoint, method = "GET", data = null) {
  const token = localStorage.getItem("userToken");

  const options = {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  return fetch(`/api/${endpoint}`, options).then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  });
}

/* =======================================================
   EVENTO PRINCIPAL: DOM CONTENT LOADED
   ======================================================= */
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM carregado!");

  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const newTicketForm = document.getElementById("new-ticket-form");
  const passwordToggle = document.getElementById("password-toggle");

  /* =========================
     TOGGLE DE SENHA
     ========================= */
  if (passwordToggle) {
    passwordToggle.addEventListener("click", function () {
      const passwordField = document.getElementById("password");
      if (passwordField) {
        if (passwordField.type === "password") {
          passwordField.type = "text";
          passwordToggle.textContent = "🙈";
        } else {
          passwordField.type = "password";
          passwordToggle.textContent = "👁";
        }
      }
    });
  }

  /* =========================
     LOGIN FORM
     ========================= */
  if (loginForm) {
    console.log("Login form encontrado!");
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      console.log("Form submetido!");
      clearErrors();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      let hasError = false;

      if (!email) {
        showError("email-error", "E-mail é obrigatório");
        hasError = true;
      } else if (!validateEmail(email)) {
        showError("email-error", "E-mail inválido");
        hasError = true;
      }

      if (!password) {
        showError("password-error", "Senha é obrigatória");
        hasError = true;
      }

      if (!hasError) {
        // SIMULAÇÃO - Remova depois e use apiCall real
        showLoading("login-btn");

        setTimeout(() => {
          localStorage.setItem("userToken", "fake-token-" + Date.now());
          localStorage.setItem("userEmail", email);
          hideLoading("login-btn");
          window.location.href = "dashboard.html";
        }, 1000);

        /* QUANDO O BACKEND ESTIVER PRONTO, USE ISSO:
        apiCall("login", "POST", { email, password })
          .then((data) => {
            localStorage.setItem("userToken", data.token);
            localStorage.setItem("userEmail", data.email);
            window.location.href = "dashboard.html";
          })
          .catch((error) => {
            showError("email-error", "Falha no login. Verifique suas credenciais.");
          })
          .finally(() => {
            hideLoading("login-btn");
          });
        */
      }
    });
  }

  /* =========================
     REGISTER FORM
     ========================= */
  if (registerForm) {
    console.log("Register form encontrado!");
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErrors();

      const fullName = document.getElementById("full-name").value;
      const email = document.getElementById("corp-email").value;
      const department = document.getElementById("department").value;
      const password = document.getElementById("reg-password").value;
      const confirmPassword = document.getElementById("confirm-password").value;

      let hasError = false;

      if (!fullName || fullName.length < 2) {
        showError("name-error", "Nome deve ter pelo menos 2 caracteres");
        hasError = true;
      }

      if (!email) {
        showError("email-error", "E-mail é obrigatório");
        hasError = true;
      } else if (!validateEmail(email)) {
        showError("email-error", "E-mail inválido");
        hasError = true;
      }

      if (!department) {
        showError("department-error", "Selecione um departamento");
        hasError = true;
      }

      if (!password || password.length < 6) {
        showError("password-error", "Senha deve ter pelo menos 6 caracteres");
        hasError = true;
      }

      if (password !== confirmPassword) {
        showError("confirm-password-error", "Senhas não conferem");
        hasError = true;
      }

      if (!hasError) {
        // SIMULAÇÃO
        showLoading("register-btn");

        setTimeout(() => {
          hideLoading("register-btn");
          alert("Cadastro realizado com sucesso!");
          window.location.href = "login.html";
        }, 1000);

        /* QUANDO O BACKEND ESTIVER PRONTO:
        apiCall("register", "POST", { fullName, email, department, password })
          .then((data) => {
            alert("Cadastro realizado com sucesso!");
            window.location.href = "login.html";
          })
          .catch((error) => {
            showError("email-error", "Falha no cadastro.");
          })
          .finally(() => {
            hideLoading("register-btn");
          });
        */
      }
    });
  }

  /* =========================
     NEW TICKET FORM
     ========================= */
  if (newTicketForm) {
    newTicketForm.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErrors();

      const title = document.getElementById("ticket-title").value;
      const category = document.getElementById("ticket-category")?.value;
      const priority = document.getElementById("ticket-priority")?.value;
      const description = document.getElementById("ticket-description").value;

      let hasError = false;

      if (!title || title.length < 5) {
        showError("title-error", "Título deve ter pelo menos 5 caracteres");
        hasError = true;
      }

      if (category && !category) {
        showError("category-error", "Selecione uma categoria");
        hasError = true;
      }

      if (priority && !priority) {
        showError("priority-error", "Selecione uma prioridade");
        hasError = true;
      }

      if (!description || description.length < 20) {
        showError(
          "description-error",
          "Descrição deve ter pelo menos 20 caracteres"
        );
        hasError = true;
      }

      if (!hasError) {
        showLoading("create-ticket-btn");

        setTimeout(() => {
          hideLoading("create-ticket-btn");
          alert(
            "Chamado criado com sucesso! ID: #" +
              Math.floor(Math.random() * 9999)
          );
          window.location.href = "dashboard.html";
        }, 1000);
      }
    });
  }

  /* =========================
     FILTROS DO DASHBOARD
     ========================= */
  const statusFilter = document.getElementById("status-filter");
  const priorityFilter = document.getElementById("priority-filter");
  const searchInput = document.getElementById("search-input");

  if (statusFilter) statusFilter.addEventListener("change", filterTickets);
  if (priorityFilter) priorityFilter.addEventListener("change", filterTickets);
  if (searchInput) searchInput.addEventListener("input", filterTickets);

  /* =========================
     CARREGAR DETALHES DO CHAMADO
     ========================= */
  if (window.location.pathname.includes("ticket-details.html")) {
    loadTicketDetails();
  }

  /* =========================
     CONFIGURAÇÕES
     ========================= */
  if (document.querySelector(".settings-section")) {
    initializeSettings();
  }

  /* =========================
     AUTENTICAÇÃO - CORRIGIDO!
     ========================= */
  checkAuthentication();
});

/* =======================================================
   FILTRO DE TICKETS
   ======================================================= */
function filterTickets() {
  const statusFilter = document
    .getElementById("status-filter")
    ?.value.toLowerCase();
  const priorityFilter = document
    .getElementById("priority-filter")
    ?.value.toLowerCase();
  const searchTerm = document
    .getElementById("search-input")
    ?.value.toLowerCase();

  const tickets = document.querySelectorAll(".ticket-item");

  tickets.forEach((ticket) => {
    let show = true;
    const ticketText = ticket.textContent.toLowerCase();

    if (searchTerm && !ticketText.includes(searchTerm)) show = false;
    if (statusFilter && !ticketText.includes(statusFilter)) show = false;
    if (priorityFilter && !ticketText.includes(priorityFilter)) show = false;

    ticket.style.display = show ? "block" : "none";
  });
}

/* =======================================================
   DETALHES DO CHAMADO
   ======================================================= */
function loadTicketDetails() {
  const ticketId = localStorage.getItem("currentTicketId");
  if (ticketId) {
    console.log("Loading ticket details for ID:", ticketId);
    // Aqui você carregaria os dados reais via API
  }
}

/* =======================================================
   CHECAGEM DE AUTENTICAÇÃO - CORRIGIDO!
   ======================================================= */
function checkAuthentication() {
  const token = localStorage.getItem("userToken");
  const currentPath = window.location.pathname;

  // Páginas públicas (não precisam de login)
  const publicPages = [
    "login.html",
    "cadastro.html",
    "index.html",
    "register.html",
  ];

  const isPublicPage =
    publicPages.some((page) => currentPath.includes(page)) ||
    currentPath.endsWith("/");

  // Se não está logado E não está em página pública, redireciona para login
  if (!token && !isPublicPage) {
    window.location.href = "login.html";
  }
}

/* =======================================================
   FUNÇÕES DE CONFIGURAÇÕES
   ======================================================= */
function initializeSettings() {
  // Tema
  const themeSelect = document.getElementById("app-theme");
  if (themeSelect) {
    themeSelect.addEventListener("change", function () {
      const theme = this.value;
      applyTheme(theme);
      localStorage.setItem("theme", theme);
    });
  }

  // Tamanho da fonte
  const fontSizeSelect = document.getElementById("font-size");
  if (fontSizeSelect) {
    fontSizeSelect.addEventListener("change", function () {
      const fontSize = this.value;
      applyFontSize(fontSize);
      localStorage.setItem("fontSize", fontSize);
    });
  }

  // Checkboxes
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      localStorage.setItem(this.id, this.checked);
      console.log(`${this.id}: ${this.checked}`);
    });
  });

  // Prioridade padrão
  const prioritySelect = document.getElementById("default-priority");
  if (prioritySelect) {
    prioritySelect.addEventListener("change", function () {
      localStorage.setItem("defaultPriority", this.value);
    });
  }

  loadSavedSettings();
}

function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark-theme");
  } else {
    document.body.classList.remove("dark-theme");
  }
}

function applyFontSize(fontSize) {
  document.body.classList.remove("font-small", "font-medium", "font-large");
  document.body.classList.add(`font-${fontSize}`);
}

function loadSavedSettings() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    const themeSelect = document.getElementById("app-theme");
    if (themeSelect) {
      themeSelect.value = savedTheme;
      applyTheme(savedTheme);
    }
  }

  const savedFontSize = localStorage.getItem("fontSize");
  if (savedFontSize) {
    const fontSizeSelect = document.getElementById("font-size");
    if (fontSizeSelect) {
      fontSizeSelect.value = savedFontSize;
      applyFontSize(savedFontSize);
    }
  }

  const savedPriority = localStorage.getItem("defaultPriority");
  if (savedPriority) {
    const prioritySelect = document.getElementById("default-priority");
    if (prioritySelect) prioritySelect.value = savedPriority;
  }

  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((checkbox) => {
    const saved = localStorage.getItem(checkbox.id);
    if (saved !== null) checkbox.checked = saved === "true";
  });

  const userEmail = localStorage.getItem("userEmail");
  if (userEmail) {
    const emailElement = document.getElementById("user-email");
    if (emailElement) emailElement.textContent = userEmail;
  }
}

/* =======================================================
   FUNÇÕES DA TELA DE CONFIGURAÇÕES
   ======================================================= */
function toggleEditProfile() {
  alert("Funcionalidade de edição de perfil seria implementada aqui");
}

function showPrivacyPolicy() {
  alert(
    "Política de Privacidade:\n\nSeus dados são protegidos conforme a LGPD..."
  );
}

function showDataUsage() {
  alert(
    "Gerenciamento de Dados LGPD:\n\n" +
      "- Dados coletados: Nome, email, departamento\n" +
      "- Finalidade: Gestão de chamados\n" +
      "- Retenção: Conforme política da empresa"
  );
}

function changePassword() {
  const newPassword = prompt("Digite sua nova senha:");
  if (newPassword) {
    if (newPassword.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres!");
      return;
    }
    alert("Senha alterada com sucesso!");
  }
}

function showHelp() {
  alert(
    "Central de Ajuda:\n\n" +
      "1. Como criar um chamado\n" +
      "2. Acompanhar status\n" +
      "3. Anexar arquivos\n" +
      "4. Categorias disponíveis"
  );
}

function contactSupport() {
  alert(
    "Contato do Suporte TI:\n\n" +
      "Email: ti@empresa.com\n" +
      "Ramal: 1234\n" +
      "Horário: 8h às 18h"
  );
}

function sendFeedback() {
  const feedback = prompt("Deixe sua sugestão ou comentário:");
  if (feedback) {
    alert("Feedback enviado! Obrigado pela contribuição.");
  }
}

function showChangelog() {
  alert(
    "Novidades v2.1.0:\n\n" +
      "✓ Nova interface de configurações\n" +
      "✓ Modo offline\n" +
      "✓ Melhorias de performance\n" +
      "✓ Correção de bugs"
  );
}

function confirmLogout() {
  if (confirm("Tem certeza que deseja sair da sua conta?")) {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    window.location.href = "login.html";
  }
}

/* =======================================================
   STATUS E PRIORIDADE DINÂMICOS
   ======================================================= */
function applyDynamicBadges() {
  // === STATUS ===
  document.querySelectorAll(".status-badge").forEach((badge) => {
    const text = badge.textContent.trim().toLowerCase();

    // Remove classes anteriores
    badge.classList.remove(
      "status-pending",
      "status-progress",
      "status-resolved"
    );

    if (text.includes("pendente")) {
      badge.classList.add("status-pending");
    } else if (text.includes("andamento")) {
      badge.classList.add("status-progress");
    } else if (text.includes("aberto")) {
      badge.classList.add("status-open");
    } else if (text.includes("resolvido") || text.includes("concluído")) {
      badge.classList.add("status-resolved");
    }
  });

  // === PRIORIDADE ===
  document.querySelectorAll(".priority-badge").forEach((badge) => {
    const text = badge.textContent.trim().toLowerCase();

    // Remove classes anteriores
    badge.classList.remove("priority-low", "priority-medium", "priority-high");

    if (text.includes("baixa")) {
      badge.classList.add("priority-low");
    } else if (text.includes("média")) {
      badge.classList.add("priority-medium");
    } else if (text.includes("alta")) {
      badge.classList.add("priority-high");
    }
  });
}

// Executa quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", applyDynamicBadges);
