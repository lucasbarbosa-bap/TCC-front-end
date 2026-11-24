# Melhoria recomendada no back-end (opcional, 1 linha)

Hoje o login responde só {"mensagem": "Login Feito UwU!"}. O site precisa do id do usuário
para postar, comentar e curtir, então ele descobre o id perguntando ao back-end
(GET /api/usuarios/<id>/ de 10 em 10). Funciona, mas gasta chamadas a mais.

Em core/views.py, na função fazer_login, devolva o id e o nome:

```python
if autenticado:
    return JsonResponse({"mensagem": "Login Feito UwU!",
                         "id": autenticado.id,
                         "username": autenticado.username}, status=200)
```

O site já lê "id" e "username" da resposta. Quando existirem, o login fica mais rápido
e a busca acima deixa de ser usada. Nenhuma alteração no site é necessária.

## Segurança (para depois)
O login não cria sessão nem token, e as rotas de postagem, comentário e interação
confiam no campo "autor" enviado. Para o TCC funciona, mas quem souber a API consegue
postar em nome de outra pessoa. O próximo passo seria JWT (djangosimplejwt) ou sessão.
