/* =======================================================
   SISTEMA WEB DE CHAMADOS - JAVASCRIPT COMPLETO
   Arquivo: script-web.js
   Versão: 1.0
   
   INSTRUÇÕES:
   - Simulações estão ATIVAS para testes
   - Para conectar com backend, descomente as seções marcadas com "BACKEND REAL"
   - Comente as seções marcadas com "SIMULAÇÃO" quando o backend estiver pronto
   ======================================================= */

/* =======================================================
   FUNÇÕES UTILITÁRIAS GERAIS
   ======================================================= */

/**
 * Mostra estado de carregamento em um botão
 * @param {string} buttonId - ID do botão
 */
function showLoading(buttonId) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.dataset.originalText = button.textContent;
    button.disabled = true;
    button.textContent = "Carregando...";
  }
}

/**
 * Remove estado de carregamento do botão
 * @param {string} buttonId - ID do botão
 */
function hideLoading(buttonId) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.disabled = false;
    button.textContent = button.dataset.originalText || "Enviar";
  }
}

/**
 * Exibe mensagem de erro em um elemento específico
 * @param {string} elementId - ID do elemento de erro
 * @param {string} message - Mensagem a ser exibida
 */
function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add("show");
  }
}

/**
 * Limpa todas as mensagens de erro da página
 */
function clearErrors() {
  const errorElements = document.querySelectorAll(".error-message");
  errorElements.forEach((element) => {
    element.classList.remove("show");
    element.textContent = "";
  });
}

/**
 * Valida formato de email
 * @param {string} email - Email a ser validado
 * @returns {boolean} - True se válido, false se inválido
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Volta para a página anterior
 */
function goBack() {
  window.history.back();
}

/**
 * Navega para página de detalhes do chamado
 * @param {number} ticketId - ID do chamado
 */
function goToTicketDetails(ticketId) {
  localStorage.setItem("currentTicketId", ticketId);
  window.location.href = "ticket-details-web.html";
}

/**
 * Realiza logout do sistema
 */
function logout() {
  if (confirm("Tem certeza que deseja sair?")) {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    window.location.href = "login-web.html";
  }
}

/**
 * Adiciona comentário ao chamado
 */
function addComment() {
  const comment = prompt("Digite seu comentário:");
  if (comment && comment.trim().length > 0) {
    // SIMULAÇÃO - Remove quando backend estiver pronto
    alert("Comentário adicionado com sucesso!");
    location.reload();

    /* BACKEND REAL - Descomente quando backend estiver pronto
        const ticketId = localStorage.getItem("currentTicketId");
        apiCall(`tickets/${ticketId}/comments`, "POST", { text: comment })
            .then(() => {
                alert("Comentário adicionado com sucesso!");
                location.reload();
            })
            .catch(error => {
                alert("Erro ao adicionar comentário: " + error.message);
            });
        */
  }
}

/* =======================================================
   FUNÇÕES DE CHAMADA À API (BACKEND)
   ======================================================= */

/**
 * Função genérica para chamadas à API REST
 * @param {string} endpoint - Endpoint da API (ex: "tickets", "login")
 * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
 * @param {object|null} data - Dados a serem enviados (para POST/PUT)
 * @returns {Promise} - Promessa com resposta da API
 */
function apiCall(endpoint, method = "GET", data = null) {
  const token = localStorage.getItem("userToken");
  const baseURL = "https://seuservidor.com/api"; // ALTERE para URL real do backend

  const options = {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Adiciona token de autenticação se existir
  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  // Adiciona corpo da requisição se houver dados
  if (data) {
    options.body = JSON.stringify(data);
  }

  return fetch(`${baseURL}/${endpoint}`, options)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("API Error:", error);
      throw error;
    });
}

/* =======================================================
   EVENTO PRINCIPAL: DOM CONTENT LOADED
   ======================================================= */

