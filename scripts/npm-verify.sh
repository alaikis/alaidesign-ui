#!/usr/bin/env bash
for p in @alaikis%2falaidesign-ui @alaikis%2falaidesign-vue @alaikis%2falaidesign-react; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "https://registry.npmjs.org/$p")
  echo "$p -> HTTP $code"
done
echo "=== npm view versions ==="
for p in @alaikis/alaidesign-ui @alaikis/alaidesign-vue @alaikis/alaidesign-react; do
  echo -n "$p -> "
  npm view $p version --registry https://registry.npmjs.org 2>&1 | head -1
done
