/* =========================================================
   KanSintonia - script.js (único arquivo JS do projeto)
   Seções: 1) Menu/Submenu  2) Rodapé  3) Dados (localStorage)
           4) Cadastro  5) Login  6) Site (tarefas)
   ========================================================= */

/* ---------- 1) MENU E SUBMENUS ---------- */
// Seleciona os elementos do HTML
const btnSobre = document.getElementById('btn-sobre');
const menuVerticalSobre = document.getElementById('menu-vertical-sobre');
const btnContato = document.getElementById('btn-contato');
const menuVerticalContato = document.getElementById('menu-vertical-contato');

// Textos exibidos no painel ao clicar em Sobre -> Empresa / Clientes
const textosSobre = {
  empresa: {
    titulo: 'Sobre — Empresa',
    texto: 'Há cinco anos no mercado, o site KanSintonia destaca-se como uma plataforma completa de gerenciamento de tarefas em grupo, desenvolvida para integrar equipes de forma simples e intuitiva. Sua interface moderna centraliza a distribuição de demandas, o acompanhamento de prazos e a organização de projetos em tempo real, eliminando ruídos de comunicação. Com recursos customizáveis e navegação fluida, o portal proporciona controle total sobre os fluxos de trabalho do seu time. Acesse o KanSintonia e descubra como otimizar a rotina operacional da sua empresa com tecnologia de ponta.'
  },
  clientes: {
    titulo: 'Sobre — Clientes',
    texto: 'Ao longo de meia década, o KanSintonia construiu parcerias sólidas ao oferecer vantagens exclusivas que impulsionam a produtividade e a rentabilidade dos seus clientes. A plataforma garante suporte dedicado, máxima segurança de dados e planos acessíveis, assegurando que pequenas e grandes equipes alcancem seus objetivos sem complicação. Essa dedicação contínua resulta em um altíssimo índice de satisfação, consolidando a fidelidade de quem confia na marca para evoluir diariamente. Seja você também parte desta trajetória de sucesso e transforme o desempenho da sua equipe.'
  }
};
let painelInfo = null;

// Mantém o submenu dentro da tela (ele fica centralizado sob o botão)
function ajustaMenu(menu) {
  menu.style.marginLeft = '0px';
  const r = menu.getBoundingClientRect();
  const folga = 8;
  if (r.right > window.innerWidth - folga) {
    menu.style.marginLeft = -(r.right - window.innerWidth + folga) + 'px';
  } else if (r.left < folga) {
    menu.style.marginLeft = (folga - r.left) + 'px';
  }
}

// Função geral para abrir/fechar TODOS OS menus verticais
function abreMenu(event, menu) {
  event.preventDefault(); // evita que a página recarregue ao clicar no link
  // fecha o outro menu antes de abrir este
  document.querySelectorAll('.menu-vertical.active').forEach(function (m) {
    if (m !== menu) m.classList.remove('active');
  });
  fechaPainel(); // clicar em Sobre/Contato fecha o painel de texto na hora
  menu.classList.toggle('active');
  if (menu.classList.contains('active')) ajustaMenu(menu);
}

function fechaMenu(event, menu, btn) {
  if (!menu.contains(event.target) && event.target !== btn) {
    menu.classList.remove('active');
  }
}

btnSobre.addEventListener('click', function (event) {
  abreMenu(event, menuVerticalSobre);
});
btnContato.addEventListener('click', function (event) {
  abreMenu(event, menuVerticalContato);
});

// Fecha menus e painel se o usuário clicar fora deles
document.addEventListener('click', function (event) {
  fechaMenu(event, menuVerticalSobre, btnSobre);
  fechaMenu(event, menuVerticalContato, btnContato);
  if (painelInfo && !painelInfo.contains(event.target) && !event.target.closest('.item-submenu')) {
    fechaPainel();
  }
});
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    fechaPainel();
    menuVerticalSobre.classList.remove('active');
    menuVerticalContato.classList.remove('active');
  }
});

// Itens com data-info (Empresa, Clientes) abrem o painel de texto
document.querySelectorAll('[data-info]').forEach(function (link) {
  link.addEventListener('click', function (event) {
    event.preventDefault();
    // usa o data-info; se faltar/estiver diferente, usa o texto do link (Empresa / Clientes)
    const chave = (link.dataset.info || link.textContent).trim().toLowerCase().split(':')[0];
    mostraPainel(chave);
  });
});

