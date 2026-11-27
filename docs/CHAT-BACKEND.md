# Rotas de chat que o back-end Django precisa ter

O site já está pronto para usá-las. Enquanto elas não existirem (erro 404), a tela
de Chats funciona em "modo demonstração", só com dados de exemplo.
Os nomes seguem o padrão das rotas atuais (postagem, comentario, interacao).

## Conversas
GET  /api/conversa/?usuario=<id>
  -> {"Conversas": [{"id": 1, "participantes": [{"id": 1, "nome": "ana"}, {"id": 2, "nome": "bia"}]}]}

POST /api/conversa/
  {"autor": 1, "destinatario": "bia"}      (nome de usuário de quem vai receber)
  -> {"id": 1}                              (cria a conversa, ou devolve a que já existe)

## Mensagens
GET  /api/mensagem/?conversa=<id>
  -> {"Mensagens": [{"id": 1, "conversa": 1, "autor": {"id": 1, "nome": "ana"},
                     "conteudo": "oi", "data_criacao": "2026-10-23T21:10:00Z"}]}

POST /api/mensagem/
  {"autor": 1, "conversa": 1, "conteudo": "oi"}

## Recomendações
- Só mostrar e aceitar mensagens de quem participa da conversa.
- Descobrir o autor pelo login (token), e não confiar no "autor" enviado pelo site.
- Evolução futura: WebSocket (Django Channels). Hoje o site consulta a cada 5 segundos.
