/**
 * LogiTrack - Script de inicializacao com verificacao detalhada de dependencias
 * Uso: node scripts/start-safe.js
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const PACKAGE_JSON_PATH = path.join(PROJECT_ROOT, 'package.json');
const SERVER_BUNDLE = path.join(PROJECT_ROOT, 'dist', 'server.js');
const DATA_DIR = path.join(PROJECT_ROOT, 'data');

let erros = [];

function log(titulo, mensagem) {
  var agora = new Date().toISOString();
  console.log('[' + agora + '] ' + titulo + ': ' + mensagem);
}

function logErro(dependencia, erro) {
  var entrada = {
    dependencia: dependencia,
    mensagem: (erro && erro.message) ? erro.message : String(erro),
    codigo: (erro && erro.code) ? erro.code : 'UNKNOWN',
    stack: (erro && erro.stack) ? erro.stack.split('\n').slice(0, 6).join('\n') : 'sem stack',
  };
  erros.push(entrada);

  console.error('\n========================================');
  console.error(' ERRO NA DEPENDENCIA: ' + dependencia);
  console.error('========================================');
  console.error('Mensagem : ' + entrada.mensagem);
  console.error('Codigo   : ' + entrada.codigo);
  console.error('Stack    :');
  console.error(entrada.stack);
  console.error('========================================\n');
}

function carregarDependencias() {
  log('PASSO 1', 'Lendo package.json...');

  if (!fs.existsSync(PACKAGE_JSON_PATH)) {
    logErro('package.json', new Error('Arquivo package.json nao encontrado em ' + PACKAGE_JSON_PATH));
    return [];
  }

  var pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
  } catch (e) {
    logErro('package.json', new Error('Nao foi possivel fazer parse do package.json: ' + e.message));
    return [];
  }

  var deps = {};
  if (pkg.dependencies) {
    for (var k in pkg.dependencies) { deps[k] = pkg.dependencies[k]; }
  }
  if (pkg.devDependencies) {
    for (var k2 in pkg.devDependencies) { deps[k2] = pkg.devDependencies[k2]; }
  }
  var nomes = Object.keys(deps);

  log('PASSO 1', nomes.length + ' dependencia(s) encontrada(s): ' + (nomes.join(', ') || '(nenhuma)'));
  return nomes;
}

function verificarDependencias(nomes) {
  log('PASSO 2', 'Testando require() de cada dependencia...');

  for (var i = 0; i < nomes.length; i++) {
    var nome = nomes[i];
    try {
      require(nome);
      log('OK', "require('" + nome + "') carregado com sucesso");
    } catch (e) {
      logErro("require('" + nome + "')", e);
    }
  }
}

function verificarBetterSqlite3() {
  log('PASSO 3', 'Verificando better-sqlite3 (modulo nativo SQLite)...');

  try {
    var Database = require('better-sqlite3');

    var dbMem = new Database(':memory:');
    dbMem.exec('CREATE TABLE IF NOT EXISTS teste (x INTEGER)');
    dbMem.exec('INSERT INTO teste VALUES (42)');
    var linha = dbMem.prepare('SELECT x FROM teste').get();
    dbMem.close();

    if (!linha || linha.x !== 42) {
      throw new Error('better-sqlite3 carregou mas falhou ao executar SQL simples');
    }

    log('OK', 'better-sqlite3 funcionando corretamente (banco em memoria OK)');

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      log('INFO', 'Diretorio ' + DATA_DIR + ' criado');
    }

    var dbArquivo = new Database(path.join(DATA_DIR, 'logitrack_integrity_test.db'));
    dbArquivo.exec('CREATE TABLE IF NOT EXISTS integridade (id INTEGER PRIMARY KEY)');
    dbArquivo.exec('INSERT INTO integridade DEFAULT VALUES');
    var count = dbArquivo.prepare('SELECT COUNT(*) AS c FROM integridade').get();
    dbArquivo.close();

    try { fs.unlinkSync(path.join(DATA_DIR, 'logitrack_integrity_test.db')); } catch (_) {}

    log('OK', 'better-sqlite3 consegue criar/abrir arquivo SQLite em ' + DATA_DIR);
  } catch (e) {
    logErro('better-sqlite3', e);
  }
}

function verificarBundle() {
  log('PASSO 4', 'Verificando bundle dist/server.js...');

  if (!fs.existsSync(SERVER_BUNDLE)) {
    logErro('dist/server.js', new Error('Arquivo nao encontrado: ' + SERVER_BUNDLE));
    return false;
  }

  var stats = fs.statSync(SERVER_BUNDLE);
  if (stats.size === 0) {
    logErro('dist/server.js', new Error('Arquivo existe mas esta vazio (0 bytes)'));
    return false;
  }

  log('OK', 'dist/server.js encontrado (' + stats.size + ' bytes)');
  return true;
}

function iniciarServidor() {
  log('PASSO 5', 'Iniciando servidor (dist/server.js)...');

  try {
    require(SERVER_BUNDLE);
    log('SUCESSO', 'Servidor LogiTrack iniciado em http://localhost:3000');
  } catch (e) {
    logErro('dist/server.js (runtime)', e);
    process.exit(1);
  }
}

function main() {
  console.log('\n========================================');
  console.log(' LogiTrack - Verificacao de Inicializacao');
  console.log('========================================\n');

  var nomes = carregarDependencias();
  verificarDependencias(nomes);
  verificarBetterSqlite3();
  var bundleOk = verificarBundle();

  if (erros.length > 0) {
    console.error('\n========================================');
    console.error(' FALHA: ' + erros.length + ' erro(s) encontrado(s). Servidor NAO iniciado.');
    console.error('========================================\n');
    process.exit(1);
  }

  if (!bundleOk) {
    console.error('\n========================================');
    console.error(' FALHA: Bundle do servidor invalido. Servidor NAO iniciado.');
    console.error('========================================\n');
    process.exit(1);
  }

  iniciarServidor();
}

process.on('uncaughtException', function (e) {
  logErro('uncaughtException', e);
  process.exit(1);
});

process.on('unhandledRejection', function (e) {
  logErro('unhandledRejection', e instanceof Error ? e : new Error(String(e)));
  process.exit(1);
});

main();
