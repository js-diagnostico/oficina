# JS Diagnóstico — Sistema de Ordens de Serviço

Site (não precisa de loja de aplicativos) para controle de OS, clientes, estoque,
catálogo de serviços, equipe e comissões, com login por usuário/senha (Dono e Funcionário).

Funciona em qualquer navegador — notebook, tablet, celular (Android e iPhone).

---

## O que você precisa antes de começar

- Uma conta no [Supabase](https://supabase.com) (grátis) — é o banco de dados
- Uma conta no [Vercel](https://vercel.com) (grátis) — é onde o site vai ficar no ar
- Uma conta no [GitHub](https://github.com) (grátis) — para guardar o código e conectar ao Vercel
- [Node.js](https://nodejs.org) instalado no seu computador (versão 18 ou mais nova), só para testar antes de publicar

---

## Passo 1 — Criar o banco de dados (Supabase)

1. Acesse https://supabase.com e crie uma conta (pode ser com o Google)
2. Clique em **"New project"**
   - Nome: `js-diagnostico` (ou o que preferir)
   - Senha do banco: crie uma senha forte e **guarde ela em local seguro** (não é a senha de login do app, é só do banco)
   - Região: escolha a mais próxima do Brasil (ex.: South America - São Paulo)
3. Aguarde o projeto ser criado (leva 1-2 minutos)
4. No menu lateral, clique em **SQL Editor**
5. Abra o arquivo `supabase/schema.sql` (está dentro desta pasta que te enviei), copie **todo o conteúdo** e cole no SQL Editor
6. Clique em **"Run"** — isso cria todas as tabelas e as regras de segurança
7. Ainda no Supabase, vá em **Authentication > Providers > Email** e **desative** a opção "Confirm email" (assim o login funciona na hora, sem precisar configurar servidor de e-mail)
8. Vá em **Settings > API** e copie dois valores, você vai precisar deles no Passo 3:
   - **Project URL**
   - **anon public key**

---

## Passo 2 — Testar no seu computador (opcional, mas recomendado)

1. Abra o terminal dentro da pasta do projeto
2. Copie o arquivo de exemplo de variáveis:
   ```
   cp .env.example .env
   ```
3. Abra o arquivo `.env` e cole a URL e a chave que você copiou no Passo 1
4. Instale as dependências:
   ```
   npm install
   ```
5. Rode o site localmente:
   ```
   npm run dev
   ```
6. Abra o link que aparecer no terminal (algo como `http://localhost:5173`)
7. Na primeira vez, clique em **"Primeira vez por aqui? Criar conta do dono"** e crie sua conta de administrador

Se tudo funcionar aqui, pode seguir pro próximo passo.

---

## Passo 3 — Colocar no ar (Vercel)

1. Crie uma conta no https://github.com e depois no https://vercel.com (pode entrar direto com a conta do GitHub)
2. No GitHub, crie um repositório novo (pode ser privado) e suba esta pasta do projeto para ele — o jeito mais simples:
   - Instale o [GitHub Desktop](https://desktop.github.com/) se preferir não usar linha de comando
   - Ou, no terminal, dentro da pasta do projeto:
     ```
     git init
     git add .
     git commit -m "primeira versão"
     git branch -M main
     git remote add origin https://github.com/SEU-USUARIO/js-diagnostico.git
     git push -u origin main
     ```
3. Na Vercel, clique em **"Add New… > Project"** e escolha esse repositório
4. Em **"Environment Variables"**, adicione as duas variáveis (mesmos valores do Passo 1):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Clique em **Deploy**
6. Em 1-2 minutos a Vercel te dá um link (ex.: `js-diagnostico.vercel.app`) — esse é o endereço do seu site, funciona em qualquer aparelho
7. (Opcional) Em **Settings > Domains** na Vercel, você pode ligar um domínio próprio (ex.: `sistema.jsdiagnostico.com.br`) se tiver um domínio comprado

---

## Passo 4 — Usar no dia a dia

- Abra o link do site em qualquer aparelho e faça login
- No celular: toque em "Adicionar à tela de início" no menu do navegador — fica com ícone, como um app
- Como **Dono**, use a aba **Usuários** para cadastrar o login de cada funcionário (nome, e-mail e senha)
- Funcionários só enxergam Painel, Nova OS, Clientes, Serviços e Estoque

---

## Perguntas comuns

**"Esqueci a senha, e agora?"**
No painel do Supabase, vá em Authentication > Users, encontre o e-mail da pessoa e clique nos três pontinhos para gerar um link de redefinição, ou delete e recrie o acesso pela aba Usuários do app.

**"Posso usar meu próprio domínio (ex: app.jsdiagnostico.com.br)?"**
Sim, configurando em Vercel > Settings > Domains, apontando o DNS do seu domínio conforme instruções que a Vercel mostra.

**"É seguro?"**
As senhas são gerenciadas pelo Supabase (mesma tecnologia usada por milhares de apps), com criptografia de verdade — bem mais seguro que o esquema anterior. As regras de acesso (funcionário não vê comissão/equipe/configurações) são aplicadas tanto na tela quanto no banco de dados.

**"Quanto isso custa pra manter?"**
Supabase e Vercel têm planos gratuitos que costumam ser suficientes para uma oficina pequena/média. Se o uso crescer muito, cada um tem planos pagos a partir de ~US$ 20-25/mês.

**"E se eu quiser mudar alguma coisa no visual ou nas funções?"**
O código está organizado em `src/components/` (uma tela por arquivo) e `src/lib/` (funções e constantes compartilhadas) — qualquer desenvolvedor React consegue seguir a partir daqui. Se preferir, volte numa conversa comigo e eu ajudo a editar.
