#!/usr/bin/env bash
set +e
AUTH=$(grep "registry.npmjs.org/:_authToken" ~/.npmrc | cut -d= -f2)
echo "token prefix: ${AUTH:0:15} len: ${#AUTH}"
echo "=== whoami ==="
curl -s -o /tmp/w.json -w "HTTP %{http_code}\n" -H "Authorization: Bearer $AUTH" "https://registry.npmjs.org/-/whoami"
cat /tmp/w.json 2>/dev/null
echo ""
echo "=== 尝试 npm publish @alaikis/alaidesign-ui（创建新包）==="
cd /e/workspace/AlaiDesign
npm publish --workspace=@alaikis/alaidesign-ui --access public --registry https://registry.npmjs.org 2>&1 | grep -E "E404|E403|E401|ENEEDAUTH|not found|permission|Unauthorized|Forbidden|Published|success|npm notice name" | head -10
echo "=== publish 后验证包是否存在 ==="
sleep 3
curl -s -o /dev/null -w "@alaikis/alaidesign-ui HTTP %{http_code}\n" "https://registry.npmjs.org/@alaikis%2falaidesign-ui"
