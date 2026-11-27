<script setup lang="ts">
const auth = useAuthStore()
const { show } = useToast()
const mode = ref<'entrar' | 'criar'>('entrar')
const f = reactive({ login: '', pass: '', email: '', user: '', pass2: '', birth: '' })
const err = ref('')
const busy = ref(false)
const slow = ref(false)
const avatarFile = ref<File | null>(null)
const avatarEl = ref<HTMLInputElement>()

function go(m: 'entrar' | 'criar') { mode.value = m; err.value = '' }
function maskDate(e: Event) {
  const d = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 8)
  f.birth = d.replace(/^(\d{2})(\d)/, '$1/$2').replace(/^(\d{2}\/\d{2})(\d)/, '$1/$2')
}
function validDate(s: string) {
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return false
  const [d, mo, y] = [+m[1], +m[2], +m[3]]
  return d >= 1 && d <= 31 && mo >= 1 && mo <= 12 && y >= 1900 && y <= new Date().getFullYear()
}
function pickAvatar(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  input.value = ''
  if (!file) return
  const bad = checkFiles([file], { max: 1, mb: 5, exts: IMG_EXT, label: 'a foto de perfil' })
  if (bad) { err.value = bad; return }
  err.value = ''
  avatarFile.value = file
}

// Roda uma chamada ao servidor com "carregando" e o aviso de servidor acordando.
async function run(action: () => Promise<void>, fallback: string) {
  busy.value = true
  const timer = setTimeout(() => { slow.value = true }, 4000)   // servidor gratuito acordando
  try {
    await action()
    f.pass = ''; f.pass2 = ''
    err.value = ''
  } catch (e: any) {
    err.value = errMsg(e, fallback)
  } finally {
    clearTimeout(timer); busy.value = false; slow.value = false
  }
}

async function submit() {
  if (busy.value) return
  if (mode.value === 'entrar') {
    const login = f.login.trim()
    if (!login || !f.pass) { err.value = 'Preencha usuário e senha.'; return }
    // O back-end confere o login só pelo nome de usuário.
    if (login.includes('@')) { err.value = 'Entre com o seu nome de usuário. O login por e-mail ainda não está disponível.'; return }
    await run(() => auth.login(login, f.pass), 'Não foi possível entrar. Tente de novo.')
  } else {
    if (!/^\S+@\S+\.\S+$/.test(f.email)) { err.value = 'Informe um e-mail válido.'; return }
    if (!f.user.trim()) { err.value = 'Escolha um nome de usuário.'; return }
    if (f.user.includes('@')) { err.value = 'O nome de usuário não pode ter @.'; return }
    if (f.pass.length < 6) { err.value = 'A senha precisa ter ao menos 6 caracteres.'; return }
    if (f.pass !== f.pass2) { err.value = 'As senhas não coincidem.'; return }
    if (!validDate(f.birth)) { err.value = 'Informe a data de nascimento como dd/mm/aaaa.'; return }
    // A data de nascimento ainda não é salva: o back-end não tem esse campo.
    await run(() => auth.register(f.user.trim(), f.email.trim(), f.pass, avatarFile.value), 'Não foi possível criar a conta. Tente de novo.')
  }
}
</script>

<template>
  <div class="modal">
    <section class="sheet" role="dialog" aria-modal="true" :aria-label="mode === 'entrar' ? 'Entrar' : 'Criar conta'">
      <i class="handle" />
      <div class="socials">
        <button v-for="p in [['x', 'X'], ['facebook', 'Facebook'], ['google', 'Google']]" :key="p[0]" type="button" class="social" :aria-label="`Entrar com ${p[1]}`" @click="show('Em breve')">
          <Icon :name="p[0]" :size="26" />
        </button>
      </div>

      <Transition name="swap" mode="out-in">
        <form v-if="mode === 'entrar'" key="entrar" @submit.prevent="submit">
          <label class="field">Usuario/E-mail<input v-model="f.login" autocomplete="username"></label>
          <label class="field">Senha<input v-model="f.pass" type="password" autocomplete="current-password"></label>
          <p v-if="err" class="err" role="alert">{{ err }}</p>
          <p v-if="slow" class="hint" role="status">Acordando o servidor… na primeira vez pode levar até 1 minuto.</p>
          <div class="row2">
            <button type="button" class="btn" @click="go('criar')"><span class="mk" />Criar Conta</button>
            <button type="submit" class="btn" :disabled="busy"><span class="mk" />{{ busy ? 'Entrando…' : 'Entrar' }}</button>
          </div>
        </form>

        <form v-else key="criar" @submit.prevent="submit">
          <label class="field">E-mail<input v-model="f.email" type="email" autocomplete="email"></label>
          <label class="field">Usuario<input v-model="f.user" autocomplete="username"></label>
          <label class="field">Senha<input v-model="f.pass" type="password" autocomplete="new-password"></label>
          <label class="field">Repita a Senha<input v-model="f.pass2" type="password" autocomplete="new-password"></label>
          <input class="date" :value="f.birth" inputmode="numeric" placeholder="dd/mm/aaaa" aria-label="Data de nascimento" @input="maskDate">
          <input ref="avatarEl" type="file" accept=".jpg,.jpeg,.png,.gif,.webp,image/*" hidden @change="pickAvatar">
          <button type="button" class="btn" style="max-width:100%" @click="avatarEl?.click()"><span class="mk" />{{ avatarFile ? avatarFile.name : 'Foto de perfil (opcional)' }}</button>
          <p v-if="err" class="err" role="alert">{{ err }}</p>
          <p v-if="slow" class="hint" role="status">Acordando o servidor… na primeira vez pode levar até 1 minuto.</p>
          <div class="row2">
            <button type="button" class="btn" @click="go('entrar')"><span class="mk" />Entrar</button>
            <button type="submit" class="btn" :disabled="busy"><span class="mk" />{{ busy ? 'Criando…' : 'Criar Conta' }}</button>
          </div>
        </form>
      </Transition>
      <button type="button" class="guest" @click="auth.browse()">{{ auth.guest ? 'Fechar' : 'Continuar sem conta' }}</button>
    </section>
  </div>
</template>