document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ Sistema Web de Chamados carregado!");
  console.log("📅 Data:", new Date().toLocaleDateString());

  // Captura elementos dos formulários
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const newTicketForm = document.getElementById("new-ticket-form");
  const passwordToggle = document.getElementById("password-toggle");

  /* =========================
       PASSWORD TOGGLE (MOSTRAR/OCULTAR SENHA)
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
    console.log("🔐 Formulário de login encontrado");

    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErrors();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      // Validações no frontend
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

      if (hasError) return;

      // Mostra loading
      showLoading("login-btn");

      // ==================== SIMULAÇÃO (ATIVA) ====================
      // Remove este bloco quando backend estiver pronto
      setTimeout(() => {
        const fakeToken = "fake-jwt-token-" + Date.now();
        localStorage.setItem("userToken", fakeToken);
        localStorage.setItem("userEmail", email);

        // Detecta perfil pelo email
        if (
          email.includes("admin") ||
          email.includes("suporte") ||
          email.includes("tecnico")
        ) {
          localStorage.setItem("userRole", "admin");
          console.log("✅ Login como ADMIN");
          window.location.href = "admin-dashboard.html";
        } else {
          localStorage.setItem("userRole", "user");
          console.log("✅ Login como USUÁRIO");
          window.location.href = "user-dashboard-web.html";
        }
      }, 1500);
      // ==================== FIM DA SIMULAÇÃO ====================

      /* ==================== BACKEND REAL ====================
            // Descomente este bloco quando backend estiver pronto
            apiCall("auth/login", "POST", { email, password })
                .then((data) => {
                    // Salva dados retornados pela API
                    localStorage.setItem("userToken", data.token);
                    localStorage.setItem("userEmail", data.email);
                    localStorage.setItem("userRole", data.role); // "admin" ou "user"
                    
                    hideLoading("login-btn");
                    
                    // Redireciona baseado no perfil
                    if (data.role === "admin") {
                        window.location.href = "admin-dashboard.html";
                    } else {
                        window.location.href = "user-dashboard-web.html";
                    }
                })
                .catch((error) => {
                    hideLoading("login-btn");
                    showError("email-error", "Email ou senha incorretos");
                    console.error("Erro no login:", error);
                });
            ==================== FIM BACKEND REAL ==================== */
    });
  }

  /* =========================
       REGISTER FORM
       ========================= */
  if (registerForm) {
    console.log("📝 Formulário de cadastro encontrado");

    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErrors();

      const fullName = document.getElementById("full-name").value;
      const email = document.getElementById("corp-email").value;
      const department = document.getElementById("department").value;
      const password = document.getElementById("reg-password").value;
      const confirmPassword = document.getElementById("confirm-password").value;

      // Validações
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

      if (hasError) return;

      showLoading("register-btn");

      // ==================== SIMULAÇÃO (ATIVA) ====================
      setTimeout(() => {
        hideLoading("register-btn");
        alert("✅ Cadastro realizado com sucesso!");
        window.location.href = "login-web.html";
      }, 1500);
      // ==================== FIM DA SIMULAÇÃO ====================

      /* ==================== BACKEND REAL ====================
            apiCall("auth/register", "POST", { 
                name: fullName, 
                email, 
                department, 
                password 
            })
                .then((data) => {
                    hideLoading("register-btn");
                    alert("✅ Cadastro realizado com sucesso!");
                    window.location.href = "login-web.html";
                })
                .catch((error) => {
                    hideLoading("register-btn");
                    showError("email-error", "Erro ao realizar cadastro. Tente novamente.");
                    console.error("Erro no cadastro:", error);
                });
            ==================== FIM BACKEND REAL ==================== */
    });
  }

  /* =========================
       NEW TICKET FORM
       ========================= */
  if (newTicketForm) {
    console.log("🎫 Formulário de novo chamado encontrado");

    newTicketForm.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErrors();

      const title = document.getElementById("ticket-title").value;
      const category = document.getElementById("ticket-category")?.value;
      const priority = document.getElementById("ticket-priority")?.value;
      const description = document.getElementById("ticket-description").value;

      // Validações
      let hasError = false;

      if (!title || title.length < 5) {
        showError("title-error", "Título deve ter pelo menos 5 caracteres");
        hasError = true;
      }

      if (!category) {
        showError("category-error", "Selecione uma categoria");
        hasError = true;
      }

      if (!priority) {
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

      if (hasError) return;

      showLoading("create-ticket-btn");

      // ==================== SIMULAÇÃO (ATIVA) ====================
      setTimeout(() => {
        hideLoading("create-ticket-btn");
        const ticketId = Math.floor(Math.random() * 9999);
        alert(`✅ Chamado criado com sucesso! ID: #${ticketId}`);

        const userRole = localStorage.getItem("userRole");
        if (userRole === "admin") {
          window.location.href = "admin-dashboard.html";
        } else {
          window.location.href = "user-dashboard-web.html";
        }
      }, 1500);
      // ==================== FIM DA SIMULAÇÃO ====================

      /* ==================== BACKEND REAL ====================
            apiCall("tickets", "POST", { 
                title, 
                category, 
                priority, 
                description 
            })
                .then((data) => {
                    hideLoading("create-ticket-btn");
                    alert(`✅ Chamado criado com sucesso! ID: #${data.id}`);
                    
                    const userRole = localStorage.getItem("userRole");
                    if (userRole === "admin") {
                        window.location.href = "admin-dashboard.html";
                    } else {
                        window.location.href = "user-dashboard-web.html";
                    }
                })
                .catch((error) => {
                    hideLoading("create-ticket-btn");
                    alert("❌ Erro ao criar chamado. Tente novamente.");
                    console.error("Erro ao criar chamado:", error);
                });
            ==================== FIM BACKEND REAL ==================== */
    });
  }

  /* =========================
       FILTROS (STATUS, PRIORIDADE, BUSCA)
       ========================= */
  const statusFilter = document.getElementById("status-filter");
  const priorityFilter = document.getElementById("priority-filter");
  const searchInput = document.getElementById("search-input");

  if (statusFilter) {
    statusFilter.addEventListener("change", filterTickets);
  }
  if (priorityFilter) {
    priorityFilter.addEventListener("change", filterTickets);
  }
  if (searchInput) {
    searchInput.addEventListener("input", filterTickets);
  }

  /* =========================
       YEAR BUTTONS (FILTROS DO DASHBOARD ADMIN)
       ========================= */
  const yearButtons = document.querySelectorAll(".year-btn");
  yearButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      yearButtons.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      console.log("📊 Ano selecionado:", this.textContent);

      // Aqui você pode adicionar lógica para filtrar dados por ano
      /* BACKEND REAL
            const year = this.textContent;
            apiCall(`dashboard/stats?year=${year}`)
                .then(data => updateDashboard(data));
            */
    });
  });

  /* =========================
       CARREGA DADOS DO TICKET (SE ESTIVER NA PÁGINA DE DETALHES)
       ========================= */
  if (window.location.pathname.includes("ticket-details-web.html")) {
    loadTicketDetails();
  }

  /* =========================
       VERIFICA AUTENTICAÇÃO
       ========================= */
  checkAuthentication();

  console.log("✅ Todas as funcionalidades inicializadas!");
});

