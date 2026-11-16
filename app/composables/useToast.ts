let timer: ReturnType<typeof setTimeout>
export function useToast() {
  const msg = useState<string>('toast', () => '')
  function show(m: string) {
    msg.value = m
    clearTimeout(timer)
    timer = setTimeout(() => (msg.value = ''), 2200)
  }
  return { show }
}
