# Nina Fit IA

Crie um web app completo chamado "Nina Fit IA" — um micro-SaaS de assinatura mensal que dá acesso a uma assistente de dieta e treino baseada em IA, acessada via chat dentro do próprio site (não é um app de celular, é um site/web app responsivo, mobile-first, já que a maioria dos usuários vem do TikTok pelo celular).

# IDENTIDADE VISUAL

Use a imagem de logo que anexei como base da identidade visual. Tom geral: feminino, saudável, acolhedor e motivador — nada de visual "corporativo frio". Cores vibrantes mas não poluídas, tipografia arredondada e amigável. A "porta-voz" da marca se chama Alice Mayer.

# PÁGINAS NECESSÁRIAS

1. Landing page (pública): headline focada em "sua nutricionista e personal no bolso, sem dieta impossível", prova social (espaço para depoimentos, mesmo que fictício/placeholder por enquanto), explicação simples de como funciona em 3 passos, preço da assinatura em destaque, botão de CTA "Quero minha Nina" levando ao cadastro/checkout.

2. Cadastro/Login: autenticação por e-mail e senha usando Supabase Auth. Após cadastro, se ainda não tiver assinatura ativa, redireciona automaticamente para a página de checkout.

3. Checkout/Assinatura: página simples explicando o plano mensal, com botão "Assinar agora" que aciona a criação do checkout via Asaas (edge function, descrita abaixo). Enquanto o pagamento não é confirmado, mostrar mensagem de "Estamos confirmando seu pagamento" com atualização automática do status.

4. Dashboard/Chat (protegida): essa é a página principal do produto. Só pode ser acessada por usuário logado com assinatura ativa (ver regra de acesso abaixo). Nela, embuta exatamente este iframe, ocupando a maior parte da tela:

<iframe 

 src="https://app.gptmaker.ai/widget/3F7BFB0E3763533B3176862D20D40BD5/iframe" 

 width="100%" 

 style="height: 100%; min-height: 700px" 

 allow="microphone;" 

 frameborder="0">

</iframe>

5. Minha Conta: mostra e-mail, status da assinatura (ativo/atrasado/cancelado), data da próxima cobrança, e um botão "Cancelar assinatura" (que apenas explica como cancelar via e-mail de suporte por enquanto, não precisa cancelar via API nessa primeira versão).

6. Página de acesso bloqueado: se o usuário estiver logado mas sem assinatura ativa (nunca assinou, cancelou, ou está com pagamento atrasado), qualquer tentativa de acessar o Dashboard deve redirecionar pra essa tela, com uma mensagem amigável explicando a situação e um botão para reativar/assinar.

# BANCO DE DADOS (Supabase)

Crie uma tabela `profiles` vinculada ao usuário autenticado, com os campos: nome, email, asaas_customer_id (texto), asaas_subscription_id (texto), status_assinatura (texto: 'nenhuma', 'ativo', 'atrasado', 'cancelado' — valor padrão 'nenhuma'), data_proxima_cobranca (data), criado_em (timestamp automático).

# INTEGRAÇÃO COM ASAAS (via Supabase Edge Functions — nunca no front-end)

Crie duas edge functions:

Função 1 - "criar-checkout": recebida uma chamada do botão "Assinar agora", essa função usa a chave secreta do Asaas (vou fornecer via o formulário seguro de chave de API do Lovable, nunca cole no código) para: (a) criar ou reaproveitar um cliente no Asaas vinculado ao e-mail do usuário logado, (b) criar uma assinatura recorrente mensal (chargeType RECURRENT, billingType CREDIT_CARD, ciclo MONTHLY), (c) salvar o asaas_customer_id e asaas_subscription_id na tabela profiles do usuário, (d) retornar a URL do checkout para o front-end redirecionar o usuário.

Função 2 - "asaas-webhook": um endpoint público (URL fixa) que vou cadastrar no painel do Asaas para receber notificações. Essa função deve: validar o header "asaas-access-token" recebido contra um valor secreto configurado (pra garantir que a chamada é legítima), identificar o evento recebido, e atualizar a tabela profiles do usuário correspondente (via asaas_customer_id ou asaas_subscription_id) da seguinte forma:

- Eventos PAYMENT_CONFIRMED ou PAYMENT_RECEIVED → status_assinatura = 'ativo', atualizar data_proxima_cobranca.

- Eventos SUBSCRIPTION_DELETED, SUBSCRIPTION_INACTIVATED ou PAYMENT_REFUNDED → status_assinatura = 'cancelado'.

- Evento PAYMENT_OVERDUE → status_assinatura = 'atrasado' (não bloquear o acesso ainda nesse status, só marcar).

Sempre responder 200 rapidamente para o Asaas, mesmo que o evento não seja um dos tratados.

# REGRA DE ACESSO

O Dashboard (página do chat) só deve renderizar o conteúdo se: usuário autenticado E status_assinatura na tabela profiles for 'ativo'. Qualquer outro caso redireciona para a página de acesso bloqueado ou checkout, conforme o caso.

# TOM DE VOZ EM TODA COPY DO SITE

Direto, acolhedor, sem jargão técnico, focado em rotina real e sem promessas de resultado milagroso. Emojis usados com moderação. Público-alvo: pessoas que vieram do TikTok, celular em mãos, pouca paciência para textos longos — frases curtas, CTAs claros.

Construa isso de forma modular e comece pela estrutura de páginas e autenticação antes de configurar as edge functions do Asaas. Primeira foto anexada (branding geral, inspiracional / manifesto), segunda foto, uma foto design, terceira logo do web app

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7a3d36cb-79c8-492c-acb2-31128ff94dc0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
