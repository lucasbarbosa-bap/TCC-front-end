# O que o back-end (Django) precisa ter para as curtidas funcionarem

O site já chama estas rotas. Enquanto faltarem, descurtir mostra um aviso e mantém a curtida.

## 1. Devolver o "id" de cada interação
GET /api/interacao/ precisa incluir o `id`:
  {"Interações": [{"id": 12, "autor_id": 1, "post_id": 4, "comentario_id": null, "tipo": "like"}]}

## 2. Rota para apagar uma interação
DELETE /api/interacao/<id>/   ->  204
(Num ModelViewSet do DRF isso já existe. Se a view for APIView, é preciso criar.)

## 3. Impedir curtida duplicada (no model)
```python
from django.db.models import Q, UniqueConstraint

class Interacao(models.Model):
    ...
    class Meta:
        constraints = [
            UniqueConstraint(fields=["autor", "post", "tipo"], condition=Q(comentario__isnull=True),
                             name="uniq_interacao_post"),
            UniqueConstraint(fields=["autor", "comentario", "tipo"], condition=Q(post__isnull=True),
                             name="uniq_interacao_comentario"),
        ]
```
Rode `makemigrations` e `migrate`. Antes, limpe as duplicadas (passo 4), senão a migração falha.

## 4. Limpar as curtidas duplicadas que já estão no banco
No `python manage.py shell`:
```python
from django.db.models import Min, Count
from app.models import Interacao   # ajuste o caminho

dups = (Interacao.objects.values("autor", "post", "comentario", "tipo")
        .annotate(primeira=Min("id"), n=Count("id")).filter(n__gt=1))
for d in dups:
    (Interacao.objects.filter(autor=d["autor"], post=d["post"], comentario=d["comentario"], tipo=d["tipo"])
     .exclude(id=d["primeira"]).delete())
```
