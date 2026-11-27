# Notas para quem cuida do back-end (Django)

Este documento lista o que o site usa do `views.py` atual e o que ainda falta.

## Rotas que o site usa hoje
| Ação | Rota | Detalhes |
|---|---|---|
| Entrar | POST /api/auth/login/ | JSON {username, password}. Usa id, username, avatar e biografia da resposta. |
| Criar conta | POST /api/registar/ | FormData: username, email, password, avatar (opcional). Usa o id devolvido. |
| Perfil | GET /api/usuarios/<id>/ | Usa avatar, biografia, seguindo e seguidores. |
| Editar perfil | PATCH /api/usuarios/<id>/ | FormData: avatar e/ou biografia. |
| Feed | GET /api/postagem/ | Usa autor.id/nome/avatar, midia, conteudo, comentarios (contagem). |
| Postar | POST /api/postagem/ | FormData: titulo, conteudo, autor, midia (até 10). |
| Ver / excluir post | GET e DELETE /api/postagem/<id>/ | O site só exclui posts do próprio autor. |
| Comentários | GET e POST, por post | Veja "Rota de comentários" abaixo. |
| Curtir | GET e POST /api/interacao/ | JSON {autor, post, tipo: "like"}. |

## O que falta para tudo funcionar
1. **Descurtir.** O GET de /api/interacao/ não devolve o `id` e não existe DELETE. O site tenta, nesta ordem:
   - DELETE /api/interacao/<id>/ (se o GET passar a devolver "id"), ou
   - DELETE /api/interacao/ com JSON {autor, post, tipo} (não precisa de id).
   Sugestão para `gerenciar_interacoes`, antes do `else:` final:
   ```python
   elif request.method == 'DELETE':
       dados = json.loads(request.body)
       Interacao.objects.filter(
           autor_id=dados.get('autor'), post_id=dados.get('post'),
           comentario_id=dados.get('comentario'), tipo=dados.get('tipo')
       ).delete()
       return JsonResponse({"mensagem": "Interação removida!"}, status=200)
   ```
   Também vale impedir curtida duplicada no model (UniqueConstraint em autor, post, comentario, tipo) e limpar as repetidas que já existem. O site já conta pessoas diferentes, então um número inflado no banco não aparece na tela.
2. **Rota de comentários.** O view recebe `id_post`, mas não vimos o `urls.py`. O site tenta `/comentario/<id>/`, `/postagem/<id>/comentarios/`, `/comentarios/<id>/` e `/postagem/<id>/comentario/` e guarda a que funcionar. Se for outra, defina `NUXT_COMMENTS_PATH` (ex.: `/comentario/{id}/`).
3. **Conversas (chat).** Não existem rotas de conversa. O site usa modo demonstração; as rotas sugeridas estão em CHAT-BACKEND.md.
4. **Seguir.** O model tem `seguidores` e `seguindo`, mas não há rota para seguir. No site, "seguir" fica só no navegador.
5. **Matéria e tipo do post.** Não há campos; o site guarda os dois no fim do `conteudo` (ex.: "#Matemática #Pergunta") e separa na leitura. O ideal é criar os campos `materia` e `tipo` no model.

## Segurança (para depois)
As rotas confiam no `autor` enviado e o login não cria sessão nem token. O site grava o id do usuário em um cookie e não deixa o navegador escolher o autor, mas quem falar direto com a API consegue postar em nome de outra pessoa. O próximo passo seria JWT ou sessão no Django.
