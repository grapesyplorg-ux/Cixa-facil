var UK = "cf-user", DK = "cf-dados";
var SEED = [
  {id:1, desc:"Venda de 50 kg de sementes de milho", tipo:"venda", cat:"Vendas", valor:7500, data:"2026-11-02"},
  {id:2, desc:"Venda de sementes de feijão", tipo:"venda", cat:"Vendas", valor:4200, data:"2026-11-03"},
  {id:3, desc:"Transporte para o mercado", tipo:"despesa", cat:"Transporte", valor:900, data:"2026-11-03"},
  {id:4, desc:"Compra de sacos e embalagens", tipo:"despesa", cat:"Matéria-prima", valor:1800, data:"2026-11-04"},
  {id:5, desc:"Encomenda de hortaliças", tipo:"venda", cat:"Vendas", valor:6300, data:"2026-11-05"},
  {id:6, desc:"Ajudante (semana)", tipo:"despesa", cat:"Salários", valor:2500, data:"2026-11-06"},
  {id:7, desc:"Venda ao balcão", tipo:"venda", cat:"Vendas", valor:3100, data:"2026-11-07"},
  {id:8, desc:"Taxa do mercado", tipo:"despesa", cat:"Outros", valor:400, data:"2026-11-07"}
];

function $(id) { return document.getElementById(id); }
function ler(k, f) { try { var r = localStorage.getItem(k); return r ? JSON.parse(r) : f; } catch (e) { return f; } }
function gravar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function mt(n) { return n.toLocaleString("pt-PT", {maximumFractionDigits: 2}) + " MT"; }
function dataPT(iso) { return new Date(iso + "T00:00:00").toLocaleDateString("pt-PT"); }

var dados = ler(DK, null);
if (!dados) { dados = SEED.slice(); gravar(DK, dados); }
var user = ler(UK, null);

function mostrar() {
  var on = !!user;
  $("login").hidden = on;
  $("app").hidden = !on;
  $("nvAcesso").textContent = on ? "Painel" : "Entrar";
  if (on) {
    $("ola").textContent = "Olá, " + user.nome.split(" ")[0] + "!";
    $("eu").textContent = user.email + " · “" + user.msg + "”";
    render();
  }
}

function render() {
  var tv = 0, td = 0, porCat = {};
  dados.forEach(function (x) {
    if (x.tipo === "venda") tv += x.valor;
    else { td += x.valor; porCat[x.cat] = (porCat[x.cat] || 0) + x.valor; }
  });
  var l = tv - td;
  $("tv").textContent = mt(tv);
  $("td").textContent = mt(td);
  $("tl").textContent = mt(l);
  $("tl").className = l >= 0 ? "v" : "d";

  var cats = $("cats");
  cats.innerHTML = "";
  var nomes = Object.keys(porCat);
  if (!nomes.length) cats.innerHTML = '<div class="vz">Sem despesas.</div>';
  nomes.sort(function (a, b) { return porCat[b] - porCat[a]; }).forEach(function (c) {
    var d = document.createElement("div");
    d.className = "ct";
    var s = document.createElement("span");
    var a = document.createElement("span"); a.textContent = c;
    var b = document.createElement("span"); b.textContent = mt(porCat[c]);
    s.appendChild(a); s.appendChild(b);
    var t = document.createElement("div"); t.className = "tr";
    var i = document.createElement("i"); i.style.width = Math.round(porCat[c] / td * 100) + "%";
    t.appendChild(i); d.appendChild(s); d.appendChild(t);
    cats.appendChild(d);
  });

  var q = $("q").value.trim().toLowerCase(), f = $("ft").value;
  var lista = dados.filter(function (x) {
    return (f === "todos" || x.tipo === f) && x.desc.toLowerCase().indexOf(q) !== -1;
  });
  var ul = $("ls");
  ul.innerHTML = "";
  if (!lista.length) { ul.innerHTML = '<div class="vz">Nenhum registo encontrado.</div>'; return; }
  lista.slice().sort(function (a, b) { return b.id - a.id; }).forEach(function (x) {
    var li = document.createElement("li");
    var d = document.createElement("div");
    var t = document.createElement("span"); t.textContent = x.desc;
    var s = document.createElement("small"); s.textContent = dataPT(x.data) + " · " + x.cat;
    d.appendChild(t); d.appendChild(s);
    var b = document.createElement("b");
    b.className = x.tipo === "venda" ? "v" : "d";
    b.textContent = (x.tipo === "venda" ? "+" : "−") + mt(x.valor);
    var r = document.createElement("button");
    r.textContent = "Apagar";
    r.onclick = function () {
      dados = dados.filter(function (y) { return y.id !== x.id; });
      gravar(DK, dados); render();
    };
    li.appendChild(d); li.appendChild(b); li.appendChild(r);
    ul.appendChild(li);
  });
}

$("fl").addEventListener("submit", function (e) {
  e.preventDefault();
  var nome = $("nm").value.trim(), email = $("em").value.trim(), msg = $("ms").value.trim();
  var er = $("er");
  if (nome.length < 3) { er.textContent = "Escreva o seu nome (mínimo 3 letras)."; return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { er.textContent = "Escreva um email válido."; return; }
  if (msg.length < 5) { er.textContent = "Escreva uma mensagem (mínimo 5 letras)."; return; }
  er.textContent = "";
  user = {nome: nome, email: email, msg: msg};
  gravar(UK, user);
  mostrar();
  $("acesso").scrollIntoView();
});

$("sai").addEventListener("click", function () {
  user = null;
  try { localStorage.removeItem(UK); } catch (e) {}
  $("fl").reset();
  mostrar();
});

$("fr").addEventListener("submit", function (e) {
  e.preventDefault();
  var d = $("ds").value.trim(), v = parseFloat($("vl").value);
  if (!d || !(v > 0)) return;
  var tipo = $("tp").value, cat = $("ct").value;
  if (tipo === "venda") cat = "Vendas";
  else if (cat === "Vendas") cat = "Outros";
  dados.push({id: Date.now(), desc: d, tipo: tipo, cat: cat, valor: v, data: new Date().toISOString().slice(0, 10)});
  gravar(DK, dados);
  $("fr").reset();
  render();
});

$("q").addEventListener("input", render);
$("ft").addEventListener("change", render);
$("rp").addEventListener("click", function () {
  if (confirm("Repor os registos de exemplo? Os atuais serão apagados.")) {
    dados = SEED.slice(); gravar(DK, dados); render();
  }
});

mostrar();
