#!/bin/bash
# Roda todos os testes das ferramentas de south-academy/tools (offline: não chama a HeyGen).
#   bash south-academy/tools/test-all.sh            testes
#   bash south-academy/tools/test-all.sh --mutacao  testes + teste de mutação (demora: cada mutação roda um teste)
set -u
D="$(cd "$(dirname "$0")" && pwd)"
fail=0
for t in test-heygen-tts test-build test-verify-final test-validate-script; do
  printf "%-24s " "$t"
  if out=$(node "$D/$t.mjs" 2>&1); then echo "passou"; else echo "FALHOU"; echo "$out" | tail -15; fail=1; fi
done
if [ "${1:-}" = "--mutacao" ]; then
  node "$D/mutation-check.mjs" || fail=1
fi
[ "$fail" = 0 ] && echo "todos os testes passaram" || echo "HÁ TESTES FALHANDO"
exit $fail
