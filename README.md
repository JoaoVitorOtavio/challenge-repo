<h2>🧪 Desafio Técnico - Cadastro e Gerenciamento de Usuários com Controle de Acesso</h2>

<p>Este projeto foi desenvolvido com base em um desafio técnico para implementar um sistema de autenticação, autorização e gerenciamento de usuários com diferentes níveis de acesso.</p>

<h3>🎯 Objetivo</h3>
<p>Permitir que administradores cadastrem, editem, visualizem e excluam usuários, garantindo que cada usuário tenha um nível de acesso apropriado e permissões controladas.</p>

<h3>✅ Critérios de Aceitação</h3>
<ul>
  <li>Somente usuários autenticados podem criar, editar e excluir usuários.</li>
  <li>O e-mail do usuário deve ser único no banco.</li>
  <li>As senhas devem ser armazenadas de forma criptografada.</li>
  <li>Autenticação via JWT com tempo de expiração.</li>
  <li>Controle de permissões baseado em papéis (Admin, Gerente, Usuário Comum), usando <code>CASL</code>.</li>
  <li>Apenas administradores podem criar novos usuários e alterar permissões.</li>
  <li>Gerentes podem visualizar todos os usuários e editar dados, exceto permissões.</li>
  <li>Usuários comuns só visualizam e editam seu próprio perfil.</li>
  <li>Mensagens de erro claras para ações sem permissão.</li>
</ul>

<h3>🛠 Tarefas</h3>

<h4>🔙 Backend (NestJS + PostgreSQL + JWT + CASL)</h4>
<ul>
  <li>Entidade <code>User</code> com: id, name, email (único), password (criptografado) e role.</li>
  <li>CRUD de usuários.</li>
  <li>Autenticação com JWT.</li>
  <li>Controle de permissões com CASL.</li>
  <li>Middleware para verificar permissões.</li>
  <li>Testes unitários e de integração.</li>
</ul>

<h4>🔜 Frontend (React + Next.js)</h4>
<ul>
  <li>Interface de login com armazenamento de JWT.</li>
  <li>Página de listagem de usuários (acesso restrito a admins e gerentes).</li>
  <li>Formulário de cadastro/edição com validação.</li>
  <li>Interface adaptada conforme permissões do usuário.</li>
  <li>Mensagens de erro ao tentar acessar recursos sem permissão.</li>
</ul>

<h3>📐 Critérios Técnicos</h3>
<ul>
  <li><strong>Backend:</strong> NestJS, PostgreSQL, TypeORM, JWT, CASL</li>
  <li><strong>Frontend:</strong> React, Next.js, Tailwind CSS, Context API ou Redux</li>
  <li><strong>Segurança:</strong> Bcrypt para senhas, validação de JWT e de permissões</li>
</ul>

<h3>🧪 Cenários de Teste</h3>
<ol>
  <li>Usuário não autenticado acessa listagem → erro 401 Unauthorized.</li>
  <li>Usuário comum acessa página de usuários → bloqueado e redirecionado.</li>
  <li>Gerente tenta alterar a role de outro usuário → erro 403 Forbidden.</li>
  <li>Administrador edita usuário com sucesso → resposta 200 OK.</li>
  <li>Cadastro com email já existente → erro 400 Email already in use.</li>
</ol>

<h4>📝 Observações</h4>
<ul>
  <li>Prazo do desafio: 1 semana.</li>
</ul>

<h1>Meu Projeto</h1>

<p>Este projeto é composto por <strong>backend</strong> e <strong>frontend</strong>.</p>

<ul>
  <li>O <strong>backend</strong> utiliza <code>Node.js</code>, <code>TypeORM</code> e <code>PostgreSQL</code>.</li>
  <li>O <strong>frontend</strong> é feito com <code>React</code> utilizando o framework <code>Next.js</code>.</li>
</ul>

<h2>📌 Pré-requisitos</h2>
<ul>
  <li><strong>PostgreSQL</strong> instalado e em funcionamento</li>
  <li><strong>Node.js</strong> e <strong>Yarn</strong> instalados</li>
</ul>

<h2>⚙️ Configuração</h2>

<ol>
  <li>
    Crie um arquivo <code>.env</code> na raiz do projeto com as seguintes variáveis de ambiente:
    <pre><code>DB_USERNAME='Nomedousuarionobanco'
DB_PASSWORD='Senhadobanco'
DB_PORT='PortaDoBancoGeralmente5432'
DB_HOST='HostDoBancoGeralmentelocalhost'
DB_NAME='NomeDoBanco'
JWT_KEY='UmaStringSuperSecretaQualquer'</code></pre>
  </li>
  <li>
    Instale as dependências do projeto:
    <pre><code>yarn</code></pre>
  </li>
  <li>
    Execute as migrations para configurar o banco de dados:
    <pre><code>yarn typeorm migration:run -- -d data-source.ts</code></pre>
  </li>
</ol>

<h2>🚀 Rodando o projeto</h2>

<h3>🔧 Backend (porta 3001)</h3>
<pre><code>yarn start:dev</code></pre>
<p>O backend ficará disponível em: <a href="http://localhost:3001" target="_blank">http://localhost:3001</a></p>

<h3>💻 Frontend (Next.js - porta 3000)</h3>
<pre><code>yarn dev</code></pre>
<p>O frontend ficará disponível em: <a href="http://localhost:3000" target="_blank">http://localhost:3000</a></p>
