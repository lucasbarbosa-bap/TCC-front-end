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

const initials = (n: string) =>
  n.replace(/^(Prof\.|Profa\.)\s*/, '').split(/[\s_]+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
const isProf = (r: string) => r.startsWith('Prof')

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
  files.value = []
  fileErr.value = ''
  store.comment(props.post.id, t, sending)
  draft.value = ''
}
function notInterested() { menu.value = false; if (!auth.requireLogin()) return; store.hide(props.post.id); show('Vamos mostrar menos posts assim') }
function report() { menu.value = false; if (!auth.requireLogin()) return; store.hide(props.post.id); show('Denúncia enviada. Obrigado!') }
async function share() {
  try { await navigator.clipboard.writeText(`${location.origin}/#post-${props.post.id}`); show('Link copiado') }
  catch { show('Não foi possível copiar') }
}
</script>

<template>
  <article :id="`post-${post.id}`" class="post">
    <UserAvatar :name="post.name" :src="post.avatar" />
    <div class="post-main">
      <header class="post-head">
        <div>
          <strong>{{ post.name }}</strong><span class="role" :class="{ prof: isProf(post.role) }">{{ post.role }}</span>
          <span class="meta"> · {{ post.time }}</span>
        </div>
        <div class="more">
          <button class="ico sm" aria-label="Mais opções" aria-haspopup="menu" :aria-expanded="menu" @click="menu = !menu">
            <Icon name="dots" :size="22" />
          </button>
          <div v-if="menu" class="click-away" @click="menu = false" />
          <Transition name="pop">
            <div v-if="menu" class="more-card" role="menu">
              <button role="menuitem" @click="notInterested">Não tenho interesse</button>
              <button role="menuitem" @click="report">Denunciar</button>
            </div>
          </Transition>
        </div>
      </header>

      <h3>{{ post.title }}</h3>
      <p v-if="post.text">{{ post.text }}</p>
      <div v-if="post.file" class="file"><b>PDF</b><span>{{ post.file }}</span></div>
      <PostMedia :items="post.media" />
      <button class="chip" :class="{ on: store.activeTag === post.tag }" @click="store.setTag(post.tag)">{{ post.tag }}</button>

      <div class="acts">
        <button :aria-expanded="post.open" @click="store.toggleComments(post.id)">Comentar{{ post.cms.length ? ` · ${post.cms.length}` : '' }}</button>
        <button :aria-pressed="post.liked" @click="store.toggleLike(post.id)">{{ post.liked ? 'Curtiu' : 'Curtir' }}{{ post.likes ? ` · ${post.likes}` : '' }}</button>
        <button :aria-pressed="post.fav" @click="store.toggleFav(post.id)">{{ post.fav ? 'Favoritado' : 'Favoritar' }}</button>
        <button @click="share">Compartilhar</button>
      </div>

      <div class="collapse" :class="{ open: post.open }">
        <div>
          <div v-for="(c, i) in post.cms" :key="i" class="cm" :class="{ ok: c.ok }">
            <div v-if="c.ok" class="stamp">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
              Resposta verificada por professor
            </div>
            <div class="cm-head">
              <UserAvatar :name="c.n" :src="c.avatar" class="mini" />
              <strong>{{ c.n }}</strong><span class="role" :class="{ prof: isProf(c.r) }">{{ c.r }}</span>
            </div>
            <div>{{ c.t }}</div>
            <PostMedia :items="c.media" small />
          </div>
          <div class="cmform">
            <input v-model="draft" class="pill" placeholder="Escreva um comentário" aria-label="Comentário" @keyup.enter="send">
            <input ref="fileEl" type="file" multiple accept=".jpg,.jpeg,.png,.gif,.webp,image/*" hidden @change="pick">
            <button type="button" class="pill" @click="fileEl?.click()">Anexar{{ files.length ? ` (${files.length})` : '' }}</button>
            <button class="pill" @click="send">Enviar</button>
          </div>
          <ul v-if="files.length" class="up-list" style="margin-top:6px">
            <li v-for="(f, i) in files" :key="f.name + i"><span>{{ f.name }}</span><button type="button" :aria-label="`Remover ${f.name}`" @click="files.splice(i, 1)">✕</button></li>
          </ul>
          <p v-if="fileErr" class="up-err" role="alert">{{ fileErr }}</p>
        </div>
      </div>
    </div>
  </article>
</template>
