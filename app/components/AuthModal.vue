<script setup lang="ts">
const auth = useAuthStore()
const { show } = useToast()
const mode = ref<'entrar' | 'criar'>('entrar')
const f = reactive({ login: '', pass: '', email: '', user: '', pass2: '', birth: '' })
const err = ref('')
const busy = ref(false)
const slow = ref(false)

function go(m: 'entrar' | 'criar') { mode.value = m; err.value = '' }
function maskDate(e: Event) {
  const d = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 6)
  f.birth = d.replace(/^(\d{2})(\d)/, '$1/$2').replace(/^(\d{2}\/\d{2})(\d)/, '$1/$2')
}
async function submit() {
  if (busy.value) return
  if (mode.value === 'entrar') {
    if (!f.login.trim() || !f.pass) { err.value = 'Preencha usuário e senha.'; return }
    busy.value = true
    const timer = setTimeout(() => { slow.value = true }, 4000)   // servidor gratuito acordando
    try {
      await auth.login(f.login.trim(), f.pass)
      f.pass = ''
      err.value = ''
    } catch (e: any) {
      err.value = e?.data?.message || 'Não foi possível entrar. Tente de novo.'
    } finally {
      clearTimeout(timer); busy.value = false; slow.value = false
    }
  } else {
    if (!/^\S+@\S+\.\S+$/.test(f.email)) { err.value = 'Informe um e-mail válido.'; return }
    if (!f.user.trim()) { err.value = 'Escolha um nome de usuário.'; return }
    if (f.pass.length < 6) { err.value = 'A senha precisa ter ao menos 6 caracteres.'; return }
    if (f.pass !== f.pass2) { err.value = 'As senhas não coincidem.'; return }
    if (!/^\d{2}\/\d{2}\/\d{2}$/.test(f.birth)) { err.value = 'Informe a data como dd/mm/aa.'; return }

  }
}
</script>

<template>
  <div class="modal">
    <section class="sheet" role="dialog" aria-modal="true" :aria-label="mode === 'entrar' ? 'Entrar' : 'Criar conta'">
      <i class="handle" />
      <div class="socials">
        <button v-for="p in ['Google', 'Microsoft', 'GitHub']" :key="p" type="button" class="circle"
                :aria-label="`Entrar com ${p}`" @click="show('Em breve')" />
      </div>
      <div class="or"><span>ou</span></div>

      <Transition name="swap" mode="out-in">
        <form v-if="mode === 'entrar'" key="entrar" @submit.prevent="submit">
          <label class="field">usuario/e-mail<input v-model="f.login" autocomplete="username"></label>
          <label class="field">senha<input v-model="f.pass" type="password" autocomplete="current-password"></label>
          <p v-if="err" class="err" role="alert">{{ err }}</p>
          <p v-if="slow" class="hint" role="status">Acordando o servidor… na primeira vez pode levar até 1 minuto.</p>
          <div class="row2">
            <button type="button" class="pill" @click="show('Em breve')">Esqueci a senha</button>
            <button type="submit" class="pill" :disabled="busy">{{ busy ? 'Entrando…' : 'Entrar' }}</button>
          </div>
          <button type="button" class="pill big" @click="go('criar')">Criar conta</button>
        </form>

        <form v-else key="criar" @submit.prevent="submit">
          <label class="field">e-mail<input v-model="f.email" type="email" autocomplete="email"></label>
          <label class="field">usuario<input v-model="f.user" autocomplete="username"></label>
          <label class="field">senha<input v-model="f.pass" type="password" autocomplete="new-password"></label>
          <label class="field">repita a senha<input v-model="f.pass2" type="password" autocomplete="new-password"></label>
          <input class="date" :value="f.birth" inputmode="numeric" placeholder="dd/mm/aa" aria-label="Data de nascimento" @input="maskDate">
          <p v-if="err" class="err" role="alert">{{ err }}</p>
          <div class="row2">
            <button type="button" class="pill" @click="go('entrar')">entrar</button>
            <button type="submit" class="pill">criar conta</button>
          </div>
        </form>
      </Transition>
      <button type="button" class="guest" @click="auth.browse()">{{ auth.guest ? 'Fechar' : 'Continuar sem conta' }}</button>
    </section>
  </div>
</template>
