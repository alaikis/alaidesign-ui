#!/usr/bin/env bash
set +e
# 验证 npmjs token 认证 + 包发布权限（token 从 ~/.npmrc 读取，不硬编码）
AUTH=$(grep "registry.npmjs.org/:_authToken" ~/.npmrc | cut -d= -f2)
if [ -z "$AUTH" ]; then
  echo "未在 ~/.npmrc 找到 registry.npmjs.org/:_authToken，跳过"
  exit 0
fi
echo "token prefix: ${AUTH:0:15} len: ${#AUTH}"
echo "=== whoami ==="
curl -s -o /tmp/w.json -w "HTTP %{http_code}\n" -H "Authorization: Bearer $AUTH" "https://registry.npmjs.org/-/whoami"
cat /tmp/w.json 2>/dev/null
echo ""
echo "=== 检查 @alaikis scope 内已有包 ==="
for pkg in alaikis%2falaidesign-ui alaikis%2falaidesign-vue alaikis%2falaidesign-react; do
  echo -n "@$pkg -> "
  curl -s -o /dev/null -w "HTTP %{http_code}\n" "https://registry.npmjs.org/$pkg"
done