function mostraPainel(chave) {
  const dados = textosSobre[chave];
  if (!dados) return;
  if (!painelInfo) {
    painelInfo = document.createElement('section');
    painelInfo.className = 'painel-info';
    painelInfo.setAttribute('role', 'dialog');
    painelInfo.innerHTML = '<h2></h2><p></p>';
    const fechar = document.createElement('button');
    fechar.type = 'button';
    fechar.className = 'btn';
    fechar.textContent = 'Fechar';
    fechar.addEventListener('click', fechaPainel);
    painelInfo.appendChild(fechar);
    document.body.appendChild(painelInfo);
  }
  painelInfo.querySelector('h2').textContent = dados.titulo;
  painelInfo.querySelector('p').textContent = dados.texto;
  painelInfo.hidden = false;
}

function fechaPainel() {
  if (painelInfo) painelInfo.hidden = true;
}

/* ---------- 2) RODAPÉ: DATA ATUAL ---------- */
const spanData = document.getElementById('data-atual');
if (spanData) {
  spanData.textContent = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  });
}

/* ---------- 3) DADOS (localStorage / sessionStorage) ---------- */
const CHAVE_USUARIOS = 'tg_usuarios';
const CHAVE_SESSAO = 'tg_logado';
const CHAVE_TENTATIVAS = 'tg_tentativas';
const CHAVE_AVISO = 'tg_aviso';
const MAX_TENTATIVAS = 3;

function lerJSON(chave, padrao) {
  try {
    const valor = JSON.parse(localStorage.getItem(chave));
    return valor === null ? padrao : valor;
  } catch (e) {
    return padrao;
  }
}
function salvarJSON(chave, valor) {
  localStorage.setItem(chave, JSON.stringify(valor));
}
function usuarioLogado() {
  const email = sessionStorage.getItem(CHAVE_SESSAO);
  if (!email) return null;
  return lerJSON(CHAVE_USUARIOS, []).find(function (u) { return u.email === email; }) || null;
}
function mostraMensagem(el, texto, tipo) {
  el.textContent = texto;
  el.className = 'mensagem ' + tipo;
}

