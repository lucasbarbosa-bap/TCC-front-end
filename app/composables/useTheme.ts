export function useTheme() {
  const dark = useState<boolean>('theme-dark', () => false)
  onMounted(() => {
    const saved = document.documentElement.dataset.theme
    dark.value = saved ? saved === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches
  })
  function toggle() {
    dark.value = !dark.value
    document.documentElement.dataset.theme = dark.value ? 'dark' : 'light'
  }
  return { dark, toggle }
}