/* =======================================================
   FUNÇÃO DE FILTRO DE TICKETS
   ======================================================= */

/**
 * Filtra tickets na tabela baseado em status, prioridade e busca
 */
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

  const tickets = document.querySelectorAll(".ticket-row");
  let visibleCount = 0;

  tickets.forEach((ticket) => {
    let show = true;
    const ticketText = ticket.textContent.toLowerCase();

    // Filtro por termo de busca
    if (searchTerm && !ticketText.includes(searchTerm)) {
      show = false;
    }

    // Filtro por status
    if (statusFilter && !ticketText.includes(statusFilter)) {
      show = false;
    }

    // Filtro por prioridade
    if (priorityFilter && !ticketText.includes(priorityFilter)) {
      show = false;
    }

    ticket.style.display = show ? "" : "none";
    if (show) visibleCount++;
  });

  console.log(`🔍 Filtros aplicados: ${visibleCount} tickets visíveis`);

  /* BACKEND REAL - Filtros no servidor
    const filters = {
        status: statusFilter,
        priority: priorityFilter,
        search: searchTerm
    };
    
    apiCall(`tickets?${new URLSearchParams(filters)}`)
        .then(data => {
            renderTickets(data.tickets);
        });
    */
}

/* =======================================================
   FUNÇÃO DE CARREGAMENTO DE DETALHES DO TICKET
   ======================================================= */

