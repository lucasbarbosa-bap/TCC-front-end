<script setup lang="ts">
import type { Post } from '~/stores/posts'

const props = defineProps<{ post: Post }>()
const store = usePostsStore()
const auth = useAuthStore()
const { show } = useToast()
const draft = ref('')
const menu = ref(false)
const files = ref<File[]>([])
const fileEl = ref<HTMLInputElement>()
const fileErr = ref('')

const mine = computed(() => props.post.authorId != null && props.post.authorId === auth.id)
const fav = computed(() => store.favIds.includes(props.post.id))
// o título só aparece quando não é um pedaço do próprio texto (posts criados por outros meios)
const showTitle = computed(() => !!props.post.text && !props.post.text.startsWith(props.post.title.replace(/…$/, '')))

function pick(e: Event) {
  const input = e.target as HTMLInputElement
  const next = [...files.value, ...Array.from(input.files ?? [])]
  input.value = ''
  const bad = checkFiles(next, { max: 5, mb: 5, exts: IMG_EXT, label: 'o comentário' })
  if (bad) { fileErr.value = bad; return }
  fileErr.value = ''
  files.value = next
}
function send() {
  if (!auth.requireLogin()) return
  const t = draft.value.trim()
  if (!t) return
  const sending = files.value
  files.value = []; fileErr.value = ''; draft.value = ''
  store.comment(props.post.id, t, sending)
}
function notInterested() { menu.value = false; store.hide(props.post.id); show('Vamos mostrar menos posts assim') }
function report() { menu.value = false; if (!auth.requireLogin()) return; store.hide(props.post.id); show('Denúncia enviada. Obrigado!') }
async function remove() { menu.value = false; if (confirm('Excluir este post?')) await store.remove(props.post.id) }
async function share() {
  try { await navigator.clipboard.writeText(`${location.origin}/#post-${props.post.id}`); show('Link copiado') }
  catch { show('Não foi possível copiar') }
}
</script>

<template>
  <article :id="`post-${post.id}`" class="post">
    <NuxtLink v-if="post.authorId != null" :to="mine ? '/perfil' : `/usuarios/${post.authorId}`" class="post-avatar" :aria-label="`Perfil de ${post.name}`">
      <UserAvatar :name="post.name" :src="post.avatar" />
    </NuxtLink>
    <div v-else class="post-avatar"><UserAvatar :name="post.name" :src="post.avatar" /></div>
    <div class="post-main">
      <header class="post-head">
        <div class="post-who">
          <NuxtLink v-if="post.authorId != null" :to="mine ? '/perfil' : `/usuarios/${post.authorId}`" class="author"><strong>{{ post.name }}</strong></NuxtLink>
          <strong v-else>{{ post.name }}</strong>
          <span class="meta">{{ post.time }}</span>
        </div>
        <div class="head-actions">
          <FollowButton :user-id="post.authorId" :name="post.name" />
          <div class="more">
          <button class="kebab" aria-label="Mais opções" aria-haspopup="menu" :aria-expanded="menu" @click="menu = !menu"><i /><i /><i /></button>
          <div v-if="menu" class="click-away" @click="menu = false" />
          <Transition name="pop">
            <div v-if="menu" class="more-card" role="menu">
              <button v-if="mine" role="menuitem" class="danger" @click="remove">Excluir</button>
              <button role="menuitem" @click="notInterested">Não tenho interesse</button>
              <button v-if="!mine" role="menuitem" @click="report">Denunciar</button>
            </div>
          </Transition>
          </div>
        </div>
      </header>

      <h3 v-if="showTitle">{{ post.title }}</h3>
      <p>{{ post.text || post.title }}</p>
      <PostMedia :items="post.media" />
      <div class="tags-line">
        <button :class="{ 'link-btn': store.activeTag === post.tag }" @click="store.setTag(post.tag)">#{{ post.tag }}</button>
        <span>{{ post.tipo }}</span>
      </div>

      <div class="acts">
        <button :aria-expanded="post.open" aria-label="Comentários" @click="store.toggleComments(post.id)">
          <Icon name="comment" :size="24" /><span>{{ post.comments || '' }}</span>
        </button>
        <button :class="{ on: post.liked }" :aria-pressed="post.liked" aria-label="Curtir" @click="store.toggleLike(post.id)">
          <Icon name="heart" :size="24" :fill="post.liked" /><span>{{ post.likes || '' }}</span>
        </button>
        <button aria-label="Compartilhar" @click="share"><Icon name="share" :size="22" /></button>
        <button :class="{ on: fav }" :aria-pressed="fav" aria-label="Favoritar" @click="store.toggleFav(post.id)"><Icon name="star" :size="24" :fill="fav" /></button>
      </div>

      <div class="collapse" :class="{ open: post.open }">
        <div>
          <p v-if="store.loadingComments.includes(post.id) && !post.cmsLoaded" class="hint" role="status">Carregando comentários…</p>
          <div v-for="c in post.cms" :key="c.id" class="cm">
            <div class="cm-head"><UserAvatar :name="c.n" :src="c.avatar" class="mini" /><strong>{{ c.n }}</strong><span class="meta">{{ c.time }}</span></div>
            <p>{{ c.t }}</p>
            <PostMedia :items="c.media" small />
          </div>
          <div class="cmform">
            <input v-model="draft" type="text" placeholder="Escreva um comentário" aria-label="Comentário" @keyup.enter="send">
            <input ref="fileEl" type="file" multiple accept=".jpg,.jpeg,.png,.gif,.webp,image/*" hidden @change="pick">
            <button type="button" class="btn" aria-label="Anexar imagens" @click="fileEl?.click()">Anexar{{ files.length ? ` (${files.length})` : '' }}</button>
            <button class="btn" @click="send">Enviar</button>
          </div>
          <ul v-if="files.length" class="up-list" style="margin-top:6px">
            <li v-for="(f, i) in files" :key="f.name + i"><span>{{ f.name }}</span><button type="button" :aria-label="`Remover ${f.name}`" @click="files.splice(i, 1)"><Icon name="close" :size="14" /></button></li>
          </ul>
          <p v-if="fileErr" class="up-err" role="alert">{{ fileErr }}</p>
        </div>
      </div>
    </div>
  </article>
</template>