// Gera o arquivo .txt com os dados do cadastro (backup, baixado na hora do cadastro)
function baixaTxt(u) {
  const linhas = [
    'KanSintonia - Dados do cadastro',
    '--------------------------------',
    'Nome: ' + u.nome,
    'Endereço: ' + u.endereco,
    'Email: ' + u.email,
    'Senha: ' + u.senha,
    'Telefone: ' + u.telefone,
    'CPF: ' + u.cpf,
    'Cadastrado em: ' + new Date().toLocaleString('pt-BR')
  ];
  const blob = new Blob([linhas.join('\r\n')], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'cadastro_' + u.email.split('@')[0] + '.txt';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(function () { URL.revokeObjectURL(link.href); }, 1000);
}

/* ---------- 4) CADASTRO ---------- */
const formCadastro = document.getElementById('form-cadastro');
if (formCadastro) {
  const campoCpf = document.getElementById('cpf');
  const campoTelefone = document.getElementById('telefone');
  const msgCadastro = document.getElementById('msg-cadastro');

  // máscara 000.000.000-00
  campoCpf.addEventListener('input', function () {
    let n = campoCpf.value.replace(/\D/g, '').slice(0, 11);
    n = n.replace(/(\d{3})(\d)/, '$1.$2')
         .replace(/(\d{3})(\d)/, '$1.$2')
         .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    campoCpf.value = n;
  });

  // máscara (DD) 00000-0000 — aceita no máximo 11 números
  campoTelefone.addEventListener('input', function () {
    let n = campoTelefone.value.replace(/\D/g, '').slice(0, 11);
    if (n.length > 10) {
      n = n.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (n.length > 6) {
      n = n.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
    } else if (n.length > 2) {
      n = n.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
    } else if (n.length > 0) {
      n = '(' + n;
    }
    campoTelefone.value = n;
  });

  formCadastro.addEventListener('submit', function (event) {
    event.preventDefault();
    const nome = document.getElementById('nome').value.trim();
    const endereco = document.getElementById('endereco').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const senha = document.getElementById('senha').value;
    const telefone = campoTelefone.value;
    const cpf = campoCpf.value;

    if (!nome || !endereco || !email || !senha || !telefone || !cpf) {
      return mostraMensagem(msgCadastro, 'Preencha todos os campos.', 'erro');
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return mostraMensagem(msgCadastro, 'Email inválido.', 'erro');
    }
    if (senha.length < 4) {
      return mostraMensagem(msgCadastro, 'A senha deve ter pelo menos 4 caracteres.', 'erro');
    }
    const digitosTel = telefone.replace(/\D/g, '');
    if (digitosTel.length < 10 || digitosTel.length > 11) {
      return mostraMensagem(msgCadastro, 'Telefone deve ter DDD + 8 ou 9 dígitos.', 'erro');
    }
    if (cpf.replace(/\D/g, '').length !== 11) {
      return mostraMensagem(msgCadastro, 'CPF deve ter 11 dígitos.', 'erro');
    }

    const usuarios = lerJSON(CHAVE_USUARIOS, []);
    if (usuarios.some(function (u) { return u.email === email; })) {
      return mostraMensagem(msgCadastro, 'Já existe um cadastro com esse email.', 'erro');
    }

    const novoUsuario = { nome: nome, endereco: endereco, email: email, senha: senha, telefone: telefone, cpf: cpf };
    usuarios.push(novoUsuario);
    salvarJSON(CHAVE_USUARIOS, usuarios); // JSON + localStorage
    baixaTxt(novoUsuario);                // cópia em .txt
    mostraMensagem(msgCadastro, 'Cadastro realizado! O arquivo .txt foi baixado. Redirecionando para o login...', 'ok');
    setTimeout(function () { window.location.href = 'login.html'; }, 2000);
  });
}

/* ---------- 5) LOGIN (email + senha, máximo de 3 tentativas) ---------- */
// Aviso exibido na página inicial depois de 3 erros no login
const avisoGuardado = sessionStorage.getItem(CHAVE_AVISO);
const mainInicio = document.querySelector('body.pagina-inicial main');
if (avisoGuardado && mainInicio) {
  const aviso = document.createElement('p');
  aviso.className = 'aviso-erro';
  aviso.setAttribute('role', 'alert');
  aviso.textContent = avisoGuardado;
  mainInicio.prepend(aviso);
  sessionStorage.removeItem(CHAVE_AVISO);
}

const formLogin = document.getElementById('form-login');
if (formLogin) {
  const msgLogin = document.getElementById('msg-login');
  const campoSenhaLogin = document.getElementById('login-senha');

  formLogin.addEventListener('submit', function (event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const senha = campoSenhaLogin.value;

    if (!email || !senha) {
      return mostraMensagem(msgLogin, 'Informe o email e a senha.', 'erro');
    }

    // lê o cadastro salvo (JSON no localStorage) e procura o email
    const usuario = lerJSON(CHAVE_USUARIOS, []).find(function (u) { return u.email === email; });

    // acertou: libera o acesso ao site
    if (usuario && usuario.senha === senha) {
      sessionStorage.removeItem(CHAVE_TENTATIVAS);
      sessionStorage.setItem(CHAVE_SESSAO, usuario.email);
      mostraMensagem(msgLogin, 'Login realizado! Entrando...', 'ok');
      window.location.href = 'site.html';
      return;
    }

    // errou: informa o erro e NÃO libera o acesso
    const motivo = usuario ? 'Senha incorreta.' : 'Email não cadastrado.';
    const tentativas = Number(sessionStorage.getItem(CHAVE_TENTATIVAS) || 0) + 1;

    if (tentativas >= MAX_TENTATIVAS) {
      sessionStorage.removeItem(CHAVE_TENTATIVAS);
      sessionStorage.setItem(CHAVE_AVISO, 'Você errou o email ou a senha 3 vezes. Tente novamente.');
      window.location.href = 'index.html';
      return;
    }

    sessionStorage.setItem(CHAVE_TENTATIVAS, tentativas);
    const restantes = MAX_TENTATIVAS - tentativas;
    mostraMensagem(
      msgLogin,
      motivo + ' Acesso negado. Tentativa ' + tentativas + ' de ' + MAX_TENTATIVAS +
      ' — restam ' + restantes + (restantes === 1 ? ' tentativa.' : ' tentativas.'),
      'erro'
    );
    campoSenhaLogin.value = '';
    campoSenhaLogin.focus();
  });
}

/* ---------- 6) SITE: QUADRO DE TAREFAS (só após login) ---------- */
if (document.body.dataset.protegida === 'true') {
  const usuario = usuarioLogado();
  if (!usuario) {
    window.location.replace('login.html'); // bloqueia acesso sem login
  } else {
    iniciaQuadro(usuario);
  }
}

function iniciaQuadro(usuario) {
  const chaveTarefas = 'tg_tarefas_' + usuario.email;
  let tarefas = lerJSON(chaveTarefas, []);

  document.getElementById('nome-usuario').textContent = usuario.nome;
  document.getElementById('email-usuario').textContent = usuario.email;
  document.getElementById('avatar-usuario').textContent = usuario.nome.charAt(0).toUpperCase();
  document.getElementById('telefone-usuario').textContent = usuario.telefone || '';

  document.getElementById('btn-sair').addEventListener('click', function () {
    sessionStorage.removeItem(CHAVE_SESSAO);
    window.location.href = 'login.html';
  });

  const nomesStatus = { todo: 'A fazer', doing: 'Em andamento', done: 'Concluído' };
  const hoje = new Date();
  const hojeISO = hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0') + '-' + String(hoje.getDate()).padStart(2, '0');

  function formataData(iso) {
    const p = iso.split('-');
    return p[2] + '/' + p[1] + '/' + p[0];
  }
  function salvar() { salvarJSON(chaveTarefas, tarefas); desenha(); }

  function botao(texto, classe, aoClicar) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn ' + classe;
    b.textContent = texto;
    b.addEventListener('click', aoClicar);
    return b;
  }
  function muda(id, status) {
    const t = tarefas.find(function (x) { return x.id === id; });
    if (t) { t.status = status; salvar(); }
  }

  function criaCartao(t) {
    const card = document.createElement('article');
    card.className = 'tarefa ' + t.status;

    const titulo = document.createElement('h3');
    titulo.textContent = t.titulo;
    card.appendChild(titulo);

    if (t.descricao) {
      const desc = document.createElement('p');
      desc.textContent = t.descricao;
      card.appendChild(desc);
    }

    const meta = document.createElement('div');
    meta.className = 'meta';
    const prazo = document.createElement('span');
    const atrasada = t.status !== 'done' && t.prazo < hojeISO;
    prazo.textContent = '📅 ' + formataData(t.prazo) + (atrasada ? ' (atrasada)' : '');
    if (atrasada) prazo.className = 'atrasada';
    meta.appendChild(prazo);
    if (t.responsavel) {
      const resp = document.createElement('span');
      resp.textContent = '👤 ' + t.responsavel;
      meta.appendChild(resp);
    }
    card.appendChild(meta);

    const acoes = document.createElement('div');
    acoes.className = 'acoes';
    if (t.status === 'todo') {
      acoes.appendChild(botao('Iniciar', '', function () { muda(t.id, 'doing'); }));
    }
    if (t.status === 'doing') {
      acoes.appendChild(botao('Concluir', '', function () { muda(t.id, 'done'); }));
      acoes.appendChild(botao('Voltar', '', function () { muda(t.id, 'todo'); }));
    }
    if (t.status === 'done') {
      acoes.appendChild(botao('Reabrir', '', function () { muda(t.id, 'doing'); }));
    }
    acoes.appendChild(botao('Excluir', 'perigo', function () {
      if (confirm('Excluir a tarefa "' + t.titulo + '"?')) {
        tarefas = tarefas.filter(function (x) { return x.id !== t.id; });
        salvar();
      }
    }));
    card.appendChild(acoes);
    return card;
  }

  function desenha() {
    Object.keys(nomesStatus).forEach(function (status) {
      const lista = document.getElementById('lista-' + status);
      lista.innerHTML = '';
      const doStatus = tarefas
        .filter(function (t) { return t.status === status; })
        .sort(function (a, b) { return a.prazo.localeCompare(b.prazo); });
      document.getElementById('cont-' + status).textContent = doStatus.length;
      if (doStatus.length === 0) {
        const vazio = document.createElement('p');
        vazio.className = 'vazio';
        vazio.textContent = 'Nenhuma tarefa aqui.';
        lista.appendChild(vazio);
      }
      doStatus.forEach(function (t) { lista.appendChild(criaCartao(t)); });
    });
  }

  document.getElementById('form-tarefa').addEventListener('submit', function (event) {
    event.preventDefault();
    const titulo = document.getElementById('tarefa-titulo').value.trim();
    const prazo = document.getElementById('tarefa-prazo').value;
    if (!titulo || !prazo) return;
    tarefas.push({
      id: Date.now(),
      titulo: titulo,
      responsavel: document.getElementById('tarefa-responsavel').value.trim(),
      descricao: document.getElementById('tarefa-descricao').value.trim(),
      prazo: prazo,
      status: document.getElementById('tarefa-status').value
    });
    event.target.reset();
    salvar();
  });

  desenha();
}