/**
 * Carrega detalhes completos de um ticket
 */
function loadTicketDetails() {
  const ticketId = localStorage.getItem("currentTicketId");

  if (!ticketId) {
    console.warn("⚠️ Nenhum ticket ID encontrado");
    return;
  }

  console.log(`📄 Carregando detalhes do ticket #${ticketId}`);

  // ==================== SIMULAÇÃO (ATIVA) ====================
  // Dados estáticos já estão no HTML
  console.log("✅ Dados do ticket carregados (simulação)");
  // ==================== FIM DA SIMULAÇÃO ====================

  /* ==================== BACKEND REAL ====================
    apiCall(`tickets/${ticketId}`)
        .then(data => {
            // Preenche os dados na página
            document.querySelector('.ticket-id-large').textContent = `ID ${data.id}`;
            document.querySelector('.description-text').textContent = data.description;
            
            // Atualiza status e prioridade
            const statusBadge = document.querySelector('.status-badge');
            statusBadge.textContent = data.status;
            statusBadge.className = `status-badge status-${data.status.toLowerCase()}`;
            
            const priorityBadge = document.querySelector('.priority-high');
            priorityBadge.textContent = data.priority;
            priorityBadge.className = `priority-${data.priority.toLowerCase()}`;
            
            // Carrega comentários
            renderComments(data.comments);
            
            console.log("✅ Detalhes do ticket carregados");
        })
        .catch(error => {
            console.error("❌ Erro ao carregar ticket:", error);
            alert("Erro ao carregar detalhes do chamado");
        });
    ==================== FIM BACKEND REAL ==================== */
}

/* =======================================================
   VERIFICAÇÃO DE AUTENTICAÇÃO
   ======================================================= */

/**
 * Verifica se usuário está autenticado
 * Redireciona para login se não estiver
 */
function checkAuthentication() {
  const token = localStorage.getItem("userToken");
  const currentPath = window.location.pathname;

  // Páginas que não precisam de autenticação
  const publicPages = ["login-web.html", "register.html"];
  const isPublicPage =
    publicPages.some((page) => currentPath.includes(page)) ||
    currentPath.endsWith("/");

  if (!token && !isPublicPage) {
    console.warn("⚠️ Usuário não autenticado - Redirecionando para login");
    window.location.href = "login-web.html";
    return false;
  }

  if (token) {
    console.log("✅ Usuário autenticado");
    const userRole = localStorage.getItem("userRole");
    console.log(`👤 Perfil: ${userRole}`);
  }

  return true;
}

/* =======================================================
   FUNÇÕES AUXILIARES
   ======================================================= */

/**
 * Renderiza comentários na página de detalhes
 * @param {Array} comments - Array de comentários
 */
function renderComments(comments) {
  const container = document.querySelector(".comments-section");
  if (!container || !comments) return;

  const commentsHTML = comments
    .map(
      (comment) => `
        <div class="comment-item">
            <div class="comment-header">
                <span class="comment-author">${comment.author}</span>
                <span class="comment-date">${formatDate(comment.date)}</span>
            </div>
            <div class="comment-text">${comment.text}</div>
        </div>
    `
    )
    .join("");

  container.innerHTML = commentsHTML;
}

/**
 * Formata data para exibição
 * @param {string} dateString - Data em formato ISO
 * @returns {string} - Data formatada
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Atualiza estatísticas do dashboard
 * @param {Object} stats - Objeto com estatísticas
 */
function updateDashboard(stats) {
  if (!stats) return;

  const statNumbers = document.querySelectorAll(".stat-number");
  if (statNumbers.length >= 4) {
    statNumbers[0].textContent = stats.resolved || 0;
    statNumbers[1].textContent = stats.inProgress || 0;
    statNumbers[2].textContent = stats.pending || 0;
    statNumbers[3].textContent = stats.technicians || 0;
  }

  console.log("📊 Dashboard atualizado com dados reais");
}

/* =======================================================
   FIM DO ARQUIVO
   ======================================================= */

console.log("📄 script-web.js carregado completamente!");

/* =======================================================
   FUNÇÕES ESPECÍFICAS DE CONFIGURAÇÕES WEB
   ======================================================= */

function editProfile() {
  alert("Funcionalidade de edição de perfil em desenvolvimento");
  // Aqui você conectaria com o backend depois
}

function showPrivacyPolicy() {
  alert(
    "Política de Privacidade:\n\nSeus dados são protegidos conforme a LGPD..."
  );
}

function showDataUsage() {
  alert(
    "Gerenciamento de Dados LGPD:\n\n- Dados coletados: Nome, email, departamento\n- Finalidade: Gestão de chamados\n- Retenção: Conforme política da empresa"
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
    "Central de Ajuda:\n\n1. Como criar um chamado\n2. Acompanhar status\n3. Anexar arquivos\n4. Categorias disponíveis"
  );
}

function contactSupport() {
  alert(
    "Contato do Suporte TI:\n\nEmail: ti@empresa.com\nRamal: 1234\nHorário: 8h às 18h"
  );
}

function sendFeedback() {
  const feedback = prompt("Deixe sua sugestão ou comentário:");
  if (feedback) {
    alert("Feedback enviado! Obrigado pela contribuição.");
  }
}

function confirmLogout() {
  if (confirm("Tem certeza que deseja sair da sua conta?")) {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    window.location.href = "login.html";
  }
}

function loadWebSettings() {
  const userEmail = localStorage.getItem("userEmail");
  if (userEmail) {
    const emailElement = document.getElementById("user-email");
    if (emailElement) emailElement.textContent = userEmail;
  }

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    const themeSelect = document.getElementById("app-theme");
    if (themeSelect) themeSelect.value = savedTheme;
  }

  const savedFontSize = localStorage.getItem("fontSize");
  if (savedFontSize) {
    const fontSelect = document.getElementById("font-size");
    if (fontSelect) fontSelect.value = savedFontSize;
  }

  const savedPriority = localStorage.getItem("defaultPriority");
  if (savedPriority) {
    const prioritySelect = document.getElementById("default-priority");
    if (prioritySelect) prioritySelect.value = savedPriority;
  }

  document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    const saved = localStorage.getItem(checkbox.id);
    if (saved !== null) {
      checkbox.checked = saved === "true";
    }
  });

  // Event listeners para salvar automaticamente
  document.getElementById("app-theme")?.addEventListener("change", function () {
    localStorage.setItem("theme", this.value);
    applyTheme(this.value);
  });

  document.getElementById("font-size")?.addEventListener("change", function () {
    localStorage.setItem("fontSize", this.value);
  });

  document
    .getElementById("default-priority")
    ?.addEventListener("change", function () {
      localStorage.setItem("defaultPriority", this.value);
    });

  document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      localStorage.setItem(this.id, this.checked);
    });
  });
}

function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark-theme");
  } else {
    document.body.classList.remove("dark-theme");
  }
}

console.log("🔧 Modo: SIMULAÇÃO ativa");
console.log("💡 Para conectar ao backend, descomente as seções 'BACKEND REAL'");
